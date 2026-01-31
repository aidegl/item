const https = require('https');

const APPKEY = 'b37a969f03b3cf0b';
const SIGN = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';

// v1 API 请求
function requestV1API(path, data) {
  const postData = data ? JSON.stringify(data) : '';

  const options = {
    hostname: 'api.mingdao.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, result: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, result: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message });
    });

    req.write(postData);
    req.end();
  });
}

async function testV1API() {
  console.log('测试 v1 API...\n');

  // 测试获取工作表列表
  const body = {
    appKey: APPKEY,
    sign: SIGN
  };

  const result = await requestV1API('/v1/open/worksheet/getWorksheets', body);
  console.log('获取工作表列表:');
  console.log(JSON.stringify(result, null, 2));
}

testV1API();
