# HEARTBEAT.md

**保持空文件以跳过心跳 API 调用**

# 需要时再添加任务

## 最新检查记录

- **时间**: 2026-03-05 06:15
- **任务**: 心跳检查 - 守护进程状态 & 系统验证
- **结果**: 
  - ✅ 守护进程运行正常 (PID: 1421337)
  - ✅ 明道云消息记录功能正常
  - ✅ 06:04 成功测试对话记录 (ID: `55af5fca-...`)
  - ✅ 技能包已完善（新增 INSTALL.md, config.example.js, check-config.js, CHECKLIST.md）

- **测试验证**:
  - ✅ 通过 API 直接发送测试消息成功 (ID: `3c3cfa57-...`)
  - ✅ 对话 ID: `44a68578-dfc3-40f2-8fe5-0631e86297c1`
  - ✅ 消息 ID: `3c3cfa57-ab61-4f10-aa36-fe2b99098dbd`

## ✅ 消息发送架构 - 双重发送（最新）

**新方案**：同时发送到明道云（备份）和 WebSocket（实时通知）

### 架构

```
发送消息 → auto-hook.js → 同时执行：
                      ├─→ 明道云 API（备份）
                      └─→ WebSocket 直接发送（实时通知）
```

### 优势

- ✅ **简化流程** - 不需要明道云 Webhook 中转
- ✅ **实时送达** - WebSocket 直接发送，毫秒级延迟
- ✅ **双重保障** - 明道云备份 + WebSocket 通知

### 核心文件

| 文件 | 作用 |
|------|------|
| `auto-hook.js` | ⭐ 已集成 WebSocket 发送 |
| `ws-sender.js` | ⭐ WebSocket 发送器 |
| `ws-bridge-client.js` | ⭐ WebSocket 接收器 |

### 使用方法

```javascript
const autoHook = require('./skills/mingdao-chat/auto-hook.js');
autoHook.enable('master');

// 发送消息（自动备份到明道云 + WebSocket 通知）
await autoHook.recordReply('消息内容', 'feng');
```

### 预期效果

```
✅ 已记录：xiaozong → feng (消息 ID: xxx)     // 明道云备份成功
📡 正在通过 WebSocket 通知 feng...
✅ WebSocket 通知成功：feng                   // WebSocket 发送成功
```

**详细文档**: `skills/mingdao-chat/WEBSOCKET-SEND.md`

## 下一步

- 如需添加新任务，请在此文件中备注
- 守护进程日志位置：`/home/admin/openclaw/workspace/skills/mingdao-chat/daemon.log`
- 队列文件：`/home/admin/openclaw/workspace/skills/mingdao-chat/.message-queue.json`
