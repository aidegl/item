#!/usr/bin/env node
/**
 * OpenClaw 自主通信引擎
 * 
 * 让多个 OpenClaw AI 之间自主交流
 * 
 * 使用方法:
 * node auto-chat-engine.js
 */

const WebSocket = require('ws');
const http = require('http');

// 配置
const CONFIG = {
  // WebSocket 服务器
  wsServer: process.env.WS_SERVER || 'ws://8.155.148.75/ws',
  
  // 当前客户端
  clientId: process.env.CLIENT_ID || 'xiaozong',
  nodeId: process.env.NODE_ID || 'node_67a98114',
  
  // HTTP API
  agentApiUrl: process.env.AGENT_API_URL || 'http://localhost:3020/chat',
  
  // 对话控制
  maxTurns: parseInt(process.env.MAX_TURNS) || 10,        // 最多 10 轮
  conversationWindow: parseInt(process.env.CONV_WINDOW) || 30 * 60 * 1000,  // 30 分钟
  cooldownMs: parseInt(process.env.COOLDOWN) || 5000,     // 5 秒冷却
  minContentLength: parseInt(process.env.MIN_LENGTH) || 10,  // 最少 10 字
  maxRepeatedTurns: parseInt(process.env.MAX_REPEAT) || 3,   // 最多 3 次重复
  
  // 结束关键词
  endKeywords: [
    '再见', '拜拜', '下次聊', '结束', 'bye', 'goodbye',
    '谢谢', '明白了', '好的', '知道了', '就这样'
  ],
  
  // 忽略关键词（太短或无意义）
  ignoreKeywords: ['嗯', '哦', '啊', '呃', '哦哦', '嗯嗯']
};

// 对话状态
let conversationState = {
  active: false,
  turnCount: 0,
  lastMessageTime: 0,
  lastContent: '',
  repeatedCount: 0,
  startTime: 0
};

// WebSocket 连接
let ws = null;
let reconnectTimer = null;

// 连接到 WebSocket 服务器
function connect() {
  const wsUrl = `${CONFIG.wsServer}?client=${CONFIG.clientId}`;
  
  console.log(`🔌 正在连接：${wsUrl}`);
  
  ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log('✅ 已连接到 WebSocket 服务器');
    conversationState.active = true;
    conversationState.startTime = Date.now();
  });
  
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      await handleMessage(msg);
    } catch (e) {
      console.error('❌ 解析消息失败:', e.message);
    }
  });
  
  ws.on('close', () => {
    console.log('❌ 连接已关闭，5 秒后重连...');
    conversationState.active = false;
    scheduleReconnect();
  });
  
  ws.on('error', (err) => {
    console.error('❌ WebSocket 错误:', err.message);
  });
}

// 安排重连
function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, 5000);
}

// 处理收到的消息
async function handleMessage(msg) {
  const content = msg.data?.content || msg.content || '';
  const from = msg.from || 'unknown';
  
  console.log(`\n📥 收到消息 from ${from}:`);
  console.log(`   ${content.substring(0, 80)}...`);
  
  // 检查对话控制
  if (!shouldReply(content)) {
    console.log('⏸️ 跳过回复');
    return;
  }
  
  // 更新状态
  conversationState.turnCount++;
  conversationState.lastMessageTime = Date.now();
  conversationState.lastContent = content;
  
  console.log(`📊 第 ${conversationState.turnCount}/${CONFIG.maxTurns} 轮`);
  
  // 调用 AI API 获取回复
  try {
    const reply = await callAgentAPI(content, from);
    
    console.log(`🤖 AI 回复：${reply.content.substring(0, 80)}...`);
    
    // 发送回复
    sendReply(from, reply.content);
    
    // 检查是否应该结束
    if (shouldEndConversation(reply.content)) {
      console.log('🏁 检测到结束信号，停止对话');
      conversationState.active = false;
    }
    
  } catch (e) {
    console.error('❌ 调用 AI 失败:', e.message);
  }
}

// 检查是否应该回复
function shouldReply(content) {
  // 检查对话是否激活
  if (!conversationState.active) {
    console.log('⏸️ 对话未激活');
    return false;
  }
  
  // 检查轮次限制
  if (conversationState.turnCount >= CONFIG.maxTurns) {
    console.log(`⏸️ 已达到最大轮次 (${CONFIG.maxTurns})`);
    return false;
  }
  
  // 检查时间窗口
  const now = Date.now();
  if (now - conversationState.lastMessageTime > CONFIG.conversationWindow) {
    console.log('⏰ 对话超时');
    return false;
  }
  
  // 检查冷却时间
  if (now - conversationState.lastMessageTime < CONFIG.cooldownMs) {
    console.log('⏳ 冷却中');
    return false;
  }
  
  // 检查忽略关键词
  for (const keyword of CONFIG.ignoreKeywords) {
    if (content.includes(keyword)) {
      console.log(`⚠️ 包含忽略关键词：${keyword}`);
      return false;
    }
  }
  
  // 检查内容长度
  if (content.length < CONFIG.minContentLength) {
    console.log(`⚠️ 内容太短 (${content.length} < ${CONFIG.minContentLength})`);
    conversationState.repeatedCount++;
    if (conversationState.repeatedCount >= CONFIG.maxRepeatedTurns) {
      console.log('🛑 短消息太多，停止对话');
      conversationState.active = false;
    }
    return false;
  }
  
  // 检查重复
  if (content === conversationState.lastContent) {
    conversationState.repeatedCount++;
    if (conversationState.repeatedCount >= CONFIG.maxRepeatedTurns) {
      console.log('🔁 重复太多，停止对话');
      return false;
    }
    console.log(`⚠️ 重复内容 (${conversationState.repeatedCount}/${CONFIG.maxRepeatedTurns})`);
    return false;
  } else {
    conversationState.repeatedCount = 0;
  }
  
  return true;
}

// 检查是否应该结束对话
function shouldEndConversation(content) {
  for (const keyword of CONFIG.endKeywords) {
    if (content.includes(keyword)) {
      return true;
    }
  }
  return false;
}

// 调用 AI API
async function callAgentAPI(message, context) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      context: {
        from: context,
        conversationTurns: conversationState.turnCount
      }
    });
    
    const req = http.request(CONFIG.agentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 60000
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(new Error(`解析失败：${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(data);
    req.end();
  });
}

// 发送回复
function sendReply(to, content) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('❌ WebSocket 未连接，无法发送');
    return;
  }
  
  const message = {
    type: 'chat',
    from: CONFIG.clientId,
    fromNode: CONFIG.nodeId,
    to: to,
    data: {
      type: 'chat',
      content: content,
      timestamp: new Date().toISOString(),
      conversationTurns: conversationState.turnCount
    }
  };
  
  ws.send(JSON.stringify(message));
  console.log(`📤 已发送给 ${to}: ${content.substring(0, 50)}...`);
}

// 启动
console.log('🚀 OpenClaw 自主通信引擎启动');
console.log(`   客户端：${CONFIG.clientId}`);
console.log(`   节点：${CONFIG.nodeId}`);
console.log(`   WebSocket: ${CONFIG.wsServer}`);
console.log(`   AI API: ${CONFIG.agentApiUrl}`);
console.log(`   最大轮次：${CONFIG.maxTurns}`);
console.log(`   时间窗口：${CONFIG.conversationWindow / 1000 / 60} 分钟`);
console.log('\n💬 AI 自主交流开始！\n');

connect();

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n⏸️ 正在关闭...');
  if (ws) ws.close();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  process.exit(0);
});
