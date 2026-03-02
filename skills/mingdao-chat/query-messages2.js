const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4',
  dialogWorksheet: '68da90934256d51497bb9ff8'
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
  console.log('🔍 查询明道云对话和消息...\n');
  
  // 查询对话工作表
  console.log('📋 查询对话工作表...');
  const dialogs = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/query`, {
    limit: 10,
    offset: 0
  });
  console.log('对话数量:', dialogs.data?.length || dialogs.rows?.length || 0);
  if (dialogs.data?.length > 0) {
    console.log('第一条对话:', JSON.stringify(dialogs.data[0], null, 2).substring(0, 1000));
  }
  
  // 查询消息工作表 - 带 include 参数
  console.log('\n📋 查询消息工作表 (带 fields)...');
  const messages = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 50,
    offset: 0,
    include: ['all']
  });
  console.log('消息数量:', messages.data?.length || messages.rows?.length || 0);
  if (messages.data?.length > 0) {
    console.log('第一条消息:', JSON.stringify(messages.data[0], null, 2).substring(0, 1500));
  }
  
  // 尝试不带任何参数的查询
  console.log('\n📋 查询消息工作表 (最简参数)...');
  const messages2 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {});
  console.log('消息数量:', messages2.data?.length || messages2.rows?.length || 0);
}

main().catch(console.error);
