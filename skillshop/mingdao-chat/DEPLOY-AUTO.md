# OpenClaw 监控器 - 自动启动部署指南

## 🚨 为什么需要自动启动？

**当前问题：**
- ❌ 手动启动的后台进程，服务器重启后停止
- ❌ 进程崩溃后不会自动恢复
- ❌ 没有监控和告警机制

**解决方案：**
- ✅ systemd 服务 - 系统级进程管理
- ✅ 自动重启 - 崩溃后 5 秒内恢复
- ✅ 开机自启 - 服务器重启后自动运行
- ✅ 健康检查 - 每 5 分钟自动检测

---

## 📦 方案一：systemd 服务（推荐⭐）

### 1. 运行安装脚本

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
chmod +x install-service.sh
./install-service.sh
```

### 2. 验证安装

```bash
# 查看服务状态
systemctl --user status openclaw-watcher

# 查看实时日志
journalctl --user -u openclaw-watcher -f
```

### 3. 常用命令

```bash
# 启动服务
systemctl --user start openclaw-watcher

# 停止服务
systemctl --user stop openclaw-watcher

# 重启服务
systemctl --user restart openclaw-watcher

# 查看状态
systemctl --user status openclaw-watcher

# 查看日志
journalctl --user -u openclaw-watcher --since today

# 实时日志
journalctl --user -u openclaw-watcher -f

# 禁用开机自启
systemctl --user disable openclaw-watcher

# 重新加载配置（修改服务文件后）
systemctl --user daemon-reload
```

---

## 📦 方案二：健康检查定时器（可选）

### 1. 安装健康检查服务

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat

# 复制服务文件到 systemd 目录
cp openclaw-watcher-health.service ~/.config/systemd/user/
cp openclaw-watcher-health.timer ~/.config/systemd/user/

# 重新加载
systemctl --user daemon-reload

# 启用定时器
systemctl --user enable openclaw-watcher-health.timer
systemctl --user start openclaw-watcher-health.timer
```

### 2. 验证定时器

```bash
# 查看定时器状态
systemctl --user list-timers | grep openclaw

# 查看下次执行时间
systemctl --user status openclaw-watcher-health.timer
```

### 3. 手动运行健康检查

```bash
chmod +x health-check.sh
./health-check.sh
```

---

## 📦 方案三：crontab 定时检查（备选）

如果 systemd 不可用，使用 crontab：

```bash
# 编辑 crontab
crontab -e

# 添加以下内容（每 5 分钟检查一次）
*/5 * * * * /home/admin/openclaw/workspace/skills/mingdao-chat/health-check.sh
```

---

## 🔍 监控和告警

### 1. 查看日志

```bash
# systemd 日志
journalctl --user -u openclaw-watcher --since today

# 健康检查日志
tail -f /home/admin/openclaw/workspace/skills/mingdao-chat/watcher-health.log

# 监控器日志
tail -f /home/admin/openclaw/workspace/skills/mingdao-chat/session-watcher.log
```

### 2. 快速检查脚本

```bash
#!/bin/bash
# quick-check.sh - 快速检查监控器状态

if systemctl --user is-active --quiet openclaw-watcher; then
  echo "✅ 监控器服务运行正常"
  systemctl --user status openclaw-watcher --no-pager
else
  echo "❌ 监控器服务未运行！"
  echo "正在自动启动..."
  systemctl --user start openclaw-watcher
fi
```

### 3. 检查缓存新鲜度

```bash
# 查看缓存文件最后更新时间
stat /home/admin/openclaw/workspace/skills/mingdao-chat/.session-cache.json

# 检查是否超过 10 分钟未更新
node -e "
const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('/home/admin/openclaw/workspace/skills/mingdao-chat/.session-cache.json'));
const now = Date.now();
const diff = (now - cache.lastMessageTimestamp) / 1000 / 60;  // 分钟
console.log('缓存时间差:', diff.toFixed(2), '分钟');
if (diff > 10) {
  console.log('⚠️  警告：缓存可能过期！');
  process.exit(1);
} else {
  console.log('✅ 缓存更新正常');
}
"
```

---

## 🎯 部署检查清单

- [ ] 运行 `./install-service.sh` 安装 systemd 服务
- [ ] 验证 `systemctl --user status openclaw-watcher` 显示 active
- [ ] 测试 `journalctl --user -u openclaw-watcher -f` 可以看到日志
- [ ] （可选）安装健康检查定时器
- [ ] （可选）配置 crontab 备选方案
- [ ] 测试服务器重启后服务是否自动启动

---

## 📊 服务特性对比

| 特性 | 手动启动 | systemd 服务 | 健康检查 |
|------|---------|-------------|---------|
| 开机自启 | ❌ | ✅ | ✅ |
| 崩溃重启 | ❌ | ✅ | ✅ |
| 日志管理 | 手动 | 自动 | 自动 |
| 资源限制 | ❌ | ✅ | ❌ |
| 健康检测 | ❌ | ❌ | ✅ |
| 推荐度 | ⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 一键部署命令

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat

# 1. 停止旧进程
pkill -f "node session-watcher.js" || true

# 2. 安装 systemd 服务
chmod +x install-service.sh
./install-service.sh

# 3. 安装健康检查
cp openclaw-watcher-health.service ~/.config/systemd/user/
cp openclaw-watcher-health.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable openclaw-watcher-health.timer
systemctl --user start openclaw-watcher-health.timer

# 4. 验证
echo ""
echo "🎉 部署完成！"
echo ""
systemctl --user status openclaw-watcher --no-pager
echo ""
systemctl --user list-timers | grep openclaw
```

---

## ⚠️ 故障排查

### 问题 1: 服务无法启动

```bash
# 查看详细错误
journalctl --user -u openclaw-watcher --no-pager -n 50

# 检查 Node.js 是否可用
which node
node --version

# 手动测试
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node session-watcher.js
```

### 问题 2: 服务启动后立即退出

```bash
# 检查日志
journalctl --user -u openclaw-watcher -f

# 常见原因：
# - 端口被占用
# - 权限不足
# - 依赖文件缺失
```

### 问题 3: 缓存不更新

```bash
# 检查最后更新时间
stat /home/admin/openclaw/workspace/skills/mingdao-chat/.session-cache.json

# 检查会话文件
ls -lah ~/.openclaw/agents/main/sessions/*.jsonl

# 重启服务
systemctl --user restart openclaw-watcher
```

---

## 📞 支持

遇到问题？

1. 查看日志：`journalctl --user -u openclaw-watcher -f`
2. 运行健康检查：`./health-check.sh`
3. 查看文档：`TECH-PATH.md`

---

**版本**: 1.0  
**创建时间**: 2026-02-28  
**状态**: ✅ 就绪
