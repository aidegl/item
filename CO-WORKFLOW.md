# 🤝 小粽 ↔ 主人 协同工作流程

## 一、仓库结构

```
https://github.com/aidegl/item
├── main              # 主分支（主人使用）
├── ai-xiaozong       # 小粽的分支（我使用）
├── ai-xiaozong-fixed # 小粽修复分支（备用）
└── 其他分支...
```

---

## 二、分支分工

| 分支 | 使用者 | 用途 |
|------|--------|------|
| **main** | 主人 | 主分支，最终合并 |
| **ai-xiaozong** | 小粽 (我) | 我的日常工作分支 |
| **ai-xiaozong-fixed** | 小粽 (我) | 修复问题时使用 |

---

## 三、协同流程

### 3.1 我（小粽）的工作流程

```bash
# 1. 切换到我的分支
git checkout ai-xiaozong

# 2. 拉取最新代码
git pull origin ai-xiaozong

# 3. 进行工作（修改/创建文件）
# ... 编辑文件 ...

# 4. 提交更改
git add .
git commit -m "小粽：完成 XXX 任务"

# 5. 推送到远程
git push origin ai-xiaozong

# 6. 通知主人检查
# （通过消息或其他方式）
```

### 3.2 主人的工作流程

```bash
# 1. 在 main 分支工作
git checkout main
git pull origin main

# 2. 查看小粽的工作
git fetch origin
git diff main..ai-xiaozong

# 3. 合并小粽的工作（如果满意）
git merge ai-xiaozong

# 4. 推送到远程
git push origin main
```

---

## 四、文件组织

### 4.1 我的工作内容

在 `ai-xiaozong` 分支中，我可以：

1. **创建新文件** - 文档、脚本、配置等
2. **修改现有文件** - 更新、修复、优化
3. **删除文件** - 清理不需要的文件

### 4.2 推荐目录结构

```
ai-xiaozong/
├── xiaozong.md          # 我的个人文件
├── tasks/               # 任务相关
│   ├── todo.md          # 待办事项
│   ├── done.md          # 已完成
│   └── pending.md       # 待确认
├── docs/                # 文档
├── scripts/             # 脚本
└── config/              # 配置
```

---

## 五、提交规范

### 5.1 Commit Message 格式

```
小粽：[类型] 描述

[可选：详细说明]
```

### 5.2 类型说明

| 类型 | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `小粽：[feat] 添加自动通信脚本` |
| **fix** | 修复 | `小粽：[fix] 修复 Webhook 发送失败` |
| **docs** | 文档 | `小粽：[docs] 更新协同工作流程` |
| **refactor** | 重构 | `小粽：[refactor] 优化代码结构` |
| **chore** | 杂项 | `小粽：[chore] 更新配置文件` |

### 5.3 示例

```bash
git commit -m "小粽：[feat] 添加双节点自动通信脚本"
git commit -m "小粽：[fix] 修复 GitHub 令牌配置"
git commit -m "小粽：[docs] 创建协同工作流程文档"
```

---

## 六、同步机制

### 6.1 定期同步（推荐）

```bash
# 每小时同步一次
0 * * * * cd /home/admin/openclaw/workspace/item-repo && git pull origin ai-xiaozong

# 或者每次工作前后同步
git pull origin ai-xiaozong  # 工作前
git push origin ai-xiaozong  # 工作后
```

### 6.2 自动同步脚本

```bash
#!/bin/bash
# git_sync.sh

cd /home/admin/openclaw/workspace/item-repo

# 切换到小粽分支
git checkout ai-xiaozong

# 拉取最新
git pull origin ai-xiaozong

# 提交更改（如果有）
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "小粽：[chore] 自动同步 $(date +%Y-%m-%d_%H:%M:%S)"
    git push origin ai-xiaozong
    echo "✅ 同步完成"
else
    echo "✅ 没有更改"
fi
```

---

## 七、冲突处理

### 7.1 如果发生冲突

```bash
# 1. 拉取时发生冲突
git pull origin ai-xiaozong

# 2. 查看冲突文件
git status

# 3. 手动解决冲突
# 编辑冲突文件，解决 <<< === >>> 标记

# 4. 标记解决
git add <文件名>

# 5. 完成合并
git commit -m "小粽：[fix] 解决合并冲突"

# 6. 推送
git push origin ai-xiaozong
```

### 7.2 避免冲突的建议

1. **工作前拉取** - 每次工作前先 `git pull`
2. **频繁推送** - 完成小任务就推送
3. **文件隔离** - 不同文件减少冲突可能
4. **及时沟通** - 告诉主人你在修改什么

---

## 八、通知机制

### 8.1 我完成任务后

1. **推送代码** → `git push origin ai-xiaozong`
2. **发送消息** → 通过 EvoMap 告诉主人
3. **更新状态** → 修改 `tasks/done.md`

### 8.2 主人可以

1. **查看差异** → `git diff main..ai-xiaozong`
2. **测试验证** → 在测试环境验证
3. **合并代码** → `git merge ai-xiaozong`
4. **反馈意见** → 通过消息或 issue

---

## 九、日常操作示例

### 9.1 我开始工作

```bash
# 1. 切换到 item 仓库
cd /home/admin/openclaw/workspace/item-repo

# 2. 切换到我的分支
git checkout ai-xiaozong

# 3. 拉取最新代码
git pull origin ai-xiaozong

# 4. 开始工作...
```

### 9.2 我完成工作

```bash
# 1. 查看更改
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "小粽：[feat] 完成 XXX 功能"

# 4. 推送
git push origin ai-xiaozong

# 5. 通知主人
# "主人，我完成了 XXX 任务，请查看 ai-xiaozong 分支"
```

### 9.3 主人合并代码

```bash
# 1. 切换到 main
git checkout main

# 2. 拉取最新
git pull origin main

# 3. 合并小粽的分支
git merge ai-xiaozong

# 4. 推送
git push origin main
```

---

## 十、文件权限

| 文件/目录 | 小粽可写 | 主人可写 | 说明 |
|----------|---------|---------|------|
| `xiaozong.md` | ✅ | ✅ | 我的个人文件 |
| `tasks/*` | ✅ | ✅ | 任务相关文件 |
| `docs/*` | ✅ | ✅ | 文档 |
| `scripts/*` | ✅ | ✅ | 脚本 |
| `main` 分支 | ❌ | ✅ | 我只在 ai-xiaozong 工作 |

---

## 十一、快速参考

### 小粽常用命令

```bash
# 切换到我的分支
git checkout ai-xiaozong

# 拉取最新
git pull origin ai-xiaozong

# 提交更改
git add . && git commit -m "小粽：[chore] 更新" && git push origin ai-xiaozong

# 查看状态
git status

# 查看历史
git log --oneline -10
```

### 主人常用命令

```bash
# 查看小粽的工作
git diff main..ai-xiaozong

# 合并小粽的分支
git checkout main && git merge ai-xiaozong && git push origin main

# 回滚（如果需要）
git reset --hard HEAD~1
```

---

## 十二、总结

### ✅ 协同原则

1. **分支隔离** - 我在 `ai-xiaozong`，主人在 `main`
2. **定期同步** - 工作前后都拉取最新代码
3. **清晰提交** - Commit message 说明做了什么
4. **及时沟通** - 完成任务后通知主人
5. **冲突避免** - 频繁推送，文件隔离

### 🎯 工作流程

```
小粽：拉取 → 工作 → 提交 → 推送 → 通知
                          ↓
主人：              查看 → 测试 → 合并 → 推送
```

---

**这样我们就可以高效协同工作了！** 🤝

有任何疑问随时告诉我！🚀
