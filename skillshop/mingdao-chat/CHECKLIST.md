# 明道云对话记录技能 - 安装包检查报告

**检查时间**: 2026-03-05 05:58  
**检查目的**: 确保其他账号安装后能正常通信

---

## ✅ 文件清单

### 核心功能文件
| 文件 | 大小 | 作用 | 状态 |
|------|------|------|------|
| `auto-hook.js` | 8.0K | 明道云 API 封装 | ✅ 正常 |
| `auto-record-daemon.js` | 8.2K | 会话监控守护进程 | ✅ 正常 |
| `index.js` | 7.5K | 手动发送消息接口 | ✅ 正常 |
| `send-queue.js` | 2.7K | 消息队列处理 | ✅ 正常 |
| `cron-check-inject.js` | 6.9K | 定时消息检查 | ✅ 正常 |

### 文档文件
| 文件 | 大小 | 作用 | 状态 |
|------|------|------|------|
| `SKILL.md` | 3.9K | 技术实现文档 | ✅ 已更新 |
| `README.md` | 5.0K | 快速开始指南 | ✅ 已更新 |
| `USAGE.md` | 3.2K | 使用示例 | ✅ 正常 |
| `INSTALL.md` | 3.4K | 🆕 安装指南 | ✅ 新增 |

### 配置辅助文件
| 文件 | 大小 | 作用 | 状态 |
|------|------|------|------|
| `config.example.js` | 2.1K | 🆕 配置模板 | ✅ 新增 |
| `check-config.js` | 2.8K | 🆕 配置检查工具 | ✅ 新增 |

### 状态文件（运行时生成）
| 文件 | 作用 | 说明 |
|------|------|------|
| `.dialog-cache.json` | 对话 ID 缓存 | 运行时自动生成 |
| `.record-daemon-cache.json` | 守护进程缓存 | 运行时自动生成 |
| `.check-state-cron.json` | Cron 状态 | 运行时自动生成 |
| `.last-check.json` | 最后检查时间 | 运行时自动生成 |
| `daemon.log` | 守护进程日志 | 运行时自动生成 |

---

## 🔧 其他用户安装流程

### 步骤 1: 复制技能
```bash
cp -r /home/admin/openclaw/workspace/skills/mingdao-chat \
      /目标用户/workspace/skills/mingdao-chat
```

### 步骤 2: 阅读安装指南
```bash
cat /目标用户/workspace/skills/mingdao-chat/INSTALL.md
```

### 步骤 3: 检查配置
```bash
cd /目标用户/workspace/skills/mingdao-chat
node check-config.js
```

**预期输出：**
```
❌ AppKey: 未配置或配置错误
   💡 应该是明道云 API 的 AppKey
   📝 当前值：b37a969f03b3cf0b（这是小粽的，不是你的！）
```

### 步骤 4: 修改配置

编辑 `auto-hook.js`，修改以下部分：

```javascript
const CONFIG = {
  appkey: '你的 AppKey',      // ⚠️ 必须修改
  sign: '你的 Sign',          // ⚠️ 必须修改
  dialogWorksheet: '你的工作表 ID',    // ⚠️ 必须修改
  messageWorksheet: '你的工作表 ID',   // ⚠️ 必须修改
  // ...
};

const USERS = {
  xiaozong: '你的 AI 助手 RowID',  // ⚠️ 必须修改
  feng: '你的用户 RowID',         // ⚠️ 必须修改
  master: '你的用户 RowID'         // ⚠️ 必须修改
};
```

### 步骤 5: 再次检查
```bash
node check-config.js
```

**预期输出：**
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

### 步骤 7: 验证
```bash
ps aux | grep auto-record-daemon
tail -f daemon.log
```

---

## 📋 配置检查清单

其他用户安装时必须修改以下内容：

- [ ] `auto-hook.js` 中的 `CONFIG.appkey`
- [ ] `auto-hook.js` 中的 `CONFIG.sign`
- [ ] `auto-hook.js` 中的 `CONFIG.dialogWorksheet`
- [ ] `auto-hook.js` 中的 `CONFIG.messageWorksheet`
- [ ] `auto-hook.js` 中的字段 ID 映射
- [ ] `auto-hook.js` 中的 `USERS` 映射
- [ ] `auto-record-daemon.js` 中的 `SESSIONS_DIR`（如果路径不同）

---

## 🚨 安全提醒

1. **不要上传凭证** - 包含真实 AppKey/Sign 的文件不要上传到公开仓库
2. **使用 .gitignore** - 已自动忽略状态文件和日志
3. **定期轮换密钥** - 建议定期更新明道云 API 密钥

---

## ✅ 验证测试

安装完成后，进行以下测试：

### 测试 1: 守护进程运行
```bash
ps aux | grep auto-record-daemon
# 应该看到进程运行
```

### 测试 2: 发送测试消息
在 OpenClaw 中发送一条消息，检查日志：
```bash
tail -20 daemon.log
# 应该看到 "✅ 已记录" 的日志
```

### 测试 3: 检查明道云
登录明道云，查看消息工作表，应该能看到新记录的消息。

---

## 📞 问题排查

如果遇到问题：

1. 查看日志：`tail -f daemon.log`
2. 检查配置：`node check-config.js`
3. 验证 API：手动调用明道云 API 测试凭证
4. 查看文档：`SKILL.md`、`INSTALL.md`

---

## 📊 当前配置状态（小粽的）

```
✅ AppKey: b37a969f03b3cf0b
✅ Sign: MTNjNDYyZDIxMGM4NGU4...
✅ 对话工作表：68da90934256d51497bb9ff8
✅ 消息工作表：68da906bd34347b006235da4
✅ 用户映射：
   - xiaozong: 7548a483-2b5b-4de0-be06-63b318ca52c4
   - feng: adde88c8-de91-4484-9a5e-070f50079ed8
   - master: ff074b4e-92ad-466e-9018-d3a7d150e8ee
```

⚠️ **这些是小粽的配置，其他用户必须替换为自己的！**

---

**检查完成** ✅  
技能包已准备就绪，可以安全分发给其他用户安装。
