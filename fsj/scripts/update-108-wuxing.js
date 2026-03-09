/**
 * 根据108将的序号分配五行，并更新用户表(69ad979f1d7a7b54cfe15324)的wuxing字段
 * 五行分配规则：
 * - 1-22: 金
 * - 23-44: 木
 * - 45-66: 水
 * - 67-88: 火
 * - 89-108: 土
 * 运行: node scripts/update-108-wuxing.js
 */
const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';
const USERS_WORKSHEET_ID = '69ad979f1d7a7b54cfe15324'; // 用户表

// 108将数据（从seed-108-roles.js读取）
const SEED_FILE = path.join(__dirname, 'seed-108-roles.js');

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
  if (seq >= 1 && seq <= 22) return '金';
  if (seq >= 23 && seq <= 44) return '木';
  if (seq >= 45 && seq <= 66) return '水';
  if (seq >= 67 && seq <= 88) return '火';
  if (seq >= 89 && seq <= 108) return '土';
  return null;
}

/**
 * 创建星宿到五行的映射
 */
function createStarToWuxingMap() {
  const map = new Map();
  
  try {
    const seedFile = fs.readFileSync(SEED_FILE, 'utf8');
    // 使用正则表达式提取ROLES_108数组
    const rolesMatch = seedFile.match(/const ROLES_108 = \[([\s\S]*?)\];/);
    if (rolesMatch) {
      // 解析数组内容，提取序号和星宿
      const lines = rolesMatch[1].split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('//') && trimmed.startsWith('[');
      });
      
      lines.forEach(line => {
        // 匹配 [序号, '星宿名', ...] 格式
        const match = line.match(/\[(\d+),\s*['"]([^'"]+)['"]/);
        if (match) {
          const seq = parseInt(match[1]);
          const star = match[2];
          const wuxing = getWuxingBySeq(seq);
          if (wuxing) {
            map.set(star, wuxing);
          }
        }
      });
    }
  } catch (e) {
    console.error('无法读取seed-108-roles.js:', e.message);
    throw e;
  }
  
  if (map.size === 0) {
    throw new Error('未能从seed-108-roles.js中解析出108将数据');
  }
  
  console.log(`成功解析 ${map.size} 个星宿的五行映射`);
  return map;
}

async function main() {
  const cred = getCredential();
  
  console.log('开始更新108将的五行字段...');
  console.log('用户表ID:', USERS_WORKSHEET_ID);
  
  // 1. 创建星宿到五行的映射
  const starToWuxing = createStarToWuxingMap();
  console.log(`已创建 ${starToWuxing.size} 个星宿的五行映射`);
  
  // 2. 获取用户表结构，找到wuxing字段和星宿字段
  const structRes = await api(cred, 'GET', `/v3/app/worksheets/${USERS_WORKSHEET_ID}`);
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
  
  // 查找wuxing字段和星宿字段（可能是昵称、星宿等）
  const wuxingField = fields.find(f => 
    (f.alias && f.alias.toLowerCase() === 'wuxing') ||
    (f.name && (f.name.includes('五行') || f.name.includes('wuxing')))
  );
  
  const starField = fields.find(f =>
    (f.alias && (f.alias.toLowerCase() === 'nickname' || f.alias.toLowerCase() === 'star')) ||
    (f.name && (f.name.includes('星宿') || f.name.includes('昵称') || f.name.includes('nickname')))
  );
  
  if (!wuxingField) {
    console.error('未找到wuxing字段。当前字段:', fields.map(f => ({ name: f.name, alias: f.alias })));
    process.exit(1);
  }
  
  if (!starField) {
    console.error('未找到星宿字段。当前字段:', fields.map(f => ({ name: f.name, alias: f.alias })));
    process.exit(1);
  }
  
  console.log('字段映射: wuxing=', wuxingField.alias || wuxingField.id, ', 星宿=', starField.alias || starField.id);
  
  // 3. 查询所有用户数据（分页查询）
  const wuxingFieldId = wuxingField.alias || wuxingField.id;
  const starFieldId = starField.alias || starField.id;
  
  let pageIndex = 1;
  const pageSize = 50;
  let totalUpdated = 0;
  let totalSkipped = 0;
  
  while (true) {
    console.log(`\n查询第 ${pageIndex} 页数据...`);
    
    // 查询数据（只查询未删除的）
    const filters = [
      {
        controlId: 'del',
        dataType: 2,
        spliceType: 1,
        filterType: 2,
        value: 0
      }
    ];
    
    const queryRes = await api(cred, 'POST', '/v2/open/worksheet/getFilterRows', {
      appKey: cred.appkey,
      sign: cred.sign,
      worksheetId: USERS_WORKSHEET_ID,
      pageSize,
      pageIndex,
      filters,
      controls: JSON.stringify([starFieldId, wuxingFieldId]),
      useControlId: 'true'
    });
    
    if (!queryRes.ok) {
      console.error('查询数据失败:', queryRes.data);
      break;
    }
    
    // 处理返回数据格式
    const result = queryRes.data.success ? queryRes.data.data : queryRes.data;
    const rows = result?.rows || [];
    if (rows.length === 0) {
      console.log('没有更多数据了');
      break;
    }
    
    console.log(`本页查询到 ${rows.length} 条数据`);
    
    // 4. 更新每条记录的wuxing字段
    for (const row of rows) {
      const rowid = row.rowid;
      // 尝试多种方式获取字段值
      const starValue = row[starFieldId] || row[starField.alias] || row[starField.id] || 
                       (starField.alias && row[starField.alias]) || 
                       (starField.id && row[starField.id]);
      const currentWuxing = row[wuxingFieldId] || row[wuxingField.alias] || row[wuxingField.id] ||
                            (wuxingField.alias && row[wuxingField.alias]) ||
                            (wuxingField.id && row[wuxingField.id]);
      
      if (!starValue) {
        totalSkipped++;
        continue;
      }
      
      // 查找对应的五行
      const targetWuxing = starToWuxing.get(starValue);
      if (!targetWuxing) {
        console.log(`  跳过: 星宿 "${starValue}" 未找到对应的五行`);
        totalSkipped++;
        continue;
      }
      
      // 如果五行已经正确，跳过
      if (currentWuxing === targetWuxing) {
        totalSkipped++;
        continue;
      }
      
      // 更新五行字段
      const updateControls = [
        {
          controlId: wuxingFieldId,
          value: targetWuxing
        }
      ];
      
      const updateRes = await api(cred, 'POST', '/v2/open/worksheet/editRow', {
        appKey: cred.appkey,
        sign: cred.sign,
        worksheetId: USERS_WORKSHEET_ID,
        rowId: rowid,
        controls: updateControls,
        triggerWorkflow: false,
        getSystemControl: 'false'
      });
      
      if (updateRes.ok && updateRes.data.success) {
        console.log(`  ✓ 更新: ${starValue} -> ${targetWuxing}`);
        totalUpdated++;
      } else {
        console.error(`  ✗ 更新失败: ${starValue}`, updateRes.data);
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 检查是否还有下一页
    const total = result?.total || 0;
    if (pageIndex * pageSize >= total) {
      break;
    }
    
    pageIndex++;
  }
  
  console.log(`\n完成！`);
  console.log(`- 已更新: ${totalUpdated} 条`);
  console.log(`- 已跳过: ${totalSkipped} 条（无星宿或五行已正确）`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
