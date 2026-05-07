# HAP 查询技能

## 概述

HAP 查询技能是一个专门用于查询明道云 HAP 应用数据的 Claude 技能。它提供了完整的查询工作流程、工具函数和最佳实践指南，帮助用户高效地查询、分析和处理 HAP 应用中的数据。

## 功能特性

### 核心功能
- ✅ **应用信息查询**：获取应用结构、工作表列表、选项集等
- ✅ **工作表结构查询**：查看字段配置、类型、别名等信息
- ✅ **记录数据查询**：支持分页、筛选、排序、搜索等复杂查询
- ✅ **数据分析查询**：数据透视分析、聚合统计、多维分析
- ✅ **关联查询**：查询关联记录、讨论、日志等信息

### 高级功能
- 🔧 **查询构建工具**：提供 `query-helper.js` 工具函数库
- 📊 **结果格式化**：自动将查询结果格式化为易读的表格
- 🛡️ **错误处理**：完善的错误处理和重试机制
- ⚡ **性能优化**：缓存、合理分页、字段选择等优化策略
- 📋 **完整示例**：提供从简单查询到复杂报告生成的完整示例

## 技能结构

```
hap-query/
├── SKILL.md                    # 技能主文档（必需）
├── scripts/
│   ├── query-helper.js         # 查询辅助函数库
│   └── test-query.js           # 功能测试脚本
├── references/
│   ├── hap-api-guide.md        # HAP API 详细指南
│   ├── field-types.md          # 字段类型处理指南
│   ├── query-examples.md       # 查询示例集合
│   └── quick-start.md          # 快速入门指南
└── assets/
    └── example-workflow.md     # 完整工作流程示例
```

## 快速开始

### 1. 触发技能
当 Claude 检测到用户需要查询 HAP 数据时，会自动触发此技能。

### 2. 基本查询示例
```javascript
// 引入查询辅助函数
const queryHelper = require('./scripts/query-helper.js');

// 构建查询参数
const params = queryHelper.buildQueryParams({
  worksheet_id: 'projects',
  pageSize: 50,
  fields: ['name', 'status', 'create_time'],
  filter: queryHelper.buildSimpleFilter('status', 'eq', '进行中'),
  sorts: queryHelper.buildSort('create_time', false)
});

// 执行查询
const result = await getRecordList(params);
const data = queryHelper.extractData(result);

// 格式化显示
const table = queryHelper.formatAsTable(data);
console.log(table);
```

### 3. 数据透视分析
```javascript
const pivotParams = queryHelper.buildPivotParams({
  worksheet_id: 'sales',
  columns: [{field: 'region', displayName: '地区'}],
  values: [
    queryHelper.buildCountAggregation('订单数'),
    queryHelper.buildValueAggregation('amount', 'SUM', '总金额')
  ]
});

const pivotResult = await getRecordPivotData(pivotParams);
```

## 使用场景

### 场景 1：项目管理
- 查询项目列表和状态
- 按部门统计项目数量
- 跟踪项目进度和预算

### 场景 2：销售分析
- 分析销售数据趋势
- 按地区/产品统计销售额
- 客户行为分析

### 场景 3：人力资源
- 员工信息查询
- 考勤统计
- 绩效数据分析

### 场景 4：库存管理
- 库存查询和预警
- 出入库统计
- 库存周转分析

## 最佳实践

### 1. 查询前先了解结构
```javascript
// 先获取工作表结构
const structure = await getWorksheetStructure({
  worksheet_id: 'target_worksheet',
  responseFormat: 'json'
});
```

### 2. 使用字段别名
```javascript
// 使用别名而非ID
const efficientQuery = {
  worksheet_id: 'projects',
  fields: ['project_name', 'status'], // 使用别名
  useFieldIdAsKey: false
};
```

### 3. 合理设置分页
```javascript
// 根据数据量动态设置分页
function getOptimalPageSize(estimatedTotal) {
  if (estimatedTotal <= 100) return 100;
  if (estimatedTotal <= 500) return 50;
  return 20;
}
```

### 4. 添加错误处理
```javascript
async function safeQuery(queryFn, params) {
  try {
    const result = await queryFn(params);
    return queryHelper.extractData(result);
  } catch (error) {
    console.error('查询失败:', error.message);
    // 根据错误类型提供建议
    return [];
  }
}
```

## 性能优化建议

### 查询优化
1. **减少字段数量**：只查询需要的字段
2. **使用有效筛选**：添加合适的筛选条件减少结果集
3. **合理分页**：避免一次性查询大量数据
4. **使用索引字段**：对经常查询的字段建立索引

### 缓存策略
1. **短期缓存**：对不经常变化的数据使用内存缓存
2. **查询结果缓存**：缓存频繁查询的结果
3. **结构缓存**：缓存工作表结构信息

## 错误处理

### 常见错误及解决方案

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 认证失败 | HAP-Appkey/HAP-Sign 错误 | 检查 MCP 服务器配置 |
| 工作表不存在 | worksheet_id 错误 | 使用 getWorksheetsList 确认 |
| 字段不存在 | 字段别名错误 | 使用 getWorksheetStructure 查看字段 |
| 参数错误 | 查询参数格式错误 | 参考 API 文档验证参数 |
| 权限不足 | 用户无查询权限 | 检查角色权限设置 |

### 错误处理示例
```javascript
try {
  const result = await getRecordList(params);
  const data = queryHelper.extractData(result);
  // 处理数据
} catch (error) {
  if (error.message.includes('认证失败')) {
    console.log('请检查 HAP 认证配置');
  } else if (error.message.includes('工作表不存在')) {
    console.log('请确认工作表 ID 是否正确');
  } else {
    console.error('未知错误:', error.message);
  }
}
```

## 扩展开发

### 添加新的查询模式
1. 在 `query-helper.js` 中添加新的工具函数
2. 在 `query-examples.md` 中添加使用示例
3. 更新 `SKILL.md` 中的功能说明

### 集成其他数据源
1. 创建新的脚本处理特定数据源
2. 添加对应的参考文档
3. 更新技能描述和触发条件

## 技能维护

### 版本更新
- 定期检查 HAP API 更新
- 更新查询示例和最佳实践
- 优化工具函数性能

### 问题反馈
1. 记录使用中的问题和需求
2. 分析常见错误模式
3. 持续改进错误处理

## 相关资源

### 官方文档
- [明道云 HAP API 文档](https://api.mingdao.com/docs)
- [MCP 服务器配置指南](https://modelcontextprotocol.io)

### 学习资源
- `references/hap-api-guide.md` - 详细 API 指南
- `references/field-types.md` - 字段类型处理
- `references/query-examples.md` - 查询示例
- `assets/example-workflow.md` - 完整工作流程

## 贡献指南

欢迎贡献代码、文档或示例：

1. Fork 技能仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License - 详见 LICENSE 文件

## 支持

如有问题或建议，请：
1. 查看 `references/` 目录中的文档
2. 运行 `scripts/test-query.js` 测试基本功能
3. 参考 `assets/example-workflow.md` 中的完整示例