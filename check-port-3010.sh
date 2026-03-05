#!/bin/bash

# 检查 3010 端口占用情况
PORT=3010

echo "检查 ${PORT} 端口占用情况..."

if command -v lsof &> /dev/null; then
    echo "使用 lsof:"
    sudo lsof -i :${PORT}
elif command -v ss &> /dev/null; then
    echo "使用 ss:"
    sudo ss -tlnp | grep :${PORT}
elif command -v netstat &> /dev/null; then
    echo "使用 netstat:"
    sudo netstat -tlnp | grep :${PORT}
fi

echo ""
echo "如果需要杀死进程，执行："
echo "   sudo fuser -k ${PORT}/tcp"
