# WebSocket Bridge 守护脚本说明

**用途**：确保 WebSocket 服务崩溃后自动重启

**保存路径**：`/home/admin/openclaw/workspace/skills/ws-bridge/daemon.js`

## 使用方法

### 1. 启动守护进程
```bash
cd /home/admin/openclaw/workspace
nohup node skills/ws-bridge/daemon.js > /tmp/ws-bridge-daemon-run.log 2>&1 &
```

### 2. 验证守护进程
```bash
# 检查守护进程
ps aux | grep ws-bridge-daemon | grep -v grep

# 查看日志
tail -20 /tmp/ws-bridge-daemon-run.log

# 检查服务是否运行
netstat -tlnp | grep 3010
```

### 3. 测试自动重启
```bash
# 手动杀死服务
pkill -f "node.*ws-bridge/server"

# 查看守护进程是否自动重启
tail -f /tmp/ws-bridge-daemon-run.log
```

### 4. 重启间隔说明
守护进程配置为 **30 秒**后重启（原为 5 秒），降低频繁重启的风险。

| 方式 | 重启间隔 | 重启频率 | 适合场景 |
|------|----------|----------|----------|
| 守护进程（原） | 5 秒 | 高 | 快速恢复 |
| 守护进程（现） | 30 秒 | 低 | 减少频繁重启 |

### 5. PM2 替代方案（如需）
如果你的环境有 PM2，可以用它替代守护进程：

```bash
cd /home/admin/openclaw/workspace
pm2 start skills/ws-bridge/daemon.js --name "ws-bridge-daemon"
pm2 save
pm2 startup
```

但当前环境未安装 PM2，建议使用守护进程。

---

## 开机自启（可选）

### 使用 systemd
```bash
sudo tee /etc/systemd/system/ws-bridge.service > /dev/null << 'EOF'
[Unit]
Description=WebSocket Bridge Service
After=network.target

[Service]
Type=simple
User=admin
WorkingDirectory=/home/admin/openclaw/workspace
ExecStart=/usr/bin/node /home/admin/openclaw/workspace/skills/ws-bridge/daemon.js
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ws-bridge.service
sudo systemctl start ws-bridge.service
```

---

**最后更新**：2026-03-03 01:38
