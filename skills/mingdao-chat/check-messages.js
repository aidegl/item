#!/usr/bin/env node
/**
 * 明道云消息检查脚本
 * 检查是否有新消息，如果有，通过 sessions_send 注入到当前会话
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============ 配置 ============
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  fields: {
    dialog: {
      neirong: '68da90934256d51497bb9ff9',
      faqiren: '68da90c3432b11f7ba68cb6c',
      jieshouren: '692bfbb1e22247ab9a654f3d',
      leixing: '692bb183e22247ab9a64a383',
      riqi: '692cf82fe22247ab9a67d78d'
    },
    message: {
      neirong: '68da906bd34347b006235da5',
      duihua: '68da9105d34347b006235df6',
      yonghu: '692d147433260875c1970b8a',
      riqi: '692d166992609b5d9de82b58'
    }
  }
};

const USERS = {
  '7548a483-2b5b-4de0-be06-63b318ca52c4': 'xiaozong',
  'adde88c8-de91-4484-9a5e-070f50079ed8': 'feng',
  'ff074b4e-92ad-466e-9018-d3a7d150e8ee': 'master'
};

// ============ API 调用 ============
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
    filter: {
      rules: [
        {
          field: CONFIG.fields.dialog.leixing,
          operator: 'equals',
          value: 'AI'
        }
      ]
    },
    pageSize: 100,
    page: 1,
    sort: [
      {
        field: CONFIG.fields.dialog.riqi,
        direction: 'DESC'
      }
    ]
  };
  
  console.log(`🔍 查询对话列表...`);

  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/search`, data);
  return result.data?.rows || [];
}

// ============ 获取对话消息 ============
async function getDialogMessages(dialogId) {
  const data = {
    filter: {
      rules: [
        {
          field: CONFIG.fields.message.duihua,
          operator: 'equals',
          value: [dialogId]
        }
      ]
    },
    pageSize: 100,
    page: 1,
    sort: [
      {
        field: CONFIG.fields.message.riqi,
        direction: 'ASC'
      }
    ]
  };

  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/search`, data);
  return result.data?.rows || [];
}

// ============ 获取消息详情 ============
async function getMessageContent(messageRow) {
  const fields = messageRow.fields || {};
  
  // 获取字段值
  const content = fields[CONFIG.fields.message.neirong] || '';
  
  const userId = (fields[CONFIG.fields.message.yonghu] || [])[0];
  const userName = USERS[userId] || userId;
  
  return {
    content,
    userName,
    timestamp: messageRow.data?.riqi || messageRow.fields[CONFIG.fields.message.riqi] || Date.now()
  };
}

// ============.sessions_send API 调用 ============
async function sendToSession(sessionKey, message) {
  try {
    // 通过 sessions_send 工具调用（在 OpenClaw 环境中）
    // 注意：这是 Node.js 脚本，无法直接调用 OpenClaw 的 sessions_send 工具
    // 需要通过 HTTP API 或调用 openclaw CLI
    const { exec } = require('child_process');
    
    // 转义消息中的特殊字符
    const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const cmd = `openclaw session send --message "${escapedMessage}" --target-session "${sessionKey}"`;
    
    // 使用 exec 异步执行
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ 发送失败: ${error.message}`);
        console.error(`Stderr: ${stderr}`);
      } else {
        console.log(`✅ 发送成功: ${stdout}`);
      }
    });
    
    return true;
  } catch (err) {
    console.error(`❌ 发送异常: ${err.message}`);
    return false;
  }
}

// ============ 主逻辑 ============
async function checkNewMessages() {
  const targetSessionKey = 'f3dc9156-004e-4f88-a9cc-f58ddc91253f';
  
  console.log(`🔍 检查明道云新消息 (目标会话: ${targetSessionKey})...`);
  
  // 获取对话列表
  const dialogs = await getDialogs();
  console.log(`📊 找到 ${dialogs.length} 个对话`);
  
  if (dialogs.length === 0) {
    console.log('ℹ️ 无对话');
    return;
  }
  
  // 获取最新对话
  const latestDialog = dialogs[0];
  const dialogId = latestDialog.rowId || latestDialog.id;
  console.log(`📝 最新对话 ID: ${dialogId}`);
  
  // 获取对话消息
  const messages = await getDialogMessages(dialogId);
  console.log(`💬 对话中有 ${messages.length} 条消息`);
  
  if (messages.length === 0) {
    console.log('ℹ️ 对话无消息');
    return;
  }
  
  // 处理每条消息
  for (const msg of messages) {
    const { content, userName, timestamp } = await getMessageContent(msg);
    
    // 构造消息文本
    const msgText = `[明道云消息来自 ${userName}]\n${content}`;
    
    console.log(`📤 发送到会话: ${msgText.substring(0, 50)}...`);
    
    // 发送到目标会话
    await sendToSession(targetSessionKey, msgText);
    
    // 间隔一下，避免太快
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('✅ 检查完成');
}

// ============ 执行 ============
checkNewMessages()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  });
