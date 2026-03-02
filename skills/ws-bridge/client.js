#!/usr/bin/env node
/**
 * WebSocket 桥接客户端
 * 部署在云电脑/容器，主动连接公网 WebSocket 服务
 */

const WebSocket = require('ws');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // WebSocket 服务器地址
  WS_URL: process.env.WS_URL || 'ws://8.155.148.75/ws?client=xiaozong',
  
  // 后端 API 地址
  BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:3001/chat',
  
  // 重连配置
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT: 0,  // 0 = 无限重连
  
  // 日志配置
  LOG_FILE: process.env.LOG_FILE || '/tmp/ws-bridge-client.log',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'  // debug, info, warn, error
};

let ws = null;
let reconnectCount = 0;
let isRunning = true;

// 日志函数
function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${level} ${message}`;
  
  if (CONFIG.LOG_LEVEL === 'debug' || 
     (level === '📬' && CONFIG.LOG_LEVEL === 'info') ||
     (level === '❌' && ['warn', 'error'].includes(CONFIG.LOG_LEVEL))) {
    console.log(line);
  }
  
  // 写入日志文件
  try {
    fs.appendFileSync(CONFIG.LOG_FILE, line + '\n');
  } catch (e) {
    // 忽略日志写入错误
  }
}

// 处理收到的消息
function handleMessage(data) {
  try {
    const msg = JSON.parse(data);
    log('📬', `收到消息：${JSON.stringify(msg)}`);
    
    // 欢迎消息，不需要转发
    if (msg.type === 'welcome') {
      log('✅', `已连接，客户端 ID: ${msg.clientId}`);
      return;
    }
    
    // 客户端连接/断开通知，不需要转发
    if (['client_connected', 'client_disconnected'].includes(msg.type)) {
      log('ℹ️', `${msg.type}: ${msg.clientId}`);
      return;
    }
    
    // 需要处理的消息
    const messageText = msg.data || msg.message || JSON.stringify(msg);
    log('🔄', `转发给后端：${messageText.substring(0, 100)}`);
    
    // 调用后端 API
    callBackend(messageText, msg.from);
    
  } catch (e) {
    log('❌', `消息解析失败：${e.message}`);
  }
}

// 调用后端 API
function callBackend(message, from) {
  try {
    const payload = JSON.stringify({
      message: typeof message === 'string' ? message : JSON.stringify(message),
      from: from || 'websocket',
      time: new Date().toISOString()
    });
    
    // 使用 curl 调用后端
    const result = execSync(
      `curl -s -X POST "${CONFIG.BACKEND_URL}" -H "Content-Type: application/json" -d '${payload.replace(/'/g, "'\\''")}'`,
      { encoding: 'utf-8', timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
    );
    
    log('✅', `后端响应：${result.substring(0, 200)}`);
    
    // 把响应发回给 WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'response',
        data: result,
        time: new Date().toISOString(),
        to: from  // 定向回复给发送者
      }));
    }
  } catch (e) {
    log('❌', `后端调用失败：${e.message}`);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: e.message,
        time: new Date().toISOString()
      }));
    }
  }
}

// 连接 WebSocket
function connect() {
  if (!isRunning) return;
  
  log('🔌', `尝试连接：${CONFIG.WS_URL}`);
  
  try {
    ws = new WebSocket(CONFIG.WS_URL, {
      reconnect: false,
      handshakeTimeout: 10000,
      maxPayload: 10 * 1024 * 1024
    });
    
    ws.on('open', () => {
      log('✅', 'WebSocket 连接成功！');
      reconnectCount = 0;
      
      // 发送握手消息
      ws.send(JSON.stringify({
        type: 'handshake',
        client: 'xiaozong',
        version: '1.0.0',
        time: new Date().toISOString()
      }));
    });
    
    ws.on('message', handleMessage);
    
    ws.on('close', (code, reason) => {
      log('❌', `连接关闭：code=${code}, reason=${reason || 'unknown'}`);
      scheduleReconnect();
    });
    
    ws.on('error', (err) => {
      log('❌', `连接错误：${err.message}`);
    });
    
    ws.on('ping', () => {
      // 自动 pong
    });
    
  } catch (e) {
    log('❌', `连接异常：${e.message}`);
    scheduleReconnect();
  }
}

// 重连逻辑
function scheduleReconnect() {
  if (!isRunning) return;
  
  if (CONFIG.MAX_RECONNECT > 0 && reconnectCount >= CONFIG.MAX_RECONNECT) {
    log('❌', `达到最大重连次数 (${CONFIG.MAX_RECONNECT})，停止重连`);
    return;
  }
  
  reconnectCount++;
  const delay = CONFIG.RECONNECT_INTERVAL * reconnectCount;
  log('⏳', `${delay}ms 后第 ${reconnectCount} 次重连...`);
  
  setTimeout(connect, delay);
}

// 优雅退出
function shutdown() {
  log('👋', '收到退出信号，关闭连接...');
  isRunning = false;
  
  if (ws) {
    ws.close(1000, 'Client shutting down');
  }
  
  setTimeout(() => {
    log('✅', '已退出');
    process.exit(0);
  }, 1000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// 启动
log('🚀', 'WebSocket 客户端启动中...');
log('📍', `目标地址：${CONFIG.WS_URL}`);
log('📍', `后端地址：${CONFIG.BACKEND_URL}`);
log('📍', `日志文件：${CONFIG.LOG_FILE}`);

// 检查 ws 模块
try {
  require.resolve('ws');
} catch (e) {
  log('❌', '缺少 ws 模块，执行：npm install ws');
  process.exit(1);
}

// 开始连接
connect();
