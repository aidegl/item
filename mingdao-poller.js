#!/usr/bin/env node
/**
 * 明道云轮询器 - 无影云主动拉取消息
 * 
 * 原理：无影云出站流量允许，主动轮询明道云 API
 * 绕过：无影云无法接收推送的限制
 * 
 * 功能：
 * 1. 轮询明道云对话消息
 * 2. 通过 WebSocket 桥接发给风
 * 3. 触发 OpenClaw 自动回复
 */

const https = require('https');
const fs = require('fs');
const { WebSocket } = require('ws');

// ============ 配置 ============
const CONFIG = {
  // 明道云配置
  MINGDAO_API_KEY: process.env.MINGDAO_API_KEY || '',
  MINGDAO_APP_KEY: process.env.MINGDAO_APP_KEY || '',
  
  // 工作表 ID（需要替换成实际的）
  TABLE_CONVERSATION: '68da90934256d51497bb9ff9',  // 对话工作表
  TABLE_MESSAGE: '68da906bd34347b006235da5',      // 消息工作表
  
  // 轮询配置
  POLL_INTERVAL: 60000,  // 60 秒（每分钟检查一次）
  
  // 状态缓存
  STATE_FILE: '/tmp/mingdao-poll-state.json',
  LOG_FILE: '/tmp/mingdao-poll.log'
};

// ============ 工具函数 ============

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  fs.appendFileSync(CONFIG.LOG_FILE, line + '\n');
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.STATE_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
    }
  } catch (e) {
    log('加载状态失败：' + e.message);
  }
  return { lastMessageId: null, lastSyncTime: 0 };
}

function saveState(state) {
  try {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    log('保存状态失败：' + e.message);
  }
}

// ============ 明道云 API ============

function mingdaoRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mingdao.com/v2${endpoint}`;
    const body = data ? JSON.stringify(data) : null;
    
    const req = https.request(url, {
      method,
      headers: {
        'apikey': CONFIG.MINGDAO_API_KEY,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(resp));
        } catch (e) {
          resolve({ raw: resp });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ============ 核心功能 ============

// 获取最新消息
async function fetchNewMessages() {
  const state = loadState();
  
  try {
    log('📡 轮询明道云...');
    
    // 查询对话工作表
    const result = await mingdaoRequest('GET', 
      `/openapi/v2/apps/${CONFIG.MINGDAO_APP_KEY}/tables/${CONFIG.TABLE_CONVERSATION}/records?paging=false`
    );
    
    if (!result.records || result.records.length === 0) {
      log('ℹ️  暂无消息');
      return [];
    }
    
    // 过滤新消息（按时间戳）
    const newMessages = result.records.filter(record => {
      const recordTime = new Date(record.createdAt).getTime();
      return recordTime > state.lastSyncTime;
    });
    
    log(`✅ 获取到 ${newMessages.length} 条新消息`);
    
    // 更新状态
    if (newMessages.length > 0) {
      state.lastSyncTime = Date.now();
      state.lastMessageId = newMessages[newMessages.length - 1].id;
      saveState(state);
    }
    
    return newMessages;
    
  } catch (e) {
    log('❌ 轮询失败：' + e.message);
    return [];
  }
}

// 处理消息（转发给 OpenClaw）
async function processMessage(message) {
  log(`📨 处理消息：${message.id}`);
  
  // TODO: 这里调用 OpenClaw API 或触发事件
  // 例如：openclaw system event --text "..."
  
  console.log('消息内容:', message);
}

// ============ 守护进程 ============

async function runDaemon() {
  log('🚀 启动明道云轮询器...');
  log(`   轮询间隔：${CONFIG.POLL_INTERVAL / 1000}秒`);
  log(`   状态文件：${CONFIG.STATE_FILE}`);
  log('');
  
  // 初始轮询
  const messages = await fetchNewMessages();
  for (const msg of messages) {
    await processMessage(msg);
  }
  
  // 定时轮询
  setInterval(async () => {
    const messages = await fetchNewMessages();
    for (const msg of messages) {
      await processMessage(msg);
    }
  }, CONFIG.POLL_INTERVAL);
  
  log('✅ 轮询器已启动\n');
}

// ============ 命令行 ============

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'daemon':
      await runDaemon();
      break;
      
    case 'check':
      log('手动轮询一次...');
      const messages = await fetchNewMessages();
      console.log('新消息:', messages);
      break;
      
    case 'status':
      const state = loadState();
      console.log('当前状态:', state);
      break;
      
    default:
      console.log(`
明道云轮询器 - 无影云主动拉取消息

用法:
  node mingdao-poller.js daemon   - 后台运行
  node mingdao-poller.js check    - 手动检查
  node mingdao-poller.js status   - 查看状态
`);
  }
}

main().catch(console.error);
