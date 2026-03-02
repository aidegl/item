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

async function main() {
  console.log('🔍 尝试带过滤条件的查询...\n');
  
  // 尝试带 filter 的查询
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  
  console.log('尝试 1: 带 filter 查询 (最近 24 小时)');
  const result1 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 50,
    offset: 0,
    filter: {
      expr: {
        op: 'gt',
        field: '692d166992609b5d9de82b58',
        value: oneDayAgo
      }
    }
  });
  console.log('结果:', JSON.stringify(result1, null, 2).substring(0, 2000));
  
  console.log('\n尝试 2: 使用 controls 参数');
  const result2 = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/query`, {
    limit: 50,
    offset: 0,
    controls: {
      filter: {
        expr: {
          op: 'gt',
          field: '692d166992609b5d9de82b58',
          value: oneDayAgo
        }
      }
    }
  });
  console.log('结果:', JSON.stringify(result2, null, 2).substring(0, 2000));
}

main().catch(console.error);
