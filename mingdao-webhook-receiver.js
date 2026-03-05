#!/usr/bin/env node
/**
 * 明道云 Webhook 接收器 - 修复版
 * 
 * 接收宝塔 WebSocket 消息推送
 * 转发到 OpenClaw（通过明道云 API）
 */

const http = require('http');
const fs = require('fs');

const PORT = 3003;
const LOG_FILE = '/tmp/mingdao-webhook.log';

// 引入 auto-hook 发送到 OpenClaw
const autoHook = require('./skills/mingdao-chat/auto-hook.js');

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// 初始化 auto-hook
autoHook.enable('master');

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
        
        log('📬 收到宝塔 Webhook 推送！');
        log(`   接收时间：${new Date(receiveTime).toISOString()}`);
        log(`   发送时间：${data.createdAt || '未知'}`);
        
        // 计算延迟
        let delay = 0;
        if (data.createdAt) {
          const sendTime = new Date(data.createdAt).getTime();
          delay = receiveTime - sendTime;
          log(`   ⚡ 延迟：${delay}ms`);
        }
        
        log(`   消息内容：${JSON.stringify(data).substring(0, 200)}...`);
        
        // 发送到 OpenClaw（明道云）
        const messageContent = data.content || data.text || JSON.stringify(data);
        autoHook.recordReply(messageContent, 'master')
          .then(() => {
            log('✅ 消息已转发到 OpenClaw');
          })
          .catch(err => {
            log(`❌ 转发失败：${err.message}`);
          });
        
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
  
}).listen(PORT, '0.0.0.0', () => {
  log(`🚀 明道云 Webhook 服务器已启动`);
  log(`   监听端口：${PORT}`);
  log(`   接收地址：http://0.0.0.0:${PORT}/mingdao-webhook`);
  log(`   日志文件：${LOG_FILE}`);
  log('');
  log('⏳ 等待宝塔推送...');
});
