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
          const result = resp ? JSON.parse(resp) : { success: true };
          console.log(`\n${method} ${endpoint}`);
          console.log('Status:', res.statusCode);
          console.log('Response keys:', Object.keys(result));
          console.log('Has data?', 'data' in result);
          console.log('Has rows?', 'rows' in result);
          console.log('Data length:', result.data?.length || 'N/A');
          console.log('Rows length:', result.rows?.length || 'N/A');
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
  console.log('🔍 测试不同查询方式...\n');
  
  // 方式 1: GET without query
  await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows`, null);
  
  // 方式 2: GET with paging=false
  await apiCall('GET', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows?paging=false`, null);
  
  // 方式 3: POST query with empty filter
  await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {});
  
  // 方式 4: POST query with limit
  await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, { limit: 100 });
  
  // 方式 5: POST query with sort
  await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 100,
    sort: [{ fieldId: '692d166992609b5d9de82b58', order: 'desc' }]
  });
}

main().catch(console.error);
