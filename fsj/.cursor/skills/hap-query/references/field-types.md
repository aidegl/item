# HAP 字段类型处理指南

## 字段类型概览

### 基础字段类型
1. **Text**: 文本字段
2. **Number**: 数字字段
3. **SingleSelect**: 单选字段
4. **MultipleSelect**: 多选字段
5. **Date**: 日期字段
6. **DateTime**: 日期时间字段
7. **Collaborator**: 成员字段
8. **Relation**: 关联字段
9. **Attachment**: 附件字段
10. **Rating**: 评分字段
11. **Time**: 时间字段

## 字段类型详细说明

### 1. Text 文本字段
**特性**：
- 支持任意文本内容
- 可设置最大长度限制
- 支持模糊搜索和精确匹配

**查询操作符**：
- `eq`: 精确匹配
- `neq`: 不等于
- `contains`: 包含
- `not_contains`: 不包含
- `startswith`: 以...开始
- `endswith`: 以...结束
- `is_empty`: 为空
- `is_not_empty`: 不为空

**示例值**：
```json
"这是一个文本字段值"
```

### 2. Number 数字字段
**特性**：
- 支持整数和小数
- 可设置精度（0-14位小数）
- 支持数值比较

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

**示例值**：
```json
123.45
```

### 3. SingleSelect 单选字段
**特性**：
- 从预定义选项中选择一个
- 选项可设置颜色和分值
- 支持选项集复用

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `in`: 在列表中
- `not_in`: 不在列表中
- `is_empty`: 为空
- `is_not_empty`: 不为空

**重要注意事项**：
- 筛选时需要使用选项的 **Key** 而不是选项名称
- 选项 Key 可以通过 `getWorksheetStructure` 获取
- 每个选项包含 `Key`（唯一标识）和 `Value`（显示名称）
- 查询时在 `value` 数组中传递选项 Key

**示例值**：
```json
"选项Key值"
```

**筛选示例**：
```javascript
{
  "field": "company_size",
  "operator": "eq",
  "value": ["e643dce9-530d-41ca-beff-ad2d50f218b8"]  // 选项Key，不是"1000人以上"
}
```

### 4. MultipleSelect 多选字段
**特性**：
- 从预定义选项中选择多个
- 选项可设置颜色和分值
- 支持选项集复用

**查询操作符**：
- `contains`: 包含（任意一个）
- `not_contains`: 不包含
- `is_empty`: 为空
- `is_not_empty`: 不为空

**重要注意事项**：
- 筛选时需要使用选项的 **Key** 而不是选项名称
- 选项 Key 可以通过 `getWorksheetStructure` 获取
- 每个选项包含 `Key`（唯一标识）和 `Value`（显示名称）
- 查询时在 `value` 数组中传递选项 Key

**示例值**：
```json
["选项Key1", "选项Key2"]
```

**筛选示例**：
```javascript
{
  "field": "tags",
  "operator": "contains",
  "value": ["key1", "key2"]  // 选项Key数组
}
```

### 5. Date 日期字段
**特性**：
- 支持日期选择
- 可设置显示格式（年、年月、年月日）
- 支持日期范围查询

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

**格式**：
- `yyyy-MM-dd`

**示例值**：
```json
"2024-01-15"
```

### 6. DateTime 日期时间字段
**特性**：
- 支持日期时间选择
- 可设置显示格式（年月日时分秒等）
- 支持时间范围查询

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

**格式**：
- `yyyy-MM-dd HH:mm:ss`

**示例值**：
```json
"2024-01-15 14:30:00"
```

### 7. Collaborator 成员字段
**特性**：
- 选择组织成员
- 支持单选和多选模式
- 返回用户ID和姓名

**查询操作符**：
- `eq`: 等于（用户ID）
- `neq`: 不等于
- `in`: 在用户ID列表中
- `not_in`: 不在用户ID列表中
- `is_empty`: 为空
- `is_not_empty`: 不为空

**示例值**：
```json
{
  "id": "user_123",
  "name": "张三"
}
```

### 8. Relation 关联字段
**特性**：
- 关联其他工作表的记录
- 支持单向和双向关联
- 可设置展示字段

**查询操作符**：
- 使用关联记录ID进行查询
- 支持关联记录的详细查询

**示例值**：
```json
{
  "id": "row_456",
  "title": "关联记录标题"
}
```

### 9. Attachment 附件字段
**特性**：
- 上传和管理文件
- 支持多种文件类型
- 可设置上传模式（覆盖/新增）

**查询操作符**：
- `is_empty`: 为空
- `is_not_empty`: 不为空

**示例值**：
```json
[
  {
    "name": "文件名称.pdf",
    "url": "文件URL",
    "size": 1024
  }
]
```

### 10. Rating 评分字段
**特性**：
- 评分控件
- 可设置最大分值（0-10）
- 返回数值评分

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

**示例值**：
```json
5
```

### 11. Time 时间字段
**特性**：
- 时间选择控件
- 可设置显示格式（时分、时分秒）
- 支持时间比较

**查询操作符**：
- `eq`: 等于
- `neq`: 不等于
- `gt`: 大于
- `gte`: 大于等于
- `lt`: 小于
- `lte`: 小于等于
- `is_empty`: 为空
- `is_not_empty`: 不为空

**格式**：
- `HH:mm` 或 `HH:mm:ss`

**示例值**：
```json
"14:30:00"
```

## 字段属性说明

### 通用属性
- `id`: 字段ID（唯一标识）
- `name`: 字段名称
- `alias`: 字段别名（用于查询）
- `type`: 字段类型
- `required`: 是否必填
- `isTitle`: 是否是标题字段
- `isHidden`: 是否隐藏
- `isReadOnly`: 是否只读
- `isHiddenOnCreate`: 新增时是否隐藏
- `isUnique`: 是否唯一

### 类型特定属性

#### Number 字段
- `precision`: 小数位数（0-14）

#### SingleSelect/MultipleSelect 字段
- `options`: 选项列表
  - `value`: 选项值
  - `index`: 排序索引
  - `color`: 颜色值（可选）
  - `score`: 分值（可选）

#### Collaborator 字段
- `subType`: 选择模式
  - `0`: 单选
  - `1`: 多选

#### Relation 字段
- `subType`: 关联数量
  - `1`: 单条关联
  - `2`: 多条关联
- `dataSource`: 关联表ID
- `relation`: 关联配置
  - `showFields`: 展示字段
  - `bidirectional`: 是否双向

#### Rating 字段
- `max`: 最大分值（0-10）

#### Date/DateTime 字段
- `subType`: 显示格式
  - `5`: 年
  - `4`: 年月
  - `3`: 年月日
  - `2`: 年月日时
  - `1`: 年月日时分
  - `6`: 年月日时分秒

#### Time 字段
- `subType`: 显示格式
  - `1`: 时分
  - `6`: 时分秒

## 查询注意事项

### 1. 字段标识使用
- 查询时使用 `alias`（别名）而非 `id`
- 确保别名在应用中唯一

### 2. 值类型匹配
- 文本字段：字符串
- 数字字段：数值
- 日期字段：格式化的字符串
- 选项字段：选项值字符串
- 成员字段：用户ID或对象

### 3. 空值处理
- 使用 `is_empty` 检查空值
- 使用 `is_not_empty` 检查非空值
- 注意不同字段类型的空值表示

### 4. 多值字段
- MultipleSelect：数组格式
- Collaborator（多选）：数组格式
- Relation（多条）：数组格式

### 5. 关联字段查询
- 使用关联记录ID进行查询
- 可通过 `getRecordRelations` 获取详细信息
- 注意关联方向（单向/双向）

## 最佳实践

### 1. 查询前了解字段结构
```javascript
// 先获取工作表结构
const structure = await getWorksheetStructure(worksheet_id);
// 分析字段类型和属性
```

### 2. 使用正确的值格式
```javascript
// 正确
{
  "field": "数字字段",
  "operator": "gt",
  "value": 100  // 数值类型
}

// 错误
{
  "field": "数字字段",
  "operator": "gt",
  "value": "100"  // 字符串类型
}
```

### 3. 处理特殊字符
- 文本字段中的特殊字符需要转义
- 选项值中的逗号需要特别注意
- 日期格式必须严格遵循

### 4. 性能考虑
- 避免对文本字段使用 `contains` 操作符（性能较差）
- 对经常查询的字段建立索引
- 使用合适的筛选条件减少结果集

### 5. 错误处理
- 检查字段是否存在
- 验证值类型是否匹配
- 处理空值和默认值