# PM2 + WebSocket 桥接指南（2026-03-03 02:33）

## 部署步骤

### 1. 安装 PM2（如果未安装）
```bash
npm install -g pm2
```

### 2. 启动 WebSocket 服务（用 PM2）
```bash
cd /home/admin/openclaw/workspace
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. 更新 Nginx 配置

#### 找到配置文件位置
```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-available/xiaozong-proxy
```

#### 替换配置文件
```bash
sudo cp /home/admin/openclaw/workspace/Nginx-PM2-Config.txt /etc/nginx/sites-available/xiaozong-proxy
sudo nginx -t && sudo systemctl reload nginx
```

### 4. 检查服务状态
```bash
# PM2 状态
pm2 list

# 查看 ws-bridge 日志
pm2 logs ws-bridge

# Nginx 状态
systemctl status nginx
```

---

## 配置说明

### ecosystem.config.js（PM2 配置）
- name: `ws-bridge` - 服务名称
- script: WebSocket 服务路径
- restart_delay: 30 秒（崩溃后重启延迟）
- log_file: 统一日志文件

### Nginx-PM2-Config.txt（Nginx 配置）
- default_server 块：处理 IP 地址请求（80/443）
- `/ws` 代理：转发到 `http://127.0.0.1:3010`
- 主 server 块：处理域名请求（保持原样）

---

## 关键区别

| 方式 | 守护进程（daemon.js） | PM2 |
|------|----------------------|-----|
| 管理 | 手动脚本 | PM2 统一管理 |
| 日志 | `/tmp/ws-bridge-*.log` | `/tmp/pm2-*.log` |
| 重启 | 自定义逻辑 | PM2 内置重启 |
| 状态查看 | `ps aux | grep` | `pm2 list` |

---

## 启动命令对比

### 守护进程方式
```bash
cd /home/admin/openclaw/workspace
nohup node skills/ws-bridge/daemon.js > /tmp/ws-bridge-daemon-run.log 2>&1 &
```

### PM2 方式
```bash
cd /home/admin/openclaw/workspace
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 状态检查

### 守护进程方式
```bash
# 检查守护进程
ps aux | grep ws-bridge-daemon

# 检查服务
ps aux | grep "ws-bridge/server"

# 查看日志
tail -f /tmp/ws-bridge-daemon-run.log
```

### PM2 方式
```bash
# 检查服务列表
pm2 list

# 查看日志
pm2 logs ws-bridge

# 查看详细状态
pm2 show ws-bridge
```

---

## 零停机重启（PM2 优势）

```bash
# 平滑重启（不中断连接）
pm2 reload ws-bridge

# 优雅重启（等待连接完成）
pm2 gracefulReload ws-bridge
```

---

## 卸载守护进程（如果之前用 daemon.js）

```bash
# 查找并杀死守护进程
ps aux | grep ws-bridge-daemon | grep -v grep | awk '{print $2}' | xargs kill -9

# 检查是否还在运行
ps aux | grep ws-bridge-daemon | grep -v grep
```

---

## 宝塔面板配置

如果使用宝塔面板，可以在「网站」→「配置文件」中添加 default_server 块（在文件最前面）：

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;

    ssl_certificate /www/server/panel/vhost/cert/100000whys.cn/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/100000whys.cn/privkey.pem;

    location /ws {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 7200s;
    }
}
```

---

**最后更新**：2026-03-03 02:33
