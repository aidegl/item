# PM2 + WebSocket 桥接指南（宝塔部署版）

## 场景说明
- **公网服务器**：部署 WebSocket 服务（server.js，3010 端口）
- **宝塔面板**：管理 Nginx 代理 + PM2 守护进程
- **服务路径**：`/home/admin/openclaw/workspace/skills/ws-bridge/server.js`

---

## 部署步骤

### 1. 安装 PM2（宝塔服务器）
```bash
# 检查是否已安装 PM2
pm2 --version

# 如果未安装，使用 npm 安装
npm install -g pm2
```

### 2. 创建 PM2 配置文件
```bash
cd /home/admin/openclaw/workspace
# 复制 pm2-ws-bridge.json（已提供）
cp /home/admin/openclaw/workspace/pm2-ws-bridge.json ./
```

### 3. 启动服务（用 PM2）
```bash
cd /home/admin/openclaw/workspace
pm2 start pm2-ws-bridge.json
pm2 save
pm2 startup
```

### 4. 更新 Nginx 配置（宝塔面板）

#### 方式一：宝塔面板操作
1. 登录宝塔面板
2. 网站 → 100000whys.cn → 设置 → 配置文件
3. **在文件最前面**添加 default_server 块（见下方代码）
4. 保存后宝塔自动重载 Nginx

#### 方式二：命令行操作
```bash
# 备份原配置
sudo cp /www/server/panel/vhost/nginx/100000whys.cn.conf /www/server/panel/vhost/nginx/100000whys.cn.conf.bak

# 替换配置
sudo cp /home/admin/openclaw/workspace/Nginx-Baota-PM2.conf /www/server/panel/vhost/nginx/100000whys.cn.conf

# 重载 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 5. 验证服务
```bash
# PM2 状态
pm2 list
pm2 show ws-bridge

# 查看日志
pm2 logs ws-bridge

# 检查端口
netstat -tlnp | grep 3010
```

---

## 配置文件说明

### Nginx default_server 块（添加在配置文件最前面）
```nginx
# 默认 server 块 - 处理 IP 地址请求（WebSocket）
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;

    ssl_certificate /www/server/panel/vhost/cert/100000whys.cn/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/100000whys.cn/privkey.pem;

    # WebSocket 代理
    location /ws {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 7200s;
        proxy_buffering off;
    }
}
```

### pm2-ws-bridge.json（PM2 配置）
- name: `ws-bridge` - 服务名称
- script: `/home/admin/openclaw/workspace/skills/ws-bridge/server.js`
- restart_delay: 30 秒（崩溃后重启延迟）
- log_file: 统一日志文件

---

## 关键区别

| 方式 | 守护进程（daemon.js） | PM2 |
|------|----------------------|-----|
| 管理 | 手动脚本 | PM2 统一管理 |
| 日志 | `/tmp/ws-bridge-*.log` | `/tmp/pm2-*.log` |
| 状态查看 | `ps aux | grep` | `pm2 list` |
| 重启 | 自定义逻辑 | PM2 内置重启 |

---

## 常用命令

### 查看服务状态
```bash
pm2 list
pm2 show ws-bridge
```

### 查看日志
```bash
pm2 logs ws-bridge
pm2 logs ws-bridge --lines 100
```

### 重启服务
```bash
pm2 reload ws-bridge        # 平滑重启（不中断连接）
pm2 restart ws-bridge       # 强制重启
```

### 停止服务
```bash
pm2 stop ws-bridge
```

### 删除服务
```bash
pm2 delete ws-bridge
```

---

## 故障排查

### 1. 502 错误
- 检查服务是否运行：`pm2 list`
- 检查端口是否监听：`netstat -tlnp | grep 3010`
- 查看服务日志：`pm2 logs ws-bridge`

### 2. WebSocket 连接失败
- 检查 Nginx 配置是否有 default_server 块
- 检查 Nginx 是否重载：`systemctl status nginx`
- 检查宝塔防火墙是否放行 3010 端口

### 3. 服务频繁重启
- 检查服务代码是否有错误
- 查看日志：`pm2 logs ws-bridge`
- 增加重启间隔：修改 `restart_delay` 参数

---

## 与守护进程对比

### 守护进程（daemon.js）
```bash
nohup node skills/ws-bridge/daemon.js > /tmp/ws-bridge-daemon-run.log 2>&1 &
```

### PM2 方式（推荐）
```bash
pm2 start pm2-ws-bridge.json
pm2 save
pm2 startup
```

### 优势
- ✅ 统一管理所有 Node.js 服务
- ✅ 日志集中查看
- ✅ 平滑重启不中断连接
- ✅ 宝塔面板可视化监控

---

## 卸载守护进程（如果之前用 daemon.js）
```bash
# 查找并杀死守护进程
ps aux | grep ws-bridge-daemon | grep -v grep | awk '{print $2}' | xargs kill -9

# 检查是否还在运行
ps aux | grep ws-bridge-daemon | grep -v grep
```

---

**最后更新**：2026-03-03 02:40
