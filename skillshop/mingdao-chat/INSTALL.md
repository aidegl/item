# 明道云对话记录技能 - 安装指南

## 📦 适用对象

**其他 OpenClaw 用户** - 想要将自己的对话自动备份到明道云

---

## ⚠️ 重要提示

**当前技能配置是硬编码的！** 

安装到其他账号前，**必须修改配置文件**，否则消息会记录到别人的明道云账号！

### 🔑 必须修改的配置

1. **明道云凭证** - AppKey 和 Sign
2. **明道云工作表 ID** - 对话和消息工作表
3. **用户 RowID 映射** - ⚠️ **这个最重要！**

---

## 🚀 快速安装流程

### 步骤 1: 复制技能文件

```bash
# 复制到你的 skills 目录
cp -r /home/admin/openclaw/workspace/skills/mingdao-chat \
      你的 workspace/skills/mingdao-chat
```

### 步骤 1.5: 配置 WebSocket 消息接收（可选）⭐

**如果你想接收其他客户端发送的实时消息**（如风的 WebSocket 消息）：

```bash
# 编辑 config.js
nano config.js

# 修改 WebSocket 配置
const WS_CONFIG = {
  WS_URL: 'ws://你的服务器IP/ws?client=你的客户端 ID',
  RECONNECT_INTERVAL: 5000
};
```

**详细说明**: 见 `WEBSOCKET-DEPLOY.md`

---

### 步骤 2: 运行用户信息获取工具 ⭐

**这一步最重要！** 获取你的用户 RowID：

```bash
cd 你的 workspace/skills/mingdao-chat
node get-user-info.js
```

脚本会显示详细的获取步骤，包括：
- ✅ 如何获取 OpenClaw 会话 ID
- ✅ 如何获取明道云用户 RowID
- ✅ 如何修改配置文件

### 步骤 3: 获取明道云配置

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

#### 3.3 获取用户 RowID（明道云）

1. 打开明道云应用
2. 进入**用户管理**工作表
3. 找到对应的用户（AI 助手、你自己）
4. 点击查看详情
5. 复制 **RowID**（UUID 格式，如：`7548a483-2b5b-4de0-be06-63b318ca52c4`）

**你需要获取：**
| 用户 | 说明 | 示例 |
|------|------|------|
| `xiaozong` | AI 助手的 RowID | `7548a483-2b5b-4de0-be06-63b318ca52c4` |
| `master` | 你的 RowID | `ff074b4e-92ad-466e-9018-d3a7d150e8ee` |
| `feng` | 其他用户（可选） | `adde88c8-de91-4484-9a5e-070f50079ed8` |

### 步骤 4: 修改配置

编辑 `auto-hook.js`，找到以下部分：

```javascript
const CONFIG = {
  // ⚠️ 必须修改为你的明道云账号信息
  appkey: '你的 AppKey',          // ⚠️ 替换这里
  sign: '你的 Sign',              // ⚠️ 替换这里
  
  // ⚠️ 必须修改为你的明道云工作表 ID
  dialogWorksheet: '对话工作表 ID',    // ⚠️ 替换这里
  messageWorksheet: '消息工作表 ID',   // ⚠️ 替换这里
  
  // 字段 ID（也需要替换为你的）
  fields: {
    dialog: {
      neirong: '内容字段 ID',       // ⚠️ 替换这里
      // ... 其他字段
    },
    message: {
      neirong: '内容字段 ID',       // ⚠️ 替换这里
      // ... 其他字段
    }
  }
};

// ⚠️ 用户映射 - 必须修改！
const USERS = {
  xiaozong: '你的 AI 助手 RowID',  // ⚠️ 替换这里
  feng: '风的 RowID（可选）',      // ⚠️ 替换这里
  master: '你的 RowID'             // ⚠️ 替换这里
};
```

### 步骤 5: 验证配置

运行配置检查工具：

```bash
node check-config.js
```

**预期输出（配置正确前）：**
```
❌ AppKey: 未配置或配置错误
   💡 应该是明道云 API 的 AppKey
   📝 当前值：b37a969f03b3cf0b（这是小粽的，不是你的！）
```

**预期输出（配置正确后）：**
```
✅ AppKey: 已配置
✅ Sign: 已配置
✅ 对话工作表 ID: 已配置
✅ 消息工作表 ID: 已配置
✅ 用户映射 (xiaozong): 已配置
✅ 用户映射 (feng): 已配置
✅ 用户映射 (master): 已配置

✅ 所有配置检查通过！
```

### 步骤 6: 启动守护进程

```bash
node auto-record-daemon.js > daemon.log 2>&1 &
```

### 步骤 7: 测试

```bash
# 检查守护进程
ps aux | grep auto-record-daemon

# 查看日志
tail -f daemon.log

# 发送测试消息（在 OpenClaw 中）
# 然后检查日志是否显示 "✅ 已记录"
```

---

## 📝 配置检查清单

安装后必须修改以下内容：

- [ ] `auto-hook.js` 中的 `CONFIG.appkey`
- [ ] `auto-hook.js` 中的 `CONFIG.sign`
- [ ] `auto-hook.js` 中的 `CONFIG.dialogWorksheet`
- [ ] `auto-hook.js` 中的 `CONFIG.messageWorksheet`
- [ ] `auto-hook.js` 中的字段 ID 映射
- [ ] `auto-hook.js` 中的 `USERS` 映射
- [ ] `auto-record-daemon.js` 中的 `SESSIONS_DIR`（如果路径不同）

---

## ⚠️ 常见问题

### Q: 消息没有记录？
A: 检查：
1. 守护进程是否运行：`ps aux | grep auto-record-daemon`
2. AppKey 和 Sign 是否正确
3. 工作表 ID 是否正确
4. 用户 RowID 是否正确

### Q: 405 Method Not Allowed？
A: 检查 API 端点是否正确，应该是：
```
POST https://api.mingdao.com/v3/app/worksheets/{id}/rows
```

### Q: 403 Forbidden？
A: 检查 Sign 是否正确，或者 API 权限是否开启。

### Q: 如何获取我的用户 RowID？
A: 运行 `node get-user-info.js` 查看详细说明。

---

## 📖 详细文档

- `SKILL.md` - 技术实现细节
- `README.md` - 快速开始
- `USAGE.md` - 使用示例
- `CHECKLIST.md` - 完整检查清单

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志：`tail -f daemon.log`
2. 检查配置：`node check-config.js`
3. 阅读文档：`SKILL.md`、`CHECKLIST.md`

---

**最后更新**: 2026-03-05 06:42
