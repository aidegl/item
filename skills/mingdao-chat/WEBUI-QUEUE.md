# WebUI 消息队列 - 使用指南

## 📡 作用

解决**OpenClaw WebUI 不显示发送消息**的问题！

通过本地消息队列 + WebSocket 推送，让 WebUI 实时显示所有发送的消息。

---

## 🏗️ 新架构

### 之前（缺少 WebUI 显示）❌

```
发送消息 → 明道云 API（备份）
         → WebSocket（通知风）
         
❌ WebUI 无法显示
```

### 现在（完整三重发送）✅

```
发送消息 → 本地消息队列（WebUI 显示）⭐
         → 明道云 API（备份）
         → WebSocket（通知风）
```

---

## 📦 核心文件

| 文件 | 作用 |
|------|------|
| `message-queue.js` | ⭐ 消息队列管理器 |
| `message-queue-service.js` | ⭐ WebSocket 服务（WebUI 订阅） |
| `webui-demo.html` | 🎨 WebUI 演示页面 |
| `auto-hook.js` | ✅ 已集成消息队列 |

---

## 🚀 快速开始

### 步骤 1: 启动消息队列服务

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node message-queue-service.js
```

**预期输出**：
```
🚀 消息队列服务已启动
   WebSocket: ws://localhost:3012
   HTTP API: http://localhost:3013
   健康检查：http://localhost:3013/health
   消息列表：http://localhost:3013/messages
   发送消息：POST http://localhost:3013/send
   WebUI 演示：打开 skills/mingdao-chat/webui-demo.html
```

### 步骤 2: 打开 WebUI 演示

在浏览器打开：
```
file:///home/admin/openclaw/workspace/skills/mingdao-chat/webui-demo.html
```

**预期效果**：
- ✅ 显示"已连接"状态
- ✅ 实时显示所有发送的消息
- ✅ 点击"发送测试消息"可以看到效果

---

## 📊 使用方式

### 方式 1: 自动集成（推荐）⭐

**auto-hook.js 已自动使用消息队列**，无需额外配置：

```javascript
const autoHook = require('./auto-hook.js');
autoHook.enable('master');

// 发送消息（自动进入消息队列）
await autoHook.recordReply('消息内容', 'feng');

// 自动执行：
// 1. ✅ 添加到消息队列（WebUI 显示）
// 2. ✅ 备份到明道云
// 3. ✅ WebSocket 通知风
```

### 方式 2: 手动添加到队列

```javascript
const messageQueue = require('./message-queue.js');

// 添加消息到队列
messageQueue.add({
  type: 'chat',
  from: 'xiaozong',
  to: 'feng',
  content: '消息内容',
  status: 'sent'
});
```

### 方式 3: HTTP API 发送

```bash
# 发送测试消息
curl -X POST http://localhost:3013/send \
  -H "Content-Type: application/json" \
  -d '{"from":"xiaozong","to":"feng","content":"测试消息"}'
```

---

## 🎨 WebUI 订阅

### 前端代码示例

```javascript
// 连接到消息队列 WebSocket
const ws = new WebSocket('ws://localhost:3012');

ws.onopen = () => {
  console.log('✅ 已连接到消息队列');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'history') {
    // 加载历史消息
    renderMessages(data.messages);
  } else if (data.type === 'new_message') {
    // 新消息实时显示
    addMessage(data.message);
  }
};
```

### 集成到 OpenClaw WebUI

如果你想在 OpenClaw 原生 WebUI 中显示，需要：

1. **修改 OpenClaw 前端代码** - 添加消息队列订阅
2. **添加消息显示面板** - 展示消息列表

**代码位置**：`openclaw/webapp/src/`（需要修改源码）

---

## 📊 HTTP API 参考

### 健康检查

```bash
GET http://localhost:3013/health

响应:
{
  "status": "ok",
  "messages": 42
}
```

### 获取消息列表

```bash
GET http://localhost:3013/messages?limit=100

响应:
{
  "messages": [
    {
      "id": "msg_1741140000000_abc123",
      "type": "chat",
      "from": "xiaozong",
      "to": "feng",
      "content": "消息内容",
      "status": "sent",
      "dialogId": "xxx",
      "createdAt": "2026-03-05T10:00:00.000Z",
      "timestamp": 1741140000000
    }
  ]
}
```

### 发送消息

```bash
POST http://localhost:3013/send
Content-Type: application/json

{
  "from": "xiaozong",
  "to": "feng",
  "content": "消息内容"
}

响应:
{
  "success": true,
  "message": {
    "id": "msg_1741140000000_abc123",
    ...
  }
}
```

---

## 🔧 配置选项

### 消息队列配置

编辑 `message-queue.js`：

```javascript
const QUEUE_FILE = path.join(__dirname, '.message-queue.json'); // 队列文件路径
const WS_PORT = 3012;  // WebSocket 端口
const MAX_MESSAGES = 1000;  // 最大保留消息数
```

### 服务配置

编辑 `message-queue-service.js`：

```javascript
const WS_PORT = 3012;  // WebSocket 端口
const HTTP_PORT = 3013;  // HTTP API 端口
```

---

## 📝 完整示例

### 示例 1: 发送消息并显示在 WebUI

```javascript
const autoHook = require('./auto-hook.js');
autoHook.enable('master');

// 启动消息队列服务（终端 1）
// node message-queue-service.js

// 打开 WebUI 演示（浏览器）
// file:///home/admin/openclaw/workspace/skills/mingdao-chat/webui-demo.html

// 发送消息（终端 2）
await autoHook.recordReply('你好，风！', 'feng');

// 预期效果：
// 1. ✅ WebUI 立即显示消息
// 2. ✅ 明道云备份成功
// 3. ✅ 风收到 WebSocket 通知
```

### 示例 2: 查询历史消息

```javascript
const messageQueue = require('./message-queue.js');

// 获取最近 100 条消息
const history = messageQueue.getHistory({ limit: 100 });
console.log(history);

// 筛选特定用户的消息
const fengMessages = messageQueue.getHistory({ 
  limit: 100, 
  to: 'feng' 
});
console.log(fengMessages);
```

---

## ⚠️ 注意事项

### 1. 服务需要常驻运行

```bash
# 后台运行消息队列服务
nohup node message-queue-service.js > message-queue.log 2>&1 &

# 或使用 PM2
pm2 start message-queue-service.js --name mingdao-queue
```

### 2. 消息队列文件大小

- 默认保留最近 **1000 条** 消息
- 文件位置：`.message-queue.json`
- 定期清理：`rm .message-queue.json`

### 3. 端口占用

如果端口 3012/3013 被占用，修改配置：

```javascript
// message-queue-service.js
const WS_PORT = 3014;  // 改用其他端口
const HTTP_PORT = 3015;
```

---

## 🔍 故障排查

### 问题 1: WebUI 无法连接

```bash
# 检查服务是否运行
ps aux | grep message-queue-service

# 检查端口
netstat -tlnp | grep 3012

# 查看日志
tail -f message-queue.log
```

### 问题 2: 消息不显示

```bash
# 检查队列文件
cat .message-queue.json | jq '.length'

# 测试 HTTP API
curl http://localhost:3013/health
```

### 问题 3: WebSocket 断开

- 检查防火墙设置
- 确认端口未被占用
- 查看浏览器控制台错误

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `message-queue.js` | 消息队列核心 |
| `message-queue-service.js` | WebSocket 服务 |
| `webui-demo.html` | WebUI 演示 |
| `auto-hook.js` | 已集成消息队列 |
| `ws-sender.js` | WebSocket 发送器 |
| `ws-bridge-client.js` | WebSocket 接收器 |

---

## 🎯 下一步

### 集成到 OpenClaw 原生 WebUI

如果需要集成到 OpenClaw 原生 WebUI，需要：

1. 修改 `openclaw/webapp/src/` 前端代码
2. 添加消息队列订阅组件
3. 添加消息显示面板

**工作量**：约 2-4 小时

### 部署到生产环境

```bash
# 使用 PM2 管理
pm2 start message-queue-service.js --name mingdao-queue
pm2 save
pm2 startup
```

---

**最后更新**: 2026-03-05 10:15
