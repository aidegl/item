#!/bin/bash

# 自动重试安装 tavily-search
MAX_RETRIES=5
RETRY_INTERVAL=30

echo "🔄 开始安装 tavily-search..."
echo "⚠️  ClawHub 被限流，将自动重试 ${MAX_RETRIES} 次"
echo ""

for i in $(seq 1 $MAX_RETRIES); do
  echo "attempt ${i}/${MAX_RETRIES}..."
  
  if clawhub install tavily-search 2>/dev/null; then
    echo ""
    echo "✅ 安装成功！"
    exit 0
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "❌ 失败，等待 ${RETRY_INTERVAL} 秒后重试..."
    sleep $RETRY_INTERVAL
  fi
done

echo ""
echo "❌ 安装失败，请稍后手动运行：clawhub install tavily-search"
