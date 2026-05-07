---
name: hap-query
description: 查询明道云 HAP 数据的技能。此技能应该在使用者需要查询、搜索、分析明道云 HAP 应用中的数据时使用，包括获取工作表结构、查询记录列表、获取记录详情、执行数据透视分析等。
license: MIT
---

# HAP 数据查询技能

此技能提供查询明道云 HAP 数据的专业指导和工作流程。

## 关于此技能

此技能专门用于查询明道云 HAP（High-performance Application Platform）应用中的数据。通过集成的 MCP 服务器，可以访问 HAP API 并执行各种数据查询操作。

### 前置条件

在使用此技能前，确保：
1. HAP MCP 服务器已正确配置并运行
2. 拥有有效的 HAP-Appkey 和 HAP-Sign 认证信息
3. 了解目标应用的工作表结构和字段信息

### 核心查询功能

#### 1. 应用信息查询
- 获取应用基本信息
- 查看应用下的分组、工作表、自定义页面
- 获取选项集列表和角色列表

#### 2. 工作表结构查询
- 查询工作表配置和字段信息
- 了解字段类型、别名、必填性等属性
- 获取工作表列表

#### 3. 记录数据查询
- 查询记录列表（支持分页、筛选、排序）
- 获取记录详情（包括系统字段）
- 查询关联记录
- 获取记录讨论和日志

#### 4. 数据分析查询
- 执行数据透视分析
- 获取汇总统计信息
- 支持维度、度量和筛选条件

### 查询工作流程

#### 步骤 1：了解查询需求
- 确定要查询的工作表或应用
- 明确查询目的（数据查看、分析、导出等）
- 确定需要的字段和筛选条件

#### 步骤 2：准备工作表信息
- 使用 `getWorksheetsList` 获取工作表列表
- 使用 `getWorksheetStructure` 了解工作表结构
- 确定要查询的字段 ID 或别名

#### 步骤 3：构建查询参数
- 确定分页参数（pageSize, pageIndex）
- 设置筛选条件（filter）
- 指定排序规则（sorts）
- 选择返回字段（fields）

#### 步骤 4：执行查询
- 使用 `getRecordList` 查询记录列表
- 使用 `getRecordDetails` 获取单条记录详情
- 使用 `getRecordPivotData` 进行数据分析

#### 步骤 5：处理查询结果
- 解析返回的 JSON 数据
- 格式化显示结果
- 处理错误和异常情况

### 常用查询模式

#### 模式 1：简单列表查询
```javascript
{
  "worksheet_id": "工作表ID",
  "pageSize": 50,
  "pageIndex": 1,
  "fields": ["字段1", "字段2"],
  "sorts": [{"field": "创建时间", "isAsc": false}]
}
```

#### 模式 2：条件筛选查询
```javascript
{
  "worksheet_id": "工作表ID",
  "pageSize": 100,
  "pageIndex": 1,
  "filter": {
    "conjunction": "and",
    "conditions": [
      {
        "field": "状态",
        "operator": "eq",
        "value": "已完成"
      },
      {
        "field": "创建时间",
        "operator": "gte",
        "value": "2024-01-01"
      }
    ]
  }
}
```

#### 模式 3：数据透视分析
```javascript
{
  "worksheet_id": "工作表ID",
  "columns": [
    {
      "field": "部门",
      "displayName": "部门"
    }
  ],
  "values": [
    {
      "field": "record_count",
      "aggregation": "COUNT",
      "displayName": "记录数"
    },
    {
      "field": "金额",
      "aggregation": "SUM",
      "displayName": "总金额"
    }
  ]
}
```

### 字段类型处理指南

#### 文本类型字段
- 支持精确匹配、模糊搜索
- 使用 `eq`, `neq`, `contains` 等操作符

#### 数字类型字段
- 支持数值比较
- 使用 `eq`, `gt`, `lt`, `gte`, `lte` 等操作符
- 注意精度设置

#### 日期时间字段
- 格式：yyyy-MM-dd HH:mm:ss
- 支持日期范围查询
- 使用 `gte`, `lte` 操作符

#### 选项字段（单选/多选）
- **重要**：筛选时需要使用选项的 **Key** 而不是选项名称
- 选项 Key 可以通过 `getWorksheetStructure` 获取
- 每个选项包含 `Key`（唯一标识）和 `Value`（显示名称）
- 查询时在 `value` 数组中传递选项 Key
- 多选字段支持包含关系查询

**错误示例**：
```javascript
{
  "field": "company_size",
  "operator": "eq",
  "value": ["1000人以上"]  // 错误：使用了选项名称
}
```

**正确示例**：
```javascript
{
  "field": "company_size",
  "operator": "eq",
  "value": ["e643dce9-530d-41ca-beff-ad2d50f218b8"]  // 正确：使用选项Key
}
```

#### 关联字段
- 使用 `getRecordRelations` 查询关联记录
- 支持关联记录的详细信息查询

### 性能优化建议

1. **分页查询**：避免一次性查询大量数据，使用合理的 pageSize
2. **字段选择**：只查询需要的字段，减少数据传输量
3. **筛选条件**：使用有效的筛选条件减少查询结果集
4. **索引字段**：对经常查询的字段建立索引
5. **缓存策略**：对不经常变化的数据考虑缓存
6. **数据分析优化**：
   - **统计分布**：优先使用 `get_record_pivot_data` 进行数据透视分析
   - **详情分析**：按需使用筛选条件分组查询，避免传输不必要数据
   - **大数据量**：分步骤分析，先统计后详情
   - **交叉分析**：使用数据透视进行多维度分析，避免多次查询

### 错误处理

#### 常见错误及解决方案

1. **认证错误**：检查 HAP-Appkey 和 HAP-Sign 配置
2. **工作表不存在**：确认 worksheet_id 是否正确
3. **字段不存在**：检查字段 ID 或别名
4. **参数错误**：验证查询参数格式和类型
5. **权限不足**：确认当前用户有查询权限

#### 错误响应格式
```json
{
  "error": "错误描述",
  "error_msg": "详细错误信息",
  "statusCode": 400
}
```

### 最佳实践

1. **先了解结构再查询**：查询前先获取工作表结构，特别是选项字段的 Key-Value 映射
2. **使用别名而非ID**：在查询参数中使用字段别名提高可读性
3. **注意选项字段筛选**：单选/多选字段筛选时必须使用选项 Key 而不是选项名称
4. **数据分析效率**：
   - 统计分布：优先使用数据透视 `get_record_pivot_data`
   - 详情分析：按行业/条件分组查询，避免传输不必要数据
   - 大数据量：分步骤分析，先统计后详情
5. **逐步构建查询**：从简单查询开始，逐步添加条件
6. **测试查询条件**：先测试筛选条件是否正确，特别是选项字段的筛选
7. **监控查询性能**：关注查询响应时间和数据量

### 参考资源

- `references/hap-api-guide.md`：HAP API 详细指南
- `references/field-types.md`：字段类型处理参考
- `references/query-examples.md`：查询示例集合
- `references/option-field-filtering.md`：选项字段筛选经验总结（重要）
- `references/data-analysis-best-practices.md`：数据分析最佳实践（性能优化）

### 注意事项

1. 确保 MCP 服务器连接正常
2. 注意 API 调用频率限制
3. 处理大数据量时的分页策略
4. 敏感数据的安全处理
5. 查询结果的合理展示格式