---
name: hap-claude
description: 使用孚世界 MCP 创建和管理 claude 数据表。当用户提到"创建 claude 数据表"、"claude 表"、"创建表 claude"等需求时**立即触发**。
license: MIT
---

# Claude 数据表管理技能

本技能帮助用户使用孚世界 MCP 创建、管理和操作 `claude` 数据表。

## 🎯 技能触发场景

当用户说以下任何内容时，**立即使用本技能**：
- "创建 claude 数据表"
- "claude 表"
- "创建表 claude"
- "管理 claude 数据"
- "claude 数据表"

## 📋 MCP 配置

**连接信息**:
```
服务器名称: hap-mcp-孚世界
URL: https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==
```

**配置方式**（Claude Code）:
```bash
claude mcp add hap-mcp-孚世界 --url "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
```

---

## 🤖 AI 执行步骤

### Step 1: 验证 MCP 连接

首先验证孚世界 MCP 是否已连接：

```javascript
// 调用 get_app_info 验证连通性
const appInfo = await mcpClient.call('get_app_info');
```

如果 MCP 未连接，先进行配置：
```
❌ 检测到孚世界 MCP 未连接

🔧 正在配置孚世界 MCP...
[执行 claude mcp add 命令]

✅ 配置完成，请重启 Claude Code 使配置生效
```

### Step 2: 检查 claude 表是否存在

调用 MCP 工具检查工作表中是否已有 `claude`：

```javascript
// 获取应用信息，查看工作表列表
const result = await mcpClient.call('get_app_info');

// 检查工作表中是否包含 "claude"
const hasClaudeTable = result.worksheets.some(ws => ws.name === 'claude');
```

### Step 3: 创建或更新 claude 表

#### 3.1 如果表不存在 - 创建

使用 MCP 工具创建新的工作表：

```javascript
// 创建 claude 工作表
const createResult = await mcpClient.call('create_worksheet', {
  name: 'claude',
  description: 'Claude AI 相关数据表'
});
```

创建后添加基础字段：
```javascript
// 添加字段
await mcpClient.call('add_field', {
  worksheetId: createResult.worksheetId,
  fields: [
    {
      name: 'title',
      type: 'text',
      title: '标题'
    },
    {
      name: 'content',
      type: 'text',
      title: '内容',
      controlType: 'textarea'
    },
    {
      name: 'category',
      type: 'text',
      title: '分类'
    },
    {
      name: 'status',
      type: 'text',
      title: '状态'
    },
    {
      name: 'created_time',
      type: 'date',
      title: '创建时间'
    }
  ]
});
```

#### 3.2 如果表已存在 - 确认结构

检查现有字段，确认表结构是否满足需求：

```javascript
// 获取工作表详情
const worksheetDetail = await mcpClient.call('get_worksheet', {
  worksheetId: claudeTableId
});

console.log('现有字段:', worksheetDetail.fields);
```

### Step 4: 数据操作

#### 查询数据

```javascript
// 查询 claude 表中的所有记录
const queryResult = await mcpClient.call('query_records', {
  worksheetId: claudeTableId,
  filters: {} // 无过滤条件，查询所有
});
```

#### 添加记录

```javascript
// 添加新记录
const addResult = await mcpClient.call('add_record', {
  worksheetId: claudeTableId,
  record: {
    title: '示例标题',
    content: '示例内容',
    category: '默认',
    status: '进行中'
  }
});
```

#### 更新记录

```javascript
// 更新记录
const updateResult = await mcpClient.call('update_record', {
  worksheetId: claudeTableId,
  recordId: recordId,
  record: {
    status: '已完成'
  }
});
```

#### 删除记录

```javascript
// 删除记录
const deleteResult = await mcpClient.call('delete_record', {
  worksheetId: claudeTableId,
  recordId: recordId
});
```

---

## 📝 用户指令映射

| 用户指令 | AI 执行动作 |
|---------|-----------|
| "创建 claude 数据表" | 创建新工作表，添加基础字段 |
| "查看 claude 表数据" | 查询所有记录 |
| "添加一条 claude 数据" | 添加新记录 |
| "更新 claude 数据" | 更新指定记录 |
| "删除 claude 数据" | 删除指定记录 |
| "claude 表有多少条数据" | 统计记录数量 |

---

## ✅ 执行结果报告

### 成功创建表

```
✅ Claude 数据表创建成功！

📋 表信息：
- 表名：claude
- 应用：孚世界
- 工作表 ID：ws_xxxxxxxxx

📊 字段列表：
1. title (标题) - 文本
2. content (内容) - 多行文本
3. category (分类) - 文本
4. status (状态) - 文本
5. created_time (创建时间) - 日期

💡 现在可以开始添加数据了！
```

### 成功添加记录

```
✅ 记录添加成功！

📋 记录信息：
- 记录 ID：rec_xxxxxxxxx
- 标题：用户提供的标题
- 状态：已创建

📊 当前表中共有 N 条记录
```

### 数据查询结果

```
📊 Claude 数据表查询结果

共找到 N 条记录：

1. [状态] 标题
   - ID: rec_xxxxxxxxx
   - 分类: xxx
   - 创建时间: 2026-01-31

2. ...
```

---

## ⚠️ 注意事项

- 执行前先验证 MCP 连接状态
- 表已存在时，不要重复创建，而是确认或更新结构
- 涉及数据修改的操作，建议先确认
- 提供清晰的执行结果反馈
```
