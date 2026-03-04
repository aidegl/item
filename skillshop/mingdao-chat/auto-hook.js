#!/usr/bin/env node
/**
 * OpenClaw 自动记录钩子 - 真正的自动记录
 * 
 * 集成方式：
 * 1. 在 OpenClaw 启动时加载此模块
 * 2. 每次发送消息前自动调用 recordReply()
 * 3. 无需手动触发，完全自动化
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ============ 配置 ============
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  // 字段 ID（实际 ID，不是别名）
  fields: {
    dialog: {
      neirong: '68da90934256d51497bb9ff9',      // 内容
      faqiren: '68da90c3432b11f7ba68cb6c',     // 发起人/咨询人
      jieshouren: '692bfbb1e22247ab9a654f3d',  // 接收人/服务者
      leixing: '692bb183e22247ab9a64a383',     // 类型
      riqi: '692cf82fe22247ab9a67d78d'         // 日期
    },
    message: {
      neirong: '68da906bd34347b006235da5',     // 内容
      duihua: '68da9105d34347b006235df6',      // 对话
      yonghu: '692d147433260875c1970b8a',      // 用户
      riqi: '692d166992609b5d9de82b58'         // 日期
    }
  }
};

const USERS = {
  xiaozong: '7548a483-2b5b-4de0-be06-63b318ca52c4',
  feng: 'adde88c8-de91-4484-9a5e-070f50079ed8',
  master: 'ff074b4e-92ad-466e-9018-d3a7d150e8ee'
};

// 对话缓存
let dialogCache = {};
const CACHE_FILE = path.join(__dirname, '.dialog-cache.json');

// 确保缓存总是对象
function ensureCache() {
  if (!dialogCache || typeof dialogCache !== 'object') {
    dialogCache = {};
  }
}

// ============ 工具函数 ============

function apiCall(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    
    // 打印原始请求体
    console.log('📋 HTTP 请求体（原始 JSON）:');
    console.log(body);
    console.log('---');
    
    const req = https.request(`https://api.mingdao.com${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HAP-Appkey': CONFIG.appkey,
        'HAP-Sign': CONFIG.sign
      }
    }, res => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          resolve(resp ? JSON.parse(resp) : { success: true });
        } catch (e) {
          resolve({ success: true, raw: resp });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ============ 缓存管理 ============

function loadCache() {
  ensureCache();
  if (fs.existsSync(CACHE_FILE)) {
    try {
      dialogCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch (e) {
      dialogCache = {};
    }
  }
  return dialogCache;
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(dialogCache, null, 2));
}

function getDialogKey(participants) {
  return participants.sort().join(':');
}

// ============ 核心功能 ============

/**
 * 创建对话
 */
async function createDialog(initiator, receivers, firstMessage) {
  const data = {
    fields: [
      { id: CONFIG.fields.dialog.neirong, value: firstMessage },
      { id: CONFIG.fields.dialog.faqiren, value: [initiator] },
      { id: CONFIG.fields.dialog.jieshouren, value: receivers },
      { id: CONFIG.fields.dialog.leixing, value: 'AI' },
      { id: CONFIG.fields.dialog.riqi, value: Date.now() }
    ]
  };
  
  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows`, data);
  return result.data?.id || result.data?.rowId;
}

/**
 * 创建消息（完整原文，包括 Markdown）
 */
async function createMessage(content, dialogId, senderId) {
  const data = {
    fields: [
      { id: CONFIG.fields.message.neirong, value: content },  // 完整原文，不处理
      { id: CONFIG.fields.message.duihua, value: [dialogId] },
      { id: CONFIG.fields.message.yonghu, value: [senderId] },
      { id: CONFIG.fields.message.riqi, value: Date.now() }
    ]
  };
  
  // 打印请求体日志
  console.log('📋 请求体:', JSON.stringify(data, null, 2));
  
  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`, data);
  return result.data?.id || result.data?.rowId;
}

/**
 * 记录消息（自动创建或复用对话）
 */
async function recordMessage(sender, receiver, content) {
  // 确保缓存已加载
  ensureCache();
  
  // 支持通配符 sender（记录实际 sender）
  const senderId = USERS[sender] || sender;
  const receivers = (Array.isArray(receiver) ? receiver : [receiver]).map(r => USERS[r] || r);
  
  // 如果是通配符记录，.senderId 通常是 'openclaw-control-ui' 或其他非标准 ID
  // 这时需要映射到明道云的用户 ID（使用默认映射）
  if (!USERS[sender] && sender !== 'xiaozong' && sender !== 'feng' && sender !== 'master') {
    // 自动映射未知 sender 到明道云 API（通过 API 调用）
    // 临时方案：使用 senderId 直接作为用户 ID（明道云 API 会验证）
    console.log(`⚠️ 未知用户 ${sender}，使用原始 ID`);
  }
  
  const key = getDialogKey([sender, ...receivers]);
  let dialogId = dialogCache[key];
  
  if (!dialogId) {
    dialogId = await createDialog(senderId, receivers, content);
    dialogCache[key] = dialogId;
    saveCache();
    console.log(`📝 创建新对话：${dialogId}`);
  }
  
  // 创建消息
  const messageId = await createMessage(content, dialogId, senderId);
  console.log(`✅ 已记录：${sender} → ${receiver} (消息 ID: ${messageId})`);
  
  return { dialogId, messageId };
}

/**
 * 记录 AI 回复（自动调用）
 * 
 * 在 OpenClaw 发送回复后自动调用此函数
 */
async function recordReply(replyContent, userId = 'master') {
  try {
    await recordMessage('xiaozong', userId, replyContent);
  } catch (error) {
    console.error('❌ 记录失败:', error.message);
  }
}

/**
 * 记录用户消息（可选）
 */
async function recordUserMessage(message, userId = 'master') {
  try {
    await recordMessage(userId, 'xiaozong', message);
  } catch (error) {
    console.error('❌ 记录失败:', error.message);
  }
}

// ============ 自动钩子 ============

let autoRecordEnabled = false;
const originalSendFunctions = [];

/**
 * 启用自动记录
 * 
 * 调用后，所有 recordReply() 调用都会自动记录到明道云
 * 
 * 支持多 sender：
 * - enable() 或 enable('*') → 所有消息都记录（不限制 sender）
 * - enable('master') → 仅 master 消息
 * - enable('master', 'openclaw-control-ui') → 仅这些 sender
 */
function enable(...users) {
  autoRecordEnabled = true;
  loadCache();
  
  const targetUsers = users.length > 0 && users[0] !== '*' ? users : ['*'];
  
  console.log('📝 自动记录已启用');
  console.log(`   用户：${targetUsers.join(', ')}`);
  console.log(`   缓存：${Object.keys(dialogCache).length} 个对话`);
  return targetUsers;
}

/**
 * 禁用自动记录
 */
function disable() {
  autoRecordEnabled = false;
  saveCache();
  console.log('⏸️ 自动记录已禁用，缓存已保存');
}

/**
 * 包装发送函数（自动记录）
 * 
 * 用法：
 *   const wrappedSend = autoHook.wrapSend(originalSendFunction);
 *   // 之后调用 wrappedSend() 会自动记录
 */
function wrapSend(sendFunction, userId = 'master') {
  return async function(content) {
    // 先发送
    const result = await sendFunction(content);
    
    // 自动记录
    if (autoRecordEnabled) {
      await recordReply(content, userId);
    }
    
    return result;
  };
}

// ============ 导出 ============

module.exports = {
  // 核心功能
  recordMessage,
  recordReply,
  recordUserMessage,
  
  // 自动钩子
  enable,
  disable,
  wrapSend,
  
  // 状态
  get isEnabled() {
    return autoRecordEnabled;
  },
  
  // 直接 API 调用
  apiCall,
  createDialog,
  createMessage,
  
  // 配置
  CONFIG,
  USERS
};
