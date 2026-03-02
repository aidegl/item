const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4'
};

function apiCall(method, endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`\n📡 请求：${method} ${endpoint}`);
    
    const req = https.request(`https://api.mingdao.com${endpoint}`, {
      method,
      headers: {
        'HAP-Appkey': CONFIG.appkey,
        'HAP-Sign': CONFIG.sign
      }
    }, res => {
      console.log(`📥 响应状态：${res.statusCode}`);
      
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        console.log(`📥 响应体：${resp.substring(0, 3000)}`);
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
  console.log('🔍 使用 GET 带 filter 查询...\n');
  
  // 尝试带 filter 参数 - 使用 URL 编码
  const filter = encodeURIComponent('{"and":[]}');
  console.log('=== 测试 1: GET 带空 filter ===');
  const result1 = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?filter=${filter}&limit=100`);
  
  // 尝试带 sort 参数
  console.log('\n=== 测试 2: GET 带 sort 参数 ===');
  const sort = encodeURIComponent('[{"fieldId":"692d166992609b5d9de82b58","order":"desc"}]');
  const result2 = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?sort=${sort}&limit=100`);
}

main().catch(console.error);
