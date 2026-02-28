# MingDaoYun Chat Skill

> 将 OpenClaw 对话自动记录到明道云对话系统

## 📦 安装

已预装在：`/home/admin/openclaw/workspace/skills/mingdao-chat/`

## 🚀 快速开始

### 方法 1: 直接调用函数

```javascript
const chat = require('/home/admin/openclaw/workspace/skills/mingdao-chat/index.js');

// 记录单条消息
await chat.recordMessage({
  sender: 'xiaozong',
  receiver: 'master',
  content: '主人，任务完成了！'
});
```

### 方法 2: 使用自动记录器

```javascript
const recorder = require('/home/admin/openclaw/workspace/skills/mingdao-chat/auto-record.js');

// 自动管理对话 ID
await recorder.record('xiaozong', 'master', '你好！');
await recorder.record('master', 'xiaozong', '你好！');  // 自动使用同一个对话
```

### 方法 3: CLI 命令行

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node auto-record.js xiaozong master "你好，主人！"
```

### 方法 4: 当前会话自动记录（推荐）⭐

```javascript
const integration = require('/home/admin/openclaw/workspace/skills/mingdao-chat/integration.js');

// 启用自动记录（所有消息自动记录）
integration.enable('master');

// 之后所有消息都会自动记录，无需手动调用
// ... 正常对话 ...

// 禁用时保存缓存
integration.disable();
```

## 📖 功能

### 1. 记录单条消息

```javascript
await chat.recordMessage({
  sender: 'xiaozong',           // 发送者
  receiver: 'master',           // 接收者（可以是数组）
  content: '消息内容',           // 完整消息
  dialogId: 'xxx',             // 可选，对话 ID
  timestamp: Date.now()         // 可选，时间戳
});
```

### 2. 记录完整对话

```javascript
await chat.recordConversation({
  initiator: 'master',
  receivers: ['xiaozong'],
  messages: [
    { sender: 'master', content: '你好', timestamp: 1772275200000 },
    { sender: 'xiaozong', content: '主人好', timestamp: 1772275260000 }
  ]
});
```

### 3. 群聊支持

```javascript
await chat.recordMessage({
  sender: 'master',
  receiver: ['xiaozong', 'feng'],  // 多个接收人
  content: '大家注意，开会了！'
});
```

## 👥 用户映射

| 用户名 | RowID | 说明 |
|--------|-------|------|
| `xiaozong` | `7548a483-2b5b-4de0-be06-63b318ca52c4` | 小粽（我） |
| `feng` | `adde88c8-de91-4484-9a5e-070f50079ed8` | 风（6c42） |
| `master` | `ff074b4e-92ad-466e-9018-d3a7d150e8ee` | 主人（林东城） |

## 📊 明道云配置

| 配置项 | 值 |
|--------|-----|
| AppKey | `b37a969f03b3cf0b` |
| Sign | `MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==` |
| 对话表 | `68da90934256d51497bb9ff8` |
| 对话消息表 | `68da906bd34347b006235da4` |
| 用户表 | `68534cf5750002dbcc681334` |

## ✅ 特性

1. **完整记录** - 每条消息完整记录，不摘要不删减
2. **自动关联** - 自动管理对话 ID，同一对话自动关联
3. **群聊支持** - 支持多人对话
4. **时间戳** - 支持自定义时间戳
5. **批量导入** - 支持批量导入历史对话

## 🧪 测试

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node test.js
```

## 📁 文件结构

```
mingdao-chat/
├── SKILL.md          # 技能说明
├── index.js          # 核心功能
├── auto-record.js    # 自动记录器
├── test.js           # 测试脚本
├── USAGE.md          # 使用文档
└── README.md         # 本文件
```

## 🔧 集成到 OpenClaw

在 OpenClaw 的消息处理中添加：

```javascript
const recorder = require('/home/admin/openclaw/workspace/skills/mingdao-chat/auto-record.js');

// 用户发消息
async function onUserMessage(user, message) {
  await recorder.record(user, 'xiaozong', message);
  // ... 处理消息
}

// AI 回复
async function onAIReply(user, reply) {
  await recorder.record('xiaozong', user, reply);
  // ... 发送回复
}
```

## ⚠️ 注意事项

1. **对话唯一性**：目前需要手动管理对话 ID（未来版本会自动查找现有对话）
2. **消息完整性**：每条消息完整记录，不要传摘要
3. **类型字段**：固定填 "AI"
4. **逻辑删除**：使用 `del` 字段，不是物理删除

## 📝 示例输出

```json
{
  "dialogId": "e6c4a566-1df8-47b3-bd28-c1c53271d2f6",
  "messageId": "a2821774-f53b-4515-bff6-e90df96cce34",
  "success": true
}
```

## 🎯 下一步

- [ ] 实现对话自动查找（双向查询）
- [ ] 添加消息已读标记功能
- [ ] 添加未读消息查询功能
- [ ] 集成 Webhook 自动接收

---

**版本**: 1.0  
**作者**: 小粽  
**创建时间**: 2026-02-28
