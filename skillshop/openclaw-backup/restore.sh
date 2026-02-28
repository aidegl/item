#!/bin/bash
# openclaw-backup - OpenClaw 配置恢复脚本

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"

# 读取配置
if [ -f "$CONFIG_FILE" ]; then
    WORKSPACE=$(jq -r '.workspace' "$CONFIG_FILE")
    KNOWLEDGE=$(jq -r '.knowledge_base' "$CONFIG_FILE")
    BACKUP_DIR=$(jq -r '.backup_dir' "$CONFIG_FILE")
else
    # 默认配置
    WORKSPACE="/home/admin/openclaw/workspace"
    KNOWLEDGE="$WORKSPACE/KnowledgeBase"
    BACKUP_DIR="config/xiaozong"
fi

BACKUP_PATH="$KNOWLEDGE/$BACKUP_DIR"

echo "🔄 OpenClaw 恢复脚本"
echo "=================================="
echo "备份目录：$BACKUP_PATH"
echo "工作区：$WORKSPACE"
echo ""

# 检查备份是否存在
if [ ! -d "$BACKUP_PATH" ]; then
    echo "❌ 错误：备份目录不存在！"
    echo "请先运行备份脚本或克隆 KnowledgeBase 仓库"
    exit 1
fi

# 恢复核心配置文件
echo "📁 恢复核心配置..."
for file in SOUL.md AGENTS.md USER.md TOOLS.md IDENTITY.md HEARTBEAT.md; do
    if [ -f "$BACKUP_PATH/$file" ]; then
        cp "$BACKUP_PATH/$file" "$WORKSPACE/"
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (备份中不存在)"
    fi
done

# 恢复记忆文件
echo "📝 恢复记忆文件..."
if [ -d "$BACKUP_PATH/memory" ] && [ "$(ls -A $BACKUP_PATH/memory 2>/dev/null)" ]; then
    mkdir -p "$WORKSPACE/memory"
    cp "$BACKUP_PATH/memory/"*.md "$WORKSPACE/memory/"
    echo "  ✅ 记忆文件已恢复"
else
    echo "  ⚠️  无记忆文件"
fi

echo ""
echo "✅ 恢复完成！"
echo ""
echo "📋 恢复的文件："
ls -la "$WORKSPACE/"*.md
echo ""
echo "记忆文件："
ls -la "$WORKSPACE/memory/" 2>/dev/null || echo "无记忆文件"

echo ""
echo "🔄 请重启 OpenClaw 以应用配置："
echo "   openclaw restart"
