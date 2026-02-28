#!/usr/bin/env node
/**
 * OpenClaw 会话监控器 - 自动记录到明道云
 * 
 * 功能：
 * 1. 监控当前会话文件的新消息
 * 2. 自动提取 AI 回复
 * 3. 记录到明道云对话系统
 * 
 * 用法：
 *   node session-watcher.js
 */

const fs = require('fs');
const path = require('path');
const autoHook = require('./auto-hook.js');

// ============ 配置 ============
const CONFIG = {
  sessionsDir: '/home/admin/.openclaw/agents/main/sessions',
  cacheFile: path.join(__dirname, '.session-cache.json'),
  pollInterval: 2000,  // 2 秒检查一次
  userId: 'master'
};

// ============ 状态 ============
let state = {
  currentSessionId: null,
  lastMessageId: null,
  lastMessageTimestamp: 0,  // ⭐ 新增：最后处理的消息时间戳
  lastFileSize: 0,
  pendingMessages: []
};

// ============ 工具函数 ============

/**
 * 加载缓存
 */
function loadCache() {
  if (fs.existsSync(CONFIG.cacheFile)) {
    const cache = JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf-8'));
    state = { ...state, ...cache };
    console.log('📂 已加载缓存:', state);
  }
}

/**
 * 保存缓存
 */
function saveCache() {
  fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(state, null, 2));
}

/**
 * 获取当前会话文件
 */
function getCurrentSessionFile() {
  try {
    const sessionsIndex = path.join(CONFIG.sessionsDir, 'sessions.json');
    if (!fs.existsSync(sessionsIndex)) {
      return null;
    }
    
    const index = JSON.parse(fs.readFileSync(sessionsIndex, 'utf-8'));
    
    // 查找当前会话（最新的非 reset 文件）
    const files = fs.readdirSync(CONFIG.sessionsDir)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.reset.') && !f.includes('.lock'))
      .map(f => ({
        name: f,
        mtime: fs.statSync(path.join(CONFIG.sessionsDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length > 0) {
      return path.join(CONFIG.sessionsDir, files[0].name);
    }
  } catch (error) {
    console.error('❌ 获取会话文件失败:', error.message);
  }
  return null;
}

/**
 * 读取会话文件中的新消息（只处理新增的）
 */
function readNewMessages(sessionFile) {
  try {
    const content = fs.readFileSync(sessionFile, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());
    
    const newMessages = [];
    let maxTimestamp = state.lastMessageTimestamp;
    
    for (let i = 0; i < lines.length; i++) {
      try {
        const entry = JSON.parse(lines[i]);
        
        // 只处理 assistant 类型的消息（AI 回复）
        if (entry.type === 'message' && entry.message?.role === 'assistant') {
          // 提取文本内容
          const textContent = entry.message.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('');
          
          if (textContent && textContent.length > 0 && entry.timestamp) {
            // ⭐ 将 ISO 字符串转换为毫秒时间戳
            const entryTimestamp = new Date(entry.timestamp).getTime();
            
            // 只处理时间戳大于最后时间的消息
            if (entryTimestamp > state.lastMessageTimestamp) {
              newMessages.push({
                id: entry.id,
                content: textContent,
                timestamp: entryTimestamp  // 存储为数字
              });
              
              // 更新最大时间戳
              if (entryTimestamp > maxTimestamp) {
                maxTimestamp = entryTimestamp;
              }
            }
          }
        }
      } catch (e) {
        // 跳过解析失败的行
      }
    }
    
    // 按时间排序
    newMessages.sort((a, b) => a.timestamp - b.timestamp);
    
    // ⭐ 更新状态中的时间戳
    if (maxTimestamp > state.lastMessageTimestamp) {
      state.lastMessageTimestamp = maxTimestamp;
    }
    
    return newMessages;
  } catch (error) {
    console.error('❌ 读取消息失败:', error.message);
    return [];
  }
}

/**
 * 记录消息到明道云
 */
async function recordMessage(msg) {
  try {
    console.log(`📝 记录消息：${msg.id.substring(0, 8)}... (${msg.content.length} 字符) @${new Date(msg.timestamp).toLocaleTimeString()}`);
    
    await autoHook.recordReply(msg.content, CONFIG.userId);
    
    // ⭐ 更新时间戳（在 saveCache 中已保存）
    // state.lastMessageTimestamp 已在 readNewMessages 中更新
    
    console.log(`✅ 已记录：${msg.id.substring(0, 8)}...`);
    return true;
  } catch (error) {
    console.error(`❌ 记录失败：${msg.id.substring(0, 8)}... - ${error.message}`);
    return false;
  }
}

// ============ 主循环 ============

async function watchSession() {
  console.log('🔍 开始监控会话...');
  console.log(`   目录：${CONFIG.sessionsDir}`);
  console.log(`   间隔：${CONFIG.pollInterval}ms`);
  console.log(`   用户：${CONFIG.userId}`);
  console.log('');
  
  loadCache();
  autoHook.enable(CONFIG.userId);
  
  let lastCheck = Date.now();
  
  while (true) {
    try {
      const sessionFile = getCurrentSessionFile();
      
      if (!sessionFile) {
        await sleep(CONFIG.pollInterval);
        continue;
      }
      
      const sessionName = path.basename(sessionFile);
      
      // 检查会话是否切换
      if (sessionName !== state.currentSessionId) {
        console.log(`📁 会话切换：${sessionName}`);
        state.currentSessionId = sessionName;
        state.lastMessageId = null;
        saveCache();
      }
      
      // 读取新消息
      const newMessages = readNewMessages(sessionFile);
      
      if (newMessages.length > 0) {
        console.log(`📬 发现 ${newMessages.length} 条新消息`);
        
        // 记录所有新消息
        for (const msg of newMessages) {
          await recordMessage(msg);
          await sleep(500);  // 避免 API 限流
        }
      }
      
      lastCheck = Date.now();
      
    } catch (error) {
      console.error('❌ 监控错误:', error.message);
    }
    
    await sleep(CONFIG.pollInterval);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============ 启动 ============

console.log('🚀 OpenClaw 会话监控器启动');
console.log('   按 Ctrl+C 停止\n');

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n⏸️  正在停止...');
  saveCache();
  autoHook.disable();
  console.log('✅ 已保存缓存，再见！');
  process.exit(0);
});

// 启动监控
watchSession().catch(console.error);
