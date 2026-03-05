# FSJ Server 远程部署命令

## 一键部署（直接在远程服务器执行）

```bash
# 进入项目目录
cd /www/wwwroot/100000whys.cn/project/fsj

# 1. 释放端口
sudo fuser -k 3010/tcp

# 2. 等待端口释放
sleep 2

# 3. 启动服务（使用 dist/main.js）
pm2 start dist/main.js --name fsj-server --no-daemon

# 或者创建 ecosystem.config.js 后用：
# pm2 start ecosystem.config.js --no-daemon
```

## 检查服务状态

```bash
pm2 list
pm2 logs fsj-server
```

## 停止服务

```bash
pm2 stop fsj-server
```

---

## 自动释放端口并重启（一键脚本）

```bash
cd /www/wwwroot/100000whys.cn/project/fsj

# 创建发布脚本
cat > restart.sh << 'EOF'
#!/bin/bash
echo "🔄 重启 FSJ Server..."
sudo fuser -k 3010/tcp 2>/dev/null || echo "✅ 端口已释放"
sleep 2
pm2 restart fsj-server || pm2 start dist/main.js --name fsj-server
echo "✅ 重启完成"
EOF

chmod +x restart.sh
./restart.sh
```
