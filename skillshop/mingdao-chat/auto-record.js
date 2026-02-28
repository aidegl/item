#!/usr/bin/env node
/**
 * OpenClaw 对话自动记录器
 * 
 * 功能：
 *   1. 记录不同 OpenClaw 节点之间的对话
 *   2. 记录当前用户与小粽的每条对话消息
 * 
 * 用法：
 *   1. 手动触发：node auto-record.js <sender> <receiver> <message>
 *   2. 作为模块引入：require('./auto-record.js').record(sender, receiver, message)
 *   3. 自动拦截：启用 autoHook() 自动记录当前会话
 */

const chat = require('./index.js');
const fs = require('fs');
const path = require('path');

// 当前对话 ID 缓存（按参与者分组）
const dialogCache = new Map();

// 自动记录开关
let autoRecordEnabled = false;

/**
 * 获取或创建对话 ID
 */
function getDialogKey(participants) {
  return participants.sort().join(':');
}

/**
 * 自动记录对话
 * 
 * @param {string} sender - 发送者 ('xiaozong', 'feng', 'master', 'user')
 * @param {string|string[]} receiver - 接收者
 * @param {string} message - 消息内容
 * @param {boolean} silent - 是否静默（不打印日志）
 * @returns {Promise<Object>} { dialogId, messageId }
 */
async function record(sender, receiver, message, silent = false) {
  try {
    const receivers = Array.isArray(receiver) ? receiver : [receiver];
    const key = getDialogKey([sender, ...receivers]);
    
    // 检查缓存中是否有对话 ID
    let dialogId = dialogCache.get(key);
    
    // 记录消息
    const result = await chat.recordMessage({
      sender,
      receiver,
      content: message,  // 完整消息，不删减
      dialogId,  // 如果有则复用，没有则创建新对话
      timestamp: Date.now()
    });
    
    // 更新缓存
    dialogCache.set(key, result.dialogId);
    
    if (!silent) {
      console.log(`✅ 已记录：${sender} → ${receivers.join(',')}`);
      console.log(`   内容：${message}`);
    }
    
    return result;
  } catch (error) {
    if (!silent) {
      console.error(`❌ 记录失败：${error.message}`);
    }
    throw error;
  }
}

/**
 * 批量记录对话
 */
async function recordBatch(messages, silent = false) {
  const results = [];
  for (const msg of messages) {
    const result = await record(msg.sender, msg.receiver, msg.content, silent);
    results.push(result);
  }
  return results;
}

/**
 * 启用自动记录钩子（拦截当前会话）
 * 
 * 工作原理：
 *   - 监听会话消息
 *   - 自动记录用户消息和 AI 回复
 *   - 缓存对话 ID，同一对话自动关联
 */
function enableAutoHook() {
  autoRecordEnabled = true;
  console.log('✅ 自动记录已启用：当前会话的每条消息都会记录到明道云');
}

/**
 * 禁用自动记录钩子
 */
function disableAutoHook() {
  autoRecordEnabled = false;
  console.log('⏸️ 自动记录已禁用');
}

/**
 * 记录当前会话的用户消息（在消息处理前调用）
 */
async function onUserMessage(userId, message) {
  if (!autoRecordEnabled) return;
  
  // 默认用户映射到 master（可配置）
  const userKey = userId || 'master';
  
  await record(userKey, 'xiaozong', message, true);
}

/**
 * 记录当前会话的 AI 回复（在发送回复前调用）
 */
async function onAIReply(userId, reply) {
  if (!autoRecordEnabled) return;
  
  const userKey = userId || 'master';
  
  await record('xiaozong', userKey, reply, true);
}

/**
 * 保存对话缓存到文件（用于会话恢复）
 */
function saveCache(filePath = null) {
  if (!filePath) {
    filePath = path.join(__dirname, '.dialog-cache.json');
  }
  
  const cacheData = Object.fromEntries(dialogCache);
  fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2));
  console.log(`💾 对话缓存已保存：${filePath}`);
}

/**
 * 从文件加载对话缓存
 */
function loadCache(filePath = null) {
  if (!filePath) {
    filePath = path.join(__dirname, '.dialog-cache.json');
  }
  
  if (fs.existsSync(filePath)) {
    const cacheData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const [key, value] of Object.entries(cacheData)) {
      dialogCache.set(key, value);
    }
    console.log(`📂 对话缓存已加载：${dialogCache.size} 个对话`);
  }
}

// CLI 模式
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('用法：node auto-record.js <sender> <receiver> <message>');
    console.log('示例：node auto-record.js xiaozong master "你好，主人！"');
    process.exit(1);
  }
  
  const [sender, receiver, ...messageParts] = args;
  const message = messageParts.join(' ');
  
  record(sender, receiver.split(','), message)
    .then(result => {
      console.log('✅ 记录成功:', result);
    })
    .catch(err => {
      console.error('❌ 记录失败:', err.message);
      process.exit(1);
    });
}

// 导出
module.exports = {
  // 核心功能
  record,
  recordBatch,
  
  // 自动钩子
  enableAutoHook,
  disableAutoHook,
  onUserMessage,
  onAIReply,
  
  // 缓存管理
  saveCache,
  loadCache,
  dialogCache,
  
  // 状态
  get autoRecordEnabled() {
    return autoRecordEnabled;
  }
};
