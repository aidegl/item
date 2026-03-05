#!/usr/bin/env node
/**
 * 明道云消息检查脚本 - Cron 专用版
 * 
 * 功能：
 * 1. 检查明道云对话系统是否有新消息
 * 2. 如果有新消息，输出到临时文件供主 session 注入
 */

const https = require('https');
const fs = require('fs');

// ============ 配置 ============
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  lastCheckFile: '/home/admin/openclaw/workspace/.mingdao-cron-state.json',
  pendingFile: '/home/admin/openclaw/workspace/.mingdao-pending.json'
};

const USERS = {
  '7548a483-2b5b-4de0-be06-63b318ca52c4': 'xiaozong',
  'adde88c8-de91-4484-9a5e-070f50079ed8': 'feng',
  'ff074b4e-92ad-466e-9018-d3a7d150e8ee': 'master'
};

function log(message, verbose = true) {
  if (!verbose) return;
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${message}`);
}

function loadState() {
  try {
    if (fs.existsSync(CONFIG.lastCheckFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.lastCheckFile, 'utf8'));
    }
  } catch (e) {
    log('⚠️  加载状态失败：' + e.message);
  }
  return { lastCheckTime: 0, lastMessageId: null, lastDialogId: null };
}

function saveState(state) {
  try {
    // 读取现有状态并合并
    let existing = {};
    if (fs.existsSync(CONFIG.lastCheckFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(CONFIG.lastCheckFile, 'utf8'));
      } catch (e) {}
    }
    
    // 合并新状态
    const merged = { ...existing, ...state };
    fs.writeFileSync(CONFIG.lastCheckFile, JSON.stringify(merged, null, 2));
    log('✅ 状态已保存');
  } catch (e) {
    log('⚠️  保存状态失败：' + e.message);
  }
}

function apiCall(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const req = https.request(`https://api.mingdao.com${path}`, {
      method: method,
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
          const result = resp ? JSON.parse(resp) : { success: true };
          resolve(result);
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

// ============ 获取对话列表 ============
async function getDialogs() {
  const data = {
    filter: { rules: [] },
    pageSize: 10,
    page: 1,
    sort: [{ field: 'riqi', direction: 'DESC' }]
  };

  const path = `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/search`;
  const result = await apiCall('POST', path, data);
  return result.data?.rows || [];
}

// ============ 获取对话消息 ============
async function getDialogMessages(dialogId) {
  const data = {
    filter: {
      rules: [{ field: 'duihua', operator: 'equals', value: [dialogId] }]
    },
    pageSize: 50,
    page: 1,
    sort: [{ field: 'riqi', direction: 'ASC' }]
  };

  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/search`, data);
  return result.data?.rows || [];
}

// ============ 判断是否是新消息 ============
function isNewMessage(message, state) {
  const messageId = message.rowId || message.id;
  return messageId !== state.lastMessageId;
}

// ============ 提取消息内容 ============
function extractMessageContent(messageRow) {
  const fields = messageRow.fields || {};
  
  const content = fields['neirong'] || '';
  const userId = (fields['yonghu'] || [])[0];
  const userName = USERS[userId] || userId;
  const timestamp = fields['riqi'] || Date.now();
  const dialogId = (fields['duihua'] || [])[0];
  
  return {
    content,
    userName,
    timestamp,
    dialogId,
    messageId: messageRow.rowId || messageRow.id
  };
}

// ============ 主函数 ============
async function main() {
  log('🔍 检查明道云新消息...\n');
  
  const state = loadState();
  log(`📊 上次检查时间: ${new Date(state.lastCheckTime).toLocaleString()}`);
  log(`📊 上次消息 ID: ${state.lastMessageId || '无'}`);
  
  try {
    // 获取所有对话
    const dialogs = await getDialogs();
    log(`\n📦 找到 ${dialogs.length} 个对话\n`);
    
    if (dialogs.length === 0) {
      log('ℹ️ 暂无对话');
      saveState(state);
      return;
    }
    
    // 处理每个对话（按时间倒序）
    for (const dialog of dialogs) {
      const dialogId = dialog.rowId || dialog.id;
      const dialogContent = dialog.fields?.neirong || '';
      
      log(`📝 对话 ID: ${dialogId}`);
      log(`   首条消息: ${dialogContent.substring(0, 50)}...`);
      
      // 获取对话消息
      const messages = await getDialogMessages(dialogId);
      log(`   消息数: ${messages.length}`);
      
      if (messages.length === 0) {
        continue;
      }
      
      // 检查每条消息是否是新的
      for (const msg of messages) {
        const msgInfo = extractMessageContent(msg);
        
        if (isNewMessage(msg, state)) {
          log(`\n✅ 发现新消息!`);
          log(`   来自: ${msgInfo.userName}`);
          log(`   内容: ${msgInfo.content.substring(0, 100)}...`);
          
          // 保存到待处理文件
          const pendingData = {
            messages: [msgInfo],
            processed: false,
            createdAt: Date.now()
          };
          fs.writeFileSync(CONFIG.pendingFile, JSON.stringify(pendingData, null, 2));
          log(`\n📤 消息已保存到: ${CONFIG.pendingFile}`);
          
          // 更新状态
          state.lastMessageId = msgInfo.messageId;
          state.lastDialogId = dialogId;
          state.lastCheckTime = Date.now();
          saveState(state);
          
          console.log('\n=== CHECK COMPLETE ===');
          process.exit(0);
        }
      }
    }
    
    // 没有新消息
    log('\nℹ️  无新消息需要处理');
    state.lastCheckTime = Date.now();
    saveState(state);
    
  } catch (e) {
    log(`❌ 错误: ${e.message}`);
    log(e.stack);
  }
  
  console.log('\n=== CHECK COMPLETE ===');
}

main();
