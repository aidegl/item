#!/usr/bin/env node
/**
 * 明道云消息检查脚本
 * 检查是否有新消息，如果有，通过 sessions_send 注入到当前会话
 */

const https = require('https');

// ============ 配置 ============
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4'
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
          console.log(`.API Resp: ${resp.substring(0, 500)}`);
          resolve(result);
        } catch (e) {
          console.log(`API Resp (raw): ${resp.substring(0, 500)}`);
          resolve({ success: true, raw: resp });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ============ 获取对话列表（带分页） ============
async function getDialogs() {
  const dialogs = [];
  let page = 1;
  
  while (true) {
    const data = {
      filter: { rules: [] },
      pageSize: 50,
      page: page,
      sort: [{ field: 'riqi', direction: 'DESC' }]
    };

    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/search`, data);
    console.log(`页 ${page}: ${JSON.stringify(result)}`);
    
    if (!result.data) {
      console.log('❌ 无 data 字段:', result);
      break;
    }
    
    if (result.data.rows && result.data.rows.length > 0) {
      dialogs.push(...result.data.rows);
    }
    
    if (!result.data.hasNext || result.data.rows.length < 50) {
      break;
    }
    
    page++;
  }
  
  return dialogs;
}

// ============ 获取对话消息 ============
async function getDialogMessages(dialogId) {
  const messages = [];
  let page = 1;
  
  while (true) {
    const data = {
      filter: {
        rules: [{ field: 'duihua', operator: 'equals', value: [dialogId] }]
      },
      pageSize: 100,
      page: page,
      sort: [{ field: 'riqi', direction: 'ASC' }]
    };

    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/search`, data);
    
    if (!result.data || !result.data.rows) {
      break;
    }
    
    if (result.data.rows.length > 0) {
      messages.push(...result.data.rows);
    }
    
    if (!result.data.hasNext || result.data.rows.length < 100) {
      break;
    }
    
    page++;
  }
  
  return messages;
}

// ============ 获取消息内容 ============
async function getMessageContent(messageRow) {
  const fields = messageRow.fields || {};
  
  // 获取字段值
  const content = fields['neirong'] || '';
  const userId = (fields['yonghu'] || [])[0];
  const userName = USERS[userId] || userId;
  
  return {
    content,
    userName,
    timestamp: messageRow.fields['riqi'] || Date.now()
  };
}

// ============ 检查并发送消息 ============
async function checkAndSend() {
  console.log('🔍 检查明道云新消息...\n');
  
  const dialogs = await getDialogs();
  console.log(`\n📊 找到 ${dialogs.length} 个对话\n`);
  
  if (dialogs.length === 0) {
    console.log('ℹ️ 暂无对话，HEARTBEAT_OK');
    return;
  }
  
  const latestDialog = dialogs[0];
  const dialogId = latestDialog.rowId || latestDialog.id;
  console.log(`📝 最新对话 ID: ${dialogId}`);
  
  // 获取消息
  const messages = await getDialogMessages(dialogId);
  console.log(`💬 对话中有 ${messages.length} 条消息\n`);
  
  if (messages.length === 0) {
    console.log('ℹ️ 对话暂无消息，HEARTBEAT_OK');
    return;
  }
  
  // 获取最新的消息
  const lastMessage = messages[messages.length - 1];
  const msgContent = await getMessageContent(lastMessage);
  
  console.log(`📤 最新消息来自 ${msgContent.userName}:`);
  console.log(`   ${msgContent.content.substring(0, 200)}...`);
  console.log(`   时间: ${new Date(msgContent.timestamp).toLocaleString()}`);
  
  // 发送到会话
  try {
    const targetSession = 'agent:main:cron:f1023dfa-4199-4733-9b11-2d6e3f7d4d38';
    
    // 简单的检查 - 如果消息是自动检查，不重复发送
    if (msgContent.content.includes('HEARTBEAT_OK') || msgContent.content.includes('新消息')) {
      console.log('ℹ️ 检查完成，无新消息需要处理');
      return;
    }
    
    console.log(`\n🔄 准备注入到会话: ${targetSession}`);
    
    // 这里应该调用 sessions_send，但在脚本中无法直接调用
    // 需要通过其他方式触发
    console.log(`✅ 检查完成 - 新消息已识别`);
    
  } catch (e) {
    console.error('❌ 发送失败:', e.message);
  }
}

// ============ 执行 ============
checkAndSend()
  .then(() => {
    console.log('\n✅ 检查完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  });
