#!/usr/bin/env node
/**
 * 测试查询明道云消息 - 使用正确的字段 ID
 */

const https = require('https');

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

function apiCall(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    
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
          console.error('解析失败:', e.message);
          resolve({ success: true, raw: resp });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('🔍 查询明道云消息...\n');
  
  // 使用正确的字段 ID 查询
  const queryData = {
    limit: 20,
    offset: 0,
    include: ['all']
  };
  
  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, queryData);
  console.log('🔬 API 返回:');
  console.log(JSON.stringify(result, null, 2));
  
  // 尝试不同返回结构
  const data = result.data || {};
  const messages = data.rows || result.rows || (Array.isArray(result) ? result : []);
  
  console.log(`\n📦 消息数量: ${messages.length}`);
  
  if (messages.length > 0) {
    console.log('\n📝 消息列表:');
    for (const msg of messages) {
      const fields = {};
      if (msg.fields) {
        for (const field of msg.fields) {
          fields[field.id] = field.value;
        }
      }
      
      const content = fields[CONFIG.fields.message.neirong] || fields['neirong'] || '无内容';
      const userId = fields[CONFIG.fields.message.yonghu] || fields['yonghu'] || [];
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const userName = USERS[userIdStr] || userIdStr || 'unknown';
      
      console.log(`\n[${userName}] ${new Date(fields[CONFIG.fields.message.riqi] || Date.now()).toLocaleString()}`);
      console.log(`  ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    }
  }
}

main().catch(console.error);
