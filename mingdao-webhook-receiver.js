#!/usr/bin/env node
/**
 * 明道云 Webhook 接收器
 * 
 * 接收明道云工作流的实时推送
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

// 启动 HTTP 服务器
http.createServer((req, res) => {
  const receiveTime = Date.now();
  
  if (req.method === 'POST' && req.url === '/mingdao-webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        log('📬 收到明道云 Webhook 推送！');
        log(`   接收时间：${new Date(receiveTime).toISOString()}`);
        log(`   发送时间：${data.createdAt || '未知'}`);
        
        // 计算延迟
        if (data.createdAt) {
          const sendTime = new Date(data.createdAt).getTime();
          const delay = receiveTime - sendTime;
          log(`   ⚡ 延迟：${delay}ms`);
        }
        
        log(`   消息内容：${JSON.stringify(data).substring(0, 200)}...`);
        
        // TODO: 转发到 WebSocket / OpenClaw
        
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`OK - 延迟 ${delay}ms`);
        
      } catch (e) {
        log(`❌ 解析失败：${e.message}`);
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
  
}).listen(PORT, () => {
  log(`🚀 明道云 Webhook 服务器已启动`);
  log(`   监听端口：${PORT}`);
  log(`   接收地址：http://10.0.192.138:${PORT}/mingdao-webhook`);
  log(`   日志文件：${LOG_FILE}`);
  log('');
  log('⏳ 等待明道云推送...');
});
