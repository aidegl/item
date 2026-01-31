const https = require('https');

const APPKEY = 'b37a969f03b3cf0b';
const SIGN = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';

function createWorksheet() {
  const data = JSON.stringify({
    name: 'claude',
    alias: 'claude',
    fields: [
      {
        name: 'title',
        alias: 'title',
        type: 'Text',
        isTitle: true,
        required: true
      },
      {
        name: 'content',
        alias: 'content',
        type: 'Text',
        controlType: '2'
      },
      {
        name: 'category',
        alias: 'category',
        type: 'Text'
      },
      {
        name: 'status',
        alias: 'status',
        type: 'Text'
      },
      {
        name: 'created_time',
        alias: 'created_time',
        type: 'Date',
        advancedSetting: {
          date: { showtype: '2' }
        }
      }
    ]
  });

  const options = {
    hostname: 'api.mingdao.com',
    port: 443,
    path: '/v3/app/worksheets',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'HAP-Appkey': APPKEY,
      'HAP-Sign': SIGN
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 先获取应用信息
function getAppInfo() {
  const options = {
    hostname: 'api.mingdao.com',
    port: 443,
    path: '/v3/app/info',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': APPKEY,
      'HAP-Sign': SIGN
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('正在获取应用信息...');
  const appInfo = await getAppInfo();
  console.log('应用信息:', JSON.stringify(appInfo, null, 2));

  if (appInfo.worksheets) {
    const exists = appInfo.worksheets.some(ws => ws.name === 'claude' || ws.alias === 'claude');
    if (exists) {
      console.log('\n❌ claude 工作表已存在，无需创建');
      return;
    }
  }

  console.log('\n正在创建 claude 工作表...');
  const result = await createWorksheet();
  console.log('创建结果:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
