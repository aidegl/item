#!/usr/bin/env node
/**
 * 测试 OpenClaw API - 模拟小程序发消息
 */

const http = require('http');

const MESSAGE = '测试消息：帮我看看当前目录有什么文件';

const data = JSON.stringify({
  message: MESSAGE
});

const options = {
  hostname: '127.0.0.1',
  port: 18789,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('📤 发送消息:', MESSAGE);
console.log('📍 目标：http://127.0.0.1:18789/api/chat');
console.log('---');

const req = http.request(options, (res) => {
  console.log('📥 响应状态:', res.statusCode);
  console.log('📥 响应头:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('📥 响应内容:', body);
  });
});

req.on('error', (e) => {
  console.error('❌ 请求失败:', e.message);
});

req.write(data);
req.end();
