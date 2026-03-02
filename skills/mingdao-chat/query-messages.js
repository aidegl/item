const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
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
  console.log('🔍 查询明道云消息...\n');
  
  // 尝试不同的查询方式
  // 方式 1: 简单 GET 带 limit 参数
  console.log('方式 1: GET /rows?limit=50');
  const result1 = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?limit=50`, null);
  console.log('结果:', JSON.stringify(result1, null, 2).substring(0, 1500));
  
  // 方式 2: POST query 带 filter
  console.log('\n\n方式 2: POST /rows/query 带 filter');
  const result2 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 50,
    offset: 0,
    sort: [{ fieldId: '692d166992609b5d9de82b58', order: 'desc' }]
  });
  console.log('结果:', JSON.stringify(result2, null, 2).substring(0, 1500));
}

main().catch(console.error);
