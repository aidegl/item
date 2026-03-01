# 明道云对话记录 - 使用指南

## 🎯 功能
自动将 OpenClaw 对话备份到明道云，包括：
- ✅ 用户发送的消息
- ✅ AI 回复的消息
- ✅ 完整对话历史

---

## 🚀 快速开始

### 1. 启动守护进程
```bash
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node auto-record-daemon.js > daemon.log 2>&1 &
```

### 2. 验证运行
```bash
ps aux | grep auto-record-daemon
tail -f daemon.log
```

### 3. 测试
在 OpenClaw WebUI 发送消息，然后去明道云查看。

---

## 📊 架构

```
┌─────────────────┐
│ OpenClaw 会话    │
│ (.jsonl 文件)    │
└────────┬────────┘
         │ 监控文件变化
         ↓
┌─────────────────┐
│ auto-record-    │
│ daemon.js       │
└────────┬────────┘
         │ 调用
         ↓
┌─────────────────┐
│ auto-hook.js    │
└────────┬────────┘
         │ API 请求
         ↓
┌─────────────────┐
│ 明道云          │
└─────────────────┘
```

---

## 📁 文件说明

| 文件 | 作用 |
|------|------|
| `auto-hook.js` | 明道云 API 封装 |
| `auto-record-daemon.js` | 会话监控守护进程 |
| `index.js` | 手动发送消息接口 |
| `SKILL.md` | 技术文档 |
| `USAGE.md` | 详细使用说明 |

---

## 🔧 配置

修改 `auto-hook.js` 中的配置：

```javascript
const CONFIG = {
  appkey: '你的明道云 AppKey',
  sign: '你的签名',
  dialogWorksheet: '对话工作表 ID',
  messageWorksheet: '消息工作表 ID'
};
```

---

## 📍 明道云工作表

登录后访问：
- **对话工作表**: `68da90934256d51497bb9ff8`
- **消息工作表**: `68da906bd34347b006235da4`

---

## ⚠️ 常见问题

### Q: 消息没有记录到明道云？
A: 检查守护进程是否运行：
```bash
ps aux | grep auto-record-daemon
```

### Q: 明道云看不到消息？
A: 检查工作表 ID 是否正确，字段 ID 是否匹配。

### Q: 如何重启守护进程？
A: 
```bash
pkill -9 -f auto-record-daemon
node auto-record-daemon.js > daemon.log 2>&1 &
```

---

## 📖 详细文档

- `SKILL.md` - 技术实现细节
- `USAGE.md` - 完整使用说明

---

**最后更新**: 2026-03-01 20:08
