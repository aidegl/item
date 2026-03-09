/**
 * 创建元神表（主智体）与分身表（虚拟智体）
 * 关系：一个元神可有多个分身，一个分身只属于一个元神；元神可关联真人（用户表）
 * 运行: node scripts/create-main-mind-tables.js
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';
const USERS_WORKSHEET_ID = '69ad979f1d7a7b54cfe15324'; // 用户表 users

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

function opts(options) {
  return options.map((v, i) => ({ value: v, index: i + 1 }));
}

async function createWorksheet(cred, table) {
  const body = {
    name: table.name,
    alias: table.alias,
    fields: table.fields.map((f) => {
      const field = {
        name: f.name,
        alias: f.alias,
        type: f.type,
        required: f.required !== false,
      };
      if (f.isTitle) field.isTitle = true;
      if (f.subType) field.subType = f.subType;
      if (f.options) field.options = f.options;
      if (f.precision !== undefined) field.precision = f.precision;
      if (f.dataSource) field.dataSource = f.dataSource;
      if (f.relation) field.relation = f.relation;
      return field;
    }),
  };
  const res = await fetch(`${BASE}/v3/app/worksheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_msg || JSON.stringify(data));
  return data;
}

async function addFields(cred, worksheetId, addFields) {
  const res = await fetch(`${BASE}/v3/app/worksheets/${worksheetId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
    body: JSON.stringify({ addFields }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_msg || JSON.stringify(data));
  return data;
}

async function main() {
  const cred = getCredential();

  // 1. 元神表（主智体）：一个主智体可有多个分身，元神可能是真人
  const mainMindTable = {
    name: '元神表',
    alias: 'main_mind',
    fields: [
      { name: '名称', alias: 'name', type: 'Text', isTitle: true, required: true },
      { name: '类型', alias: 'mind_type', type: 'SingleSelect', options: opts(['真人', '智能体']), required: true },
      { name: '描述', alias: 'description', type: 'Text', required: false },
      { name: '使命', alias: 'mission', type: 'Text', required: false },
      {
        name: '关联用户',
        alias: 'linked_user',
        type: 'Relation',
        subType: '1',
        dataSource: USERS_WORKSHEET_ID,
        relation: { bidirectional: false, showFields: [] },
        required: false,
      },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  };

  console.log('创建元神表（主智体）...');
  const mainMindRes = await createWorksheet(cred, mainMindTable);
  const mainMindId = mainMindRes.worksheetId || mainMindRes.worksheet_id || mainMindRes.data?.worksheetId;
  if (!mainMindId) throw new Error('元神表未返回 worksheetId: ' + JSON.stringify(mainMindRes));
  console.log('元神表 worksheetId:', mainMindId);

  // 2. 分身表（虚拟智体）：一个分身只属于一个元神
  const avatarsTable = {
    name: '分身表',
    alias: 'avatars',
    fields: [
      { name: '名称', alias: 'name', type: 'Text', isTitle: true, required: true },
      {
        name: '元神',
        alias: 'main_mind',
        type: 'Relation',
        subType: '1',
        dataSource: mainMindId,
        relation: { bidirectional: true, showFields: [] },
        required: true,
      },
      { name: '描述', alias: 'description', type: 'Text', required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  };

  console.log('创建分身表（虚拟智体）...');
  const avatarsRes = await createWorksheet(cred, avatarsTable);
  const avatarsId = avatarsRes.worksheetId || avatarsRes.worksheet_id || avatarsRes.data?.worksheetId;
  if (!avatarsId) throw new Error('分身表未返回 worksheetId: ' + JSON.stringify(avatarsRes));
  console.log('分身表 worksheetId:', avatarsId);

  console.log('\n完成。关系说明：');
  console.log('- 元神表(main_mind): 主智体，mind_type=真人/智能体；linked_user 可关联用户表中的真人');
  console.log('- 分身表(avatars): 虚拟智体，main_mind 关联到元神（双向，元神表会自动出现「分身」关联列表）');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
