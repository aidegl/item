#!/bin/bash
# OpenClaw 监控器 - systemd 服务安装脚本

set -e

SERVICE_NAME="openclaw-watcher"
SERVICE_FILE="$HOME/.config/systemd/user/${SERVICE_NAME}.service"
WORK_DIR="/home/admin/openclaw/workspace/skills/mingdao-chat"

echo "🔧 正在安装 OpenClaw 监控器服务..."

# 停止旧进程（避免重复运行）
echo "🛑 正在停止旧的监控器进程..."
pkill -f "node session-watcher.js" 2>/dev/null || true
sleep 1

# 创建 systemd 用户目录
mkdir -p ~/.config/systemd/user

# 创建服务文件
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=OpenClaw MingDaoYun Conversation Recorder
Documentation=https://github.com/aidegl/item/tree/main/skills/mingdao-chat
After=network.target

[Service]
Type=simple
WorkingDirectory=${WORK_DIR}
ExecStart=/usr/bin/node ${WORK_DIR}/session-watcher.js
Restart=always
RestartSec=5

# 日志配置
StandardOutput=journal
StandardError=journal
SyslogIdentifier=openclaw-watcher

# 环境变量
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

echo "✅ 服务文件已创建：$SERVICE_FILE"

# 重新加载 systemd
systemctl --user daemon-reload
echo "✅ systemd 配置已重载"

# 启用服务（开机自启）
systemctl --user enable $SERVICE_NAME
echo "✅ 服务已启用（开机自启）"

# 启动服务
systemctl --user start $SERVICE_NAME
echo "✅ 服务已启动"

# 显示状态
echo ""
echo "📊 服务状态："
systemctl --user status $SERVICE_NAME --no-pager

echo ""
echo "🎉 安装完成！"
echo ""
echo "常用命令："
echo "  # 查看状态"
echo "  systemctl --user status $SERVICE_NAME"
echo ""
echo "  # 查看日志"
echo "  journalctl --user -u $SERVICE_NAME -f"
echo ""
echo "  # 重启服务"
echo "  systemctl --user restart $SERVICE_NAME"
echo ""
echo "  # 停止服务"
echo "  systemctl --user stop $SERVICE_NAME"
echo ""
echo "  # 禁用服务"
echo "  systemctl --user disable $SERVICE_NAME"
