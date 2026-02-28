# OpenClaw → 明道云 自动记录系统 - 完整技术路径

## 📊 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     OpenClaw 会话系统                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  会话文件：~/.openclaw/agents/main/sessions/*.jsonl     │   │
│  │  - 实时写入 AI 回复（JSONL 格式）                          │   │
│  │  - 每行一个 JSON 对象（type, message, timestamp）         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (文件监控)
┌─────────────────────────────────────────────────────────────────┐
│              session-watcher.js (监控器)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 每 2 秒轮询会话文件                                      │   │
│  │  - 提取 assistant 角色的消息                               │   │
│  │  - 时间戳对比（只处理新增）                                │   │
│  │  - 缓存机制（.session-cache.json）                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (调用)
┌─────────────────────────────────────────────────────────────────┐
│              auto-hook.js (明道云 API 封装)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - recordReply(content, userId)                          │   │
│  │  - 对话 ID 缓存（.dialog-cache.json）                      │   │
│  │  - 用户映射（xiaozong → master）                          │   │
│  │  - 完整 Markdown 内容保留                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP POST)
┌─────────────────────────────────────────────────────────────────┐
│                    明道云 API                                    │
│  POST https://api.mingdao.com/v3/app/worksheets/68da906bd34347b006235da4/rows
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - 对话消息表：68da906bd34347b006235da4                  │   │
│  │  - 字段：neirong(内容), duihua(对话 ID), yonghu(用户 ID) │   │
│  │  │  - 完整存储 Markdown（\n 标准 JSON 转义）                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ 文件结构

```
/home/admin/openclaw/workspace/skills/mingdao-chat/
├── index.js              # 核心 API（创建对话、记录消息）
├── auto-hook.js          # 自动记录钩子（recordReply）
├── auto-record.js        # 自动记录器（带对话 ID 缓存）
├── session-watcher.js    # ⭐ 会话监控器（新增！）
├── record-reply.js       # 手动记录脚本（备用）
├── .session-cache.json   # ⭐ 会话进度缓存
├── .dialog-cache.json    # 对话 ID 缓存
├── WATCHER.md            # 监控器使用说明
└── README.md             # 完整文档
```

---

## 🔧 核心实现细节

### 1. 会话文件监控（session-watcher.js）

**关键代码逻辑：**

```javascript
// 配置
const CONFIG = {
  sessionsDir: '/home/admin/.openclaw/agents/main/sessions',
  cacheFile: path.join(__dirname, '.session-cache.json'),
  pollInterval: 2000,  // 2 秒检查一次
  userId: 'master'
};

// 状态
let state = {
  currentSessionId: null,
  lastMessageId: null,
  lastMessageTimestamp: 0,  // ⭐ 关键：最后处理的时间戳
  lastFileSize: 0,
  pendingMessages: []
};

// 主循环
async function watchSession() {
  loadCache();  // 加载缓存
  autoHook.enable(CONFIG.userId);
  
  while (true) {
    const sessionFile = getCurrentSessionFile();
    const newMessages = readNewMessages(sessionFile);
    
    for (const msg of newMessages) {
      await recordMessage(msg);  // 记录到明道云
      await sleep(500);  // 避免 API 限流
    }
    
    await sleep(CONFIG.pollInterval);
  }
}

// 读取新消息（增量！）
function readNewMessages(sessionFile) {
  const content = fs.readFileSync(sessionFile, 'utf-8');
  const lines = content.trim().split('\n').filter(l => l.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);
    
    // 只处理 assistant 消息
    if (entry.type === 'message' && entry.message?.role === 'assistant') {
      // ⭐ ISO 字符串转毫秒时间戳
      const entryTimestamp = new Date(entry.timestamp).getTime();
      
      // ⭐ 只处理时间戳大于缓存的消息
      if (entryTimestamp > state.lastMessageTimestamp) {
        newMessages.push({
          id: entry.id,
          content: extractText(entry),
          timestamp: entryTimestamp
        });
      }
    }
  }
  
  return newMessages;
}
```

**时间戳处理：**
- 会话文件：`"2026-02-28T12:52:45.123Z"` (ISO 字符串)
- 缓存存储：`1772283165123` (毫秒时间戳)
- 转换：`new Date(isoString).getTime()`

---

### 2. 缓存机制（.session-cache.json）

**缓存内容：**
```json
{
  "currentSessionId": "7681ef60-4ded-4553-bc19-c4bf6725fb1f.jsonl",
  "lastMessageId": "c0795cd6",
  "lastMessageTimestamp": 1772283166918,
  "lastFileSize": 0,
  "pendingMessages": []
}
```

**作用：**
- `lastMessageTimestamp` - 增量处理的关键
- `currentSessionId` - 检测会话切换
- 进程重启后从上次位置继续

**保存时机：**
- 每次处理完新消息后自动保存
- 进程退出时（SIGINT）优雅保存

---

### 3. 明道云 API 调用（auto-hook.js）

**请求体结构：**
```javascript
{
  "fields": [
    {
      "id": "neirong",
      "value": "完整的 Markdown 内容\n\n## 标题\n- 列表\n```code```"
    },
    {
      "id": "duihua",
      "value": ["c10023ce-567f-4107-b44f-7fa5bd6ddd0d"]  // 对话 ID
    },
    {
      "id": "yonghu",
      "value": ["7548a483-2b5b-4de0-be06-63b318ca52c4"]  // 用户 RowID
    },
    {
      "id": "riqi",
      "value": 1772283166918  // 时间戳（毫秒）
    }
  ]
}
```

**HTTP 请求：**
```javascript
POST https://api.mingdao.com/v3/app/worksheets/68da906bd34347b006235da4/rows
Headers:
  - Authorization: Bearer <SIGN>
  - Content-Type: application/json
```

**Markdown 处理：**
- ✅ 原始内容直接发送
- ✅ `\n` 是标准 JSON 转义（不是 bug！）
- ✅ 使用 `jq -r` 查看实际换行

---

### 4. 对话 ID 缓存（.dialog-cache.json）

**缓存内容：**
```json
{
  "master:xiaozong": "8e2ff443-8348-4f3d-8bd1-2f988690136e",
  "ff074b4e-92ad-466e-9018-d3a7d150e8ee:xiaozong": "c10023ce-567f-4107-b44f-7fa5bd6ddd0d"
}
```

**作用：**
- 避免重复创建对话
- 同一对话的所有消息关联到同一个对话 ID
- 键格式：`{receiver}:{sender}`

---

## 🚀 部署流程

### 1. 启动监控器

```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node session-watcher.js &
```

### 2. 后台运行（生产环境）

```bash
# 方式 1: nohup
nohup node session-watcher.js > session-watcher.log 2>&1 &
echo $! > session-watcher.pid

# 方式 2: systemd（推荐）
sudo tee /etc/systemd/user/openclaw-watcher.service > /dev/null <<'EOF'
[Unit]
Description=OpenClaw MingDaoYun Session Watcher
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/admin/openclaw/workspace/skills/mingdao-chat
ExecStart=/usr/bin/node /home/admin/openclaw/workspace/skills/mingdao-chat/session-watcher.js
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable openclaw-watcher
systemctl --user start openclaw-watcher
```

### 3. 查看日志

```bash
# 实时日志
tail -f session-watcher.log

# systemd 日志
journalctl --user -u openclaw-watcher -f
```

### 4. 停止服务

```bash
# nohup 模式
kill $(cat session-watcher.pid)

# systemd 模式
systemctl --user stop openclaw-watcher
```

---

## 📊 数据流示例

### 用户发送消息
```
用户：测试一条吧
```

### OpenClaw 生成回复
```json
{
  "type": "message",
  "id": "c0795cd6-...",
  "message": {
    "role": "assistant",
    "content": [{"type": "text", "text": "好的！这是一条测试消息。..."}]
  },
  "timestamp": "2026-02-28T12:50:41.123Z"
}
```

### 监控器检测
```
📬 发现 1 条新消息
📝 记录消息：c0795cd6... (54 字符) @8:50:41 PM
```

### 发送到明道云
```json
POST /v3/app/worksheets/68da906bd34347b006235da4/rows
{
  "fields": [
    {"id": "neirong", "value": "好的！这是一条测试消息。..."},
    {"id": "duihua", "value": ["c10023ce-567f-4107-b44f-7fa5bd6ddd0d"]},
    {"id": "yonghu", "value": ["7548a483-2b5b-4de0-be06-63b318ca52c4"]},
    {"id": "riqi", "value": 1772283159405}
  ]
}
```

### 明道云存储
```
✅ 已记录：xiaozong → master (消息 ID: 17b7e2ff-...)
```

---

## ⚠️ 关键注意事项

### 1. 时间戳格式
- ❌ 错误：直接比较字符串 `"2026-02-28T12:50:41.123Z"` 和数字 `1772283159405`
- ✅ 正确：`new Date(isoString).getTime()` 转换为毫秒时间戳

### 2. 缓存更新时机
- ✅ 每次处理完新消息后立即保存
- ✅ 避免重复处理同一条消息

### 3. Markdown 处理
- ✅ 原始内容直接发送
- ✅ `\n` 是标准 JSON 转义
- ✅ 明道云 Text 字段支持多行

### 4. API 限流
- ✅ 每条消息间隔 500ms
- ✅ 避免批量发送导致限流

### 5. 会话切换
- ✅ 检测新会话文件
- ✅ 重置 `lastMessageId`
- ✅ 保留 `lastMessageTimestamp`

---

## 🔍 调试技巧

### 1. 查看当前缓存
```bash
cat /home/admin/openclaw/workspace/skills/mingdao-chat/.session-cache.json
```

### 2. 查看会话文件最新时间戳
```bash
tail -1 ~/.openclaw/agents/main/sessions/*.jsonl | jq -r '.timestamp'
```

### 3. 转换为毫秒时间戳
```bash
date -d "2026-02-28T12:50:41.123Z" +%s%3N
```

### 4. 计算时间差
```bash
# 缓存时间戳
CACHE_TS=$(jq -r '.lastMessageTimestamp' .session-cache.json)
# 会话最新时间戳
SESSION_TS=$(tail -1 ~/.openclaw/agents/main/sessions/*.jsonl | jq -r '.timestamp' | xargs -I {} date -d {} +%s%3N)
# 差值
echo $((SESSION_TS - CACHE_TS))  # 毫秒
```

### 5. 查看未处理消息数量
```bash
node -e "
const fs = require('fs');
const cache = JSON.parse(fs.readFileSync('.session-cache.json'));
const content = fs.readFileSync('/home/admin/.openclaw/agents/main/sessions/7681ef60-4ded-4553-bc19-c4bf6725fb1f.jsonl', 'utf-8');
const lines = content.trim().split('\n').filter(l => l.trim());
let count = 0;
lines.forEach(l => {
  try {
    const e = JSON.parse(l);
    const ts = new Date(e.timestamp).getTime();
    if (e.type === 'message' && e.message?.role === 'assistant' && ts > cache.lastMessageTimestamp) {
      count++;
    }
  } catch(err) {}
});
console.log('未处理消息:', count);
"
```

---

## 📈 性能指标

### 当前配置
- **轮询间隔**: 2 秒
- **消息处理延迟**: < 3 秒（平均）
- **API 调用频率**: 每消息 1 次（间隔 500ms）
- **缓存大小**: ~200 bytes
- **内存占用**: ~65MB

### 优化建议
- 高频对话：可降低 `pollInterval` 到 1 秒
- 低频对话：可增加 `pollInterval` 到 5 秒
- 批量处理：积累多条消息后批量发送（需修改代码）

---

## 🎯 总结

### 技术路径
```
OpenClaw 会话文件 → session-watcher.js → auto-hook.js → 明道云 API
      ↓                    ↓                    ↓            ↓
   JSONL 实时写入      2 秒轮询 + 时间戳对比   recordReply   HTTP POST
```

### 核心创新
1. **文件监控** - 无需修改 OpenClaw 源码
2. **增量处理** - 时间戳对比，只处理新增
3. **缓存机制** - 进程重启后从上次位置继续
4. **完整保留** - Markdown 格式原封不动

### 优势
- ✅ 零侵入 - 不修改 OpenClaw 核心代码
- ✅ 高可靠 - 缓存机制保证不丢失
- ✅ 易维护 - 独立进程，易于调试
- ✅ 可扩展 - 可添加更多处理逻辑

---

**版本**: 1.0  
**创建时间**: 2026-02-28  
**状态**: ✅ 生产环境运行中
