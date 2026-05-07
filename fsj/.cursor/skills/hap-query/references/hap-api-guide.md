# HAP API 查询指南

## API 基础信息

### 认证方式
- **HAP-Appkey**: 应用密钥
- **HAP-Sign**: 签名认证
- **Content-Type**: application/json

### 基础 URL
- 生产环境: `https://api.mingdao.com`
- 测试环境: `https://api2.mingdao.com`

## 核心查询 API

### 1. 应用信息查询

#### 获取应用信息
```
GET /v3/app
```
返回应用下的分组、工作表、自定义页面信息。

#### 获取工作表列表
```
POST /v3/app/worksheets/list
```
参数：
- `responseFormat`: json/md（返回格式）
- `worksheets`: 指定返回的工作表ID数组

#### 获取选项集列表
```
GET /v3/app/optionsets
```

#### 获取角色列表
```
GET /v3/app/roles
```

### 2. 工作表结构查询

#### 获取工作表结构
```
GET /v3/app/worksheets/{worksheet_id}
```
参数：
- `responseFormat`: json/md（返回格式）

返回字段信息包括：
- `id`: 字段ID
- `name`: 字段名称
- `alias`: 字段别名
- `type`: 字段类型
- `required`: 是否必填
- `isTitle`: 是否是标题字段
- `options`: 选项字段的选项列表

### 3. 记录数据查询

#### 查询记录列表
```
POST /v3/app/worksheets/{worksheet_id}/rows/list
```

**请求参数：**
```json
{
  "pageSize": 100,
  "pageIndex": 1,
  "viewId": "视图ID（可选）",
  "fields": ["字段ID1", "字段ID2"],
  "filter": {},
  "sorts": [{"field": "字段ID", "isAsc": true}],
  "search": "搜索关键词",
  "tableView": false,
  "useFieldIdAsKey": false,
  "includeTotalCount": false,
  "includeSystemFields": false,
  "responseFormat": "json"
}
```

#### 获取记录详情
```
GET /v3/app/worksheets/{worksheet_id}/rows/{row_id}
```
参数：
- `includeSystemFields`: 是否包含系统字段

#### 获取关联记录
```
GET /v3/app/worksheets/{worksheet_id}/rows/{row_id}/relations/{field}
```
参数：
- `pageSize`: 每页数量
- `pageIndex`: 页码
- `isReturnSystemFields`: 是否返回系统字段

#### 获取记录讨论
```
GET /v3/app/worksheets/{worksheet_id}/rows/{row_id}/discussions
```
参数：
- `pageIndex`: 页码
- `pageSize`: 每页数量
- `search`: 搜索关键词
- `onlyWithAttachments`: 是否只返回包含附件的讨论

#### 获取记录日志
```
GET /v3/app/worksheets/{worksheet_id}/rows/{row_id}/logs
```
参数：
- `operatorIds`: 操作者ID数组
- `field`: 字段ID
- `pageSize`: 每页数量
- `pageIndex`: 页码
- `startDate`: 开始时间
- `endDate`: 结束时间

### 4. 数据分析查询

#### 数据透视分析
```
POST /v3/app/worksheets/{worksheet_id}/rows/pivot
```

**请求参数：**
```json
{
  "pageSize": 1000,
  "pageIndex": 1,
  "viewId": "视图ID",
  "columns": [
    {
      "field": "字段ID",
      "displayName": "显示名称",
      "granularity": 1,
      "includeEmpty": false
    }
  ],
  "rows": [
    {
      "field": "字段ID",
      "displayName": "显示名称",
      "granularity": 1,
      "includeEmpty": false
    }
  ],
  "values": [
    {
      "field": "record_count",
      "displayName": "记录数",
      "aggregation": "COUNT",
      "includeEmpty": false
    },
    {
      "field": "数值字段ID",
      "displayName": "汇总值",
      "aggregation": "SUM",
      "includeEmpty": false
    }
  ],
  "filter": {},
  "sorts": [{"field": "字段ID", "isAsc": true}],
  "includeSummary": true
}
```

## 筛选条件语法

### 基本筛选结构
```json
{
  "conjunction": "and",
  "conditions": [
    {
      "field": "字段ID",
      "operator": "操作符",
      "value": "值"
    }
  ]
}
```

### 支持的操作符

#### 文本字段
- `eq`: 等于
- `neq`: 不等于
- `contains`: 包含
- `not_contains`: 不包含
- `startswith`: 以...开始
- `endswith`: 以...结束
- `is_empty`: 为空
- `is_not_empty`: 不为空

#### 数字字段
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

#### 日期字段
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

#### 选项字段
- `eq`: 等于
- `neq`: 不等于
- `in`: 在列表中
- `not_in`: 不在列表中
- `is_empty`: 为空
- `is_not_empty`: 不为空

### 复杂筛选示例

#### 多条件 AND
```json
{
  "conjunction": "and",
  "conditions": [
    {
      "field": "状态",
      "operator": "eq",
      "value": "进行中"
    },
    {
      "field": "优先级",
      "operator": "in",
      "value": ["高", "中"]
    },
    {
      "field": "创建时间",
      "operator": "gte",
      "value": "2024-01-01 00:00:00"
    }
  ]
}
```

#### 多条件 OR
```json
{
  "conjunction": "or",
  "conditions": [
    {
      "field": "负责人",
      "operator": "eq",
      "value": "张三"
    },
    {
      "field": "负责人",
      "operator": "eq",
      "value": "李四"
    }
  ]
}
```

#### 嵌套条件
```json
{
  "conjunction": "and",
  "conditions": [
    {
      "field": "部门",
      "operator": "eq",
      "value": "技术部"
    },
    {
      "conjunction": "or",
      "conditions": [
        {
          "field": "状态",
          "operator": "eq",
          "value": "已完成"
        },
        {
          "field": "状态",
          "operator": "eq",
          "value": "进行中"
        }
      ]
    }
  ]
}
```

## 排序语法

### 单字段排序
```json
[
  {
    "field": "创建时间",
    "isAsc": false
  }
]
```

### 多字段排序
```json
[
  {
    "field": "优先级",
    "isAsc": true
  },
  {
    "field": "创建时间",
    "isAsc": false
  }
]
```

## 聚合函数

### 支持的聚合类型
- `COUNT`: 计数
- `DISTINCTCOUNT`: 去重计数
- `SUM`: 求和
- `MIN`: 最小值
- `MAX`: 最大值
- `AVG`: 平均值

### 聚合字段配置
- `field`: 字段ID（COUNT时使用"record_count"）
- `aggregation`: 聚合类型
- `displayName`: 显示名称
- `includeEmpty`: 是否包含空值

## 分页参数

### 标准分页
- `pageSize`: 每页记录数（最大1000）
- `pageIndex`: 页码（从1开始）

### 包含总数
- `includeTotalCount`: true 时返回总记录数

## 响应格式

### JSON 格式
默认返回 JSON 格式，包含完整的字段信息。

### Markdown 格式
设置 `responseFormat: "md"` 返回 Markdown 表格格式，节省 token。

## 性能优化建议

### 查询优化
1. 使用合适的 `pageSize`，避免过大
2. 只查询需要的字段
3. 使用有效的筛选条件
4. 对常用查询字段建立索引

### 数据透视优化
1. 合理设置维度和度量
2. 使用筛选条件减少数据量
3. 考虑数据缓存策略

## 错误码参考

### 常见错误码
- `400`: 请求参数错误
- `401`: 认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `429`: 请求频率限制
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "error": "错误类型",
  "error_msg": "详细错误信息",
  "statusCode": 400
}
```