const https = require('https');

const APPKEY = 'b37a969f03b3cf0b';
const SIGN = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';

// MCP JSON-RPC 请求格式
function sendMCPRequest(method, params = {}) {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: Date.now(),
    method: method,
    params: params
  });

  const path = `/mcp?HAP-Appkey=${encodeURIComponent(APPKEY)}&HAP-Sign=${encodeURIComponent(SIGN)}`;

  const options = {
    hostname: 'api.mingdao.com',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
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

    req.write(data);
    req.end();
  });
}

async function testMCP() {
  console.log('测试 MCP JSON-RPC 请求 (URL参数鉴权)...\n');

  const methods = [
    'get_app_info',
    'get_worksheet_list',
    'list_worksheets',
    'tools/list',
    'initialize'
  ];

  for (const method of methods) {
    const result = await sendMCPRequest(method);
    console.log(`[${result.status || 'ERROR'}] ${method}`);
    if (result.status === 200) {
      console.log('  成功:', JSON.stringify(result.result).substring(0, 400));
    } else if (result.error) {
      console.log('  错误:', result.error);
    } else {
      console.log('  响应:', JSON.stringify(result.result).substring(0, 200));
    }
    console.log();
  }
}

testMCP();
