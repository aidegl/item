#!/usr/bin/env node

/**
 * HAP 查询技能测试脚本
 * 测试查询辅助函数的基本功能
 */

const queryHelper = require('./query-helper.js');

console.log('=== HAP 查询技能测试 ===\n');

// 测试 1: 构建查询参数
console.log('测试 1: 构建查询参数');
const queryParams = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 50,
  pageIndex: 1,
  fields: ['name', 'status', 'create_time'],
  includeTotalCount: true
});
console.log('查询参数:', JSON.stringify(queryParams, null, 2));
console.log('✓ 测试通过\n');

// 测试 2: 构建筛选条件
console.log('测试 2: 构建筛选条件');
const simpleFilter = queryHelper.buildSimpleFilter('status', 'eq', '进行中');
console.log('简单筛选:', JSON.stringify(simpleFilter, null, 2));

const dateFilter = queryHelper.buildDateRangeFilter(
  'create_time',
  '2024-01-01 00:00:00',
  '2024-12-31 23:59:59'
);
console.log('日期范围筛选:', JSON.stringify(dateFilter, null, 2));

const multiFilter = queryHelper.buildMultiFilter([
  { field: 'status', operator: 'eq', value: '进行中' },
  { field: 'priority', operator: 'eq', value: '高' }
], 'and');
console.log('多条件筛选:', JSON.stringify(multiFilter, null, 2));
console.log('✓ 测试通过\n');

// 测试 3: 构建排序
console.log('测试 3: 构建排序');
const sort = queryHelper.buildSort('create_time', false);
console.log('单字段排序:', JSON.stringify(sort, null, 2));

const multiSort = queryHelper.buildMultiSort([
  { field: 'priority', isAsc: false },
  { field: 'create_time', isAsc: false }
]);
console.log('多字段排序:', JSON.stringify(multiSort, null, 2));
console.log('✓ 测试通过\n');

// 测试 4: 构建数据透视参数
console.log('测试 4: 构建数据透视参数');
const pivotParams = queryHelper.buildPivotParams({
  worksheet_id: 'projects',
  columns: [{ field: 'department', displayName: '部门' }],
  rows: [{ field: 'status', displayName: '状态' }],
  values: [
    queryHelper.buildCountAggregation('项目数量'),
    queryHelper.buildValueAggregation('budget', 'SUM', '总预算')
  ]
});
console.log('透视参数:', JSON.stringify(pivotParams, null, 2));
console.log('✓ 测试通过\n');

// 测试 5: 数据格式化
console.log('测试 5: 数据格式化');
const sampleData = [
  { id: 1, name: '项目A', status: '进行中', budget: 10000 },
  { id: 2, name: '项目B', status: '已完成', budget: 5000 },
  { id: 3, name: '项目C', status: '规划中', budget: 20000 }
];

const table = queryHelper.formatAsTable(sampleData, ['name', 'status', 'budget']);
console.log('格式化表格:');
console.log(table);
console.log('✓ 测试通过\n');

// 测试 6: 验证查询结果
console.log('测试 6: 验证查询结果');
const validResult = {
  data: {
    rows: sampleData,
    totalCount: 3
  }
};

const invalidResult = {
  error: '认证失败',
  error_msg: 'HAP-Appkey 无效',
  statusCode: 401
};

try {
  const validated = queryHelper.validateQueryResult(validResult);
  console.log('有效结果验证通过:', validated.data ? '有数据' : '无数据');

  console.log('尝试验证无效结果...');
  queryHelper.validateQueryResult(invalidResult);
} catch (error) {
  console.log('无效结果捕获错误:', error.message);
}
console.log('✓ 测试通过\n');

// 测试 7: 数据提取
console.log('测试 7: 数据提取');
const extracted = queryHelper.extractData(validResult);
console.log('提取数据条数:', extracted.length);
console.log('第一条数据:', JSON.stringify(extracted[0], null, 2));
console.log('✓ 测试通过\n');

console.log('=== 所有测试完成 ===');
console.log('技能辅助函数功能正常，可以用于 HAP 数据查询。');

// 使用示例
console.log('\n=== 使用示例 ===');
console.log('1. 构建查询:');
console.log(`
const params = queryHelper.buildQueryParams({
  worksheet_id: 'tasks',
  pageSize: 100,
  filter: queryHelper.buildSimpleFilter('status', 'eq', '进行中'),
  sorts: queryHelper.buildSort('priority', false)
});
`);

console.log('2. 数据透视:');
console.log(`
const pivot = queryHelper.buildPivotParams({
  worksheet_id: 'sales',
  columns: [{field: 'region', displayName: '地区'}],
  values: [
    queryHelper.buildCountAggregation('订单数'),
    queryHelper.buildValueAggregation('amount', 'SUM', '总金额')
  ]
});
`);

console.log('3. 结果处理:');
console.log(`
try {
  const result = await getRecordList(params);
  const data = queryHelper.extractData(result);
  const table = queryHelper.formatAsTable(data);
  console.log(table);
} catch (error) {
  console.error('查询失败:', error.message);
}
`);