# fsj 项目 Claude 配置

> AI赋能商家平台 - 上海璟滔文化科技有限公司

## 记忆系统 ⭐ 强制执行

**每次对话必须执行以下步骤**：

### 1. 对话开始时（强制）
必须先读取记忆文件，了解项目背景和上次工作内容：
```
C:\Users\99739\.claude\projects\e--Item-fsj\memory\MEMORY.md
```

### 2. 对话过程中
- 发现重要新知识 → 立即更新 MEMORY.md
- 发现重要变更 → 立即更新相关记忆文件
- 解决重要问题 → 记录解决方案

### 3. 对话结束时（强制）
必须更新 session-log.md 记录本次工作内容：
```
C:\Users\99739\.claude\projects\e--Item-fsj\memory\session-log.md
```

---

## 记忆文件结构

```
memory/
├── MEMORY.md          # 主索引（每次必读）
├── session-log.md     # 会话工作记录（每次结束必更新）
├── 12-dimensions.md   # 12维系统详解
├── structure.md       # 项目详细结构
├── tech-style.md      # 技术栈与代码风格
├── business.md        # 业务需求要点
└── vision.md          # 项目核心愿景
```

---

## 12维系统 Skills

已在 `.claude/skills/` 和 `.cursor/skills/` 中配置：

| Skill | 功能 | Workflow ID |
|------|------|-------------|
| fsj-search | 12维数据检索 | 7631184065437958170 |
| fsj-data-update | 通用数据更新 | 7631110623212486675 |
| fsj-tags | 全局标签管理 | 7630808620096536614 |
| hap-12wei-create | 12维数据创建 | 7631572188324069419 |
| hap-query | HAP数据查询 | - |

---

## 小粽 Agent 配置

- **rowid**: `1024efc4-27fd-4522-bf3c-e4ebc998393c`
- **密码**: `381644`

---

## 项目关键信息

### 子项目结构
- `webview/` - 像素画编辑器/画布
- `merchantDashboard/` - 商家后台管理系统
- `wxApp/` - 微信小程序原生
- `server.js` - WebSocket桥接服务（端口3011）
- `KnowledgeBase/` - 天干分类知识库

### 明道云集成
- MCP配置: `.cursor/mcp.json`
- API文件: `MingdaoYunAddAPI.js`, `MingdaoYunQueryAPI.js`, `MingdaoYunUpdateAPI.js`

---

## 重要约定

1. **中文编码问题**：Windows环境curl发送中文需用文件方式，确保UTF-8编码
2. **选项字段筛选**：必须使用选项Key(UUID)而非显示名称
3. **12维类型格式**："数字+类型名"，如"1技能"、"2想法"
4. **字段名注意**：`fabuzhe`（不是`fabudzhe`）

---

*此文件确保每次对话自动加载记忆系统*