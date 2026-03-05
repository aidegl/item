#!/usr/bin/env node
/**
 * 消息队列服务 - 启动 WebSocket 服务器
 * 
 * 功能：
 * 1. 启动 WebSocket 服务器（端口 3012）
 * 2. WebUI 可以订阅消息
 * 3. 提供 HTTP API 发送测试消息
 * 
 * 使用方法:
 * node message-queue-service.js
 */

const http = require('http');
const WebSocket = require('ws');
const messageQueue = require('./message-queue.js');

const WS_PORT = 3012;
const HTTP_PORT = 3013;

// 启动 WebSocket 服务器
messageQueue.startWSServer(WS_PORT);

// 创建 HTTP 服务器（测试用）
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 路由
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', messages: messageQueue.getHistory().length }));
    return;
  }
  
  if (req.method === 'GET' && req.url === '/messages') {
    const messages = messageQueue.getHistory({ limit: 100 });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ messages }));
    return;
  }
  
  if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const msg = messageQueue.add({
          type: 'chat',
          from: data.from || 'unknown',
          to: data.to || 'unknown',
          content: data.content || '',
          status: 'sent'
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: msg }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }
  
  // 默认 404
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(HTTP_PORT, () => {
  console.log(`🚀 消息队列服务已启动`);
  console.log(`   WebSocket: ws://localhost:${WS_PORT}`);
  console.log(`   HTTP API: http://localhost:${HTTP_PORT}`);
  console.log(`   健康检查：http://localhost:${HTTP_PORT}/health`);
  console.log(`   消息列表：http://localhost:${HTTP_PORT}/messages`);
  console.log(`   发送消息：POST http://localhost:${HTTP_PORT}/send`);
  console.log(`   WebUI 演示：打开 skills/mingdao-chat/webui-demo.html`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n⏸️ 正在关闭服务...');
  messageQueue.stopWSServer();
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});
