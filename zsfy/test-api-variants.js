const https = require('https');

const APPKEY = 'b37a969f03b3cf0b';
const SIGN = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';

function requestAPI(method, path, data) {
  const postData = data ? JSON.stringify(data) : '';

  const options = {
    hostname: 'api.mingdao.com',
    port: 443,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ method, path, status: res.statusCode, result: JSON.parse(body) });
        } catch (e) {
          resolve({ method, path, status: res.statusCode, result: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ method, path, error: err.message });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

async function testVariants() {
  console.log('测试不同的 API 变体...\n');

  const tests = [
    { method: 'POST', path: '/v1/open/worksheet/getWorksheets', data: { appKey: APPKEY, sign: SIGN } },
    { method: 'GET', path: `/v1/open/worksheet/getWorksheets?appKey=${APPKEY}&sign=${SIGN}` },
    { method: 'POST', path: '/open/worksheet/getWorksheets', data: { appKey: APPKEY, sign: SIGN } },
    { method: 'GET', path: `/open/worksheet/getWorksheets?appKey=${APPKEY}&sign=${SIGN}` },
    { method: 'POST', path: '/api/open/worksheet/getWorksheets', data: { appKey: APPKEY, sign: SIGN } },
  ];

  for (const test of tests) {
    const result = await requestAPI(test.method, test.path, test.data);
    console.log(`[${result.status || 'ERROR'}] ${test.method} ${test.path}`);
    if (result.status === 200) {
      console.log('  成功:', JSON.stringify(result.result).substring(0, 300));
    } else if (result.error) {
      console.log('  错误:', result.error);
    } else {
      console.log('  响应:', JSON.stringify(result.result).substring(0, 200));
    }
    console.log();
  }
}

testVariants();
