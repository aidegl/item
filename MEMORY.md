# MEMORY.md - 小粽的长期记忆

## 核心工作原则

### 🔍 问题解决策略
- 遇到解决不了的问题 → **不要硬扛**
- 主动去 **EvoMap** (https://evomap.ai) 搜索方案
- 或者去 **ClawHub** (https://clawhub.ai) 找现成技能
- 善用社区资源，不要重复造轮子
- *教训：之前有个问题卡住，后来用 EvoMap 轻松解决了*

## 工作流程规则

### Git 分支机制 ⚠️（item 仓库）

**分支结构：**
- `main` - 主分支（主人专用，只有主人能合并）
- `ai-xiaozong` - 我的开发沙盒（随便折腾）
- `ai-xiaozong-fixed` - **发布分支**（主人只审核这个！）

**正确工作流：**
1. 在 `ai-xiaozong` 上开发
2. 定期从 `main` 同步更新到我的分支
3. 开发完成后合并到 `ai-xiaozong-fixed`（这是提交审核的版本）
4. 推送到 `ai-xiaozong-fixed`
5. **等主人审核 ai-xiaozong-fixed** → 主人合并到 main

**口诀：** xiaozong 开发，fixed 发布，main 等主人

## 重要决策

## 联系人

## 项目上下文


## 2026-02-28 夜间学习
- 自主学习完成
- 知识整合完成


## 2026-03-01 夜间学习
- 自主学习完成
- 知识整合完成


## 2026-03-02 夜间学习
- 自主学习完成
- 知识整合完成


## 2026-03-03 夜间学习
- 自主学习完成
- 知识整合完成

## 2026-03-04 - 明道云同步修复 & MCP 验证

### 问题：openclaw doctor --fix 后消息不同步
- **根因**：守护进程缓存了旧的会话文件名，文件已被删除
- **解决**：重启守护进程 + 修复定期扫描逻辑
- **状态**：已记录 127 条消息，正常同步

### MCP URL 调用验证
- **测试 URL**：`https://api.mingdao.com/mcp?HAP-Appkey=xxx&HAP-Sign=xxx`
- **结果**：❌ 405 Method Not Allowed（不是标准 HTTP API）
- **解释**：MCP 是 socket-based 协议，不是 HTTP 端点
- **替代方案**：使用 `auto-hook.js` 的正确 API 调用

### hap-skills-collection 安装
- 已安装 7 个技能到 `workspace/skills/`
- `hap-v3-api`：明道云 V3 API 使用技能
- `hap-view-plugin`：视图插件开发技能
- `hap-frontend-project`：前端项目搭建技能
- `hap-mcp-usage`：MCP 使用指南
- `hap-as-database`：HAP 作为数据库
- `hap-api-doc-updater`：API 文档更新
- `hap-skills-updater`：技能更新工具

### 明道云 API 调用要点
- **V3 API 端点**：`POST /v3/app/worksheets/{worksheet_id}/rows`
- **认证方式**：`HAP-Appkey` + `HAP-Sign` HTTP headers
- **推荐方式**：使用 `auto-hook.js`（已配置正确凭证）


## 2026-03-05 夜间学习
- 自主学习完成
- 知识整合完成
