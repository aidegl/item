# MingDaoYun Chat Skill - 明道云对话记录

## 功能
将 OpenClaw 对话自动记录到明道云对话系统

## 配置
```javascript
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  userWorksheet: '68534cf5750002dbcc681334',
  defaultLocation: 'a5dd767b-a5f3-4cd7-9357-455b5f3c175d',
  defaultOrg: 'ec2b4b92-23f5-4a0c-8498-1e0cb3f916ce'
};
```

## 用户映射
| 角色 | RowID |
|------|-------|
| 小粽 | `7548a483-2b5b-4de0-be06-63b318ca52c4` |
| 风 | `adde88c8-de91-4484-9a5e-070f50079ed8` |
| 主人 | `ff074b4e-92ad-466e-9018-d3a7d150e8ee` |

## 使用方法

### 记录单条消息
```javascript
const { recordMessage } = require('./index.js');

await recordMessage({
  sender: 'xiaozong',  // 或 'feng', 'master'
  receiver: 'master',
  content: '消息内容',
  timestamp: Date.now()  // 可选，默认当前时间
});
```

### 记录完整对话
```javascript
const { recordConversation } = require('./index.js');

await recordConversation({
  participants: ['xiaozong', 'master'],
  messages: [
    { sender: 'master', content: '你好', timestamp: 1772275200000 },
    { sender: 'xiaozong', content: '你好！', timestamp: 1772275260000 }
  ]
});
```

## API 端点
- 创建对话：`POST /v3/app/worksheets/68da90934256d51497bb9ff8/rows`
- 创建消息：`POST /v3/app/worksheets/68da906bd34347b006235da4/rows`
- 查询对话：`POST /v3/app/worksheets/68da90934256d51497bb9ff8/filter`
- 查询消息：`POST /v3/app/worksheets/68da906bd34347b006235da4/filter`

## 注意事项
1. 对话唯一性：两人之间只有一条对话（双向查询）
2. 消息完整性：每条消息单独创建，不摘要不删减
3. 类型字段：固定填 "AI"
4. 逻辑删除：使用 `del` 字段，不是物理删除
