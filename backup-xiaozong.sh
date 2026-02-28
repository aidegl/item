#!/bin/bash
# 小粽的备份脚本 - 备份所有重要配置和记忆到 KnowledgeBase

set -e

WORKSPACE="/home/admin/openclaw/workspace"
KNOWLEDGE="$WORKSPACE/KnowledgeBase"
BACKUP_DIR="$KNOWLEDGE/config/xiaozong"

echo "🫔 小粽备份脚本 - 备份所有配置和记忆"
echo "=================================="

# 创建备份目录
mkdir -p "$BACKUP_DIR/memory"

# 备份核心配置文件
echo "📁 备份核心配置..."
cp "$WORKSPACE/SOUL.md" "$BACKUP_DIR/"
cp "$WORKSPACE/AGENTS.md" "$BACKUP_DIR/"
cp "$WORKSPACE/USER.md" "$BACKUP_DIR/"
cp "$WORKSPACE/TOOLS.md" "$BACKUP_DIR/"
cp "$WORKSPACE/IDENTITY.md" "$BACKUP_DIR/"
cp "$WORKSPACE/HEARTBEAT.md" "$BACKUP_DIR/"

# 备份记忆文件
echo "📝 备份记忆文件..."
cp "$WORKSPACE/memory/"*.md "$BACKUP_DIR/memory/" 2>/dev/null || echo "无记忆文件"

# 备份 KnowledgeBase 重要文档（可选）
echo "📚 备份重要文档..."
cp "$WORKSPACE/KnowledgeBase/claws/"*.md "$BACKUP_DIR/docs/" 2>/dev/null || mkdir -p "$BACKUP_DIR/docs"

# 显示备份内容
echo ""
echo "✅ 备份完成！内容："
ls -la "$BACKUP_DIR/"
echo ""
echo "记忆文件："
ls -la "$BACKUP_DIR/memory/" 2>/dev/null || echo "无记忆文件"

# 提交到 Git
echo ""
echo "📤 提交到 Git..."
cd "$KNOWLEDGE"
git add config/xiaozong/
if git diff --staged --quiet; then
    echo "✅ 没有变化，跳过提交"
else
    git commit -m "小粽：[backup] 自动备份配置和记忆 $(date +%Y-%m-%d_%H:%M:%S)"
    git push origin main
    echo "✅ 推送成功！"
fi

echo ""
echo "🎉 备份完成！"
