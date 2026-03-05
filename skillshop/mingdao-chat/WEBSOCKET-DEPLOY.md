# WebSocket 桥接部署指南

## 📡 作用

WebSocket 桥接服务用于**接收其他客户端发送的实时消息**，并自动记录到明道云。

---

## 🏗️ 架构说明

```
其他客户端（风）
     ↓ WebSocket
公网服务器 (ws://your-server.com/ws)
     ↓ WebSocket
小粽客户端 (ws-bridge-client.js)
     ↓ 自动记录
明道云 ✅
```

---

## 📦 部署方案

### 方案一：使用现有公网 WebSocket 服务器

如果已经有公网 WebSocket 服务器（如阿里云 8.155.148.75），只需配置客户端：

#### 1. 配置 WebSocket 地址

编辑 `config.js`：

```javascript
const WS_CONFIG = {
  WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',  // 替换为你的服务器
  RECONNECT_INTERVAL: 5000
};
```

#### 2. 启动客户端

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node ws-bridge-client.js
```

#### 3. 后台运行（可选）

```bash
nohup node ws-bridge-client.js > ws-bridge.log 2>&1 &

# 验证
ps aux | grep ws-bridge-client
tail -f ws-bridge.log
```

---

### 方案二：自建 WebSocket 服务器

如果需要自建公网 WebSocket 服务器：

#### 1. 准备公网服务器

- 阿里云/腾讯云服务器（有公网 IP）
- 或本地服务器 + 内网穿透（ngrok/frp）

#### 2. 部署 WebSocket 服务端

```bash
# 在公网服务器上创建目录
mkdir -p /opt/ws-bridge && cd /opt/ws-bridge

# 创建 package.json
cat > package.json << 'EOF'
{"name":"ws-bridge","version":"1.0.0","main":"server.js","dependencies":{"ws":"^8.14.0"}}
EOF

# 创建 server.js（从 skills/ws-bridge/server.js 复制）
cp /home/admin/openclaw/workspace/skills/ws-bridge/server.js .

# 安装依赖
npm install

# 启动服务
nohup node server.js > ws-bridge.log 2>&1 &

# 验证
ps aux | grep "node server"
netstat -tlnp | grep 3010
```

#### 3. 配置 Nginx 反向代理（宝塔面板）

1. 网站 → 设置 → 反向代理 → 添加反向代理
2. 配置：
   - 代理名称：`websocket`
   - 目标 URL：`http://127.0.0.1:3010`
   - 代理目录：`/ws`
   - ✅ 启用 WebSocket

#### 4. 配置小粽客户端

编辑 `config.js`：

```javascript
const WS_CONFIG = {
  WS_URL: 'ws://你的公网IP/ws?client=xiaozong',
  RECONNECT_INTERVAL: 5000
};
```

#### 5. 启动客户端

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node ws-bridge-client.js
```

---

## 🔧 其他客户端发送消息

### Node.js 示例

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://你的服务器IP/ws?client=feng');

ws.on('open', () => {
  console.log('✅ 连接成功');
  
  ws.send(JSON.stringify({
    from: 'feng',
    data: '小粽你好！这是测试消息。',
    time: new Date().toISOString()
  }));
  
  console.log('📤 消息已发送');
});

ws.on('message', (data) => {
  console.log('📬 收到回复:', data.toString());
});

ws.on('error', (err) => {
  console.error('❌ 错误:', err.message);
});

setTimeout(() => {
  ws.close();
  process.exit(0);
}, 10000);
```

### 简化版

```javascript
ws.send(JSON.stringify({
  from: 'feng',
  data: '消息内容'
}));
```

---

## 📊 验证

### 1. 检查客户端状态

```bash
ps aux | grep ws-bridge-client
```

### 2. 查看日志

```bash
tail -f /home/admin/openclaw/workspace/skills/mingdao-chat/ws-bridge.log
```

### 3. 查看明道云

打开明道云应用，查看"对话"工作表，应该能看到新消息。

---

## ⚠️ 注意事项

### 1. 安全性

- WebSocket 服务器建议添加认证机制
- 不要暴露到公网（除非必要）
- 使用防火墙限制访问

### 2. 稳定性

- 使用 PM2 或 systemd 管理进程
- 配置自动重启
- 监控日志

### 3. 网络

- 确保服务器防火墙开放端口（3010 或 3011）
- Nginx 配置 WebSocket 支持
- 检查云服务商安全组规则

---

## 🔧 故障排查

### 问题 1: 连接失败

```bash
# 测试服务器连通性
ping your-server-ip

# 测试端口
telnet your-server-ip 3010

# 查看服务端日志
tail -f /opt/ws-bridge/ws-bridge.log
```

### 问题 2: 消息未记录

```bash
# 检查客户端日志
tail -f ws-bridge.log

# 检查明道云 API
tail -f daemon.log

# 验证 config.js 配置
cat config.js | grep -E "WS_URL|appkey"
```

### 问题 3: 频繁断线

- 检查网络连接
- 增加重连间隔（`RECONNECT_INTERVAL`）
- 查看服务端负载

---

## 📝 配置示例

### config.js 完整示例

```javascript
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: '你的 Sign',
  dialogWorksheet: '68da90934256d51497bb9ff8',
  messageWorksheet: '68da906bd34347b006235da4',
  fields: {
    // ... 字段配置
  }
};

const USERS = {
  xiaozong: '7548a483-2b5b-4de0-be06-63b318ca52c4',
  feng: 'adde88c8-de91-4484-9a5e-070f50079ed8',
  master: 'ff074b4e-92ad-466e-9018-d3a7d150e8ee'
};

const SESSIONS_DIR = '/home/admin/.openclaw/agents/main/sessions';

const WS_CONFIG = {
  WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',
  RECONNECT_INTERVAL: 5000
};

module.exports = { CONFIG, USERS, SESSIONS_DIR, WS_CONFIG };
```

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `ws-bridge-client.js` | WebSocket 客户端 |
| `config.example.js` | 配置模板 |
| `server.js` | WebSocket 服务端（在 skills/ws-bridge/） |
| `daemon.log` | 明道云守护进程日志 |

---

**最后更新**: 2026-03-05
