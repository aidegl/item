#!/usr/bin/env node
/**
 * WebSocket 客户端 - 无影云主动连接公网服务器
 * 通过 80 端口出站，绕过无影云入站限制
 */

const WebSocket = require('ws');
const { execSync } = require('child_process');
const fs = require('fs');

// 配置
const CONFIG = {
  // 公网服务器 WebSocket 地址（通过 Nginx 代理 /ws）
  WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',
  
  // 重连配置
  RECONNECT_INTERVAL: 5000,  // 5 秒
  MAX_RECONNECT: 10,
  
  // 日志
  LOG_FILE: '/tmp/ws-bridge-client.log'
};

let ws = null;
let reconnectCount = 0;

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(CONFIG.LOG_FILE, line + '\n');
}

// 处理收到的消息
function handleMessage(data) {
  try {
    const msg = JSON.parse(data);
    log(`📬 收到消息：${JSON.stringify(msg)}`);
    
    // 如果是小程序发来的消息，转发给 OpenClaw
    if (msg.type === 'chat' || msg.data || msg.message) {
      log('🔄 转发给 OpenClaw...');
      
      const messageText = msg.data || msg.message || JSON.stringify(msg);
      
      try {
        const result = execSync(
          `curl -s -X POST http://127.0.0.1:3001/chat -H "Content-Type: application/json" -d '${JSON.stringify({ message: messageText }).replace(/'/g, "'\\''")}'`,
          { encoding: 'utf-8', timeout: 30000 }
        );
        log(`✅ OpenClaw 响应：${result.substring(0, 200)}`);
      // ⚠️ 不再返回响应给 WebSocket（单向转发）
      // if (ws && ws.readyState === WebSocket.OPEN) {
      //   ws.send(JSON.stringify({
      //     type: 'response',
      //     data: result,
      //     time: new Date().toISOString()
      //   }));
      // }
      } catch (e) {
        log(`❌ OpenClaw 调用失败：${e.message}`);
        // ⚠️ 不再返回错误给 WebSocket（单向转发）
        // if (ws && ws.readyState === WebSocket.OPEN) {
        //   ws.send(JSON.stringify({
        //     type: 'error',
        //     message: e.message
        //   }));
        // }
      }
    }
  } catch (e) {
    log(`❌ 消息解析失败：${e.message}`);
  }
}

// 连接 WebSocket
function connect() {
  log(`🔌 尝试连接：${CONFIG.WS_URL}`);
  
  ws = new WebSocket(CONFIG.WS_URL, {
    reconnect: false  // 手动重连
  });
  
  ws.on('open', () => {
    log('✅ WebSocket 连接成功！');
    reconnectCount = 0;
    
    // 发送握手消息
    ws.send(JSON.stringify({
      type: 'handshake',
      client: 'xiaozong',
      time: new Date().toISOString()
    }));
  });
  
  ws.on('message', handleMessage);
  
  ws.on('close', (code, reason) => {
    log(`❌ 连接关闭：code=${code}, reason=${reason}`);
    scheduleReconnect();
  });
  
  ws.on('error', (err) => {
    log(`❌ 连接错误：${err.message}`);
  });
}

// 重连逻辑
function scheduleReconnect() {
  if (reconnectCount >= CONFIG.MAX_RECONNECT) {
    log('❌ 达到最大重连次数，停止重连');
    return;
  }
  
  reconnectCount++;
  const delay = CONFIG.RECONNECT_INTERVAL * reconnectCount;
  log(`⏳ ${delay}ms 后第 ${reconnectCount} 次重连...`);
  
  setTimeout(connect, delay);
}

// 启动
log('🚀 WebSocket 客户端启动中...');
log(`📍 目标地址：${CONFIG.WS_URL}`);

// 检查 ws 模块
try {
  require.resolve('ws');
} catch (e) {
  log('❌ 缺少 ws 模块，执行：npm install ws');
  process.exit(1);
}

// 连接
connect();

// 保持进程运行
process.on('SIGINT', () => {
  log('👋 收到退出信号，关闭连接...');
  if (ws) ws.close();
  process.exit(0);
});