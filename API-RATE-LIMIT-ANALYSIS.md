2026-03-03 阿里百炼 API 限流问题分析

## 问题现象
- 使用阿里百炼 coding plan 套餐
- 用量仅 8%，但收到 "API rate limit reached" 警告

## 原因分析

### 阿里百炼的两种限流
1. **总量配额**：你看到的 8%（月总调用次数）
2. **QPS 限流**：每秒请求数（突发请求限制）

### 根本原因
WebSocket 服务可能在短时间内频繁调用 API：
- 守护进程每 5 秒尝试重启
- `openclaw system event` 调用可能触发限流
- 风频繁发送消息导致快速连续调用

## 解决方案

### 方案 1：降低调用频率
在 `server.js` 中添加节流逻辑：

```javascript
const throttle = require('lodash/throttle');

// 限制调用频率：每 2 秒最多调用 1 次
const sendMessage = throttle((message) => {
  const command = `openclaw system event --text "${message}" --mode now 2>&1`;
  execSync(command);
}, 2000);
```

### 方案 2：使用消息队列
添加 Redis 或内存队列，避免瞬时高并发：

```javascript
const messageQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || messageQueue.length === 0) return;
  
  isProcessing = true;
  const message = messageQueue.shift();
  
  // 调用 API
  await callOpenClawAPI(message);
  
  isProcessing = false;
  setTimeout(processQueue, 1000); // 1 秒后处理下一条
}
```

### 方案 3：检查 OpenClaw 配置
检查 OpenClaw 的 API 调用配置是否有速率限制：

```bash
openclaw ecs info
openclaw ecs config get
```

### 方案 4：增加重试间隔
修改守护进程，增加重试间隔：

```javascript
// 原来：5 秒
const RESTART_DELAY = 5000;

// 修改为：30 秒
const RESTART_DELAY = 30000;
```

## 推荐组合方案
1. ✅ 用消息队列缓冲
2. ✅ 每次调用间隔 ≥ 2 秒
3. ✅ 失败时指数退避重试（1s → 2s → 4s → 8s）

## 下一步
需要我帮你修改 `server.js` 添加节流和队列机制吗？
