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
          const result = resp ? JSON.parse(resp) : { success: true, raw: resp };
          console.log(`\n${method} ${endpoint}`);
          console.log('Status:', res.statusCode);
          console.log('Full response:', JSON.stringify(result, null, 2).substring(0, 1000));
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

async function main() {
  console.log('🔍 详细测试 API 响应...\n');
  
  // GET rows - full response
  console.log('=== GET rows ===');
  await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`, null);
  
  // Try dialog worksheet
  console.log('\n=== GET dialog rows ===');
  await apiCall('GET', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows`, null);
}

main().catch(console.error);
