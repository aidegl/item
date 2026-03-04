/**
 * MingDaoYun Chat Skill - 明道云对话记录（简化版）
 * 
 * 功能：将 OpenClaw 对话自动记录到明道云
 * 特点：每条消息完整记录，不摘要不删减
 */

const https = require('https');

// ============ 配置 ============
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  userWorksheet: '68534cf5750002dbcc681334',
  lastCheckFile: '/home/admin/openclaw/workspace/skills/mingdao-chat/.last-check.json'
};

// ============ 用户映射 ============
const USERS = {
  xiaozong: '7548a483-2b5b-4de0-be06-63b318ca52c4',
  feng: 'adde88c8-de91-4484-9a5e-070f50079ed8',
  master: 'ff074b4e-92ad-466e-9018-d3a7d150e8ee'
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

// ============ API 工具函数 ============

/**
 * 分页获取消息记录
 */
async function getMessagesByPage({ dialogId = null, lastUpdateAfter = null, page = 1, pageSize = 50 } = {}) {
  const params = new URLSearchParams({
    pageIndex: page,
    pageSize: pageSize,
    fields: 'neirong,duihua,yonghu,riqi'
  });
  
  // 合并 filter，用 AND 连接
  const filters = [];
  if (dialogId) {
    filters.push(`duihua="${dialogId}"`);
  }
  if (lastUpdateAfter) {
    filters.push(`riqi>${lastUpdateAfter}`);
  }
  
  if (filters.length > 0) {
    params.append('filter', filters.join(' AND '));
  }
  
  const path = `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?${params.toString()}`;
  
  return new Promise((resolve, reject) => {
    const req = https.request(`https://api.mingdao.com${path}`, {
      method: 'GET',
      headers: {
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
    req.end();
  });
}

/**
 * 获取指定对话的所有消息
 */
async function getMessages(dialogId) {
  const allMessages = [];
  let page = 1;
  
  while (true) {
    const result = await getMessagesByPage({ dialogId, page, pageSize: 50 });
    const messages = result.data?.rows || [];
    
    if (messages.length === 0) break;
    
    allMessages.push(...messages);
    page++;
    
    // 如果返回的消息少于 pageSize，说明已经到最后一页
    if (messages.length < pageSize) break;
  }
  
  return allMessages;
}

/**
 * 获取最新消息（按时间戳过滤）
 */
async function getNewMessages(lastCheckTime) {
  const allMessages = [];
  let page = 1;
  
  while (true) {
    const result = await getMessagesByPage({ 
      lastUpdateAfter: lastCheckTime,
      page, 
      pageSize: 50 
    });
    
    const messages = result.data?.rows || [];
    
    if (messages.length === 0) break;
    
    // 过滤出比 lastCheckTime 新的消息
    const newMessages = messages.filter(msg => {
      const msgTime = msg.fields?.riqi?.value || msg.fields?.riqi;
      return msgTime > lastCheckTime;
    });
    
    allMessages.push(...newMessages);
    page++;
    
    if (messages.length < pageSize) break;
  }
  
  return allMessages;
}

// ============ 核心功能 ============

/**
 * 创建对话
 */
async function createDialog(initiator, receivers, firstMessage) {
  const data = {
    fields: [
      { id: 'neirong', value: firstMessage },
      { id: 'faqiren', value: [initiator] },
      { id: 'jieshouren', value: receivers },
      { id: 'leixing', value: 'AI' },
      { id: 'riqi', value: Date.now() }
    ]
  };

  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows`, data);
  return result.data?.id || result.data?.rowId;
}

/**
 * 创建消息（完整记录，不删减）
 */
async function createMessage(content, dialogId, senderId, timestamp = null) {
  const data = {
    fields: [
      { id: 'neirong', value: content },
      { id: 'duihua', value: [dialogId] },
      { id: 'yonghu', value: [senderId] },
      { id: 'riqi', value: timestamp || Date.now() }
    ]
  };

  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`, data);
  return result.data?.id || result.data?.rowId;
}

/**
 * 记录单条消息
 * 
 * @param {Object} options
 * @param {string} options.sender - 发送者 ('xiaozong', 'feng', 'master')
 * @param {string|string[]} options.receiver - 接收者
 * @param {string} options.content - 消息内容（完整记录）
 * @param {string} options.dialogId - 对话 ID（可选，不提供则创建新对话）
 * @param {number} options.timestamp - 时间戳（可选）
 * @returns {Object} { dialogId, messageId }
 */
async function recordMessage({ sender, receiver, content, dialogId = null, timestamp = null }) {
  const senderId = USERS[sender] || sender;
  const receivers = (Array.isArray(receiver) ? receiver : [receiver]).map(r => USERS[r] || r);

  // 如果没有对话 ID，创建新对话
  if (!dialogId) {
    dialogId = await createDialog(senderId, receivers, content);
  }

  // 创建消息
  const messageId = await createMessage(content, dialogId, senderId, timestamp);

  return {
    dialogId,
    messageId,
    success: true
  };
}

/**
 * 记录完整对话（批量导入）
 * 
 * @param {Object} options
 * @param {string} options.initiator - 发起人
 * @param {string[]} options.receivers - 接收者列表
 * @param {Array} options.messages - 消息数组 [{ sender, content, timestamp }]
 * @returns {Object} { dialogId, messageCount }
 */
async function recordConversation({ initiator, receivers, messages }) {
  if (!messages || messages.length === 0) {
    throw new Error('消息列表不能为空');
  }

  const initiatorId = USERS[initiator] || initiator;
  const receiverIds = receivers.map(r => USERS[r] || r);

  // 创建对话
  const dialogId = await createDialog(initiatorId, receiverIds, messages[0].content);

  // 批量创建消息
  for (const msg of messages) {
    const senderId = USERS[msg.sender] || msg.sender;
    await createMessage(msg.content, dialogId, senderId, msg.timestamp);
  }

  return {
    dialogId,
    messageCount: messages.length,
    success: true
  };
}

// ============ 导出 ============
module.exports = {
  // 核心功能
  recordMessage,
  recordConversation,
  createMessage,
  createDialog,
  
  // 获取消息
  getMessages,
  getNewMessages,
  getMessagesByPage,
  
  // 配置和用户映射
  CONFIG,
  USERS,
  
  // 直接 API 调用
  apiCall
};
