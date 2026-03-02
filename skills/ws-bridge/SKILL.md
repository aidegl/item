# WebSocket 桥接技能 (ws-bridge)

## 📖 概述

**用途**：绕过云电脑/容器的入站流量限制，实现双向通信

**核心原理**：
- 云电脑（如无影云）入站流量完全阻止，但**出站流量允许**
- 在公网服务器部署 WebSocket 服务（80/443 端口）
- 云电脑主动出站连接 WebSocket，建立长连接
- 通过 WebSocket 桥接实现双向消息转发

**适用场景**：
- 无影云电脑、容器等入站受限环境
- 需要实时双向通信的应用
- 小程序 ↔ 后端 ↔ AI 助手通信

---

## 🏗️ 架构设计

```
┌─────────────┐                      ┌─────────────┐
│  小程序/客户端 │ ←── WS:80/443 ──→  │  公网服务器  │
│  (出站连接)  │   wss://domain/ws   │  (Nginx+WS) │
└─────────────┘                      └──────┬──────┘
                                            │ WS
                                            ↓
┌─────────────┐                      ┌─────────────┐
│   业务后端   │ ←── HTTP ──→        │   云电脑     │
│  (API 服务)   │                     │  (WS 客户端)  │
└─────────────┘                      └─────────────┘
```

---

## 🚀 1.0 阶段开发经验总结

### ✅ 成功经验

#### 1. 排除法定位问题 ✅
**问题**：风发送消息，小粽未收到

**排除步骤**：
1. 确认风的 WebSocket 发送正常（服务端收到消息）
2. 确认宝塔 API 调用正常（直接调用返回成功）
3. 确认小粽 client.js 进程状态（发现已退出）
4. 确认小粽能否连接公网服务端（发现安全组限制）

**关键收获**：
- 一次只验证一个环节
- 用事实证明"没问题"，而不是"可能没问题"
- 逐步缩小问题范围

#### 2. 小功能迭代验证 ✅
**问题**：MVP 链路不通

**迭代步骤**：
1. 风 → 服务端：✅ HTTP 服务正常
2. 服务端 → 小粽：✅ Broadcast 转发成功
3. 小粽 client.js → 宝塔：✅ 进程运行正常
4. 完整链路：✅ 三次验证全部通过

**关键收获**：
- 每次只做最小修改
- 每次修改后立即验证
- 确保功能稳定、逻辑清晰

#### 3. 日志驱动调试 ✅
**关键日志文件**：
- `/tmp/ws-bridge-client.log` - 小粽客户端日志
- `/tmp/ws-bridge-server.log` - 服务端日志

**关键命令**：
```bash
tail -f /tmp/ws-bridge-client.log
grep "miniprogram" /tmp/ws-bridge-client.log
ps aux | grep ws-bridge
```

**关键收获**：
- 日志是调试的第一依据
- 解决问题前先看日志
- 记录关键时间点和状态

### ❌ 失败经验（反例）

#### 1. 混乱地一起查 ❌
**错误做法**：
- 同时检查风、服务端、小粽、网络
- 混乱地修改多个组件
- 无法定位具体问题

**教训**：
- 不要"一起查"所有环节
- 每次专注一个环节
- 用排除法逐步缩小范围

#### 2. 未记录成功状态 ❌
**错误做法**：
- 小粽 client.js 每次重启后都退出
- 没有及时发现进程状态异常

**教训**：
- 每次修改后立即验证
- 记录当前状态（进程 PID、日志时间戳）
- 建立验证检查清单

#### 3. 忽视网络限制 ❌
**错误做法**：
- 假设无影云可以访问公网 WebSocket
- 没有提前测试安全组配置

**教训**：
- 网络限制需要提前验证
- 出站连接可能被阻断
- 优先选择本地回环（127.0.0.1）

#### 4. 未考虑连接生命周期 ❌
**错误做法**：
- 风的 HTML 页面 WebSocket 发送后立即关闭
- 小粽的 client.js 连接也多次断开

**教训**：
- WebSocket 连接可能不稳定
- 需要自动重连机制
- 消息丢失风险需要考虑

### 📊 1.0 开发总结

| 经验点 | 做法 | 效果 |
|--------|------|------|
| 排除法 | 一次只验证一个环节 | 快速定位问题 |
| 小迭代 | 每次最小修改 + 立即验证 | 链路稳定 |
| 日志驱动 | 所有问题先看日志 | 解决有依据 |
| 状态回溯 | 记录每个成功状态 | 问题可追溯 |
| 本地优先 | 优先使用 127.0.0.1 | 排除网络干扰 |

### 🎯 2.0 优化方向

#### 1. 连接稳定性
- 小粽 client.js 添加自动重连（已基本实现）
- WebSocket 心跳保活
- 消息队列 + 离线消息重发

#### 2. 链路监控
- 定期检查服务端/客户端状态
- 自动重启异常进程
- 完整链路健康检查

#### 3. 明道云集成
- 服务端收到风消息后自动记录到明道云
- 消息可追溯 + 可查看
- 完整的对话历史

#### 4. 安全加固
- WebSocket 连接添加认证
- 限制服务端 IP 白名单
- 日志脱敏处理

---

## 📦 部署步骤

### 第一步：公网服务器部署 WebSocket 服务

```bash
# 1. 创建目录
mkdir -p /root/ws-bridge
cd /root/ws-bridge

# 2. 创建 package.json
cat > package.json << 'EOF'
{
  "name": "ws-bridge",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "ws": "^8.14.0"
  }
}
EOF

# 3. 创建 WebSocket 服务
cat > server.js << 'EOF'
const WebSocket = require('ws');
const http = require('http');

const PORT = 3010;
const clients = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket Bridge Running');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const clientId = req.url.split('?client=')[1] || 'unknown';
  console.log(`[${new Date().toISOString()}] 客户端连接：${clientId}`);
  
  clients.set(clientId, ws);
  
  ws.on('message', (message) => {
    console.log(`[${clientId}] 收到：`, message.toString());
    
    // 广播给其他客户端
    clients.forEach((client, id) => {
      if (id !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          from: clientId,
          data: message.toString(),
          time: new Date().toISOString()
        }));
      }
    });
  });
  
  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] 客户端断开：${clientId}`);
    clients.delete(clientId);
  });
  
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: '已连接到 WebSocket 桥接服务'
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ WebSocket 服务已启动，监听端口：${PORT}`);
});
EOF

# 4. 安装依赖并启动
npm install
nohup node server.js > ws-bridge.log 2>&1 &

# 5. 验证
ps aux | grep "node server" | grep -v grep
```

---

### 第二步：配置 Nginx 反向代理

**宝塔面板操作**：
1. 登录宝塔 → 网站 → 设置 → 反向代理
2. 添加反向代理：
   - 代理名称：`websocket`
   - 目标 URL：`http://127.0.0.1:3010`
   - 代理目录：`/ws`
   - 勾选 **启用 WebSocket**

**或手动配置**：
```nginx
location /ws {
    proxy_pass http://127.0.0.1:3010;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

---

### 第三步：云电脑部署 WebSocket 客户端

```bash
# 1. 创建客户端脚本
cat > ws-bridge-client.js << 'EOF'
#!/usr/bin/env node
const WebSocket = require('ws');
const { execSync } = require('child_process');

const CONFIG = {
  WS_URL: 'ws://8.155.148.75/ws?client=xiaozong',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT: 10
};

let ws = null;
let reconnectCount = 0;

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function handleMessage(data) {
  try {
    const msg = JSON.parse(data);
    log(`📬 收到消息：${JSON.stringify(msg)}`);
    
    if (msg.type === 'chat' || msg.data || msg.message) {
      log('🔄 转发给后端...');
      const messageText = msg.data || msg.message || JSON.stringify(msg);
      
      try {
        const result = execSync(
          `curl -s -X POST http://127.0.0.1:3001/chat -H "Content-Type: application/json" -d '${JSON.stringify({ message: messageText }).replace(/'/g, "'\\''")}'`,
          { encoding: 'utf-8', timeout: 30000 }
        );
        log(`✅ 后端响应：${result.substring(0, 200)}`);
        
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'response',
            data: result,
            time: new Date().toISOString()
          }));
        }
      } catch (e) {
        log(`❌ 后端调用失败：${e.message}`);
      }
    }
  } catch (e) {
    log(`❌ 消息解析失败：${e.message}`);
  }
}

function connect() {
  log(`🔌 尝试连接：${CONFIG.WS_URL}`);
  
  ws = new WebSocket(CONFIG.WS_URL, { reconnect: false });
  
  ws.on('open', () => {
    log('✅ WebSocket 连接成功！');
    reconnectCount = 0;
  });
  
  ws.on('message', handleMessage);
  
  ws.on('close', () => scheduleReconnect());
  ws.on('error', (err) => log(`❌ 连接错误：${err.message}`));
}

function scheduleReconnect() {
  if (reconnectCount >= CONFIG.MAX_RECONNECT) return;
  reconnectCount++;
  const delay = CONFIG.RECONNECT_INTERVAL * reconnectCount;
  log(`⏳ ${delay}ms 后第 ${reconnectCount} 次重连...`);
  setTimeout(connect, delay);
}

// 检查 ws 模块
try { require.resolve('ws'); } catch (e) {
  log('❌ 缺少 ws 模块，执行：npm install ws');
  process.exit(1);
}

connect();
EOF

# 2. 安装依赖
npm install ws

# 3. 启动客户端
nohup node ws-bridge-client.js > /tmp/ws-client.log 2>&1 &

# 4. 验证
tail -20 /tmp/ws-client.log
```

---

## 🧪 测试方法

### 方式 1：wscat 测试
```bash
npm install -g wscat
wscat -c "ws://8.155.148.75/ws?client=test" -x '{"type":"chat","data":"测试消息"}'
```

### 方式 2：网页测试
```html
<script>
const ws = new WebSocket('ws://8.155.148.75/ws?client=test');
ws.onopen = () => ws.send(JSON.stringify({type:'chat',data:'测试'}));
ws.onmessage = (e) => console.log('收到:', e.data);
</script>
```

### 方式 3：小程序测试
```javascript
const ws = wx.connectSocket({
  url: 'ws://100000whys.cn/ws?client=miniprogram'
});
ws.onOpen(() => ws.send({
  data: JSON.stringify({type:'chat',data:'你好'})
}));
```

---

## 📁 文件结构

```
skills/ws-bridge/
├── SKILL.md              # 技能说明文档
├── server.js             # WebSocket 服务端
├── client.js             # WebSocket 客户端
├── nginx.conf.example    # Nginx 配置示例
└── README.md             # 部署文档
```

---

## ⚠️ 注意事项

1. **端口选择**：云电脑出站通常只允许 80/443，必须用 Nginx 反向代理
2. **心跳保活**：长连接需要心跳，建议 30 秒一次 ping/pong
3. **重连机制**：客户端必须有重连逻辑，网络波动会断开
4. **消息格式**：建议统一用 JSON 格式，包含 type、data、time 字段
5. **安全性**：生产环境建议加 token 认证、WSS 加密

---

## 🔧 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 404 错误 | Nginx 配置未生效 | 检查 location /ws 配置，重载 Nginx |
| 连接超时 | 防火墙阻止 | 检查阿里云安全组、宝塔防火墙 |
| 频繁断开 | 网络波动/超时 | 增加重连逻辑、心跳保活 |
| 消息不转发 | 客户端 ID 不匹配 | 检查广播逻辑中的客户端过滤 |

---

## 📚 相关资源

- [ws 模块文档](https://github.com/websockets/ws)
- [Nginx WebSocket 代理](https://nginx.org/en/docs/http/websocket.html)
- [小程序 WebSocket](https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html)

---

**版本**：1.0.0  
**作者**：小粽  
**更新时间**：2026-03-02  
**开发阶段**：1.0 MVP（已验证成功，风↔小粽链路打通）

## 📝 开发记录

| 日期 | 事件 | 状态 |
|------|------|------|
| 2026-03-02 21:28 | 问题发现：风发消息小粽未收到 | ⏳ |
| 2026-03-02 21:52 | 排除法定位到 client.js 退出 | ✅ |
| 2026-03-02 22:17 | MVP 链路首次验证成功 | ✅ |
| 2026-03-02 22:24 | 服务端日志完整验证 | ✅ |
| 2026-03-02 22:26 | 功能验证：消息询问 | ✅ |
| 2026-03-02 22:31 | 小粽 client.js 重启成功 | ✅ |
| 2026-03-02 22:42 | 最新消息测试成功 | ✅ |

---

**最后总结**：通过排除法 + 小功能迭代法，成功打通风 ↔ 小粽 WebSocket 桥接链路！
