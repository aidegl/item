const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  messageWorksheet: '68da906bd34347b006235da4'
};

function apiCall(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    console.log(`\n${method} ${endpoint}`);
    console.log('Request body:', body.substring(0, 500));
    
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
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(result, null, 2).substring(0, 1500));
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
  console.log('🔍 测试正确的查询格式...\n');
  
  // POST /rows/query with proper filter
  // According to Mingdao API, we need to send filter in the body
  const queryBody = {
    filter: {
      items: [],
      type: 'and'
    },
    limit: 100,
    offset: 0
  };
  
  console.log('=== POST rows/query with filter ===');
  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, queryBody);
  
  if (result.data && result.data.length > 0) {
    console.log('\n✅ 成功获取数据!');
    console.log('第一条消息:', JSON.stringify(result.data[0], null, 2));
  } else {
    console.log('\n❌ 没有数据返回');
  }
}

main().catch(console.error);
