#!/bin/bash

# FSJ Server 部署脚本 - 远程服务器使用
# 用途：解决端口占用并启动服务

set -e

echo "🚀 开始部署 FSJ Server..."

# 1. 检查 3010 端口
echo "🔍 检查 3010 端口占用情况..."
if command -v lsof &> /dev/null; then
    sudo lsof -i :3010 || echo "✅ 3010 端口空闲"
elif command -v ss &> /dev/null; then
    sudo ss -tlnp | grep :3010 || echo "✅ 3010 端口空闲"
fi

# 2. 强制释放端口（如果有进程占用）
echo "🔧 尝试释放 3010 端口..."
sudo fuser -k 3010/tcp 2>/dev/null || echo "✅ 3010 端口已释放或原本空闲"

# 3. 等待端口释放
sleep 2

# 4. 检查端口状态
echo "📝 端口检查结果："
if sudo ss -tlnp 2>/dev/null | grep -q :3010; then
    echo "❌ 3010 端口仍然被占用"
    exit 1
else
    echo "✅ 3010 端口空闲"
fi

# 5. 启动服务
echo "🚀 启动 FSJ Server..."
pm2 start ecosystem.config.js --no-daemon

echo "✅ 部署完成！"
