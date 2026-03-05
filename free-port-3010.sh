#!/bin/bash

# 远程服务器端口释放脚本
# 运行方式：bash free-port-3010.sh

echo "🔍 正在查看 3010 端口占用情况..."

# 查看进程详细信息
echo "=== 进程详情 ==="
sudo lsof -i :3010 2>/dev/null | head -20

echo ""
echo "=== netstat 详情 ==="
sudo netstat -tlnp 2>/dev/null | grep :3010

echo ""
echo "=== ss 详情 ==="
sudo ss -tlnp 2>/dev/null | grep :3010

echo ""
echo "=== 查找 node 进程 ==="
ps aux | grep -E "node|server" | grep -v grep
