#!/bin/bash
# OpenClaw 监控器 - 健康检查脚本

WORK_DIR="/home/admin/openclaw/workspace/skills/mingdao-chat"
LOG_FILE="$WORK_DIR/watcher-health.log"
PID_FILE="$WORK_DIR/session-watcher.pid"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查 systemd 服务
check_systemd() {
  if systemctl --user is-active --quiet openclaw-watcher 2>/dev/null; then
    return 0
  fi
  return 1
}

# 检查进程
check_process() {
  if pgrep -f "node session-watcher.js" > /dev/null 2>&1; then
    return 0
  fi
  return 1
}

# 检查缓存更新时间（超过 10 分钟未更新视为异常）
check_cache_freshness() {
  local cache_file="$WORK_DIR/.session-cache.json"
  if [ ! -f "$cache_file" ]; then
    return 1
  fi
  
  local cache_time=$(stat -c %Y "$cache_file" 2>/dev/null)
  local now=$(date +%s)
  local diff=$((now - cache_time))
  
  # 10 分钟 = 600 秒
  if [ $diff -gt 600 ]; then
    log "⚠️  警告：缓存文件超过 10 分钟未更新（${diff}秒前）"
    return 1
  fi
  
  return 0
}

# 主检查逻辑
main() {
  log "🔍 开始健康检查..."
  
  # 检查 systemd 服务
  if check_systemd; then
    log "✅ systemd 服务运行正常"
  else
    log "❌ systemd 服务未运行"
    
    # 尝试自动启动
    log "🔄 尝试自动启动服务..."
    if systemctl --user start openclaw-watcher 2>&1 | tee -a "$LOG_FILE"; then
      log "✅ 服务已自动启动"
    else
      log "❌ 服务启动失败，尝试直接启动进程..."
      
      # 备用方案：直接启动进程
      cd "$WORK_DIR"
      nohup node session-watcher.js > watcher.log 2>&1 &
      echo $! > "$PID_FILE"
      log "✅ 进程已启动（PID: $(cat $PID_FILE)）"
    fi
  fi
  
  # 检查进程
  if check_process; then
    local pid=$(pgrep -f "node session-watcher.js")
    log "✅ 监控器进程运行中（PID: $pid）"
  else
    log "❌ 监控器进程未运行"
  fi
  
  # 检查缓存新鲜度
  if check_cache_freshness; then
    log "✅ 缓存文件更新正常"
  else
    log "⚠️  缓存文件可能过期"
  fi
  
  log "🏁 健康检查完成"
  log ""
}

main
