# HAP 查询示例集合

## 基础查询示例

### 示例 1：获取应用信息
**目的**：了解应用结构和可用工作表

```javascript
// 使用 getAppInfo 工具
const appInfo = await getAppInfo({
  ai_description: "获取当前应用的基本信息"
});

// 返回示例
{
  "id": "app_123",
  "name": "项目管理系统",
  "sections": [
    {
      "id": "section_1",
      "name": "项目管理",
      "worksheets": [
        {
          "id": "worksheet_1",
          "name": "项目列表",
          "alias": "projects"
        },
        {
          "id": "worksheet_2",
          "name": "任务列表",
          "alias": "tasks"
        }
      ]
    }
  ]
}
```

### 示例 2：获取工作表列表
**目的**：查看所有可用的工作表

```javascript
// 使用 getWorksheetsList 工具
const worksheets = await getWorksheetsList({
  responseFormat: "json",
  ai_description: "获取应用下的所有工作表列表"
});

// 返回字段包括：id, name, alias, sectionId 等
```

### 示例 3：获取工作表结构
**目的**：了解特定工作表的字段结构

```javascript
// 使用 getWorksheetStructure 工具
const structure = await getWorksheetStructure({
  worksheet_id: "worksheet_1",
  responseFormat: "json",
  ai_description: "获取项目列表工作表的字段结构"
});

// 返回示例
{
  "id": "worksheet_1",
  "name": "项目列表",
  "alias": "projects",
  "fields": [
    {
      "id": "field_1",
      "name": "项目名称",
      "alias": "project_name",
      "type": "Text",
      "isTitle": true,
      "required": true
    },
    {
      "id": "field_2",
      "name": "项目状态",
      "alias": "status",
      "type": "SingleSelect",
      "options": [
        {"value": "规划中", "index": 1},
        {"value": "进行中", "index": 2},
        {"value": "已完成", "index": 3}
      ]
    }
  ]
}
```

## 记录查询示例

### 示例 4：简单列表查询
**目的**：获取工作表中的记录列表

```javascript
// 使用 getRecordList 工具
const records = await getRecordList({
  worksheet_id: "worksheet_1",
  pageSize: 50,
  pageIndex: 1,
  fields: ["project_name", "status", "create_time"],
  sorts: [{"field": "create_time", "isAsc": false}],
  ai_description: "查询项目列表，按创建时间倒序排列"
});
```

### 示例 5：条件筛选查询
**目的**：根据条件筛选记录

```javascript
// 查询状态为"进行中"的项目
const records = await getRecordList({
  worksheet_id: "worksheet_1",
  pageSize: 100,
  pageIndex: 1,
  filter: {
    "conjunction": "and",
    "conditions": [
      {
        "field": "status",
        "operator": "eq",
        "value": "进行中"
      }
    ]
  },
  ai_description: "查询所有状态为'进行中'的项目"
});
```

### 示例 6：多条件复合查询
**目的**：使用多个条件进行复杂筛选

```javascript
// 查询状态为"进行中"且优先级为"高"的项目
const records = await getRecordList({
  worksheet_id: "worksheet_1",
  pageSize: 100,
  pageIndex: 1,
  filter: {
    "conjunction": "and",
    "conditions": [
      {
        "field": "status",
        "operator": "eq",
        "value": "进行中"
      },
      {
        "field": "priority",
        "operator": "eq",
        "value": "高"
      },
      {
        "field": "create_time",
        "operator": "gte",
        "value": "2024-01-01 00:00:00"
      }
    ]
  },
  ai_description: "查询2024年1月1日之后创建的、状态为进行中且优先级为高的项目"
});
```

### 示例 7：OR 条件查询
**目的**：满足任一条件的记录

```javascript
// 查询状态为"进行中"或"规划中"的项目
const records = await getRecordList({
  worksheet_id: "worksheet_1",
  pageSize: 100,
  pageIndex: 1,
  filter: {
    "conjunction": "or",
    "conditions": [
      {
        "field": "status",
        "operator": "eq",
        "value": "进行中"
      },
      {
        "field": "status",
        "operator": "eq",
        "value": "规划中"
      }
    ]
  },
  ai_description: "查询状态为进行中或规划中的项目"
});
```

### 示例 8：模糊搜索查询
**目的**：根据关键词搜索记录

```javascript
// 搜索包含"重要"关键词的项目
const records = await getRecordList({
  worksheet_id: "worksheet_1",
  pageSize: 50,
  pageIndex: 1,
  search: "重要",
  ai_description: "搜索项目名称或描述中包含'重要'关键词的项目"
});
```

### 示例 9：获取记录详情
**目的**：获取单条记录的详细信息

```javascript
// 使用 getRecordDetails 工具
const recordDetail = await getRecordDetails({
  worksheet_id: "worksheet_1",
  row_id: "row_123",
  includeSystemFields: true,
  ai_description: "获取ID为row_123的项目详细信息，包括系统字段"
});
```

## 数据分析示例

### 示例 10：简单数据透视
**目的**：按部门统计项目数量

```javascript
// 使用 getRecordPivotData 工具
const pivotData = await getRecordPivotData({
  worksheet_id: "worksheet_1",
  columns: [
    {
      "field": "department",
      "displayName": "部门"
    }
  ],
  values: [
    {
      "field": "record_count",
      "aggregation": "COUNT",
      "displayName": "项目数量"
    }
  ],
  ai_description: "按部门统计项目数量"
});
```

### 示例 11：多维度数据透视
**目的**：按部门和状态统计项目

```javascript
const pivotData = await getRecordPivotData({
  worksheet_id: "worksheet_1",
  columns: [
    {
      "field": "department",
      "displayName": "部门"
    }
  ],
  rows: [
    {
      "field": "status",
      "displayName": "状态"
    }
  ],
  values: [
    {
      "field": "record_count",
      "aggregation": "COUNT",
      "displayName": "项目数量"
    },
    {
      "field": "budget",
      "aggregation": "SUM",
      "displayName": "总预算"
    }
  ],
  ai_description: "按部门和状态统计项目数量和预算总额"
});
```

### 示例 12：带筛选的数据透视
**目的**：筛选特定时间范围的数据进行分析

```javascript
const pivotData = await getRecordPivotData({
  worksheet_id: "worksheet_1",
  columns: [
    {
      "field": "department",
      "displayName": "部门"
    }
  ],
  values: [
    {
      "field": "record_count",
      "aggregation": "COUNT",
      "displayName": "项目数量"
    }
  ],
  filter: {
    "conjunction": "and",
    "conditions": [
      {
        "field": "create_time",
        "operator": "gte",
        "value": "2024-01-01 00:00:00"
      },
      {
        "field": "create_time",
        "operator": "lte",
        "value": "2024-12-31 23:59:59"
      }
    ]
  },
  ai_description: "统计2024年各部门的项目数量"
});
```

## 关联查询示例

### 示例 13：查询关联记录
**目的**：获取某条记录的关联记录

```javascript
// 使用 getRecordRelations 工具
const relations = await getRecordRelations({
  worksheet_id: "worksheet_1",
  row_id: "row_123",
  field: "related_tasks",
  pageSize: 20,
  pageIndex: 1,
  ai_description: "获取项目row_123关联的所有任务"
});
```

### 示例 14：获取记录讨论
**目的**：查看记录的讨论内容

```javascript
// 使用 getRecordDiscussions 工具
const discussions = await getRecordDiscussions({
  worksheet_id: "worksheet_1",
  row_id: "row_123",
  pageSize: 10,
  pageIndex: 1,
  ai_description: "获取项目row_123的讨论记录"
});
```

### 示例 15：获取记录日志
**目的**：查看记录的操作日志

```javascript
// 使用 getRecordLogs 工具
const logs = await getRecordLogs({
  worksheet_id: "worksheet_1",
  row_id: "row_123",
  startDate: "2024-01-01 00:00:00",
  endDate: "2024-12-31 23:59:59",
  ai_description: "获取项目row_123在2024年的操作日志"
});
```

## 实用查询模式

### 模式 1：分页遍历所有记录
```javascript
async function getAllRecords(worksheet_id, pageSize = 100) {
  let allRecords = [];
  let pageIndex = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getRecordList({
      worksheet_id,
      pageSize,
      pageIndex,
      includeTotalCount: true,
      ai_description: `获取第${pageIndex}页记录`
    });

    if (result.data && result.data.rows) {
      allRecords = allRecords.concat(result.data.rows);

      // 检查是否还有更多记录
      const totalCount = result.data.totalCount || 0;
      const fetchedCount = pageIndex * pageSize;
      hasMore = fetchedCount < totalCount;
    } else {
      hasMore = false;
    }

    pageIndex++;
  }

  return allRecords;
}
```

### 模式 2：批量查询记录详情
```javascript
async function getBatchRecordDetails(worksheet_id, row_ids) {
  const details = [];

  for (const row_id of row_ids) {
    const detail = await getRecordDetails({
      worksheet_id,
      row_id,
      ai_description: `获取记录${row_id}的详情`
    });

    if (detail.data) {
      details.push(detail.data);
    }
  }

  return details;
}
```

### 模式 3：条件统计
```javascript
async function countByCondition(worksheet_id, condition) {
  const result = await getRecordList({
    worksheet_id,
    pageSize: 1,
    pageIndex: 1,
    filter: condition,
    includeTotalCount: true,
    ai_description: "统计满足条件的记录数量"
  });

  return result.data?.totalCount || 0;
}
```

## 错误处理示例

### 示例 16：处理查询错误
```javascript
async function safeQuery(params) {
  try {
    const result = await getRecordList(params);

    if (result.error) {
      console.error("查询错误:", result.error);
      // 处理特定错误类型
      if (result.statusCode === 401) {
        throw new Error("认证失败，请检查HAP-Appkey和HAP-Sign");
      } else if (result.statusCode === 404) {
        throw new Error("工作表不存在");
      }
    }

    return result.data;
  } catch (error) {
    console.error("查询异常:", error.message);
    throw error;
  }
}
```

### 示例 17：验证查询参数
```javascript
function validateQueryParams(params) {
  const errors = [];

  if (!params.worksheet_id) {
    errors.push("worksheet_id 不能为空");
  }

  if (!params.pageSize || params.pageSize > 1000) {
    errors.push("pageSize 必须在1-1000之间");
  }

  if (!params.pageIndex || params.pageIndex < 1) {
    errors.push("pageIndex 必须大于0");
  }

  return errors;
}
```

## 性能优化示例

### 示例 18：使用字段别名提高性能
```javascript
// 使用字段别名而非ID
const efficientQuery = {
  worksheet_id: "projects",
  pageSize: 50,
  pageIndex: 1,
  fields: ["project_name", "status", "create_time"], // 使用别名
  useFieldIdAsKey: false, // 使用别名作为键
  ai_description: "高效查询：使用字段别名"
};
```

### 示例 19：合理设置分页大小
```javascript
// 根据数据量动态设置分页大小
function getOptimalPageSize(totalEstimate) {
  if (totalEstimate <= 100) return 100;
  if (totalEstimate <= 500) return 50;
  if (totalEstimate <= 1000) return 20;
  return 10; // 大数据量使用小分页
}
```

## 实际应用场景

### 场景 1：项目报表生成
```javascript
// 生成月度项目报表
async function generateMonthlyReport(year, month) {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01 00:00:00`;
  const endDate = `${year}-${month.toString().padStart(2, '0')}-31 23:59:59`;

  // 1. 获取项目列表
  const projects = await getRecordList({
    worksheet_id: "projects",
    pageSize: 1000,
    pageIndex: 1,
    filter: {
      "conjunction": "and",
      "conditions": [
        {
          "field": "create_time",
          "operator": "gte",
          "value": startDate
        },
        {
          "field": "create_time",
          "operator": "lte",
          "value": endDate
        }
      ]
    },
    ai_description: `获取${year}年${month}月创建的项目`
  });

  // 2. 按状态统计
  const statusStats = await getRecordPivotData({
    worksheet_id: "projects",
    columns: [{"field": "status", "displayName": "状态"}],
    values: [{"field": "record_count", "aggregation": "COUNT", "displayName": "数量"}],
    filter: {
      "conjunction": "and",
      "conditions": [
        {
          "field": "create_time",
          "operator": "gte",
          "value": startDate
        },
        {
          "field": "create_time",
          "operator": "lte",
          "value": endDate
        }
      ]
    },
    ai_description: `统计${year}年${month}月项目状态分布`
  });

  return {
    projects: projects.data?.rows || [],
    statistics: statusStats.data || {}
  };
}
```

### 场景 2：任务跟踪看板
```javascript
// 生成任务看板数据
async function getTaskBoardData() {
  const boardData = {};

  // 获取不同状态的任务
  const statuses = ["待处理", "进行中", "已完成", "已延期"];

  for (const status of statuses) {
    const tasks = await getRecordList({
      worksheet_id: "tasks",
      pageSize: 50,
      pageIndex: 1,
      filter: {
        "conjunction": "and",
        "conditions": [
          {
            "field": "status",
            "operator": "eq",
            "value": status
          }
        ]
      },
      sorts: [{"field": "priority", "isAsc": false}],
      ai_description: `获取状态为${status}的任务`
    });

    boardData[status] = tasks.data?.rows || [];
  }

  return boardData;
}
```