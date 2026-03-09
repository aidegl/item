/**
 * 删除虚拟角色表中重复的地煞星数据
 * 每个地煞星只保留一条记录
 * 运行: node scripts/remove-duplicate-disha.js
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
  
  console.log('开始查找并删除重复的地煞星数据...');
  console.log('虚拟角色表ID:', WORKSHEET_ID);
  
  // 1. 获取表结构
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
  
  const nickField = findFieldByAliasOrName(customFields, '昵称', 'nickname', '星宿', 'name');
  // 查找del字段（系统字段）
  const delField = fields.find(f => {
    const id = String(f.id || '').toLowerCase();
    const alias = String(f.alias || '').toLowerCase();
    return id === 'del' || alias === 'del' || f.name === 'del' || f.name === '删除标识';
  });
  
  console.log('del字段:', delField ? { id: delField.id, alias: delField.alias, name: delField.name } : '未找到');
  
  if (!nickField) {
    console.error('未找到昵称字段');
    process.exit(1);
  }
  
  const nickAlias = nickField.alias || nickField.id;
  const nickId = nickField.id;
  
  console.log('字段映射: 昵称 =', nickAlias);
  
  // 2. 查询所有地煞星数据
  console.log('\n正在查询所有地煞星数据...');
  let allDishaRows = [];
  let pageIndex = 1;
  const pageSize = 100;
  
  while (true) {
    const queryRes = await api(cred, 'POST', '/v2/open/worksheet/getFilterRows', {
      appKey: cred.appkey,
      sign: cred.sign,
      worksheetId: WORKSHEET_ID,
      pageSize,
      pageIndex,
      filters: [],
      controls: [nickAlias, 'rowid'],
      useControlId: 'false'
    });
    
    if (!queryRes.ok || !queryRes.data.success) {
      console.error('查询失败:', queryRes.data);
      break;
    }
    
    const rows = queryRes.data.data?.rows || [];
    if (rows.length === 0) break;
    
    // 筛选出地煞星（星宿名称以"地"开头）
    const dishaRows = rows.filter(row => {
      const star = row[nickAlias] || row[nickId];
      return star && star.startsWith('地');
    });
    
    allDishaRows = allDishaRows.concat(dishaRows.map(row => ({
      rowid: row.rowid,
      star: row[nickAlias] || row[nickId]
    })));
    
    const total = queryRes.data.data?.total || 0;
    if (pageIndex * pageSize >= total) break;
    pageIndex++;
  }
  
  console.log(`查询到 ${allDishaRows.length} 条地煞星记录`);
  
  // 3. 找出重复的记录
  const starMap = new Map();
  allDishaRows.forEach(row => {
    if (!starMap.has(row.star)) {
      starMap.set(row.star, []);
    }
    starMap.get(row.star).push(row.rowid);
  });
  
  const duplicates = [];
  starMap.forEach((rowids, star) => {
    if (rowids.length > 1) {
      duplicates.push({ star, rowids, count: rowids.length });
      // 保留第一条，删除其他的
      const toDelete = rowids.slice(1);
      toDelete.forEach(rowid => {
        duplicates[duplicates.length - 1].toDelete = toDelete;
      });
    }
  });
  
  console.log(`\n发现 ${duplicates.length} 个重复的地煞星：`);
  duplicates.forEach(dup => {
    console.log(`  ${dup.star}: ${dup.count} 条（将删除 ${dup.count - 1} 条）`);
  });
  
  if (duplicates.length === 0) {
    console.log('\n没有发现重复数据！');
    return;
  }
  
  // 4. 先查询一条记录，确认del字段格式
  console.log('\n正在查询一条记录以确认del字段格式...');
  let delControlId = 'del';
  if (duplicates.length > 0 && duplicates[0].rowids.length > 1) {
    const testRowid = duplicates[0].rowids[1];
    const testRes = await api(cred, 'POST', '/v2/open/worksheet/getRowByIdPost', {
      appKey: cred.appkey,
      sign: cred.sign,
      worksheetId: WORKSHEET_ID,
      rowId: testRowid,
      getSystemControl: 'true'
    });
    
    if (testRes.ok && testRes.data.success) {
      const testData = testRes.data.data;
      // 查找del字段
      const delKey = Object.keys(testData).find(k => k.toLowerCase() === 'del');
      if (delKey) {
        console.log('找到del字段:', delKey);
        // 尝试从字段结构中获取del字段的controlId
        const delFieldInStruct = fields.find(f => {
          const id = String(f.id || '').toLowerCase();
          const alias = String(f.alias || '').toLowerCase();
          return id === 'del' || alias === 'del';
        });
        if (delFieldInStruct) {
          delControlId = delFieldInStruct.id || 'del';
          console.log('使用del字段ID:', delControlId);
        }
      }
    }
  }
  
  // 5. 收集所有要删除的rowid
  const allToDelete = [];
  duplicates.forEach(dup => {
    const toDelete = dup.rowids.slice(1); // 保留第一条，删除其他的
    toDelete.forEach(rowid => {
      allToDelete.push({ rowid, star: dup.star });
    });
  });
  
  console.log(`\n准备删除 ${allToDelete.length} 条重复记录...`);
  
  // 6. 使用v3批量删除接口
  let deleted = 0;
  let failed = 0;
  const BATCH_SIZE = 20;
  
  for (let i = 0; i < allToDelete.length; i += BATCH_SIZE) {
    const batch = allToDelete.slice(i, i + BATCH_SIZE);
    const rowIds = batch.map(item => item.rowid);
    
    console.log(`\n正在删除第 ${Math.floor(i / BATCH_SIZE) + 1} 批（${batch.length} 条）...`);
    
    try {
      // 尝试使用v3批量删除接口
      const deleteRes = await api(cred, 'POST', `/v3/app/worksheets/${WORKSHEET_ID}/rows/batchDelete`, {
        rowIds: rowIds
      });
      
      if (deleteRes.ok && (deleteRes.data.success !== false && deleteRes.data.error_code !== 1)) {
        deleted += batch.length;
        console.log(`  ✓ 成功删除 ${batch.length} 条，累计 ${deleted}/${allToDelete.length}`);
      } else {
        // 如果批量删除失败，尝试逐条逻辑删除
        console.log(`  批量删除失败，尝试逐条逻辑删除（使用del=${delControlId}）...`);
        for (const item of batch) {
          try {
            const controls = [{ controlId: delControlId, value: 1 }];
            const updateRes = await api(cred, 'POST', '/v2/open/worksheet/editRow', {
              appKey: cred.appkey,
              sign: cred.sign,
              worksheetId: WORKSHEET_ID,
              rowId: item.rowid,
              controls: controls,
              triggerWorkflow: false,
              getSystemControl: 'false'
            });
            
            if (updateRes.ok && updateRes.data.success) {
              deleted++;
              if (deleted % 10 === 0) {
                console.log(`  ✓ 已删除 ${deleted} 条...`);
              }
            } else {
              failed++;
              if (failed <= 3) {
                const errorMsg = updateRes.data?.error_msg || updateRes.data?.errorMsg || JSON.stringify(updateRes.data);
                console.error(`  ✗ 删除失败: ${item.star}`, errorMsg);
              }
            }
          } catch (error) {
            failed++;
            if (failed <= 3) {
              console.error(`  ✗ 删除异常: ${item.star}`, error.message);
            }
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('批量删除异常:', error.message);
      // 异常时也尝试逐条删除
      for (const item of batch) {
        try {
          const controls = [{ controlId: delControlId, value: 1 }];
          const updateRes = await api(cred, 'POST', '/v2/open/worksheet/editRow', {
            appKey: cred.appkey,
            sign: cred.sign,
            worksheetId: WORKSHEET_ID,
            rowId: item.rowid,
            controls: controls,
            triggerWorkflow: false,
            getSystemControl: 'false'
          });
          
          if (updateRes.ok && updateRes.data.success) {
            deleted++;
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 避免请求过快
    if (i + BATCH_SIZE < allToDelete.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`\n完成！`);
  console.log(`- 成功删除: ${deleted} 条重复记录`);
  if (failed > 0) {
    console.log(`- 删除失败: ${failed} 条`);
  }
  
  // 5. 验证删除结果
  console.log('\n正在验证删除结果...');
  const verifyRes = await api(cred, 'POST', '/v2/open/worksheet/getFilterRows', {
    appKey: cred.appkey,
    sign: cred.sign,
    worksheetId: WORKSHEET_ID,
    pageSize: 200,
    pageIndex: 1,
    filters: [],
    controls: [nickAlias],
    useControlId: 'false'
  });
  
  if (verifyRes.ok && verifyRes.data.success) {
    const rows = verifyRes.data.data?.rows || [];
    const dishaRows = rows.filter(row => {
      const star = row[nickAlias] || row[nickId];
      return star && star.startsWith('地');
    });
    
    const verifyMap = new Map();
    dishaRows.forEach(row => {
      const star = row[nickAlias] || row[nickId];
      verifyMap.set(star, (verifyMap.get(star) || 0) + 1);
    });
    
    const stillDuplicates = Array.from(verifyMap.entries()).filter(([star, count]) => count > 1);
    
    if (stillDuplicates.length === 0) {
      console.log(`✓ 验证通过：每个地煞星只有1条记录，共 ${dishaRows.length} 条地煞星`);
    } else {
      console.log(`⚠ 仍有 ${stillDuplicates.length} 个地煞星存在重复：`);
      stillDuplicates.forEach(([star, count]) => {
        console.log(`  ${star}: ${count} 条`);
      });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
