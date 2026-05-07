# HAP 数据分析最佳实践

## 经验总结：分析效率优化

### 问题背景

在进行数据分析时，常见的低效做法是：
1. 一次性查询所有记录进行本地分析
2. 对大数据量场景性能差
3. 传输不必要的数据

### 优化原则：按需查询，分组分析

#### 原则1：统计分布使用数据透视
**错误做法**：
```javascript
// 查询所有记录，本地统计
const allRecords = await getRecordList({pageSize: 1000});
// 本地循环统计行业分布（低效）
```

**正确做法**：
```javascript
// 使用数据透视直接获取统计
const distribution = await getRecordPivotData({
  columns: [{"field": "industry_type", "displayName": "行业"}],
  values: [{"field": "rowid", "aggregation": "COUNT", "displayName": "数量"}]
});
// 1次API调用，直接获得统计结果
```

#### 原则2：详情分析按需分组查询
**错误做法**：
```javascript
// 查询所有记录，过滤出制造业
const allRecords = await getRecordList({pageSize: 1000});
const manufacturing = allRecords.filter(r => r.industry_type === '制造业');
// 传输了所有数据，但只用了部分
```

**正确做法**：
```javascript
// 只查询制造业记录
const manufacturing = await getRecordList({
  filter: {
    "type": "group",
    "logic": "AND",
    "children": [{
      "type": "condition",
      "field": "industry_type",
      "operator": "eq",
      "value": ["cb45011b-1642-4add-959a-3489c0d78762"] // 制造业Key
    }]
  }
});
// 只传输需要的数据
```

### 实际案例分析：客户行业分布

#### 场景需求
分析客户行业分布情况，包括：
1. 各行业客户数量统计
2. 重点行业客户详情
3. 多维度交叉分析

#### 优化后的工作流程

**步骤1：获取行业分布统计（1次调用）**
```javascript
const industryStats = await getRecordPivotData({
  worksheet_id: "客户工作表ID",
  columns: [{"field": "industry_type", "displayName": "行业"}],
  values: [{"field": "rowid", "aggregation": "COUNT", "displayName": "客户数量"}]
});

// 结果示例：
// 制造业: 3家, 信息技术: 3家, 零售业: 2家, ...
```

**步骤2：按需查询重点行业详情**
```javascript
// 只查询需要深度分析的行业
if (industryStats.制造业 > 0) {
  const manufacturingDetails = await getRecordList({
    worksheet_id: "客户工作表ID",
    filter: {
      "type": "group",
      "logic": "AND",
      "children": [{
        "type": "condition",
        "field": "industry_type",
        "operator": "eq",
        "value": ["制造业Key"]
      }]
    }
  });
  // 分析制造业客户详情
}
```

**步骤3：多维度交叉分析（按需）**
```javascript
// 分析行业×客户等级分布
const industryLevelStats = await getRecordPivotData({
  worksheet_id: "客户工作表ID",
  columns: [{"field": "industry_type", "displayName": "行业"}],
  rows: [{"field": "customer_level", "displayName": "客户等级"}],
  values: [{"field": "rowid", "aggregation": "COUNT", "displayName": "数量"}]
});
```

### 性能对比

| 场景 | 旧方法 | 新方法 | 优化效果 |
|------|--------|--------|----------|
| 统计15个客户行业分布 | 查询15条记录 + 本地统计 | 1次数据透视调用 | 减少数据传输，提高速度 |
| 分析制造业3个客户 | 查询15条记录 + 过滤 | 查询3条记录 | 减少80%数据传输 |
| 分析1万个客户 | 可能超时或内存不足 | 高效分组查询 | 支持大数据量 |

### 数据透视分析模式库

#### 模式1：单维度统计
```javascript
// 行业分布
{
  columns: [{"field": "industry_type"}],
  values: [{"field": "rowid", "aggregation": "COUNT"}]
}

// 客户状态分布
{
  columns: [{"field": "customer_status"}],
  values: [{"field": "rowid", "aggregation": "COUNT"}]
}
```

#### 模式2：双维度交叉分析
```javascript
// 行业×客户等级
{
  columns: [{"field": "industry_type"}],
  rows: [{"field": "customer_level"}],
  values: [{"field": "rowid", "aggregation": "COUNT"}]
}

// 行业×客户状态
{
  columns: [{"field": "industry_type"}],
  rows: [{"field": "customer_status"}],
  values: [{"field": "rowid", "aggregation": "COUNT"}]
}
```

#### 模式3：数值字段聚合分析
```javascript
// 各行业平均交易金额（假设有amount字段）
{
  columns: [{"field": "industry_type"}],
  values: [{"field": "amount", "aggregation": "AVG"}]
}

// 各行业交易总额
{
  columns: [{"field": "industry_type"}],
  values: [{"field": "amount", "aggregation": "SUM"}]
}
```

### 最佳实践总结

#### 1. 分析前先规划
- 明确分析目标：统计分布、详情分析、交叉分析
- 确定需要的数据维度和度量
- 预估数据量，选择合适方法

#### 2. 分层查询策略
- **第一层**：使用数据透视获取统计分布
- **第二层**：按需分组查询详情
- **第三层**：多维度交叉分析

#### 3. 性能优化技巧
- 小数据量统计：优先使用数据透视
- 大数据量详情：使用筛选条件分组查询
- 复杂分析：分步骤进行，避免一次性复杂查询

#### 4. 错误处理
```javascript
try {
  // 先尝试数据透视
  const stats = await getRecordPivotData(config);

  if (stats.totalCount > 1000) {
    // 大数据量，使用分组查询
    return await analyzeLargeDataset(stats);
  } else {
    // 小数据量，可以直接查询详情
    return await analyzeSmallDataset(stats);
  }
} catch (error) {
  // 降级方案：使用分组查询
  return await fallbackAnalysis();
}
```

### 实际应用示例

#### 示例：客户价值分析
```javascript
// 步骤1：统计各行业客户数量和等级分布
const industryAnalysis = await getRecordPivotData({
  columns: [{"field": "industry_type"}],
  rows: [{"field": "customer_level"}],
  values: [{"field": "rowid", "aggregation": "COUNT"}]
});

// 步骤2：识别高价值行业（A级客户多的行业）
const highValueIndustries = industryAnalysis.filter(item =>
  item.customer_level === 'A级' && item.count > 2
);

// 步骤3：深度分析高价值行业
for (const industry of highValueIndustries) {
  const details = await getRecordList({
    filter: {
      "type": "group",
      "logic": "AND",
      "children": [
        {
          "type": "condition",
          "field": "industry_type",
          "operator": "eq",
          "value": [industry.key]
        },
        {
          "type": "condition",
          "field": "customer_level",
          "operator": "eq",
          "value": ["A级Key"]
        }
      ]
    }
  });
  // 分析高价值客户详情
}
```

### 工具函数建议

```javascript
/**
 * 智能数据分析函数
 * @param {string} worksheetId 工作表ID
 * @param {string} dimensionField 维度字段（如industry_type）
 * @param {string} measureField 度量字段（如rowid）
 * @param {string} aggregation 聚合方式（COUNT, SUM, AVG等）
 */
async function smartDataAnalysis(worksheetId, dimensionField, measureField, aggregation) {
  // 1. 先获取统计分布
  const stats = await getRecordPivotData({
    worksheet_id: worksheetId,
    columns: [{"field": dimensionField}],
    values: [{"field": measureField, "aggregation": aggregation}]
  });

  // 2. 根据数据量决定后续分析策略
  const totalCount = stats.summary?.total || stats.pivot.reduce((sum, item) => sum + item.values[measureField], 0);

  if (totalCount <= 50) {
    // 小数据量：直接查询所有详情
    return await getRecordList({
      worksheet_id: worksheetId,
      pageSize: totalCount
    });
  } else {
    // 大数据量：只返回统计结果，详情按需查询
    return {
      statistics: stats,
      suggestGroupedQuery: true,
      groups: stats.pivot.map(item => ({
        dimensionValue: item.columns[dimensionField],
        count: item.values[measureField],
        queryFilter: {
          "type": "condition",
          "field": dimensionField,
          "operator": "eq",
          "value": [getOptionKey(dimensionField, item.columns[dimensionField])]
        }
      }))
    };
  }
}
```

通过遵循这些最佳实践，可以显著提高HAP数据分析的效率和性能，特别是在处理大数据量时表现更加出色。