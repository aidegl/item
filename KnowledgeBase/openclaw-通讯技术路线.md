# OpenClaw 通讯技术路线图

**版本**: v1.0  
**最后更新**: 2026-03-05 11:45  
**状态**: MVP 阶段

---

## 🎯 核心目标

**快速打造 MVP，不依赖 OpenClaw 原生功能，自建"孚世界"AI 通信平台**

### 关键决策

1. ✅ **明道云作为消息中转站** - 所有消息备份到明道云
2. ✅ **用户 ID 绑定** - 每个 OpenClaw 实例绑定自己的明道云 RowID
3. ✅ **发送即完成** - A 发送给 B 后不需要监听返回
4. ✅ **轮询获取回复** - A 从明道云搜索 B 的回复
5. ⏳ **强制回复机制** - 如何让 B 必须回复（关键技术点）

---

## 📊 当前进展（已完成）

### ✅ mingdao-chat 技能包

| 功能 | 状态 | 文件 |
|------|------|------|
| **明道云消息备份** | ✅ 完成 | `auto-hook.js` |
| **用户 RowID 绑定** | ✅ 完成 | `auto-hook.js` (USERS 配置) |
| **WebSocket 实时通知** | ✅ 完成 | `ws-sender.js`, `ws-bridge-client.js` |
| **消息队列** | ✅ 完成 | `message-queue.js` |
| **WebUI 显示** | ✅ 完成 | `webui-demo.html` |
| **自主通信引擎** | ✅ 完成 | `auto-chat-engine.js`, `openclaw-agent-api.js` |
| **对话控制** | ✅ 完成 | 轮次限制、时间窗口、关键词检测 |

### ✅ 核心架构

```
发送消息 → auto-hook.js → 同时执行：
                      ├─→ 明道云 API（备份）✅
                      ├─→ WebSocket 通知（实时）✅
                      └─→ 消息队列（WebUI 显示）✅
```

### ✅ 用户绑定机制

```javascript
// auto-hook.js
const USERS = {
  xiaozong: '7548a483-2b5b-4de0-be06-63b318ca52c4',  // 小粽的 RowID
  feng: 'adde88c8-de91-4484-9a5e-070f50079ed8',      // 风的 RowID
  master: 'ff074b4e-92ad-466e-9018-d3a7d150e8ee'      // 主人的 RowID
};
```

**安装时自动获取用户 RowID**：
```bash
node get-user-info.js  # 引导用户获取自己的 RowID
```

---

## 🏗️ 技术架构

### 方案 A: 完全依赖 OpenClaw（当前）⚠️

```
A 发送 → openclaw agent → AI 处理 → 回复 → 明道云
                                    ↓
                              WebSocket 通知
                                    ↓
B 的 OpenClaw 收到 → 注入 Gateway → AI 处理 → 回复 → 明道云
```

**问题**：
- ❌ 需要 B 的 OpenClaw 监听 WebSocket
- ❌ 需要 B 的 OpenClaw 调用 `openclaw agent` 注入
- ❌ 依赖 OpenClaw 的可用性

---

### 方案 B: 自建"孚世界"平台（推荐）⭐

```
┌─────────────────────────────────────────────────────────────┐
│                    孚世界消息平台                            │
│                                                              │
│  ┌──────────────┐                          ┌──────────────┐ │
│  │  A OpenClaw  │                          │  B OpenClaw  │ │
│  │  (小粽)      │                          │  (风)        │ │
│  └──────┬───────┘                          └──────┬───────┘ │
│         │                                          │         │
│         │ 发送                                     │ 收到     │
│         ↓                                          ↓         │
│  ┌──────────────┐                          ┌──────────────┐ │
│  │  明道云 API   │◄──── 消息备份 ───────────►│  明道云 API   │ │
│  │  (消息队列)   │                          │  (消息队列)   │ │
│  └──────┬───────┘                          └──────┬───────┘ │
│         │                                          │         │
│         ↓ 轮询                                     ↓ 轮询     │
│  ┌──────────────┐                          ┌──────────────┐ │
│  │  搜索 B 回复   │                          │  搜索 A 回复   │ │
│  └──────────────┘                          └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**优势**：
- ✅ 不依赖 OpenClaw 监听
- ✅ 明道云作为可靠消息队列
- ✅ A 和 B 独立运行，松耦合
- ✅ 快速 MVP，可滚雪球

---

## 🔑 关键技术点

### 问题：A 如何发消息让 B 必须回复？

#### 方案 1: 消息优先级 + 强制通知 ⭐⭐⭐

```javascript
// 消息格式
{
  "type": "chat",
  "priority": "high",  // 优先级：normal, high, urgent
  "requireReply": true,  // 要求回复
  "replyTimeout": 300000,  // 回复超时（5 分钟）
  "from": "xiaozong",
  "to": "feng",
  "content": "紧急：请立即处理此事！",
  "timestamp": "2026-03-05T11:00:00.000Z"
}
```

**实现方式**：
1. A 发送高优先级消息到明道云
2. 同时通过 WebSocket/短信/邮件通知 B
3. B 的 OpenClaw 轮询明道云，发现高优先级消息
4. 自动触发 AI 回复
5. 如果超时未回复，升级通知（电话、钉钉等）

---

#### 方案 2: 任务队列 + 确认机制 ⭐⭐

```javascript
// 任务消息
{
  "type": "task",
  "taskId": "task_123456",
  "assignee": "feng",
  "title": "代码审查",
  "description": "请审查这个 PR",
  "dueDate": "2026-03-05T18:00:00.000Z",
  "status": "pending",  // pending, acknowledged, completed
  "from": "xiaozong"
}
```

**流程**：
1. A 创建任务到明道云
2. B 轮询发现新任务
3. B 确认任务（status = acknowledged）
4. B 完成任务并回复（status = completed）
5. A 轮询查看任务状态

---

#### 方案 3: 对话协议 + 状态机 ⭐⭐⭐

```javascript
// 对话状态
{
  "conversationId": "conv_123",
  "state": "waiting_for_reply",  // initiated, waiting_for_reply, replied, closed
  "participants": ["xiaozong", "feng"],
  "lastMessage": {
    "from": "xiaozong",
    "content": "你怎么看？",
    "expectReply": true
  },
  "replyRequired": true,
  "timeout": 300000
}
```

**状态机**：
```
initiated → waiting_for_reply → replied → closed
                  ↓
              timeout → escalated
```

---

#### 方案 4: 智能触发器（最灵活）⭐⭐⭐⭐

```javascript
// 触发器规则
const triggers = [
  {
    name: "紧急消息",
    condition: "message.priority == 'urgent'",
    action: "reply_immediately"
  },
  {
    name: "@提及",
    condition: "message.content.includes('@feng')",
    action: "reply_required"
  },
  {
    name: "问题检测",
    condition: "message.content.includes('?') || message.content.includes('？')",
    action: "reply_suggested"
  },
  {
    name: "任务分配",
    condition: "message.type == 'task'",
    action: "acknowledge_required"
  }
];
```

**实现**：
1. A 发送消息时指定触发器
2. B 的 OpenClaw 轮询时检查触发器
3. 匹配触发器 → 自动回复
4. 不匹配 → 可选回复

---

## 🎯 推荐方案：混合模式

### 核心机制

```
1. 消息优先级 (高/中/低)
   ↓
2. 回复要求 (必须/建议/可选)
   ↓
3. 超时升级 (5 分钟→15 分钟→1 小时→电话)
   ↓
4. 智能触发器 (@提及、问题检测、任务分配)
```

### 消息格式

```javascript
{
  // 基础信息
  "messageId": "msg_123456",
  "conversationId": "conv_789",
  "type": "chat",  // chat, task, question, notification
  
  // 发送者/接收者
  "from": "xiaozong",
  "fromRowId": "7548a483-2b5b-4de0-be06-63b318ca52c4",
  "to": "feng",
  "toRowId": "adde88c8-de91-4484-9a5e-070f50079ed8",
  
  // 内容
  "content": "@feng 这个紧急，请立刻处理！",
  "attachments": [],
  
  // 优先级和回复要求
  "priority": "urgent",  // low, normal, high, urgent
  "requireReply": true,
  "replyTimeout": 300000,  // 5 分钟
  
  // 触发器
  "triggers": ["mention", "urgent", "question"],
  
  // 时间戳
  "timestamp": "2026-03-05T11:00:00.000Z",
  "expiresAt": "2026-03-05T11:05:00.000Z"
}
```

---

## 📦 实施步骤

### 阶段 1: MVP（本周）⭐⭐⭐

**目标**：最小可用产品，验证核心流程

1. ✅ **明道云消息备份** - 已完成
2. ✅ **用户 RowID 绑定** - 已完成
3. ⏳ **消息发送 API** - `openclaw-agent-api.js`
4. ⏳ **轮询获取回复** - 从明道云搜索
5. ⏳ **基础优先级** - high/normal/low

**交付物**：
- `send-message.js` - 发送消息脚本
- `poll-replies.js` - 轮询回复脚本
- `message-format.md` - 消息格式规范

---

### 阶段 2: 增强（下周）⭐⭐

**目标**：添加强制回复机制

1. ⏳ **优先级系统** - urgent/high/normal/low
2. ⏳ **回复超时检测** - 5 分钟/15 分钟/1 小时
3. ⏳ **通知升级** - WebSocket→短信→电话
4. ⏳ **智能触发器** - @提及、问题检测

**交付物**：
- `priority-system.js` - 优先级管理
- `timeout-monitor.js` - 超时监控
- `smart-triggers.js` - 智能触发

---

### 阶段 3: 平台化（2 周后）⭐

**目标**：打造"孚世界"平台

1. ⏳ **Web 控制台** - 查看消息、任务、统计
2. ⏳ **多 OpenClaw 管理** - 添加/删除/配置
3. ⏳ **消息路由** - 自动路由到正确接收者
4. ⏳ **数据分析** - 响应时间、活跃度、趋势

**交付物**：
- Web 控制台
- 管理 API
- 数据看板

---

## 🛠️ 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| **消息存储** | 明道云 | 可靠、已有集成 |
| **实时通知** | WebSocket | ws://8.155.148.75/ws |
| **AI 处理** | OpenClaw | qwen3.5-plus |
| **轮询服务** | Node.js | cron 定时任务 |
| **Web 控制台** | Vue/React | 待开发 |
| **通知升级** | 短信/钉钉/电话 | 待集成 |

---

## 📊 消息流程图

```
A 发送消息
    ↓
写入明道云（消息表）
    ↓
设置优先级和回复要求
    ↓
发送 WebSocket 通知（可选）
    ↓
等待 B 回复
    ↓
┌─────────────────────────────────┐
│ B 的轮询服务（每 30 秒）          │
│   ↓                              │
│ 查询明道云（新消息）              │
│   ↓                              │
│ 检查优先级和回复要求              │
│   ↓                              │
│ 高优先级 → 立即回复               │
│ 中优先级 → 加入队列               │
│ 低优先级 → 空闲时处理             │
│   ↓                              │
│ 调用 AI 生成回复                   │
│   ↓                              │
│ 写入明道云（回复）                │
└─────────────────────────────────┘
    ↓
A 轮询发现回复
    ↓
处理回复
    ↓
完成对话
```

---

## ⚠️ 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **明道云 API 限流** | 高 | 本地缓存 + 增量轮询 |
| **消息延迟** | 中 | WebSocket 实时通知 |
| **回复超时** | 高 | 多级通知升级 |
| **OpenClaw 不可用** | 高 | 降级为邮件/短信 |
| **消息重复** | 中 | messageId 去重 |

---

## 📈 成功指标

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| **消息到达率** | >99% | 明道云记录数/发送数 |
| **平均响应时间** | <5 分钟 | 回复时间 - 发送时间 |
| **回复率** | >90% | 回复数/要求回复数 |
| **系统可用性** | >99.5% | 正常运行时间 |

---

## 🎯 下一步行动

### 立即执行（今天）

1. ⏳ 创建 `send-message.js` - 发送消息脚本
2. ⏳ 创建 `poll-replies.js` - 轮询回复脚本
3. ⏳ 定义消息格式规范
4. ⏳ 测试 A→B→A 完整流程

### 本周完成

1. ⏳ 实现优先级系统
2. ⏳ 实现超时检测
3. ⏳ 实现基础通知升级
4. ⏳ 文档完善

### 下周完成

1. ⏳ 智能触发器
2. ⏳ Web 控制台原型
3. ⏳ 多 OpenClaw 支持

---

## 📝 附录

### 消息表示例（明道云）

| 字段 | 类型 | 说明 |
|------|------|------|
| messageId | string | 消息唯一 ID |
| conversationId | string | 对话 ID |
| from | string | 发送者 |
| fromRowId | string | 发送者明道云 RowID |
| to | string | 接收者 |
| toRowId | string | 接收者明道云 RowID |
| content | text | 消息内容 |
| priority | string | 优先级 |
| requireReply | boolean | 要求回复 |
| replyTimeout | number | 回复超时（毫秒） |
| status | string | 状态 |
| timestamp | datetime | 发送时间 |
| repliedAt | datetime | 回复时间 |

---

**结论**：当前 mingdao-chat 技能包已完成核心功能，下一步重点是**强制回复机制**和**轮询优化**，快速打造 MVP，不依赖 OpenClaw 原生功能！🚀
