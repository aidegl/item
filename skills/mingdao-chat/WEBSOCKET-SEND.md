# WebSocket 消息发送 - 使用指南

## 📡 作用

通过 WebSocket 桥接服务**实时发送消息**给其他客户端（如风），与明道云 API 配合实现：
- ✅ **明道云 API** - 消息备份（持久化存储）
- ✅ **WebSocket** - 实时通知（即时送达）

---

## 🏗️ 架构说明

### 之前的流程（复杂）❌
```
发送消息 → 明道云 API → 明道云 Webhook → 宝塔 3011 → WebSocket → 接收方
```

### 现在的流程（简单）✅
```
发送消息 → 同时执行：
  ├─→ 明道云 API（备份）
  └─→ WebSocket 直接发送（实时通知）
```

---

## 📦 使用方法

### 方式 1: 自动发送（推荐）⭐

**auto-hook.js 已集成 WebSocket 发送**，调用 `recordReply()` 时自动发送：

```javascript
const autoHook = require('./auto-hook.js');
autoHook.enable('master');

// 记录 AI 回复（自动发送到明道云 + WebSocket）
await autoHook.recordReply('你好，这是消息内容', 'feng');
```

**预期输出**：
```
✅ 已记录：xiaozong → feng (消息 ID: xxx)
📡 正在通过 WebSocket 通知 feng...
✅ WebSocket 通知成功：feng
```

---

### 方式 2: 手动发送

直接使用 `ws-sender.js`：

```javascript
const wsSender = require('./ws-sender.js');

// 发送给单个接收者
await wsSender.send('feng', '消息内容', 'xiaozong');

// 批量发送
await wsSender.broadcast(['feng', 'master'], '群发消息', 'xiaozong');
```

---

## 📊 发送格式

### WebSocket 消息格式

```javascript
{
  type: 'chat',
  from: 'xiaozong',           // 发送者 ID
  to: 'feng',                  // 接收者 ID
  data: {
    type: 'chat',
    content: '消息内容',        // 消息内容（支持 Markdown）
    sender: 'xiaozong',
    timestamp: '2026-03-05T09:30:00.000Z'
  }
}
```

### 支持的接收者

| ID | 说明 | WebSocket 客户端 ID |
|----|------|-------------------|
| `feng` | 风 | `feng` |
| `master` | 主人 | `master` |
| `xiaozong` | 小粽 | `xiaozong` |

---

## 🔧 配置

### WebSocket 服务器地址

编辑 `ws-sender.js`：

```javascript
const WS_SERVER = 'ws://8.155.148.75/ws';  // 修改为你的服务器
```

### 客户端 ID 映射

```javascript
const CLIENT_IDS = {
  xiaozong: 'xiaozong',
  feng: 'feng',
  master: 'master'
};
```

---

## 📝 完整示例

### 示例 1: 发送消息给风

```javascript
const autoHook = require('./auto-hook.js');
autoHook.enable('master');

// 发送消息（自动备份到明道云 + WebSocket 通知）
await autoHook.recordReply('🍃 风，收到请回复！', 'feng');
```

### 示例 2: 发送消息给主人

```javascript
await autoHook.recordReply('主人，任务已完成！', 'master');
```

### 示例 3: 仅 WebSocket 发送（不明道云备份）

```javascript
const wsSender = require('./ws-sender.js');

// 仅发送 WebSocket，不明道云备份
await wsSender.send('feng', '这是一条临时消息');
```

---

## 📊 预期日志

### 成功发送

```
[WS-Sender] 发送消息给 feng: 消息内容...
[WS-Sender] ✅ 已连接到 ws://8.155.148.75/ws?client=xiaozong
[WS-Sender] 📤 消息已发送
[WS-Sender] ✅ WebSocket 通知成功：feng
✅ 已记录：xiaozong → feng (消息 ID: xxx)
```

### 发送失败（超时）

```
[WS-Sender] 发送消息给 feng: 消息内容...
[WS-Sender] ⏰ 发送超时
⚠️ WebSocket 通知失败：feng
✅ 已记录：xiaozong → feng (消息 ID: xxx)  // 明道云备份仍然成功
```

---

## ⚠️ 注意事项

### 1. 超时处理

- WebSocket 发送超时时间：**5 秒**
- 超时不影响明道云备份
- 自动重试：需要手动调用

### 2. 错误处理

```javascript
try {
  const success = await wsSender.send('feng', '消息内容');
  if (!success) {
    console.log('⚠️ WebSocket 发送失败，但明道云备份成功');
  }
} catch (e) {
  console.error('❌ 发送错误:', e.message);
}
```

### 3. 批量发送

```javascript
const results = await wsSender.broadcast(['feng', 'master'], '群发消息');
console.log(results);
// [
//   { to: 'feng', success: true },
//   { to: 'master', success: true }
// ]
```

---

## 🔍 故障排查

### 问题 1: WebSocket 连接失败

```bash
# 测试服务器连通性
ping 8.155.148.75

# 测试端口
telnet 8.155.148.75 80

# 查看服务端状态（在阿里云执行）
pm2 status
```

### 问题 2: 消息未送达

```bash
# 查看发送日志
tail -f skills/mingdao-chat/auto-hook.log | grep WebSocket

# 查看服务端日志（在阿里云执行）
pm2 logs ws-3011 --lines 50
```

### 问题 3: 接收方未收到

- 确认接收方 WebSocket 客户端在线
- 检查接收方客户端 ID 是否正确
- 查看接收方日志

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `ws-sender.js` | WebSocket 发送器 |
| `ws-bridge-client.js` | WebSocket 接收器 |
| `auto-hook.js` | 自动记录钩子（已集成 WebSocket） |
| `WEBSOCKET-DEPLOY.md` | WebSocket 部署指南 |

---

## 🎯 最佳实践

### 1. 优先使用 auto-hook.js

```javascript
// ✅ 推荐：自动备份 + WebSocket
await autoHook.recordReply('消息内容', 'feng');

// ❌ 不推荐：分开调用
await recordMessage(...);
await wsSender.send(...);
```

### 2. 异步发送

```javascript
// ✅ 推荐：不阻塞主流程
wsSender.send('feng', '消息内容')
  .then(success => console.log(success ? '成功' : '失败'));

// ❌ 不推荐：阻塞等待
await wsSender.send('feng', '消息内容');
```

### 3. 错误容忍

```javascript
// WebSocket 失败不影响明道云备份
await recordMessage('xiaozong', 'feng', '消息内容');  // 总是成功
wsSender.send('feng', '消息内容');  // 失败也没关系
```

---

**最后更新**: 2026-03-05 09:30
