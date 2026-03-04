#!/usr/bin/env node
/**
 * Cron Check & Inject - 明道云消息检查并注入到当前会话
 * 每次检查自上次检查以来的新消息
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4',
  dialogWorksheet: '68da90934256d51497bb9ff8'
};

const USERS = {
  '7548a483-2b5b-4de0-be06-63b318ca52c4': '小粽',
  'adde88c8-de91-4484-9a5e-070f50079ed8': '风',
  'ff074b4e-92ad-466e-9018-d3a7d150e8ee': '林东城'
};

// 状态文件
const STATE_FILE = '/home/admin/openclaw/workspace/skills/mingdao-chat/.check-state-cron.json';
const LAST_CHECK_FILE = '/home/admin/openclaw/workspace/skills/mingdao-chat/.last-check.json';
const MESSAGE_QUEUE_FILE = '/home/admin/openclaw/workspace/skills/mingdao-chat/.message-queue.json';

// 按 _CreatedAt 查询消息
function getMessagesSince(lastCheckTime) {
  const data = {
    filters: [{
      field: '_createdAt',
      operator: 'greater_than',
      value: lastCheckTime
    }],
    sorts: [{ field: '_createdAt', isAsc: false }],
    pageIndex: 1,
    pageSize: 50
  };

  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    const req = https.request('https://api.mingdao.com/v3/app/worksheets/' + CONFIG.messageWorksheet + '/rows/list', {
      method: 'POST',
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
          resolve(JSON.parse(resp));
        } catch (e) {
          resolve({ success: false, error: e.message, raw: resp });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 格式化时间
function formatTime(isoString) {
  if (!isoString) return '未知时间';
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

// 提取消息内容
function extractMessage(msg) {
  if (msg.neirong) return msg.neirong;
  if (msg.fields && Array.isArray(msg.fields)) {
    for (const field of msg.fields) {
      if (field.id === '68da906bd34347b006235da5' && field.value) {
        return Array.isArray(field.value) ? field.value[0]?.text || field.value[0] : field.value;
      }
    }
  }
  return '';
}

// 获取发送者名称
function getSenderName(msg) {
  // 方式 1: yonghu 是对象数组
  if (msg.yonghu && Array.isArray(msg.yonghu) && msg.yonghu.length > 0) {
    const user = msg.yonghu[0];
    if (typeof user === 'object' && user.sid) {
      return USERS[user.sid] || user.name || '未知用户';
    }
  }
  // 方式 2: yonghu 是字符串
  if (msg.yonghu && typeof msg.yonghu === 'string') {
    return USERS[msg.yonghu] || '未知用户';
  }
  // 方式 3: 使用 yhnc（用户名称）
  return msg.yhnc || '未知用户';
}

// 获取当前时间（作为下一次检查的基准）
function getCurrentTime() {
  return new Date().toISOString();
}

// 保存检查状态
function saveState(lastCheckTime, lastMessageId) {
  const state = {
    lastCheckTime,
    lastMessageId,
    checked: 1
  };
  const fs = require('fs');
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log('✅ 状态已保存:', state);
}

// 加载上次检查状态
function loadState() {
  const fs = require('fs');
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(data);
    // 确保 lastCheckTime 使用小于号（<），查询 createdAt > lastCheckTime 的消息
    return state;
  } catch (e) {
    return { lastCheckTime: '2026-03-04T01:29:11.040Z', lastMessageId: '1168491b-8740-49d4-a3be-f4983e8b9899', checked: 0 };
  }
}

async function main() {
  console.log('=== 明道云消息检查 & 注入 ===\n');
  console.log('本次检查时间:', formatTime(new Date().toISOString()));
  console.log('');

  // 加载上次检查状态
  const state = loadState();
  console.log('上次检查时间:', formatTime(state.lastCheckTime));
  console.log('上次消息 ID:', state.lastMessageId || '无');
  console.log('');

  // 查询新消息
  console.log('🔍 查询新消息...\n');
  const result = await getMessagesSince(state.lastCheckTime);

  if (!result.success) {
    console.log('❌ 查询失败:', result.error || result);
    process.exit(1);
  }

  const newMessages = result.data?.rows || [];
  console.log(`找到 ${newMessages.length} 条新消息\n`);

  if (newMessages.length === 0) {
    console.log('✅ 没有新消息');
    process.exit(0);
  }

  // 处理新消息（按时间正序，确保顺序正确）
  const messagesToInject = newMessages.sort((a, b) => {
    return new Date(a._createdAt) - new Date(b._createdAt);
  });

  for (const msg of messagesToInject) {
    const content = extractMessage(msg);
    const senderName = getSenderName(msg);
    const timeStr = formatTime(msg._createdAt);
    const messageId = msg.rowId;

    console.log(`📩 [${timeStr}] ${senderName}: ${content.substring(0, 50)}...`);

    // 构造消息文本（包含发送者信息和时间）
    const injectText = `**明道云同步消息**\n\n时间: ${timeStr}\n发送者: ${senderName}\n内容: ${content}`;

    console.log(`   📤 写入消息队列...`);
    const queueFile = '/home/admin/openclaw/workspace/skills/mingdao-chat/.message-queue.json';
    console.log(`   📤 写入消息队列...`);
    
    try {
      // 读取现有队列
      let queue = [];
      try {
        if (fs.existsSync(queueFile)) {
          queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
        }
      } catch (e) {
        console.log(`   ⚠️  读取队列失败，新建队列`);
      }
      
      // 添加新消息
      queue.push({
        time: new Date().toISOString(),
        sender: senderName,
        content: content,
        injected: false
      });
      
      // 写回队列
      fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));
      console.log(`   ✅ 已写入队列 (${queue.length} 条待处理)`);
    } catch (e) {
      console.log(`   ❌ 写入队列失败: ${e.message}`);
    }
  }

  console.log('\n✅ 检查完成');
  console.log('-Length:', newMessages.length, '条');
  console.log('-Last Message ID:', messagesToInject[messagesToInject.length - 1].rowId);

  // 更新状态
  // 保存最后一条消息的时间作为下一次检查的起点
  // 使用 lastMsg._createdAt 而不是 currentTime，避免边界问题
  const lastMsg = messagesToInject[messagesToInject.length - 1];
  const lastMsgTime = lastMsg._createdAt;
  saveState(lastMsgTime, lastMsg.rowId);
  
  console.log('\n✅ 下次检查起点时间:', formatTime(lastMsgTime));
}

main().catch(console.error);
