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
