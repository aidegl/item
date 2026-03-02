# WebSocket 桥接服务部署文档

## 🚀 快速部署

### 1. 公网服务器部署（WebSocket 服务端）

```bash
# 创建目录
mkdir -p /root/ws-bridge && cd /root/ws-bridge

# 创建 package.json
cat > package.json << 'EOF'
{"name":"ws-bridge","version":"1.0.0","main":"server.js","dependencies":{"ws":"^8.14.0"}}
EOF

# 复制 server.js 到当前目录
# 或直接从 skills/ws-bridge/server.js 复制

# 安装依赖
npm install

# 启动服务
nohup node server.js > ws-bridge.log 2>&1 &

# 验证
ps aux | grep "node server" | grep -v grep
netstat -tlnp | grep 3010
```

---

### 2. 配置 Nginx 反向代理

**宝塔面板**：
1. 网站 → 设置 → 反向代理 → 添加反向代理
2. 配置：
   - 代理名称：`websocket`
   - 目标 URL：`http://127.0.0.1:3010`
   - 代理目录：`/ws`
   - ✅ 启用 WebSocket

**手动配置**：
```bash
cat > /etc/nginx/conf.d/ws-proxy.conf << 'EOF'
location /ws {
    proxy_pass http://127.0.0.1:3010;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
EOF
nginx -t && nginx -s reload
```

---

### 3. 云电脑部署（WebSocket 客户端）

```bash
# 创建工作目录
mkdir -p /opt/ws-bridge && cd /opt/ws-bridge

# 复制 client.js 到当前目录

# 创建 package.json
cat > package.json << 'EOF'
{"name":"ws-bridge-client","version":"1.0.0","main":"client.js","dependencies":{"ws":"^8.14.0"}}
EOF

# 安装依赖
npm install

# 配置环境变量（可选）
export WS_URL="ws://8.155.148.75/ws?client=xiaozong"
export BACKEND_URL="http://127.0.0.1:3001/chat"

# 启动客户端
nohup node client.js > /tmp/ws-client.log 2>&1 &

# 验证
tail -20 /tmp/ws-client.log
ps aux | grep "node client" | grep -v grep
```

---

## 🔧 配置说明

### 服务端配置 (server.js)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `WS_PORT` | `3010` | WebSocket 服务监听端口 |

### 客户端配置 (client.js)

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `WS_URL` | `ws://8.155.148.75/ws?client=xiaozong` | WebSocket 服务器地址 |
| `BACKEND_URL` | `http://127.0.0.1:3001/chat` | 后端 API 地址 |
| `LOG_FILE` | `/tmp/ws-bridge-client.log` | 日志文件路径 |
| `LOG_LEVEL` | `info` | 日志级别 (debug/info/warn/error) |
| `RECONNECT_INTERVAL` | `5000` | 重连间隔 (毫秒) |
| `MAX_RECONNECT` | `0` | 最大重连次数 (0=无限) |

---

## 🧪 测试

### 测试 1: wscat
```bash
npm install -g wscat
wscat -c "ws://8.155.148.75/ws?client=test" -x '{"type":"chat","data":"测试"}'
```

### 测试 2: curl 检查服务
```bash
curl -I http://8.155.148.75/ws
# 应该返回 200 或 101 Switching Protocols
```

### 测试 3: 检查日志
```bash
# 服务端日志
tail -f /root/ws-bridge/ws-bridge.log

# 客户端日志
tail -f /tmp/ws-client.log
```

---

## 🔒 安全建议

### 1. 启用 WSS（WebSocket over SSL）

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /ws {
        proxy_pass http://127.0.0.1:3010;
        # ... 其他配置
    }
}
```

客户端连接：
```javascript
ws:// → wss://
```

### 2. 添加 Token 认证

服务端验证：
```javascript
const token = url.searchParams.get('token');
if (token !== process.env.EXPECTED_TOKEN) {
  ws.close(4001, 'Unauthorized');
  return;
}
```

### 3. 限制 IP 访问

```nginx
location /ws {
    allow 10.0.0.0/8;  # 只允许内网
    allow 127.0.0.1;
    deny all;
    
    proxy_pass http://127.0.0.1:3010;
    # ...
}
```

---

## 🐛 故障排查

### 问题 1: 404 Not Found
```bash
# 检查 Nginx 配置
nginx -t
nginx -T | grep "location /ws"

# 检查 WebSocket 服务
netstat -tlnp | grep 3010
ps aux | grep "node server"
```

### 问题 2: 连接超时
```bash
# 检查防火墙
iptables -L INPUT -n | grep 3010
# 或宝塔面板：安全 → 放行端口

# 检查阿里云安全组
# ECS → 安全组 → 放行 3010/TCP
```

### 问题 3: 频繁断开
```bash
# 检查日志
tail -100 /tmp/ws-client.log | grep "断开\|重连"

# 增加心跳间隔
# 修改 server.js 中的 pingInterval 为 60000
```

### 问题 4: 消息不转发
```bash
# 检查客户端 ID 是否匹配
# 检查后端 API 是否可访问
curl -X POST http://127.0.0.1:3001/chat -H "Content-Type: application/json" -d '{"message":"test"}'
```

---

## 📊 监控建议

### 1. 进程监控
```bash
# systemd 服务（推荐）
cat > /etc/systemd/system/ws-bridge.service << 'EOF'
[Unit]
Description=WebSocket Bridge Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ws-bridge
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ws-bridge
systemctl start ws-bridge
systemctl status ws-bridge
```

### 2. 日志轮转
```bash
cat > /etc/logrotate.d/ws-bridge << 'EOF'
/tmp/ws-client.log /root/ws-bridge/ws-bridge.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    copytruncate
}
EOF
```

### 3. 健康检查脚本
```bash
cat > /opt/check-ws-bridge.sh << 'EOF'
#!/bin/bash
if ! curl -s http://127.0.0.1:3010 > /dev/null; then
    echo "WebSocket 服务异常，重启..."
    systemctl restart ws-bridge
fi
EOF

chmod +x /opt/check-ws-bridge.sh
# 添加到 crontab: */5 * * * * /opt/check-ws-bridge.sh
```

---

## 📝 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-03-02 | 初始版本，支持基本 WebSocket 桥接 |

---

## 📞 支持

- 文档：`skills/ws-bridge/SKILL.md`
- 服务端：`skills/ws-bridge/server.js`
- 客户端：`skills/ws-bridge/client.js`
- Nginx 配置：`skills/ws-bridge/nginx.conf.example`
