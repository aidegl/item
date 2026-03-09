/**
 * 获取明道云工作表结构（用于查看字段 name/alias/type）
 * 用法: node scripts/get-worksheet-structure.js <worksheetId>
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';

function getCredential() {
  const raw = fs.readFileSync(MCP_PATH, 'utf8');
  const json = JSON.parse(raw);
  const server = json.mcpServers && json.mcpServers['hap-mcp-孚世界'];
  if (!server || !server.url) throw new Error('未找到 hap-mcp-孚世界 配置');
  const u = new URL(server.url);
  const appkey = u.searchParams.get('HAP-Appkey');
  const sign = u.searchParams.get('HAP-Sign');
  if (!appkey || !sign) throw new Error('URL 中缺少 HAP-Appkey 或 HAP-Sign');
  return { appkey, sign };
}

const worksheetId = process.argv[2] || '68534cf5750002dbcc681334';

async function main() {
  const cred = getCredential();
  const res = await fetch(`${BASE}/v3/app/worksheets/${worksheetId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Error:', res.status, data);
    process.exit(1);
  }
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
