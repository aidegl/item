#!/bin/bash

# FSJ Server 检查脚本 - 远程服务器使用
# 用途：检查项目结构并生成正确的启动命令

echo "🔍 开始检查 FSJ Server 项目结构..."

# 1. 检查 dist/main.js 是否存在
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js 存在"
    echo "📈 使用命令：pm2 start dist/main.js --name fsj-server"
    exit 0
fi

# 2. 检查 src 或 tsconfig.json（需要编译的项目）
if [ -d "src" ] || [ -f "tsconfig.json" ] || [ -f "package.json" ]; then
    echo "⚠️  项目需要编译 TypeScript"
    echo "📝 检查 package.json..."
    
    if [ -f "package.json" ]; then
        echo "📦 找到 package.json"
        cat package.json | grep -A5 '"scripts"' || echo "scripts 部分未找到"
    fi
    
    # 检查是否存在 build 工具
    if [ -f "tsconfig.json" ]; then
        echo " TypeScript 配置文件存在"
        echo "♨️  尝试编译：tsc --build"
    fi
    
    exit 1
fi

# 3. 检查 server.js 或 index.js（简单 Node.js 项目）
if [ -f "server.js" ]; then
    echo "✅ 找到 server.js"
    echo "📈 使用命令：pm2 start server.js --name fsj-server"
    exit 0
fi

if [ -f "index.js" ]; then
    echo "✅ 找到 index.js"
    echo "📈 使用命令：pm2 start index.js --name fsj-server"
    exit 0
fi

# 4. 无结果
echo "❌ 无法找到可执行文件"
echo "📁 当前目录结构："
ls -la
exit 1
