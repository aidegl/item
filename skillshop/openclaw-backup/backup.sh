#!/bin/bash
# openclaw-backup - OpenClaw 配置备份脚本

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

echo "🔄 OpenClaw 备份脚本"
echo "=================================="
echo "工作区：$WORKSPACE"
echo "知识库：$KNOWLEDGE"
echo "备份目录：$BACKUP_PATH"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_PATH/memory"

# 备份核心配置文件
echo "📁 备份核心配置..."
for file in SOUL.md AGENTS.md USER.md TOOLS.md IDENTITY.md HEARTBEAT.md; do
    if [ -f "$WORKSPACE/$file" ]; then
        cp "$WORKSPACE/$file" "$BACKUP_PATH/"
        echo "  ✅ $file"
    else
        echo "  ⚠️  $file (不存在)"
    fi
done

# 备份记忆文件
echo "📝 备份记忆文件..."
if [ -d "$WORKSPACE/memory" ]; then
    cp "$WORKSPACE/memory/"*.md "$BACKUP_PATH/memory/" 2>/dev/null && echo "  ✅ 记忆文件已备份" || echo "  ⚠️  无记忆文件"
else
    echo "  ⚠️  memory 目录不存在"
fi

# 显示备份内容
echo ""
echo "✅ 备份完成！内容："
ls -la "$BACKUP_PATH/"
echo ""
echo "记忆文件："
ls -la "$BACKUP_PATH/memory/" 2>/dev/null || echo "无记忆文件"

# 提交到 Git
echo ""
echo "📤 提交到 Git..."
cd "$KNOWLEDGE"
git add "$BACKUP_DIR/"
if git diff --staged --quiet; then
    echo "✅ 没有变化，跳过提交"
else
    TIMESTAMP=$(date +%Y-%m-%d_%H:%M:%S)
    git commit -m "小粽：[backup] 自动备份配置和记忆 $TIMESTAMP"
    
    # 尝试推送
    if git push origin main 2>/dev/null; then
        echo "✅ 推送成功！"
    else
        echo "⚠️  推送失败，先拉取远程变更..."
        git pull origin main --no-rebase
        git push origin main
        echo "✅ 推送成功！"
    fi
fi

echo ""
echo "🎉 备份完成！"

# 安装 cron 任务
if [ "$1" == "--install-cron" ]; then
    echo ""
    echo "⏰ 安装定时任务..."
    CRON_JOB="0 2 * * * $SCRIPT_DIR/backup.sh >> /tmp/xiaozong-backup.log 2>&1"
    
    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "$SCRIPT_DIR/backup.sh"; then
        echo "✅ 定时任务已存在"
    else
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✅ 定时任务已安装（每天凌晨 2 点）"
    fi
fi
