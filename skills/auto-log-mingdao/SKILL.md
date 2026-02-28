# Auto-Log to MingDaoYun - 自动记录对话

## 功能
每次 OpenClaw 回复后，自动将完整回复内容记录到明道云对话系统。

## 配置
在 `~/.openclaw/config.json` 或环境变量中启用：

```json
{
  "autoLog": {
    "enabled": true,
    "userId": "master",
    "skill": "/home/admin/openclaw/workspace/skills/mingdao-chat/auto-hook.js"
  }
}
```

## 使用方法

### 方式 1: 在回复中自动调用

```javascript
// 在 OpenClaw 的回复处理中添加
const autoHook = require('/home/admin/openclaw/workspace/skills/mingdao-chat/auto-hook.js');

// 启用自动记录
autoHook.enable('master');

// 每次发送回复后
await autoHook.recordReply(replyContent);
```

### 方式 2: 使用 message tool 钩子

创建 `~/.openclaw/hooks/message-sent.js`:

```javascript
const autoHook = require('/home/admin/openclaw/workspace/skills/mingdao-chat/auto-hook.js');

export async function onMessageSent(message) {
  if (message.fromMe && autoHook.isEnabled) {
    await autoHook.recordReply(message.content);
  }
}
```

## 原理

1. OpenClaw 发送消息
2. 钩子拦截发送完成事件
3. 自动调用 `recordReply()` 记录到明道云
4. 不阻塞主流程，异步记录

## 日志

```
📝 自动记录已启用
   用户：master
✅ 已记录：xiaozong → master (消息 ID: xxx)
```
