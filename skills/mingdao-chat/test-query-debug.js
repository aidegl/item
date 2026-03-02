const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4'
};

function apiCall(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    console.log(`\n📡 请求：${method} ${endpoint}`);
    if (body) console.log(`📦 请求体：${body.substring(0, 500)}`);
    
    const req = https.request(`https://api.mingdao.com${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'HAP-Appkey': CONFIG.appkey,
        'HAP-Sign': CONFIG.sign
      }
    }, res => {
      console.log(`📥 响应状态：${res.statusCode}`);
      console.log(`📥 响应头：${JSON.stringify(res.headers)}`);
      
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        console.log(`📥 响应体长度：${resp.length}`);
        console.log(`📥 响应体：${resp.substring(0, 2000)}`);
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
  console.log('🔍 调试明道云 API 查询...\n');
  
  // 尝试不同的查询方式
  console.log('=== 测试 1: POST query 带完整参数 ===');
  const result1 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 100,
    offset: 0,
    sort: [{ fieldId: '692d166992609b5d9de82b58', order: 'desc' }]
  });
  console.log('结果 data:', result1.data?.length);
  console.log('结果 rows:', result1.rows?.length);
  
  console.log('\n=== 测试 2: POST query 最简单 ===');
  const result2 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {});
  console.log('结果 data:', result2.data?.length);
  console.log('结果 rows:', result2.rows?.length);
}

main().catch(console.error);
