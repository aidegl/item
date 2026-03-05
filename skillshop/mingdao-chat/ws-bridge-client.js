#!/usr/bin/env node
/**
 * WebSocket 桥接客户端 - 明道云消息接收器
 * 
 * 连接到公网 WebSocket 服务器，接收其他客户端发送的消息
 * 并转发到 OpenClaw（通过明道云 API）
 * 
 * 部署说明：
 * 1. 配置 WebSocket 服务器地址（见 config.js）
 * 2. 运行：node ws-bridge-client.js
 * 3. 守护进程：nohup node ws-bridge-client.js > ws-bridge.log 2>&1 &
 */

const WebSocket = require('ws');
const autoHook = require('./auto-hook.js');

// 配置（从 config.js 读取）
let CONFIG = {};
try {
  CONFIG = require('./config.js');
} catch (e) {
  console.error('⚠️  未找到 config.js，使用默认配置');
  CONFIG = {
    WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',
    RECONNECT_INTERVAL: 5000
  };
}

// 初始化 auto-hook
autoHook.enable('master');

let ws = null;
let reconnectTimer = null;

function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level} ${message}`);
}

function connect() {
  log('🔌', `正在连接 WebSocket 服务器...`);
  log('   ', `地址：${CONFIG.WS_URL}`);
  
  ws = new WebSocket(CONFIG.WS_URL);
  
  ws.on('open', () => {
    log('✅', 'WebSocket 连接成功！');
    log('⏳', '等待消息...\n');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      log('📬', '收到消息！');
      log('   ', `类型：${message.type}`);
      log('   ', `发送者：${message.from || '未知'}`);
      log('   ', `内容：${message.data || message.content || JSON.stringify(message).substring(0, 100)}...`);
      
      // 欢迎消息，不需要记录
      if (message.type === 'welcome') {
        log('ℹ️', '欢迎消息，已忽略');
        return;
      }
      
      // 客户端连接/断开通知，不需要记录
      if (['client_connected', 'client_disconnected'].includes(message.type)) {
        log('ℹ️', `${message.type}: ${message.clientId}`);
        return;
      }
      
      // 记录到明道云
      const content = message.data?.content || message.data || message.content || JSON.stringify(message);
      const sender = message.from || 'unknown';
      
      autoHook.recordReply(`📨 收到 ${sender} 的消息：${content}`, 'master')
        .then(() => {
          log('✅', '消息已记录到明道云');
        })
        .catch(err => {
          log('❌', `记录失败：${err.message}`);
        });
      
    } catch (e) {
      log('❌', `消息解析失败：${e.message}`);
      log('   ', `原始数据：${data.toString().substring(0, 200)}`);
    }
  });
  
  ws.on('error', (err) => {
    log('❌', `WebSocket 错误：${err.message}`);
  });
  
  ws.on('close', () => {
    log('⚠️', '连接已关闭');
    log('🔄', `${CONFIG.RECONNECT_INTERVAL/1000}秒后尝试重连...\n`);
    
    reconnectTimer = setTimeout(() => {
      connect();
    }, CONFIG.RECONNECT_INTERVAL);
  });
}

// 启动连接
connect();

// 优雅退出
process.on('SIGINT', () => {
  log('👋', '正在关闭连接...');
  if (ws) ws.close();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  process.exit(0);
});
