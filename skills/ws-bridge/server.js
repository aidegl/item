#!/usr/bin/env node
/**
 * WebSocket 桥接服务端
 * 部署在公网服务器，接受客户端 WebSocket 连接并转发消息
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.WS_PORT || 3010;
const clients = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Bridge Service Running\n');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  // 从 URL 获取客户端 ID: /ws?client=xxx
  const url = new URL(req.url, `http://${req.headers.host}`);
  const clientId = url.searchParams.get('client') || 'unknown';
  
  console.log(`[${new Date().toISOString()}] ✅ 客户端连接：${clientId}`);
  console.log(`   IP: ${req.socket.remoteAddress}`);
  console.log(`   UA: ${req.headers['user-agent']}`);
  
  clients.set(clientId, ws);
  
  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    serverTime: new Date().toISOString(),
    message: '已连接到 WebSocket 桥接服务',
    connectedClients: Array.from(clients.keys())
  }));
  
  // 通知其他客户端
  broadcast({
    type: 'client_connected',
    clientId,
    time: new Date().toISOString()
  }, clientId);
  
  // 处理收到的消息
  ws.on('message', (data) => {
    const message = data.toString();
    console.log(`[${new Date().toISOString()}] 📬 [${clientId}] 收到：`, message.substring(0, 200));
    
    try {
      const msg = JSON.parse(message);
      
      // 如果是广播消息
      if (msg.broadcast) {
        broadcast({
          type: 'broadcast',
          from: clientId,
          data: msg,
          time: new Date().toISOString()
        });
        return;
      }
      
      // 如果是定向消息（指定 to）
      if (msg.to) {
        const targetClient = clients.get(msg.to);
        if (targetClient && targetClient.readyState === WebSocket.OPEN) {
          targetClient.send(JSON.stringify({
            type: 'direct_message',
            from: clientId,
            data: msg.data || msg,
            time: new Date().toISOString()
          }));
          console.log(`   📤 已转发给：${msg.to}`);
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: `客户端 ${msg.to} 不在线`
          }));
        }
        return;
      }
      
      // 默认：广播给其他所有客户端
      broadcast({
        from: clientId,
        data: message,
        time: new Date().toISOString()
      }, clientId);
      
    } catch (e) {
      console.error(`   ❌ 消息解析失败：`, e.message);
    }
  });
  
  ws.on('close', (code, reason) => {
    console.log(`[${new Date().toISOString()}] ❌ 客户端断开：${clientId} (code=${code})`);
    clients.delete(clientId);
    
    // 通知其他客户端
    broadcast({
      type: 'client_disconnected',
      clientId,
      time: new Date().toISOString()
    });
  });
  
  ws.on('error', (err) => {
    console.error(`[${clientId}] ❌ 错误：`, err.message);
  });
  
  // 心跳检测
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
  
  ws.on('pong', () => {
    // 心跳正常
  });
});

// 广播函数
function broadcast(message, excludeClientId = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// 启动服务
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 WebSocket 桥接服务已启动');
  console.log(`📍 监听地址：http://0.0.0.0:${PORT}`);
  console.log(`📍 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`📍 连接示例：ws://localhost:${PORT}/ws?client=myclient\n`);
});

// 优雅退出
process.on('SIGTERM', () => {
  console.log('\n👋 收到退出信号，关闭服务...');
  clients.forEach((client) => client.close());
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 收到中断信号，关闭服务...');
  clients.forEach((client) => client.close());
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});
