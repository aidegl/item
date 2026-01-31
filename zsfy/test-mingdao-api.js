const https = require('https');

const APPKEY = 'b37a969f03b3cf0b';
const SIGN = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';

function tryEndpoint(path, data) {
  return new Promise((resolve) => {
    const postData = data ? JSON.stringify(data) : '';

    const options = {
      hostname: 'api.mingdao.com',
      port: 443,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        'HAP-Appkey': APPKEY,
        'HAP-Sign': SIGN
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ path, status: res.statusCode, result: JSON.parse(body) });
        } catch (e) {
          resolve({ path, status: res.statusCode, result: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

async function testEndpoints() {
  console.log('测试不同 API 端点...\n');

  const endpoints = [
    { path: '/v3/app/info', method: 'GET' },
    { path: '/v3/worksheet/getWorksheets', method: 'GET' },
    { path: '/v3/api/app/info', method: 'GET' },
    { path: '/mcp?HAP-Appkey=' + APPKEY + '&HAP-Sign=' + SIGN, method: 'GET' },
  ];

  for (const ep of endpoints) {
    const result = await tryEndpoint(ep.path, null);
    console.log(`[${result.status || 'ERROR'}] ${ep.path}`);
    if (result.status === 200) {
      console.log('  成功:', JSON.stringify(result.result).substring(0, 200));
    } else if (result.error) {
      console.log('  错误:', result.error);
    } else {
      console.log('  响应:', JSON.stringify(result.result).substring(0, 200));
    }
    console.log();
  }
}

testEndpoints();
