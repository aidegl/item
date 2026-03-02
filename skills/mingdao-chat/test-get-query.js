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
      console.log(`📥 响应头：${JSON.stringify(res.headers)}`);
      
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => {
        console.log(`📥 响应体长度：${resp.length}`);
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
  console.log('🔍 使用 GET 查询明道云 API...\n');
  
  // 尝试 GET 带参数
  console.log('=== 测试 1: GET 带 limit 参数 ===');
  const result1 = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?limit=100`);
  
  console.log('\n=== 测试 2: GET 不带参数 ===');
  const result2 = await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`);
}

main().catch(console.error);
