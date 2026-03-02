#!/usr/bin/env node
/**
 * 小程序后端 API - 转发消息给 OpenClaw
 * 
 * 使用方式：
 * POST http://localhost:3001/chat
 * Body: { "message": "帮我看看有什么文件" }
 */

const http = require('http');
const { execSync } = require('child_process');

const PORT = 3001;

console.log(`🚀 小程序后端 API 启动中...`);
console.log(`📍 监听端口：${PORT}`);
console.log(`📋 接口：POST /chat`);
console.log('---');

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        
        if (!message) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'message 字段必填' }));
          return;
        }
        
        console.log(`📥 收到消息：${message}`);
        
        // 执行 openclaw system event 命令
        const command = `openclaw system event --text "${message.replace(/"/g, '\\"')}" --mode now 2>&1`;
        console.log(`🔧 执行命令：${command}`);
        
        const result = execSync(command, {
          encoding: 'utf-8',
          timeout: 60000,
          cwd: '/home/admin/openclaw/workspace'
        });
        
        console.log(`📤 命令结果：${result.substring(0, 200)}...`);
        
        // 返回结果
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '消息已发送到 OpenClaw',
          result: result.substring(0, 1000) // 限制长度
        }));
        
      } catch (error) {
        console.error(`❌ 错误：${error.message}`);
        res.writeHead(500);
        res.end(JSON.stringify({
          error: error.message
        }));
      }
    });
    
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务已启动，可以接收请求`);
});
