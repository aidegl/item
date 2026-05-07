# HAP 查询技能快速入门

## 技能概述

HAP 查询技能是一个专门用于查询明道云 HAP 应用数据的技能。它提供了完整的查询工作流程、工具函数和最佳实践指南。

## 快速开始

### 步骤 1：触发技能

当需要查询 HAP 数据时，Claude 会自动识别并触发此技能。技能描述为：
> "查询明道云 HAP 数据的技能。此技能应该在使用者需要查询、搜索、分析明道云 HAP 应用中的数据时使用，包括获取工作表结构、查询记录列表、获取记录详情、执行数据透视分析等。"

### 步骤 2：了解查询需求

在开始查询前，需要明确：
1. **查询目标**：要查询哪个工作表？需要什么数据？
2. **查询条件**：有哪些筛选条件？需要排序吗？
3. **输出格式**：需要原始数据还是格式化表格？

### 步骤 3：使用查询工具

技能提供了 `query-helper.js` 工具函数，可以简化查询过程：

```javascript
// 引入查询辅助函数
const queryHelper = require('./scripts/query-helper.js');

// 构建查询参数
const params = queryHelper.buildQueryParams({
  worksheet_id: 'projects',  // 工作表ID或别名
  pageSize: 50,
  pageIndex: 1,
  fields: ['name', 'status', 'create_time'],
  filter: queryHelper.buildSimpleFilter('status', 'eq', '进行中'),
  sorts: queryHelper.buildSort('create_time', false)
});
```

## 常用查询场景

### 场景 1：查询项目列表

```javascript
// 查询状态为"进行中"的项目，按创建时间倒序排列
const projectQuery = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 100,
  pageIndex: 1,
  fields: ['project_name', 'status', '负责人', 'create_time', 'deadline'],
  filter: queryHelper.buildSimpleFilter('status', 'eq', '进行中'),
  sorts: queryHelper.buildSort('create_time', false),
  includeTotalCount: true
});

// 执行查询
const result = await getRecordList(projectQuery);
const projects = queryHelper.extractData(result);

// 格式化显示
const table = queryHelper.formatAsTable(projects, [
  'project_name', 'status', '负责人', 'create_time', 'deadline'
]);
console.log(table);
```

### 场景 2：月度数据统计

```javascript
// 统计2024年1月各部门项目数量
const monthlyStats = queryHelper.buildPivotParams({
  worksheet_id: 'projects',
  columns: [{ field: 'department', displayName: '部门' }],
  values: [queryHelper.buildCountAggregation('项目数量')],
  filter: queryHelper.buildDateRangeFilter(
    'create_time',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59'
  )
});

const pivotResult = await getRecordPivotData(monthlyStats);
const statsData = queryHelper.extractData(pivotResult);
```

### 场景 3：任务看板查询

```javascript
// 查询不同状态的任务
const statuses = ['待处理', '进行中', '已完成', '已延期'];
const boardData = {};

for (const status of statuses) {
  const taskQuery = queryHelper.buildQueryParams({
    worksheet_id: 'tasks',
    pageSize: 20,
    pageIndex: 1,
    fields: ['task_name', '负责人', 'priority', 'create_time'],
    filter: queryHelper.buildSimpleFilter('status', 'eq', status),
    sorts: queryHelper.buildMultiSort([
      { field: 'priority', isAsc: false },
      { field: 'create_time', isAsc: false }
    ])
  });

  const result = await getRecordList(taskQuery);
  boardData[status] = queryHelper.extractData(result);
}
```

## 错误处理

### 基本错误处理模式

```javascript
async function safeHAPQuery(queryFn, params) {
  try {
    const result = await queryFn(params);
    return queryHelper.extractData(result);
  } catch (error) {
    console.error('HAP查询失败:', error.message);

    // 根据错误类型提供建议
    if (error.message.includes('认证失败')) {
      console.log('建议：检查 HAP-Appkey 和 HAP-Sign 配置');
    } else if (error.message.includes('工作表不存在')) {
      console.log('建议：确认 worksheet_id 是否正确');
    } else if (error.message.includes('字段不存在')) {
      console.log('建议：先使用 getWorksheetStructure 查看字段结构');
    }

    return [];
  }
}
```

### 重试机制

```javascript
async function queryWithRetry(queryFn, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn(params);
      return queryHelper.extractData(result);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.log(`查询失败，第${attempt}次重试...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 指数退避
    }
  }
}
```

## 性能优化技巧

### 1. 合理设置分页大小
```javascript
// 根据预估数据量设置分页
function getOptimalPageSize(estimatedTotal) {
  if (estimatedTotal <= 100) return 100;
  if (estimatedTotal <= 500) return 50;
  if (estimatedTotal <= 1000) return 20;
  return 10;
}
```

### 2. 只查询需要的字段
```javascript
// 避免查询所有字段
const efficientQuery = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 50,
  fields: ['name', 'status', 'create_time'], // 只查询需要的字段
  // 而不是 fields: [] 查询所有字段
});
```

### 3. 使用缓存
```javascript
// 简单缓存实现
const queryCache = new Map();

async function cachedQuery(queryFn, params, cacheKey, ttl = 300000) { // 5分钟
  const now = Date.now();
  const cached = queryCache.get(cacheKey);

  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }

  const data = await queryFn(params);
  queryCache.set(cacheKey, { data, timestamp: now });
  return data;
}
```

## 最佳实践

### 1. 查询前先了解结构
```javascript
// 先获取工作表结构
const structure = await getWorksheetStructure({
  worksheet_id: 'projects',
  responseFormat: 'json'
});

// 分析字段类型和别名
const fields = structure.data?.fields || [];
console.log('可用字段:', fields.map(f => `${f.name} (${f.alias}): ${f.type}`));
```

### 2. 逐步构建复杂查询
```javascript
// 从简单查询开始
let params = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 10
});

// 逐步添加条件
params.filter = queryHelper.buildSimpleFilter('status', 'eq', '进行中');
params.sorts = queryHelper.buildSort('create_time', false);

// 测试查询
const testResult = await getRecordList(params);
console.log('测试查询结果数:', queryHelper.extractData(testResult).length);
```

### 3. 使用 Markdown 格式节省 Token
```javascript
// 当数据量较大时，使用 md 格式
const mdQuery = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 100,
  responseFormat: 'md'  // 返回 Markdown 表格格式
});
```

## 常见问题解答

### Q1: 如何找到工作表的 ID 或别名？
A: 使用 `getWorksheetsList` 获取所有工作表信息，或使用 `getAppInfo` 查看应用结构。

### Q2: 查询时应该使用字段 ID 还是别名？
A: 建议使用别名，因为别名更易读且稳定。设置 `useFieldIdAsKey: false`。

### Q3: 如何查询关联记录？
A: 使用 `getRecordRelations` 工具，需要提供 worksheet_id、row_id 和关联字段。

### Q4: 数据透视分析支持哪些聚合函数？
A: 支持 COUNT, DISTINCTCOUNT, SUM, MIN, MAX, AVG。

### Q5: 如何处理查询超时？
A: 减少 pageSize，添加有效的筛选条件，或分多次查询。

## 下一步

1. **查看详细文档**：阅读 `hap-api-guide.md` 了解完整的 API 文档
2. **学习字段类型**：查看 `field-types.md` 了解不同字段类型的处理方式
3. **参考示例**：查看 `query-examples.md` 获取更多查询示例
4. **使用工具函数**：利用 `query-helper.js` 简化查询代码

## 获取帮助

如果在使用过程中遇到问题：
1. 检查 MCP 服务器连接状态
2. 验证 HAP-Appkey 和 HAP-Sign 配置
3. 确认工作表 ID 和字段别名正确
4. 参考错误信息中的建议