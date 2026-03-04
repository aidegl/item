# MingDaoYun Chat Skill - 明道云对话记录

## 功能
将 OpenClaw 对话自动备份到明道云，支持：
- ✅ 用户消息自动记录
- ✅ AI 回复自动记录
- ✅ 完整对话历史保存

## ⚠️ 重要提示

**当前配置是硬编码的！** 

其他用户安装前必须修改配置文件，否则消息会记录到别人的明道云账号！

👉 **安装指南**: 见 `INSTALL.md`  
👉 **配置模板**: 见 `config.example.js`  
👉 **获取用户 RowID**: 运行 `node get-user-info.js` ⭐

## 架构
```
OpenClaw 会话文件 → auto-record-daemon.js → auto-hook.js → 明道云 API
```

## 核心文件
| 文件 | 作用 |
|------|------|
| `auto-hook.js` | 明道云 API 封装（创建对话、消息） |
| `auto-record-daemon.js` | 会话监控守护进程（自动记录） |
| `index.js` | 手动发送消息接口 |
| `INSTALL.md` | 📦 其他用户安装指南 |
| `config.example.js` | 📝 配置模板（复制后修改） |

## 当前配置（小粽的）
```javascript
const CONFIG = {
  appkey: 'b37a969f03b3cf0b',
  sign: 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==',
  dialogWorksheet: '68da90934256d51497bb9ff8',      // 对话工作表
  messageWorksheet: '68da906bd34347b006235da4'     // 消息工作表
};
```

## 用户映射
| 角色 | RowID |
|------|-------|
| 小粽 (AI) | `7548a483-2b5b-4de0-be06-63b318ca52c4` |
| 风 | `adde88c8-de91-4484-9a5e-070f50079ed8` |
| 主人 | `ff074b4e-92ad-466e-9018-d3a7d150e8ee` |

## 使用方法

### 自动记录（默认）
守护进程自动运行，无需手动操作：
```bash
# 启动守护进程
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node auto-record-daemon.js > daemon.log 2>&1 &
```

### 手动发送消息
```javascript
const { sendMessage } = require('./index.js');

await sendMessage({
  sender: 'xiaozong',
  receiver: 'master',
  content: '消息内容'
});
```

## 明道云工作表结构

### 对话工作表 (68da90934256d51497bb9ff8)
| 字段 | ID | 说明 |
|------|------|------|
| 内容 | `68da90934256d51497bb9ff9` | 第一条消息内容 |
| 发起人 | `68da90c3432b11f7ba68cb6c` | 对话发起人 |
| 接收人 | `692bfbb1e22247ab9a654f3d` | 对话接收人 |
| 类型 | `692bb183e22247ab9a64a383` | 固定填 "AI" |
| 日期 | `692cf82fe22247ab9a67d78d` | 创建时间戳 |

### 消息工作表 (68da906bd34347b006235da4)
| 字段 | ID | 说明 |
|------|------|------|
| 内容 | `68da906bd34347b006235da5` | 消息完整内容 |
| 对话 | `68da9105d34347b006235df6` | 关联对话 ID |
| 用户 | `692d147433260875c1970b8a` | 发送者 ID |
| 日期 | `692d166992609b5d9de82b58` | 消息时间戳 |

## 注意事项
1. **字段 ID**：必须使用实际字段 ID，不是别名
2. **消息完整性**：保留 Markdown 格式，不摘要不删减
3. **对话唯一性**：两人之间只有一条对话，消息多条
4. **守护进程**：建议开机自启，保持常驻
5. **配置安全**：不要将包含真实凭证的代码上传到公开仓库

## 📦 其他用户安装

如果你是其他 OpenClaw 用户，想要安装此技能：

```bash
# 1. 复制技能到你的 workspace
cp -r /home/admin/openclaw/workspace/skills/mingdao-chat \
      你的 workspace/skills/mingdao-chat

# 2. 阅读安装指南
cat 你的 workspace/skills/mingdao-chat/INSTALL.md

# 3. 使用配置模板
cat 你的 workspace/skills/mingdao-chat/config.example.js

# 4. 修改 auto-hook.js 中的配置为你的明道云账号信息

# 5. 启动守护进程
cd 你的 workspace/skills/mingdao-chat
node auto-record-daemon.js > daemon.log 2>&1 &
```

详细步骤见 `INSTALL.md`。

## 调试命令
```bash
# 查看守护进程状态
ps aux | grep auto-record-daemon

# 查看实时日志
tail -f /home/admin/openclaw/workspace/skills/mingdao-chat/daemon.log

# 重启守护进程
pkill -9 -f auto-record-daemon
cd /home/admin/openclaw/workspace/skills/mingdao-chat
node auto-record-daemon.js > daemon.log 2>&1 &
```

---

**最后更新**: 2026-03-01 20:08
