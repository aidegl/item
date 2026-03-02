#!/usr/bin/env node
/**
 * 明道云工作表结构查询脚本
 * 查询对话和消息工作表的实际字段结构
 */

const https = require('https');

const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4'
};

function apiCall(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : '';
    const req = https.request(`https://api.mingdao.com${path}`, {
      method: method,
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
          const result = resp ? JSON.parse(resp) : { success: true };
          resolve(result);
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

// 查询工作表结构
async function getWorksheetStructure(worksheetId) {
  console.log(`\n=== 查询工作表结构: ${worksheetId} ===`);
  
  const result = await apiCall('GET', `/v3/app/worksheets/${worksheetId}`);
  console.log('状态:', result.success ? '成功' : '失败');
  
  if (result.data) {
    console.log('\n📊 工作表信息:');
    console.log('  名称:', result.data.name);
    console.log('  描述:', result.data.description);
    
    console.log('\n📝 字段列表:');
    if (result.data.fields && result.data.fields.length > 0) {
      result.data.fields.forEach((field, i) => {
        console.log(`  [${i+1}] ID: ${field.id}`);
        console.log(`      类型: ${field.type}`);
        console.log(`      名称: ${field.name}`);
        console.log(`      别名: ${field.alias || '无'}`);
        console.log(`      必填: ${field.required ? '是' : '否'}`);
        
        if (field.customOptions && field.customOptions.length > 0) {
          console.log(`      选项:`);
          field.customOptions.forEach(opt => {
            console.log(`        - ${opt.label} (${opt.value})`);
          });
        }
        console.log('');
      });
    } else {
      console.log('  (无字段定义)');
    }
  }
  
  return result;
}

// 检查单条记录的字段结构
async function checkRecordStructure(worksheetId) {
  console.log(`\n=== 检查记录结构: ${worksheetId} ===`);
  
  // 先查询一条记录
  const searchResult = await apiCall('POST', `/v3/app/worksheets/${worksheetId}/rows/search`, {
    filter: { rules: [] },
    pageSize: 1,
    page: 1
  });
  
  if (searchResult.data?.rows?.length > 0) {
    const row = searchResult.data.rows[0];
    console.log('找到 1 条记录:');
    console.log('  RowID:', row.rowId || row.id);
    
    if (row.fields) {
      console.log('\n📝 字段值:');
      for (const [fieldId, fieldValue] of Object.entries(row.fields)) {
        console.log(`  [${fieldId}]:`);
        console.log(`      值:`, fieldValue);
      }
    }
  } else {
    console.log('❌ 无记录');
  }
  
  return searchResult;
}

// 主函数
async function main() {
  console.log('明道云工作表结构查询');
  console.log('====================');
  
  await getWorksheetStructure(CONFIG.dialogWorksheet);
  await checkRecordStructure(CONFIG.dialogWorksheet);
  
  await getWorksheetStructure(CONFIG.messageWorksheet);
  await checkRecordStructure(CONFIG.messageWorksheet);
  
  console.log('\n✅ 查询完成');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ 查询失败:', err.message);
    process.exit(1);
  });
