# 明道云对话记录技能 - 安装指南

## 📦 适用对象

**其他 OpenClaw 用户** - 想要将自己的对话自动备份到明道云

---

## ⚠️ 重要提示

**当前技能配置是硬编码的！** 

安装到其他账号前，**必须修改配置文件**，否则消息会记录到别人的明道云账号！

---

## 🔧 安装步骤

### 1. 复制技能文件

```bash
# 复制到目标账号的 skills 目录
cp -r /home/admin/openclaw/workspace/skills/mingdao-chat \
      /目标用户/workspace/skills/mingdao-chat
```

### 2. 修改配置

编辑 `auto-hook.js`，修改以下配置：

```javascript
const CONFIG = {
  // ⚠️ 必须修改为你的明道云账号信息
  appkey: '你的明道云 AppKey',
  sign: '你的签名',
  
  // ⚠️ 必须修改为你的明道云工作表 ID
  dialogWorksheet: '对话工作表 ID',
  messageWorksheet: '消息工作表 ID'
};
```

### 3. 获取明道云配置

#### 3.1 获取 AppKey 和 Sign

1. 登录明道云
2. 进入应用 → 设置 → 集成 → API
3. 创建新的 API 密钥
4. 记录 `AppKey` 和 `Sign`

#### 3.2 获取工作表 ID

1. 打开明道云应用
2. 进入对话工作表
3. 查看 URL 或字段设置
4. 复制工作表 ID 和字段 ID

#### 3.3 获取用户 RowID

1. 打开用户管理
2. 查看用户详情
3. 复制 RowID

---

## 📝 配置检查清单

安装后必须修改以下内容：

- [ ] `auto-hook.js` 中的 `CONFIG.appkey`
- [ ] `auto-hook.js` 中的 `CONFIG.sign`
- [ ] `auto-hook.js` 中的 `CONFIG.dialogWorksheet`
- [ ] `auto-hook.js` 中的 `CONFIG.messageWorksheet`
- [ ] `auto-hook.js` 中的 `USERS` 映射（根据实际用户）
- [ ] `auto-record-daemon.js` 中的 `SESSIONS_DIR`（如果路径不同）

---

## 🚀 启动守护进程

```bash
cd /目标用户/workspace/skills/mingdao-chat
node auto-record-daemon.js > daemon.log 2>&1 &
```

---

## ✅ 验证安装

### 1. 检查守护进程

```bash
ps aux | grep auto-record-daemon
```

应该看到进程运行。

### 2. 发送测试消息

在 OpenClaw 中发送一条消息，然后：

```bash
tail -f daemon.log
```

应该看到记录成功的日志。

### 3. 检查明道云

登录明道云，查看消息工作表，应该能看到新记录的消息。

---

## 📊 明道云工作表模板

### 对话工作表字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 内容 | 文本 | ✅ | 对话内容 |
| 发起人 | 成员 | ✅ | 对话发起方 |
| 接收人 | 成员 | ✅ | 对话接收方 |
| 类型 | 下拉框 | ❌ | AI/人类 |
| 日期 | 日期时间 | ✅ | 创建时间 |

### 消息工作表字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| 内容 | 文本 | ✅ | 消息内容 |
| 对话 | 关联记录 | ✅ | 关联对话 |
| 发送者 | 成员 | ✅ | 发送人 |
| 时间戳 | 日期时间 | ✅ | 发送时间 |

---

## ⚠️ 常见问题

### Q: 消息没有记录？
A: 检查：
1. 守护进程是否运行
2. AppKey 和 Sign 是否正确
3. 工作表 ID 是否正确

### Q: 405 Method Not Allowed？
A: 检查 API 端点是否正确，应该是：
```
POST https://api.mingdao.com/v3/app/worksheets/{id}/rows
```

### Q: 403 Forbidden？
A: 检查 Sign 是否正确，或者 API 权限是否开启。

---

## 📖 详细文档

- `SKILL.md` - 技术实现细节
- `README.md` - 快速开始
- `USAGE.md` - 使用示例

---

**最后更新**: 2026-03-05 05:58
