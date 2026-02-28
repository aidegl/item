# openclaw-backup - OpenClaw 配置备份技能

## 功能描述

自动备份 OpenClaw 配置文件和记忆文件到 Git 仓库，支持定时任务。

## 使用场景

- OpenClaw 崩溃后快速恢复配置
- 多实例配置同步
- 配置版本控制
- 定期备份记忆文件

## 文件结构

```
skills/openclaw-backup/
├── SKILL.md           # 技能说明（本文件）
├── backup.sh          # 备份脚本
├── restore.sh         # 恢复脚本
└── config.json        # 配置文件
```

## 使用方法

### 手动备份

```bash
./skills/openclaw-backup/backup.sh
```

### 设置定时备份（每天凌晨 2 点）

```bash
./skills/openclaw-backup/backup.sh --install-cron
```

### 恢复配置

```bash
./skills/openclaw-backup/restore.sh
```

## 配置项

编辑 `config.json`：

```json
{
  "workspace": "/home/admin/openclaw/workspace",
  "knowledge_base": "/home/admin/openclaw/workspace/KnowledgeBase",
  "backup_dir": "config/xiaozong",
  "files": [
    "SOUL.md",
    "AGENTS.md",
    "USER.md",
    "TOOLS.md",
    "IDENTITY.md",
    "HEARTBEAT.md"
  ],
  "memory_dir": "memory",
  "cron_time": "0 2 * * *"
}
```

## 备份内容

- SOUL.md - 灵魂定位
- AGENTS.md - 工作流程
- USER.md - 用户信息
- TOOLS.md - 工具配置
- IDENTITY.md - 身份配置
- HEARTBEAT.md - 心跳配置
- memory/*.md - 所有记忆文件

## 恢复流程

1. 克隆 KnowledgeBase 仓库
2. 运行 restore.sh
3. 重启 OpenClaw

## 注意事项

- 确保 Git 已配置用户信息
- 确保有 KnowledgeBase 仓库推送权限
- 首次使用需手动运行一次备份

## 扩展性

此技能可复用于：
- 其他 OpenClaw 实例（修改 config.json）
- 其他备份目录（如 config/feng、config/cloud）
- 其他 Git 仓库
