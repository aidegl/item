#!/usr/bin/env node
/**
 * OpenClaw Agent HTTP API
 * 
 * 将 OpenClaw AI 回复封装成 HTTP API，供其他 AI 调用
 * 
 * 使用方法:
 * node openclaw-agent-api.js
 * 
 * API 端点:
 * POST /chat - 发送消息给 AI，获取回复
 * GET  /health - 健康检查
 */

const http = require('http');
const { exec } = require('child_process');
const url = require('url');

// 配置
const CONFIG = {
  port: process.env.AGENT_API_PORT || 3020,
  maxContentLength: 5000,  // 最大消息长度
  timeoutMs: 60000         // 超时时间（60 秒）
};

// 请求处理
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // 路由
  if (req.method === 'GET' && pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    return;
  }
  
  if (req.method === 'POST' && pathname === '/chat') {
    await handleChat(req, res);
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 处理聊天请求
async function handleChat(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
    // 限制请求体大小
    if (body.length > CONFIG.maxContentLength) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request too large' }));
      req.destroy();
    }
  });
  
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { message, context = {} } = data;
      
      if (!message || typeof message !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Missing or invalid "message" field',
          required: { message: 'string' }
        }));
        return;
      }
      
      console.log(`\n📥 API 请求：${message.substring(0, 50)}...`);
      
      // 调用 openclaw agent
      const result = await callAgent(message, context);
      
      console.log(`📤 API 回复：${result.content.substring(0, 50)}...`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      
    } catch (e) {
      console.error('❌ API 错误:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: e.message,
        stack: process.env.DEBUG ? e.stack : undefined
      }));
    }
  });
}

// 调用 OpenClaw Agent
async function callAgent(message, context = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // 转义消息
    const escaped = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    // 构建命令
    const cmd = `openclaw agent --message "${escaped}" --deliver`;
    
    console.log(`🚀 执行：${cmd}`);
    
    // 执行命令
    const proc = exec(cmd, {
      timeout: CONFIG.timeoutMs,
      env: { ...process.env, FORCE_COLOR: '0' }  // 禁用颜色输出
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);
    
    proc.on('close', code => {
      const duration = Date.now() - startTime;
      
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
        return;
      }
      
      // 解析输出
      const content = extractContent(stdout);
      
      resolve({
        success: true,
        content: content || stdout,
        duration,
        timestamp: new Date().toISOString(),
        context
      });
    });
    
    proc.on('error', reject);
  });
}

// 从输出中提取 AI 回复内容
function extractContent(output) {
  // 尝试提取 AI 回复（跳过日志和元数据）
  const lines = output.split('\n');
  const contentLines = [];
  
  let inContent = false;
  
  for (const line of lines) {
    // 跳过日志行
    if (line.startsWith('Config warnings:')) continue;
    if (line.startsWith('🦞')) continue;
    if (line.startsWith('Usage:')) continue;
    if (line.includes('openclaw')) continue;
    
    // 提取内容
    if (line.trim() && !line.startsWith('[')) {
      contentLines.push(line);
    }
  }
  
  return contentLines.join('\n').trim();
}

// 启动服务器
server.listen(CONFIG.port, () => {
  console.log('🚀 OpenClaw Agent API 已启动');
  console.log(`   端口：${CONFIG.port}`);
  console.log(`   健康检查：GET http://localhost:${CONFIG.port}/health`);
  console.log(`   聊天接口：POST http://localhost:${CONFIG.port}/chat`);
  console.log('\n使用示例:');
  console.log(`   curl -X POST http://localhost:${CONFIG.port}/chat \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"message":"你好"}'`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n⏸️ 正在关闭...');
  server.close(() => {
    console.log('✅ 服务已关闭');
    process.exit(0);
  });
});
