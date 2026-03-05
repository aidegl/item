#!/usr/bin/env node
/**
 * 明道云自动记录守护进程 - 修复版
 * 
 * 监控 OpenClaw 会话文件，当 AI 回复时自动记录到明道云
 */

const fs = require('fs');
const path = require('path');
const autoHook = require('./auto-hook.js');

// ============ 配置 ============
const SESSIONS_DIR = '/home/admin/.openclaw/agents/main/sessions';
const CACHE_FILE = path.join(__dirname, '.record-daemon-cache.json');

// ============ 缓存管理 ============
let filePositions = {};
let recordedMessages = new Set();  // 避免重复记录

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    filePositions = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(filePositions, null, 2));
}

// ============ 提取 AI 回复文本 ============
function extractAssistantText(content) {
  if (!content) return null;
  
  // 如果是数组格式（新格式）
  if (Array.isArray(content)) {
    const textParts = content
      .filter(item => item.type === 'text' && item.text)
      .map(item => item.text);
    return textParts.join('') || null;
  }
  
  // 如果是字符串格式（旧格式）
  if (typeof content === 'string') {
    return content || null;
  }
  
  return null;
}

// ============ 处理消息 ============
function processMessage(message, sessionKey) {
  try {
    // 检查消息类型
    if (message.type === 'message' && message.message) {
      const msg = message.message;
      const msgId = message.id;
      
      // 避免重复记录
      if (recordedMessages.has(msgId)) return;
      
      // 提取文本内容
      let text = null;
      if (Array.isArray(msg.content)) {
        const textParts = msg.content
          .filter(item => item.type === 'text' && item.text)
          .map(item => item.text);
        text = textParts.join('') || null;
      } else if (typeof msg.content === 'string') {
        text = msg.content || null;
      }
      
      if (!text || !text.trim()) return;
      
      recordedMessages.add(msgId);
      
      // 检查消息角色
      if (msg.role === 'assistant') {
        // AI 回复
        console.log(`\n📝 检测到 AI 回复 (${sessionKey}):`);
        console.log(`   ${text.substring(0, 80)}...`);
        
        autoHook.recordReply(text, 'master')
          .then(() => {
            console.log('   ✅ 已记录到明道云');
          })
          .catch(err => {
            console.error('   ❌ 记录失败:', err.message);
          });
          
      } else if (msg.role === 'user') {
        // 用户消息
        console.log(`\n📝 检测到用户消息 (${sessionKey}):`);
        console.log(`   ${text.substring(0, 80)}...`);
        
        autoHook.recordUserMessage(text, 'master')
          .then(() => {
            console.log('   ✅ 已记录到明道云');
          })
          .catch(err => {
            console.error('   ❌ 记录失败:', err.message);
          });
      }
    }
  } catch (error) {
    // 忽略解析错误
  }
}

// ============ 监控会话文件 ============
function watchSessionFile(filePath) {
  const sessionKey = path.basename(filePath);
  
  // 先读取现有内容
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // 处理最后几条消息
    lines.slice(-10).forEach(line => {
      try {
        const message = JSON.parse(line);
        processMessage(message, sessionKey);
      } catch (e) {
        // 忽略
      }
    });
  } catch (error) {
    console.error(`❌ 读取 ${sessionKey} 失败：${error.message}`);
  }
  
  // 监控文件变化（添加错误处理）
  try {
    const watcher = fs.watch(filePath, { persistent: true }, (eventType) => {
      if (eventType !== 'change') return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        // 只处理最后一条消息
        const lastLine = lines[lines.length - 1];
        if (!lastLine) return;
        
        try {
          const message = JSON.parse(lastLine);
          processMessage(message, sessionKey);
        } catch (e) {
          // 忽略
        }
      } catch (error) {
        console.error(`❌ 处理 ${sessionKey} 变化失败：${error.message}`);
      }
    });
    
    watcher.on('error', (err) => {
      console.error(`❌ 监控 ${sessionKey} 出错：${err.message}`);
    });
  } catch (error) {
    console.error(`❌ 无法监控 ${sessionKey}: ${error.message}`);
  }
  
  console.log(`✅ 开始监控：${sessionKey}`);
}

// ============ 消息队列监控 ============
const MESSAGE_QUEUE_FILE = '/home/admin/openclaw/workspace/skills/mingdao-chat/.message-queue.json';

function processMessageQueue() {
  try {
    if (!fs.existsSync(MESSAGE_QUEUE_FILE)) return;
    
    const queue = JSON.parse(fs.readFileSync(MESSAGE_QUEUE_FILE, 'utf8'));
    if (!queue || queue.length === 0) return;
    
    console.log(` queued messages (${queue.length})...`);
    
    // Process each message in the queue
    for (let i = queue.length - 1; i >= 0; i--) {
      const msg = queue[i];
      if (msg.injected) continue;
      
      const messageText = `[明道云消息]\n**${msg.sender}** ${new Date(msg.time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n${msg.content}`;
      
      // Try to send via sessions_send
      try {
        // Note: This requires the session to have access to the sessions_send tool
        // For now, we'll just mark it as injected and log it
        console.log(`   📤 ${msg.sender}: ${msg.content.substring(0, 30)}...`);
        msg.injected = true;
      } catch (e) {
        console.error(`   ❌ 发送失败: ${e.message}`);
      }
    }
    
    // Save updated queue
    fs.writeFileSync(MESSAGE_QUEUE_FILE, JSON.stringify(queue, null, 2));
  } catch (e) {
    console.error(`❌ 消息队列处理失败: ${e.message}`);
  }
}

// ============ 主程序 ============
async function main() {
  console.log('🚀 明道云自动记录守护进程（修复版）启动...\n');
  
  // 全局错误处理
  process.on('uncaughtException', (err) => {
    console.error(`❌ 未捕获异常：${err.message}`);
    console.error(err.stack);
    // 不退出进程，继续运行
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`❌ 未处理的 Promise 拒绝：${reason}`);
    // 不退出进程，继续运行
  });
  
  // 加载缓存
  loadCache();
  
  // 监控所有会话文件
  if (fs.existsSync(SESSIONS_DIR)) {
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
    
    files.forEach(file => {
      const filePath = path.join(SESSIONS_DIR, file);
      watchSessionFile(filePath);
    });
    
    console.log(`\n✅ 正在监控 ${files.length} 个会话文件`);
  } else {
    console.log('⚠️ 会话目录不存在:', SESSIONS_DIR);
  }
  
  // 退出时保存缓存
  process.on('exit', () => {
    saveCache();
  });
  
  process.on('SIGINT', () => {
    console.log('\n👋 守护进程退出');
    saveCache();
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    console.log('\n👋 收到 SIGTERM，优雅退出');
    saveCache();
    process.exit();
  });
  
  console.log('\n✅ 守护进程运行中，按 Ctrl+C 停止\n');
  
  // 定期健康检查（每 5 分钟）
  setInterval(() => {
    console.log(`💓 心跳 - 已记录 ${recordedMessages.size} 条消息`);
  }, 300000);
  
  // 定期重新扫描会话目录（每 10 秒）
  setInterval(() => {
    try {
      const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
      console.log(`🔄 重新扫描会话目录：找到 ${files.length} 个 .jsonl 文件`);
      
      // 简单扫描，实际使用时可以添加更复杂的逻辑
      // 比如：只监控非空文件，或者最近有写入的文件
    } catch (err) {
      console.error(`❌ 扫描会话目录失败：${err.message}`);
    }
  }, 10000);
  
  // 定期检查消息队列（每 30 秒）
  setInterval(() => {
    console.log('\n🔄 检查明道云消息队列...');
    processMessageQueue();
  }, 30000);
}

main();
