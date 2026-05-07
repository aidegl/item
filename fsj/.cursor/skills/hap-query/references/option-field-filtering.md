# 选项字段筛选经验总结

## 问题背景

在查询 HAP 数据时，对单选（SingleSelect）和多选（MultipleSelect）字段进行筛选时，常见的错误是直接使用选项的显示名称（Value）作为筛选条件，这会导致查询返回空结果。

## 根本原因

HAP 系统中的选项字段存储和筛选机制：
1. 每个选项包含两个关键属性：
   - `Key`: 唯一标识符（UUID格式）
   - `Value`: 显示名称
2. 数据存储时使用的是 `Key` 值
3. 筛选条件中必须使用 `Key` 而不是 `Value`

## 错误示例

```javascript
// 错误：使用选项名称
{
  "field": "company_size",
  "operator": "eq",
  "value": ["1000人以上"]  // 错误！应该使用 Key
}
```

## 正确方法

### 步骤 1：获取工作表结构
首先使用 `getWorksheetStructure` 获取字段的选项信息：

```javascript
const structure = await getWorksheetStructure(worksheet_id);
// 查看 company_size 字段的 options
const options = structure.fields.find(f => f.alias === 'company_size').options;
// options 示例：
// [
//   {"Key": "e643dce9-530d-41ca-beff-ad2d50f218b8", "Value": "1000人以上"},
//   {"Key": "74e86925-39c3-4812-afff-26d84099abfd", "Value": "501-1000人"},
//   ...
// ]
```

### 步骤 2：使用 Key 进行筛选
```javascript
// 正确：使用选项 Key
{
  "field": "company_size",
  "operator": "eq",
  "value": ["e643dce9-530d-41ca-beff-ad2d50f218b8"]  // 正确！
}
```

## 完整工作流程

### 查询规模在1000人以上的客户

1. **获取工作表列表**
```javascript
const worksheets = await getWorksheetsList();
// 找到"客户"工作表
const customerWorksheet = worksheets.find(w => w.name === '客户');
```

2. **获取工作表结构**
```javascript
const structure = await getWorksheetStructure(customerWorksheet.id);
// 查找 company_size 字段
const sizeField = structure.fields.find(f => f.alias === 'company_size');
// 获取"1000人以上"选项的 Key
const largeCompanyKey = sizeField.options.find(o => o.Value === '1000人以上').Key;
```

3. **构建筛选条件**
```javascript
const filter = {
  "type": "group",
  "logic": "AND",
  "children": [
    {
      "type": "condition",
      "field": "company_size",
      "operator": "eq",
      "value": [largeCompanyKey]  // 使用 Key
    }
  ]
};
```

4. **执行查询**
```javascript
const result = await getRecordList({
  worksheet_id: customerWorksheet.id,
  pageSize: 100,
  pageIndex: 1,
  filter: filter,
  responseFormat: 'md'
});
```

## 常见错误场景

### 场景 1：直接使用选项名称
```javascript
// 错误
value: ["1000人以上"]
// 正确
value: ["e643dce9-530d-41ca-beff-ad2d50f218b8"]
```

### 场景 2：多选字段筛选
```javascript
// 查询包含"制造业"或"金融业"的客户
const industryField = structure.fields.find(f => f.alias === 'industry_type');
const manufacturingKey = industryField.options.find(o => o.Value === '制造业').Key;
const financeKey = industryField.options.find(o => o.Value === '金融业').Key;

// 正确筛选条件
const filter = {
  "type": "group",
  "logic": "OR",
  "children": [
    {
      "type": "condition",
      "field": "industry_type",
      "operator": "contains",
      "value": [manufacturingKey]
    },
    {
      "type": "condition",
      "field": "industry_type",
      "operator": "contains",
      "value": [financeKey]
    }
  ]
};
```

## 调试技巧

1. **先查询所有数据**：查看实际存储的 Key 值
2. **对比结构信息**：确认从 `getWorksheetStructure` 获取的 Key 与实际数据匹配
3. **使用简单条件测试**：先用一个已知存在的选项进行测试
4. **检查响应格式**：确保使用正确的 responseFormat

## 经验总结

1. **永远记住**：筛选选项字段时使用 `Key`，不是 `Value`
2. **查询前必做**：通过 `getWorksheetStructure` 获取选项映射关系
3. **数据验证**：实际数据中存储的是 Key 数组，如 `["e643dce9-530d-41ca-beff-ad2d50f218b8"]`
4. **错误排查**：如果筛选返回空结果，首先检查是否使用了正确的 Key

## 相关工具函数建议

可以创建辅助函数来简化这个过程：

```javascript
// 获取选项映射表
async function getOptionMapping(worksheetId, fieldAlias) {
  const structure = await getWorksheetStructure(worksheetId);
  const field = structure.fields.find(f => f.alias === fieldAlias);
  if (!field || !field.options) return null;

  // 创建 Value -> Key 映射
  const mapping = {};
  field.options.forEach(option => {
    mapping[option.Value] = option.Key;
  });

  // 创建 Key -> Value 映射（用于显示）
  const reverseMapping = {};
  field.options.forEach(option => {
    reverseMapping[option.Key] = option.Value;
  });

  return { mapping, reverseMapping };
}

// 使用示例
const sizeMapping = await getOptionMapping(worksheetId, 'company_size');
const largeCompanyKey = sizeMapping.mapping['1000人以上'];
```

通过遵循这些原则，可以避免选项字段筛选的常见错误，提高查询的准确性和效率。