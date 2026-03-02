const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4'
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
  console.log('📋 查询明道云对话...\n');
  
  // 查询对话工作表
  const dialogResult = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/query`, { limit: 10 });
  console.log('对话结果:', JSON.stringify(dialogResult, null, 2).substring(0, 2000));
  
  // 查询消息工作表
  const messageResult = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, { limit: 20 });
  console.log('\n\n消息结果:', JSON.stringify(messageResult, null, 2).substring(0, 3000));
}

main().catch(console.error);
