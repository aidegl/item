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

async function test() {
  console.log('ADING debug API 调用...');
  
  // 尝试获取消息工作表的所有行（带 include 参数）
  const queryData = {
    limit: 10,
    offset: 0,
    include: ['all']
  };
  
  const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, queryData);
  
  console.log('完整响应:');
  console.log(JSON.stringify(result, null, 2));
  
  // 尝试直接获取对话
  const dialogResult = await apiCall('GET', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows?limit=5&offset=0&include=all`, null);
  console.log('\n对话列表:');
  console.log(JSON.stringify(dialogResult, null, 2));
}

test();
