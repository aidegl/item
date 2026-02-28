#!/bin/bash
# 夜间自主进化系统安装脚本

echo "🌙 安装夜间自主进化系统..."
echo "=========================="

# 1. 创建目录
mkdir -p /home/admin/openclaw/workspace/skills/night-evolution

# 2. 复制服务文件
cp openclaw-night-evolution.service ~/.config/systemd/user/ 2>/dev/null || \
  sudo cp openclaw-night-evolution.service /etc/systemd/system/

# 3. 重载 systemd
sudo systemctl daemon-reload

# 4. 启用服务
sudo systemctl enable openclaw-night-evolution

# 5. 启动服务
sudo systemctl start openclaw-night-evolution

# 6. 验证状态
sudo systemctl status openclaw-night-evolution --no-pager

echo ""
echo "✅ 安装完成！"
echo ""
echo "常用命令:"
echo "  查看状态：sudo systemctl status openclaw-night-evolution"
echo "  查看日志：sudo journalctl -u openclaw-night-evolution -f"
echo "  重启服务：sudo systemctl restart openclaw-night-evolution"
echo "  停止服务：sudo systemctl stop openclaw-night-evolution"
