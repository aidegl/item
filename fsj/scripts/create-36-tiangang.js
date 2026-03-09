/**
 * 将36天罡星创建到虚拟角色表(69ad979f1d7a7b54cfe15324)
 * 字段映射：
 * - 昵称 = 星宿
 * - 职业 = 角色名
 * - 描述 = 分工 + Skill（Markdown格式）
 * - 五行 = 根据序号分类（1-22金，23-36木）
 * - 类型 = 智能体
 * - id = 序号（1-36）
 * - 元神 = 不填
 * 运行: node scripts/create-36-tiangang.js
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';
const WORKSHEET_ID = '69ad979f1d7a7b54cfe15324'; // 虚拟角色表

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

async function api(cred, method, pathname, body) {
  const url = pathname.startsWith('http') ? pathname : `${BASE}${pathname}`;
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
  return { ok: res.ok, data };
}

/**
 * 根据序号获取五行（36天罡：1-22金，23-36木）
 */
function getWuxingBySeq(seq) {
  if (seq >= 1 && seq <= 22) return '金';
  if (seq >= 23 && seq <= 36) return '木';
  return null;
}

/**
 * 从seed-108-roles.js读取36天罡星数据
 */
function get36TiangangData() {
  const seedFile = path.join(__dirname, 'seed-108-roles.js');
  const content = fs.readFileSync(seedFile, 'utf8');
  
  // 提取ROLES_108数组
  const rolesMatch = content.match(/const ROLES_108 = \[([\s\S]*?)\];/);
  if (!rolesMatch) {
    throw new Error('无法从seed-108-roles.js中提取ROLES_108数据');
  }
  
  const lines = rolesMatch[1].split('\n');
  const tiangangList = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    
    // 匹配 [序号, '星宿', '角色名', '分工', '优势', 'skill']
    // 格式：[1, '天魁星', '总指挥', '项目总控、任务分配、进度把控', '全局视野、决策力强、资源调配', 'project-manager']
    // 或者：[序号, '星宿', '角色名', '分工', null, 'skill']
    const match = trimmed.match(/\[(\d+),\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(null|['"][^'"]*['"]|[^,]+),\s*['"]([^'"]+)['"]\]/);
    if (match) {
      const seq = parseInt(match[1]);
      // 只取36天罡星（1-36号）
      if (seq >= 1 && seq <= 36) {
        const star = match[2];
        const roleName = match[3];
        const work = match[4];
        const skill = match[6];
        tiangangList.push({ seq, star, roleName, work, skill });
      }
    }
  }
  
  if (tiangangList.length !== 36) {
    console.warn(`警告：只解析到 ${tiangangList.length} 个天罡星，预期36个`);
  }
  
  return tiangangList;
}

/**
 * 构建描述内容（Markdown格式）
 */
function buildDescription(work, skill) {
  const parts = [];
  if (work) {
    parts.push('## 分工\n\n' + work);
  }
  if (skill) {
    parts.push('## 对应 Skill\n\n`' + skill + '`');
  }
  return parts.join('\n\n');
}

/**
 * 查找字段ID（支持别名和名称）
 */
function findFieldByAliasOrName(fields, ...candidates) {
  const normalized = (s) => (s || '').toLowerCase().replace(/\s/g, '');
  for (const c of candidates) {
    const n = normalized(c);
    const f = fields.find(
      (x) =>
        normalized(x.alias) === n ||
        normalized(x.name) === n ||
        (x.alias && x.alias.toLowerCase() === c) ||
        (x.name && x.name === c)
    );
    if (f) return f;
  }
  return null;
}

async function main() {
  const cred = getCredential();
  
  console.log('开始创建36天罡星到虚拟角色表...');
  console.log('虚拟角色表ID:', WORKSHEET_ID);
  
  // 1. 获取36天罡星数据
  const tiangangList = get36TiangangData();
  console.log(`已读取 ${tiangangList.length} 个天罡星数据`);
  
  // 2. 获取虚拟角色表结构
  const structRes = await api(cred, 'GET', `/v3/app/worksheets/${WORKSHEET_ID}`);
  if (!structRes.ok || !structRes.data.data) {
    console.error('获取表结构失败:', structRes.data);
    process.exit(1);
  }
  
  const raw = structRes.data.data;
  const rawFields = raw.fields || raw.controls || [];
  const fields = rawFields.map((f) => ({ 
    id: f.id || f.controlId, 
    alias: f.alias || f.controlAlias, 
    name: f.name || f.controlName 
  }));
  
  const sysIds = new Set(['rowid', 'ownerid', 'caid', 'ctime', 'utime', 'uaid', 'wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfcotime', 'wfdtime', 'wfftime', 'wfstatus']);
  const customFields = fields.filter((f) => f.id && !sysIds.has(String(f.id).toLowerCase()));
  
  // 查找字段
  const nickField = findFieldByAliasOrName(customFields, '昵称', 'nickname', '星宿', 'name');
  const jobField = findFieldByAliasOrName(customFields, '职业', 'occupation', '角色名');
  const descField = findFieldByAliasOrName(customFields, '描述', 'description', 'remarks', '备注');
  const wuxingField = findFieldByAliasOrName(customFields, '五行', 'wuxing', '五行分类');
  const typeField = findFieldByAliasOrName(customFields, '类型', 'type', 'mind_type', 'AI类型');
  const idField = findFieldByAliasOrName(customFields, 'id', 'ID', '序号', 'sequence', 'seq');
  const delField = fields.find(f => (f.id && String(f.id).toLowerCase() === 'del') || (f.alias && f.alias.toLowerCase() === 'del'));
  
  if (!nickField || !jobField) {
    console.error('表中未找到必要字段。当前自定义字段:', customFields.map((f) => ({ name: f.name, alias: f.alias })));
    process.exit(1);
  }
  
  // addRow接口需要使用字段的实际ID（controlId），而不是alias
  const nickId = nickField.id;
  const jobId = jobField.id;
  const descId = descField?.id;
  const wuxingId = wuxingField?.id;
  const typeId = typeField?.id;
  const idFieldId = idField?.id;
  
  console.log('字段映射:');
  console.log('  昵称 =', nickId);
  console.log('  职业 =', jobId);
  console.log('  描述 =', descId || '(无)');
  console.log('  五行 =', wuxingId || '(无)');
  console.log('  类型 =', typeId || '(无)');
  console.log('  id =', idFieldId || '(无)');
  
  // 3. 构建36条记录
  const rows = tiangangList.map((tiangang) => {
    const { seq, star, roleName, work, skill } = tiangang;
    const wuxing = getWuxingBySeq(seq);
    const description = buildDescription(work, skill);
    
    const fields = [
      { id: nickId, value: star },
      { id: jobId, value: roleName },
    ];
    
    if (descId) {
      fields.push({ id: descId, value: description });
    }
    
    if (wuxingId && wuxing) {
      fields.push({ id: wuxingId, value: wuxing });
    }
    
    if (typeId) {
      fields.push({ id: typeId, value: '智能体' });
    }
    
    // 填写id字段（序号）
    if (idFieldId) {
      fields.push({ id: idFieldId, value: seq });
    }
    
    // 添加del字段（逻辑删除标识，0表示未删除）
    if (delField && delField.id) {
      fields.push({ id: delField.id, value: 0 });
    }
    
    return { fields };
  });
  
  console.log(`\n准备创建 ${rows.length} 条记录...`);
  
  // 4. 分批写入（使用v3批量接口，每批20条）
  const BATCH = 20;
  let created = 0;
  let failed = 0;
  
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    console.log(`\n正在创建第 ${Math.floor(i / BATCH) + 1} 批（${batch.length} 条）...`);
    
    try {
      // 使用v3批量接口
      const res = await api(cred, 'POST', `/v3/app/worksheets/${WORKSHEET_ID}/rows/batch`, { rows: batch });
      
      if (res.ok && res.data.success !== false) {
        created += batch.length;
        console.log(`✓ 成功创建 ${batch.length} 条，累计 ${created}/${rows.length}`);
      } else {
        console.error('批量创建失败:', res.data);
        failed += batch.length;
        // 如果批量失败，尝试逐条创建
        console.log('尝试逐条创建...');
        for (let j = 0; j < batch.length; j++) {
          const row = batch[j];
          const tiangang = tiangangList[i + j];
          try {
            const singleRes = await api(cred, 'POST', '/v2/open/worksheet/addRow', {
              appKey: cred.appkey,
              sign: cred.sign,
              worksheetId: WORKSHEET_ID,
              controls: row.fields,
              triggerWorkflow: false,
              getSystemControl: 'false'
            });
            if (singleRes.ok && singleRes.data.success) {
              created++;
              failed--;
              console.log(`  ✓ 成功创建: ${tiangang.star} (id=${tiangang.seq})`);
            } else {
              console.error(`  ✗ 创建失败: ${tiangang.star}`, singleRes.data?.error_msg || singleRes.data);
            }
          } catch (error) {
            console.error(`  ✗ 创建异常: ${tiangang.star}`, error.message);
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('批量创建异常:', error.message);
      failed += batch.length;
    }
    
    // 避免请求过快
    if (i + BATCH < rows.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n完成！`);
  console.log(`- 成功创建: ${created} 条`);
  if (failed > 0) {
    console.log(`- 失败: ${failed} 条`);
  }
  
  // 5. 检查创建的数据
  console.log(`\n正在检查创建的数据...`);
  try {
    const nickAlias = nickField.alias || nickField.id;
    const jobAlias = jobField.alias || jobField.id;
    
    const checkRes = await api(cred, 'POST', '/v2/open/worksheet/getFilterRows', {
      appKey: cred.appkey,
      sign: cred.sign,
      worksheetId: WORKSHEET_ID,
      pageSize: 100,
      pageIndex: 1,
      filters: [],
      controls: [nickAlias, jobAlias, idFieldId ? (idField.alias || idField.id) : ''],
      useControlId: 'false'
    });
    
    if (checkRes.ok && checkRes.data.success) {
      const total = checkRes.data.data?.total || 0;
      const rows = checkRes.data.data?.rows || [];
      
      console.log(`\n检查结果：`);
      console.log(`- 表中总记录数（未删除）: ${total}`);
      console.log(`- 本次查询到: ${rows.length} 条`);
      
      // 统计36天罡星的数量
      const idAlias = idField ? (idField.alias || idField.id) : null;
      const tiangangCount = rows.filter(row => {
        const star = row[nickAlias] || row[nickId];
        return star && star.startsWith('天');
      }).length;
      
      console.log(`- 天罡星数量: ${tiangangCount} 条`);
      
      // 显示前10条天罡星
      if (tiangangCount > 0) {
        console.log(`\n前10条天罡星记录：`);
        const tiangangRows = rows.filter(row => {
          const star = row[nickAlias] || row[nickId];
          return star && star.startsWith('天');
        }).slice(0, 10);
        
        tiangangRows.forEach((row, idx) => {
          const star = row[nickAlias] || row[nickId];
          const job = row[jobAlias] || row[jobId];
          const id = idAlias ? (row[idAlias] || row[idFieldId]) : '(无)';
          console.log(`  ${idx + 1}. ${star} - ${job} (id=${id})`);
        });
      }
    } else {
      console.error('检查数据失败:', checkRes.data);
    }
  } catch (error) {
    console.error('检查数据异常:', error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
