# MingDaoYun Chat Skill - 使用示例

## 快速开始

### 1. 记录单条消息

```javascript
const chat = require('/home/admin/openclaw/workspace/skills/mingdao-chat/index.js');

// 小粽发给主人
await chat.recordMessage({
  sender: 'xiaozong',
  receiver: 'master',
  content: '主人，任务完成了！'
});

// 风发给小粽
await chat.recordMessage({
  sender: 'feng',
  receiver: 'xiaozong',
  content: '你好，小粽！'
});

// 群聊（多个接收人）
await chat.recordMessage({
  sender: 'master',
  receiver: ['xiaozong', 'feng'],
  content: '大家注意，开会了！'
});
```

### 2. 记录完整对话（批量导入）

```javascript
const chat = require('/home/admin/openclaw/workspace/skills/mingdao-chat/index.js');

await chat.recordConversation({
  initiator: 'master',
  receivers: ['xiaozong'],
  messages: [
    { sender: 'master', content: '你好', timestamp: 1772275200000 },
    { sender: 'xiaozong', content: '主人好！', timestamp: 1772275260000 },
    { sender: 'master', content: '今天工作怎么样？', timestamp: 1772275320000 }
  ]
});
```

### 3. 指定对话 ID（连续对话）

```javascript
const chat = require('/home/admin/openclaw/workspace/skills/mingdao-chat/index.js');

// 第一次：创建对话
const result1 = await chat.recordMessage({
  sender: 'xiaozong',
  receiver: 'master',
  content: '第一条消息'
});

// 后续：使用同一个对话 ID
await chat.recordMessage({
  sender: 'master',
  receiver: 'xiaozong',
  content: '回复第一条',
  dialogId: result1.dialogId  // 使用已创建的对话
});

await chat.recordMessage({
  sender: 'xiaozong',
  receiver: 'master',
  content: '再回复',
  dialogId: result1.dialogId
});
```

## 自动化集成

### OpenClaw 自动记录

在 OpenClaw 的回复处理中添加：

```javascript
const chat = require('/home/admin/openclaw/workspace/skills/mingdao-chat/index.js');

// 每次用户发消息后
async function handleUserMessage(userMessage) {
  // 记录用户消息
  await chat.recordMessage({
    sender: 'user',  // 需要映射到具体用户 RowID
    receiver: 'xiaozong',
    content: userMessage.content
  });
  
  // 生成回复
  const reply = await generateReply(userMessage);
  
  // 记录 AI 回复
  await chat.recordMessage({
    sender: 'xiaozong',
    receiver: 'user',
    content: reply
  });
  
  return reply;
}
```

## 用户映射

```javascript
const USERS = {
  xiaozong: '7548a483-2b5b-4de0-be06-63b318ca52c4',  // 小粽
  feng: 'adde88c8-de91-4484-9a5e-070f50079ed8',      // 风
  master: 'ff074b4e-92ad-466e-9018-d3a7d150e8ee'     // 主人（林东城）
};
```

## 返回值

```javascript
{
  dialogId: "605766e7-37c2-44f6-9266-a865d906de3a",  // 对话 ID
  messageId: "f2188927-22db-44e0-ac0d-8d2c8b2f5df2", // 消息 ID
  success: true
}
```

## 注意事项

1. **消息完整性**：每条消息完整记录，不摘要不删减
2. **对话唯一性**：两人之间只有一条对话（需要手动管理）
3. **类型字段**：固定填 "AI"
4. **时间戳**：可选，默认使用当前时间

## 测试

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node test.js
```

---

**最后更新**: 2026-03-01 20:08
