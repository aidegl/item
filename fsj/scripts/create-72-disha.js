/**
 * 将72地煞星创建到虚拟角色表(69ad979f1d7a7b54cfe15324)
 * 字段映射：
 * - 昵称 = 星宿
 * - 职业 = 角色名
 * - 描述 = 分工 + Skill（Markdown格式）
 * - 五行 = 根据序号分类（37-44木，45-66水，67-88火，89-108土）
 * - 类型 = 智能体
 * - 元神 = 不填
 * 运行: node scripts/create-72-disha.js
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
 * 根据序号获取五行
 */
function getWuxingBySeq(seq) {
  if (seq >= 37 && seq <= 44) return '木';
  if (seq >= 45 && seq <= 66) return '水';
  if (seq >= 67 && seq <= 88) return '火';
  if (seq >= 89 && seq <= 108) return '土';
  return null;
}

/**
 * 从seed-108-roles.js读取72地煞星数据
 */
function get72DishaData() {
  const seedFile = path.join(__dirname, 'seed-108-roles.js');
  const content = fs.readFileSync(seedFile, 'utf8');
  
  // 提取ROLES_108数组
  const rolesMatch = content.match(/const ROLES_108 = \[([\s\S]*?)\];/);
  if (!rolesMatch) {
    throw new Error('无法从seed-108-roles.js中提取ROLES_108数据');
  }
  
  const lines = rolesMatch[1].split('\n');
  const dishaList = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    
    // 匹配 [序号, '星宿', '角色名', '分工', null, 'skill']
    // 格式：[37, '地魁星', '技术支持总管', '技术支持统筹、问题分级、资源调配', null, 'tech-support-lead']
    // 使用更精确的正则，处理null值
    const match = trimmed.match(/\[(\d+),\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*(null|[^,]+),\s*['"]([^'"]+)['"]\]/);
    if (match) {
      const seq = parseInt(match[1]);
      // 只取72地煞星（37-108号）
      if (seq >= 37 && seq <= 108) {
        const star = match[2];
        const roleName = match[3];
        const work = match[4];
        const skill = match[6];
        dishaList.push({ seq, star, roleName, work, skill });
      }
    }
  }
  
  if (dishaList.length !== 72) {
    console.warn(`警告：只解析到 ${dishaList.length} 个地煞星，预期72个`);
  }
  
  return dishaList;
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
  
  console.log('开始创建72地煞星到虚拟角色表...');
  console.log('虚拟角色表ID:', WORKSHEET_ID);
  
  // 1. 获取72地煞星数据
  const dishaList = get72DishaData();
  console.log(`已读取 ${dishaList.length} 个地煞星数据`);
  
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
  
  console.log('字段映射:');
  console.log('  昵称 =', nickId);
  console.log('  职业 =', jobId);
  console.log('  描述 =', descId || '(无)');
  console.log('  五行 =', wuxingId || '(无)');
  console.log('  类型 =', typeId || '(无)');
  
  // 3. 构建72条记录
  const rows = dishaList.map((disha) => {
    const { seq, star, roleName, work, skill } = disha;
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
          const disha = dishaList[i + j];
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
              console.log(`  ✓ 成功创建: ${disha.star}`);
            } else {
              console.error(`  ✗ 创建失败: ${disha.star}`, singleRes.data?.error_msg || singleRes.data);
            }
          } catch (error) {
            console.error(`  ✗ 创建异常: ${disha.star}`, error.message);
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
      controls: [nickAlias, jobAlias],
      useControlId: 'false'
    });
    
    if (checkRes.ok && checkRes.data.success) {
      const total = checkRes.data.data?.total || 0;
      const rows = checkRes.data.data?.rows || [];
      
      console.log(`\n检查结果：`);
      console.log(`- 表中总记录数（未删除）: ${total}`);
      console.log(`- 本次查询到: ${rows.length} 条`);
      
      // 统计72地煞星的数量（使用alias查询结果）
      
      const dishaCount = rows.filter(row => {
        const star = row[nickAlias] || row[nickId];
        return star && star.startsWith('地');
      }).length;
      
      console.log(`- 地煞星数量: ${dishaCount} 条`);
      
      // 显示前10条地煞星
      if (dishaCount > 0) {
        console.log(`\n前10条地煞星记录：`);
        const dishaRows = rows.filter(row => {
          const star = row[nickAlias] || row[nickId];
          return star && star.startsWith('地');
        }).slice(0, 10);
        
        dishaRows.forEach((row, idx) => {
          const star = row[nickAlias] || row[nickId];
          const job = row[jobAlias] || row[jobId];
          console.log(`  ${idx + 1}. ${star} - ${job}`);
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
