/**
 * 克隆用户表（68534cf5750002dbcc681334）结构，新建一张表「用户表」别名 users，字段使用英文别名
 * 运行: node scripts/clone-user-worksheet.js
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';
const SOURCE_WORKSHEET_ID = '68534cf5750002dbcc681334';

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
  uni_id: 'uni_id',
};
const NAME_TO_ALIAS = { '描述': 'description', '使命': 'mission' };
const ID_TO_ALIAS = {
  '69a492542216b8b595abfb98': 'description',
  '69a4926a5025a371106a9058': 'mission',
};
const CONV2_ID = '692bfbb1e22247ab9a654f3e';

const SYSTEM_IDS = new Set(['rowid', 'ownerid', 'caid', 'ctime', 'utime', 'uaid', 'wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfcotime', 'wfdtime', 'wfftime', 'wfstatus']);

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

function toValidAlias(idx) {
  return 'f_' + String(idx).replace(/\D/g, '');
}

function getEnglishAlias(field, index) {
  if (field.id && ID_TO_ALIAS[field.id]) return ID_TO_ALIAS[field.id];
  if (field.alias && ALIAS_MAP[field.alias] !== undefined) return ALIAS_MAP[field.alias];
  if (field.id === CONV2_ID) return 'conversations_display';
  if (field.name && NAME_TO_ALIAS[field.name]) return NAME_TO_ALIAS[field.name];
  if (field.alias && /^[a-zA-Z][a-zA-Z0-9_]{0,49}$/.test(field.alias)) return field.alias;
  return toValidAlias(index);
}

function isSystemField(f) {
  return SYSTEM_IDS.has(String(f.id).toLowerCase());
}

function isSelfRelation(f) {
  return f.type === 'Relation' && f.dataSource === SOURCE_WORKSHEET_ID;
}

function fieldToCreateSpec(f, index) {
  const alias = getEnglishAlias(f, index);
  const base = { name: f.name, alias, type: f.type, required: !!f.required };
  if (f.isTitle) base.isTitle = true;
  if (f.subType !== undefined && f.type !== 'Text') base.subType = String(f.subType);
  if (f.type === 'Dropdown' || f.type === 'SingleSelect') {
    base.type = 'SingleSelect';
    if (f.options && f.options.length) base.options = f.options.map((o, i) => ({ value: o.value, index: (o.index || i) + 1 }));
  }
  if (f.type === 'Rating' && f.max != null) base.max = f.max;
  if (f.type === 'Number' && f.precision != null) base.precision = f.precision;
  if (f.type === 'Relation') {
    base.dataSource = f.dataSource;
    base.relation = f.relation ? { bidirectional: !!f.relation.bidirectional, showFields: f.relation.showFields || [] } : { bidirectional: false, showFields: [] };
  }
  return base;
}

async function main() {
  const cred = getCredential();
  console.log('获取用户表结构...');
  const res = await fetch(`${BASE}/v3/app/worksheets/${SOURCE_WORKSHEET_ID}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'HAP-Appkey': cred.appkey, 'HAP-Sign': cred.sign },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.data) throw new Error(JSON.stringify(data));
  const fields = data.data.fields || [];

  const normal = [];
  const selfRelations = [];
  const rollups = [];
  let idx = 0;
  for (const f of fields) {
    if (isSystemField(f)) continue;
    if (f.type === 'Rollup' || f.type === 'DateFormula') {
      rollups.push(f);
      continue;
    }
    if (isSelfRelation(f)) {
      selfRelations.push(f);
      continue;
    }
    if (f.type === 'Divider' || f.type === 'AutoNumber') continue;
    normal.push(fieldToCreateSpec(f, idx++));
  }

  const body = {
    name: '用户表',
    alias: 'users',
    fields: normal,
  };

  console.log('创建新表「用户表」(users)，字段数:', normal.length);
  const createRes = await fetch(`${BASE}/v3/app/worksheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'HAP-Appkey': cred.appkey, 'HAP-Sign': cred.sign },
    body: JSON.stringify(body),
  });
  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    console.error('创建失败:', createRes.status, createData);
    process.exit(1);
  }
  const newId = createData.worksheetId || createData.worksheet_id || createData.data?.worksheetId || createData.data?.worksheet_id;
  if (!newId) {
    console.error('未返回 worksheetId:', createData);
    process.exit(1);
  }
  console.log('已创建工作表:', newId);

  if (selfRelations.length > 0) {
    console.log('添加自关联字段: following, followers ...');
    const addFields = selfRelations.map((f, i) => {
      const spec = fieldToCreateSpec(f, 100 + i);
      spec.dataSource = newId;
      return spec;
    });
    const addRes = await fetch(`${BASE}/v3/app/worksheets/${newId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'HAP-Appkey': cred.appkey, 'HAP-Sign': cred.sign },
      body: JSON.stringify({ addFields }),
    });
    const addData = await addRes.json().catch(() => ({}));
    if (!addRes.ok) console.warn('添加自关联字段失败:', addRes.status, addData);
    else console.log('自关联字段已添加');
  }

  if (rollups.length > 0) console.log('说明: Rollup/公式字段未自动克隆，需在界面中手动添加');
  console.log('\n新表 worksheetId:', newId);
  console.log('别名: users');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
