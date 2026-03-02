#!/usr/bin/env node
/**
 * 明道云 API 测试脚本
 * 测试对话和消息的查询
 */

const https = require('https');
const fs = require('fs');

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

// 测试1: 查询所有对话
async function testQueryDialogs() {
  console.log('\n=== 测试1: 查询所有对话 ===');
  
  const data = {
    filter: {
      rules: []
    },
    pageSize: 10,
    page: 1
  };

  try {
    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/search`, data);
    console.log('状态:', result.success ? '成功' : '失败');
    console.log('数据行数:', result.data?.rows?.length || 0);
    if (result.data?.rows) {
      console.log('前3条对话:');
      result.data.rows.slice(0, 3).forEach((row, i) => {
        console.log(`  [${i+1}] ID: ${row.rowId || row.id}`);
        console.log(`      内容:`, row.fields?.neirong?.value || row.fields?.neirong);
        console.log(`      类型:`, row.fields?.leixing?.value || row.fields?.leixing);
      });
    }
    return result;
  } catch (err) {
    console.error('错误:', err.message);
    return null;
  }
}

// 测试2: 按类型过滤对话
async function testFilterDialogsByType() {
  console.log('\n=== 测试2: 按类型=AI过滤对话 ===');
  
  const data = {
    filter: {
      rules: [
        {
          field: 'leixing',
          operator: 'equals',
          value: 'AI'
        }
      ]
    },
    pageSize: 10,
    page: 1
  };

  try {
    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.dialogWorksheet}/rows/search`, data);
    console.log('状态:', result.success ? '成功' : '失败');
    console.log('数据行数:', result.data?.rows?.length || 0);
    if (result.data?.rows) {
      result.data.rows.forEach((row, i) => {
        console.log(`  [${i+1}] ID: ${row.rowId || row.id}`);
      });
    }
    return result;
  } catch (err) {
    console.error('错误:', err.message);
    return null;
  }
}

// 测试3: 查询最新100条消息
async function testQueryMessages() {
  console.log('\n=== 测试3: 查询最新100条消息 ===');
  
  const data = {
    filter: {
      rules: []
    },
    pageSize: 100,
    page: 1,
    sort: [
      {
        field: 'riqi',
        direction: 'DESC'
      }
    ]
  };

  try {
    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/search`, data);
    console.log('状态:', result.success ? '成功' : '失败');
    console.log('数据行数:', result.data?.rows?.length || 0);
    if (result.data?.rows && result.data.rows.length > 0) {
      console.log('最新消息:');
      result.data.rows.slice(0, 5).forEach((row, i) => {
        console.log(`  [${i+1}] ID: ${row.rowId || row.id}`);
        console.log(`      内容:`, (row.fields?.neirong?.value || row.fields?.neirong || '').substring(0, 50));
      });
    }
    return result;
  } catch (err) {
    console.error('错误:', err.message);
    return null;
  }
}

// 测试4: 查询特定对话的消息
async function testQueryDialogMessages(dialogId) {
  console.log('\n=== 测试4: 查询对话消息 ===');
  console.log(`对话ID: ${dialogId}`);
  
  const data = {
    filter: {
      rules: [
        {
          field: 'duihua',
          operator: 'equals',
          value: [dialogId]
        }
      ]
    },
    pageSize: 100,
    page: 1,
    sort: [
      {
        field: 'riqi',
        direction: 'ASC'
      }
    ]
  };

  try {
    const result = await apiCall('POST', `/v3/app/worksheets/${CONFIG.messageWorksheet}/rows/search`, data);
    console.log('状态:', result.success ? '成功' : '失败');
    console.log('消息数:', result.data?.rows?.length || 0);
    return result;
  } catch (err) {
    console.error('错误:', err.message);
    return null;
  }
}

// 主函数
async function main() {
  console.log('明道云 API 测试');
  console.log('AppKey:', CONFIG.appkey);
  console.log('对话表:', CONFIG.dialogWorksheet);
  console.log('消息表:', CONFIG.messageWorksheet);
  
  await testQueryDialogs();
  await testFilterDialogsByType();
  await testQueryMessages();
}

main()
  .then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ 测试失败:', err.message);
    process.exit(1);
  });
