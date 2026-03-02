const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4'
};

function apiCall(method, endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.request(`https://api.mingdao.com${endpoint}`, {
      method,
      headers: {
        'HAP-Appkey': CONFIG.appkey,
        'HAP-Sign': CONFIG.sign
      }
    }, res => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        try {
          resolve(resp ? JSON.parse(resp) : { success: true, raw: resp });
        } catch (e) {
          resolve({ success: true, raw: resp });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔍 尝试 GET 请求...\n');
  
  // 尝试 GET 请求
  console.log('尝试 GET /v3/app/worksheets/{worksheetId}/rows');
  const result = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`);
  console.log('结果:', JSON.stringify(result, null, 2).substring(0, 3000));
}

main().catch(console.error);
