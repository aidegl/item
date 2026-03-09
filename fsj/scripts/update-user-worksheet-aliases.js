/**
 * 尝试通过 API 将用户表（68534cf5750002dbcc681334）字段别名改为英文
 * 若明道云支持更新控件别名则生效；否则仅输出需在界面手动修改的清单
 * 运行: node scripts/update-user-worksheet-aliases.js
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';
const WORKSHEET_ID = '68534cf5750002dbcc681334';

// 字段名/当前别名 -> 建议英文别名（用于匹配 GET 返回的字段）
const ALIAS_MAP = {
  nicheng: 'nickname',
  rwgl: 'task_management',
  zhiye: 'occupation',
  lyms: 'source_description',
  laiyuan: 'source',
  dengji: 'level',
  duihua: 'conversations',
  leixing: 'user_type',
  fupan: 'reviews',
  fensi_: 'fans_increment',
  guanzhu: 'following',
  fensi2: 'followers',
  fensi1: 'followers_count',
  zntid: 'agent_id',
  touxiang: 'avatar',
  weixinhao: 'wechat_id',
  del: 'checklist_item',
  uni_id: 'uni_id', // 已是英文，保留
};

// 无别名或别名为空时，用字段 name 的 key（与 GET 返回的 name 对应，可能乱码则用 id 匹配）
const NAME_TO_ALIAS = {
  '描述': 'description',
  '使命': 'mission',
};

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

async function getStructure(cred) {
  const res = await fetch(`${BASE}/v3/app/worksheets/${WORKSHEET_ID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.data) throw new Error(JSON.stringify(data));
  return data.data;
}

async function tryUpdate(cred, method, pathSuffix, body) {
  const url = pathSuffix.startsWith('http') ? pathSuffix : `${BASE}${pathSuffix}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function isSystemField(field) {
  const sysIds = ['rowid', 'ownerid', 'caid', 'ctime', 'utime', 'uaid', 'wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfcotime', 'wfdtime', 'wfftime', 'wfstatus'];
  return sysIds.includes(String(field.id).toLowerCase());
}

async function main() {
  const cred = getCredential();
  console.log('获取用户表结构...');
  const structure = await getStructure(cred);
  const fields = structure.fields || [];

  const updates = [];
  for (const f of fields) {
    if (isSystemField(f)) continue;
    let newAlias = ALIAS_MAP[f.alias] || (f.name && NAME_TO_ALIAS[f.name]);
    if (!newAlias && f.alias && ALIAS_MAP[f.alias] !== undefined) newAlias = ALIAS_MAP[f.alias];
    if (!newAlias) continue;
    if (f.alias === newAlias) continue;
    updates.push({ id: f.id, name: f.name, oldAlias: f.alias || '(空)', newAlias });
  }

  // 第二处「对话」无 alias，用 id 直接映射
  const conversationDisplayId = '692bfbb1e22247ab9a654f3e';
  const conv2 = fields.find((f) => f.id === conversationDisplayId);
  if (conv2 && conv2.alias !== 'conversations_display') {
    updates.push({ id: conv2.id, name: conv2.name, oldAlias: conv2.alias || '(空)', newAlias: 'conversations_display' });
  }

  console.log('待更新别名数:', updates.length);
  if (updates.length === 0) {
    console.log('无需更新或映射已全部为英文。');
    return;
  }

  const updatePayload = updates.map((u) => ({ controlId: u.id, alias: u.newAlias }));
  const putBody = { updateControls: updatePayload };
  const patchBody = { controls: updatePayload };

  const attempts = [
    ['PUT', `/v3/app/worksheets/${WORKSHEET_ID}`, putBody],
    ['PATCH', `/v3/app/worksheets/${WORKSHEET_ID}`, patchBody],
    ['POST', `/v3/app/worksheets/${WORKSHEET_ID}/controls/update`, { controls: updatePayload }],
    ['POST', `/v3/app/worksheets/${WORKSHEET_ID}/update`, putBody],
  ];

  for (const [method, pathSuffix, body] of attempts) {
    const result = await tryUpdate(cred, method, pathSuffix, body);
    if (result.ok && result.data && result.data.success !== false) {
      console.log('成功通过 API 更新:', method, pathSuffix, result.data);
      return;
    }
    console.log('尝试', method, pathSuffix, '->', result.status, result.data?.error_msg || result.data?.message || '');
  }

  console.log('\n当前开放接口未提供「修改字段别名」能力，请在明道云界面手动修改：');
  console.log('应用 → 设置 → 工作表「用户」→ 各字段 → 数据名称\n');
  console.log('字段ID\t\t\t\t\t当前别名\t-> 建议英文别名');
  console.log('-'.repeat(80));
  for (const u of updates) {
    console.log(`${u.id}\t${u.oldAlias}\t-> ${u.newAlias}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
