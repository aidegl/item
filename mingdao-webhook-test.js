#!/usr/bin/env node
/**
 * 明道云 Webhook 接收器 - 最简测试版
 */

const http = require('http');
const fs = require('fs');

const PORT = 3003;
const LOG_FILE = '/tmp/mingdao-webhook.log';

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

log('🚀 启动中...');

const server = http.createServer((req, res) => {
  const receiveTime = Date.now();
  
  // CORS 预检请求处理
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    log(`📥 OPTIONS 预检请求 - 已允许`);
    return;
  }
  
  log(`📥 收到请求：${req.method} ${req.url}`);
  
  if (req.method === 'POST' && req.url === '/mingdao-webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const sendTime = data.createdAt ? new Date(data.createdAt).getTime() : receiveTime;
        const delay = receiveTime - sendTime;
        
        log('✅ 收到消息！');
        log(`   延迟：${delay}ms`);
        log(`   内容：${JSON.stringify(data)}`);
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`OK - 延迟 ${delay}ms\n`);
        
      } catch (e) {
        log(`❌ 错误：${e.message}`);
        res.writeHead(400);
        res.end('Invalid JSON\n');
      }
    });
    
  } else {
    res.writeHead(404);
    res.end('Not Found\n');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  log(`✅ 服务器已启动`);
  log(`   端口：${PORT}`);
  log(`   地址：http://0.0.0.0:${PORT}/mingdao-webhook`);
});

server.on('error', (err) => {
  log(`❌ 服务器错误：${err.message}`);
});
