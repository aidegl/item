# HAP 查询技能完整工作流程示例

## 场景：生成项目月度报告

### 目标
为项目经理生成2024年1月的项目报告，包括：
1. 项目列表（状态为"进行中"）
2. 按部门统计项目数量
3. 项目状态分布
4. 预算汇总

### 步骤 1：准备工作

#### 1.1 确认 MCP 连接
```javascript
// 检查 MCP 服务器配置
// 确保已配置正确的 HAP-Appkey 和 HAP-Sign
```

#### 1.2 获取应用信息
```javascript
const appInfo = await getAppInfo({
  ai_description: "获取应用信息，了解可用工作表"
});

console.log('应用名称:', appInfo.data?.name);
console.log('工作表数量:', appInfo.data?.worksheets?.length || 0);
```

### 步骤 2：了解数据结构

#### 2.1 获取工作表列表
```javascript
const worksheets = await getWorksheetsList({
  responseFormat: 'json',
  ai_description: "获取所有工作表信息"
});

// 查找项目工作表
const projectWorksheet = worksheets.data?.find(ws =>
  ws.name.includes('项目') || ws.alias === 'projects'
);

if (!projectWorksheet) {
  throw new Error('未找到项目工作表');
}

console.log('项目工作表:', projectWorksheet.name, `(${projectWorksheet.id})`);
```

#### 2.2 获取工作表结构
```javascript
const structure = await getWorksheetStructure({
  worksheet_id: projectWorksheet.id,
  responseFormat: 'json',
  ai_description: "获取项目工作表字段结构"
});

// 分析重要字段
const importantFields = structure.data?.fields?.filter(f =>
  ['status', 'department', 'budget', '负责人', 'create_time'].includes(f.alias)
);

console.log('重要字段:');
importantFields?.forEach(field => {
  console.log(`  ${field.name} (${field.alias}): ${field.type}`);
});
```

### 步骤 3：执行数据查询

#### 3.1 查询进行中的项目
```javascript
const queryHelper = require('./scripts/query-helper.js');

const projectQuery = queryHelper.buildQueryParams({
  worksheet_id: projectWorksheet.id,
  pageSize: 100,
  pageIndex: 1,
  fields: ['project_name', 'status', 'department', '负责人', 'budget', 'create_time'],
  filter: queryHelper.buildSimpleFilter('status', 'eq', '进行中'),
  sorts: queryHelper.buildSort('create_time', false),
  includeTotalCount: true
});

const projectResult = await getRecordList(projectQuery);
const projects = queryHelper.extractData(projectResult);

console.log(`找到 ${projects.length} 个进行中的项目`);
```

#### 3.2 按部门统计
```javascript
const deptStatsQuery = queryHelper.buildPivotParams({
  worksheet_id: projectWorksheet.id,
  columns: [{ field: 'department', displayName: '部门' }],
  values: [queryHelper.buildCountAggregation('项目数量')],
  filter: queryHelper.buildDateRangeFilter(
    'create_time',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59'
  )
});

const deptStatsResult = await getRecordPivotData(deptStatsQuery);
const deptStats = queryHelper.extractData(deptStatsResult);
```

#### 3.3 项目状态分布
```javascript
const statusStatsQuery = queryHelper.buildPivotParams({
  worksheet_id: projectWorksheet.id,
  columns: [{ field: 'status', displayName: '状态' }],
  values: [
    queryHelper.buildCountAggregation('数量'),
    queryHelper.buildValueAggregation('budget', 'SUM', '总预算')
  ],
  filter: queryHelper.buildDateRangeFilter(
    'create_time',
    '2024-01-01 00:00:00',
    '2024-01-31 23:59:59'
  )
});

const statusStatsResult = await getRecordPivotData(statusStatsQuery);
const statusStats = queryHelper.extractData(statusStatsResult);
```

### 步骤 4：生成报告

#### 4.1 格式化项目列表
```javascript
const projectTable = queryHelper.formatAsTable(projects, [
  'project_name', 'status', 'department', '负责人', 'budget'
]);

console.log('=== 进行中的项目列表 ===');
console.log(projectTable);
```

#### 4.2 格式化统计结果
```javascript
console.log('\n=== 部门项目统计（2024年1月）===');
if (deptStats.length > 0) {
  deptStats.forEach(stat => {
    console.log(`${stat.department}: ${stat['项目数量']} 个项目`);
  });
}

console.log('\n=== 项目状态分布（2024年1月）===');
if (statusStats.length > 0) {
  const statusTable = queryHelper.formatAsTable(statusStats, ['status', '数量', '总预算']);
  console.log(statusTable);
}
```

#### 4.3 计算汇总数据
```javascript
// 总项目数
const totalProjects = projectResult.data?.totalCount || projects.length;

// 总预算
const totalBudget = projects.reduce((sum, project) => {
  const budget = parseFloat(project.budget) || 0;
  return sum + budget;
}, 0);

// 平均预算
const avgBudget = totalProjects > 0 ? totalBudget / totalProjects : 0;

console.log('\n=== 汇总信息 ===');
console.log(`总项目数: ${totalProjects}`);
console.log(`总预算: ¥${totalBudget.toLocaleString()}`);
console.log(`平均预算: ¥${avgBudget.toLocaleString()}`);
```

### 步骤 5：错误处理和优化

#### 5.1 添加错误处理
```javascript
async function safeQuery(queryFn, params, description) {
  try {
    console.log(`执行查询: ${description}`);
    const startTime = Date.now();

    const result = await queryFn({
      ...params,
      ai_description: description
    });

    const endTime = Date.now();
    console.log(`查询完成，耗时: ${endTime - startTime}ms`);

    return queryHelper.validateQueryResult(result);
  } catch (error) {
    console.error(`查询失败: ${error.message}`);
    throw error;
  }
}
```

#### 5.2 使用缓存优化
```javascript
const cache = new Map();

async function cachedQuery(queryFn, params, cacheKey, ttl = 60000) {
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && (now - cached.timestamp) < ttl) {
    console.log(`使用缓存数据: ${cacheKey}`);
    return cached.data;
  }

  const data = await queryFn(params);
  cache.set(cacheKey, { data, timestamp: now });
  return data;
}

// 使用缓存查询
const cachedProjects = await cachedQuery(
  getRecordList,
  projectQuery,
  `projects_${projectWorksheet.id}_进行中`,
  300000 // 5分钟缓存
);
```

### 完整代码示例

```javascript
// 引入查询辅助函数
const queryHelper = require('./scripts/query-helper.js');

async function generateMonthlyProjectReport(year, month) {
  console.log(`开始生成 ${year}年${month}月项目报告...\n`);

  // 1. 准备工作表信息
  const worksheets = await getWorksheetsList({
    responseFormat: 'json',
    ai_description: "获取工作表列表"
  });

  const projectWorksheet = worksheets.data?.find(ws =>
    ws.name.includes('项目') || ws.alias === 'projects'
  );

  if (!projectWorksheet) {
    throw new Error('未找到项目工作表');
  }

  // 2. 设置时间范围
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01 00:00:00`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31 23:59:59`;

  // 3. 查询进行中的项目
  const projectQuery = queryHelper.buildQueryParams({
    worksheet_id: projectWorksheet.id,
    pageSize: 100,
    pageIndex: 1,
    fields: ['project_name', 'status', 'department', '负责人', 'budget', 'create_time'],
    filter: queryHelper.buildMultiFilter([
      { field: 'status', operator: 'eq', value: '进行中' },
      { field: 'create_time', operator: 'gte', value: startDate },
      { field: 'create_time', operator: 'lte', value: endDate }
    ]),
    sorts: queryHelper.buildSort('create_time', false),
    includeTotalCount: true
  });

  const projectResult = await getRecordList(projectQuery);
  const projects = queryHelper.extractData(projectResult);

  // 4. 生成部门统计
  const deptStatsQuery = queryHelper.buildPivotParams({
    worksheet_id: projectWorksheet.id,
    columns: [{ field: 'department', displayName: '部门' }],
    values: [queryHelper.buildCountAggregation('项目数量')],
    filter: queryHelper.buildDateRangeFilter('create_time', startDate, endDate)
  });

  const deptStatsResult = await getRecordPivotData(deptStatsQuery);
  const deptStats = queryHelper.extractData(deptStatsResult);

  // 5. 生成状态统计
  const statusStatsQuery = queryHelper.buildPivotParams({
    worksheet_id: projectWorksheet.id,
    columns: [{ field: 'status', displayName: '状态' }],
    values: [
      queryHelper.buildCountAggregation('数量'),
      queryHelper.buildValueAggregation('budget', 'SUM', '总预算')
    ],
    filter: queryHelper.buildDateRangeFilter('create_time', startDate, endDate)
  });

  const statusStatsResult = await getRecordPivotData(statusStatsQuery);
  const statusStats = queryHelper.extractData(statusStatsResult);

  // 6. 生成报告
  const report = {
    period: `${year}年${month}月`,
    worksheet: projectWorksheet.name,
    totalProjects: projectResult.data?.totalCount || 0,
    ongoingProjects: projects.length,
    projects: projects,
    departmentStats: deptStats,
    statusStats: statusStats,
    generatedAt: new Date().toISOString()
  };

  // 7. 格式化输出
  console.log(`=== ${report.period} 项目报告 ===`);
  console.log(`数据源: ${report.worksheet}`);
  console.log(`总项目数: ${report.totalProjects}`);
  console.log(`进行中项目: ${report.ongoingProjects}\n`);

  console.log('=== 部门项目分布 ===');
  if (report.departmentStats.length > 0) {
    const deptTable = queryHelper.formatAsTable(report.departmentStats, ['department', '项目数量']);
    console.log(deptTable);
  }

  console.log('\n=== 项目状态分布 ===');
  if (report.statusStats.length > 0) {
    const statusTable = queryHelper.formatAsTable(report.statusStats, ['status', '数量', '总预算']);
    console.log(statusTable);
  }

  console.log('\n=== 进行中的项目 ===');
  if (report.projects.length > 0) {
    const projectTable = queryHelper.formatAsTable(report.projects.slice(0, 10), [
      'project_name', 'department', '负责人', 'budget'
    ]);
    console.log(projectTable);

    if (report.projects.length > 10) {
      console.log(`... 还有 ${report.projects.length - 10} 个项目未显示`);
    }
  }

  console.log(`\n报告生成时间: ${new Date(report.generatedAt).toLocaleString()}`);

  return report;
}

// 使用示例
try {
  const report = await generateMonthlyProjectReport(2024, 1);
  console.log('\n✅ 报告生成完成！');
} catch (error) {
  console.error('❌ 报告生成失败:', error.message);
}
```

## 技能优势

通过这个完整的工作流程，展示了 HAP 查询技能的以下优势：

1. **结构化查询**：从了解数据结构到执行查询，步骤清晰
2. **错误处理**：完善的错误处理和重试机制
3. **性能优化**：使用缓存、合理分页等优化手段
4. **结果格式化**：自动格式化查询结果为易读的表格
5. **完整工作流**：从数据查询到报告生成的全流程支持

这个示例可以作为模板，根据实际需求进行调整和扩展。