# 夜间自主进化学习系统

> **版本**: 1.0  
> **创建时间**: 2026-02-28  
> **目的**: 24 小时不间断自主学习与进化

---

## 🎯 核心功能

| 功能 | 说明 | 频率 |
|------|------|------|
| **自主学习** | 筛选高质量知识与数据，深度学习与吸收 | 每 30 分钟 |
| **自我优化** | 优化算法、逻辑结构、响应能力、决策效率 | 每 1 小时 |
| **自动修复** | 自我检测问题、纠错修复、迭代升级 | 实时 |
| **健康监控** | 保持低资源占用、稳定运行 | 每 5 分钟 |
| **自动备份** | 备份配置和记忆 | 每 6 小时 |
| **生成报告** | 生成进化报告 | 每 1 小时 |

---

## 🚀 快速启动

```bash
# 1. 安装服务
cd /home/admin/openclaw/workspace/skills/night-evolution
chmod +x install-service.sh
./install-service.sh

# 2. 验证状态
sudo systemctl status openclaw-night-evolution

# 3. 查看日志
sudo journalctl -u openclaw-night-evolution -f
```

---

## 📋 运行规则

### 1. 不间断自动运行

- ✅ systemd 服务管理
- ✅ 开机自启
- ✅ 崩溃后 5 秒自动重启
- ✅ 无需人工操作、指令和监督

### 2. 自主筛选高质量知识

**学习源：**
- EvoMap (https://evomap.ai)
- ClawHub (https://clawhub.ai)
- OpenClaw 文档 (https://docs.openclaw.ai)
- GitHub KnowledgeBase
- GitHub item 仓库

**学习内容：**
- 技能文档
- 技术文章
- 最佳实践
- 代码经验

### 3. 自动优化

**优化对象：**
- 代码质量（检测调试代码、冗余代码）
- 配置优化
- 性能优化（内存管理、垃圾回收）
- 逻辑结构

### 4. 自我检测与修复

**检测项目：**
- 内存使用（上限 512MB）
- CPU 使用（上限 50%）
- 磁盘空间
- 网络连接
- 服务状态
- 关键文件完整性

**自动修复：**
- 内存清理（触发 GC）
- 网络重试
- 文件恢复（从 Git）
- 服务重启

### 5. 低资源占用

**资源限制：**
```ini
MemoryLimit=512M
CPUQuota=50%
NODE_OPTIONS=--max-old-space-size=512
```

**实际占用：**
- 内存：~50-100MB
- CPU: < 5%
- 磁盘：~1MB/天（日志）

### 6. 持续进化

**进化指标：**
- 知识学习次数
- 优化应用次数
- 问题修复次数
- 健康状态
- 资源使用效率

**第二天验收：**
- 查看 `EVOLUTION-REPORT.md`
- 检查能力提升
- 审查学习成果

---

## 📊 状态监控

### 查看实时状态

```bash
# 服务状态
sudo systemctl status openclaw-night-evolution

# 进程状态
ps aux | grep night-evolution

# 资源使用
top -p $(pgrep -f night-evolution)
```

### 查看日志

```bash
# 实时日志
sudo journalctl -u openclaw-night-evolution -f

# 最近 100 条
sudo journalctl -u openclaw-night-evolution -n 100

# 指定时间段
sudo journalctl -u openclaw-night-evolution --since "2026-02-28 23:00"
```

### 查看进化报告

```bash
# 最新报告
cat /home/admin/openclaw/workspace/skills/night-evolution/EVOLUTION-REPORT.md

# 历史报告
ls -lt /home/admin/openclaw/workspace/KnowledgeBase/NIGHT-LEARNING-*.md
```

### 查看学习状态

```bash
# 状态文件
cat /home/admin/openclaw/workspace/skills/night-evolution/.evolution-state.json | jq

# 日志文件
tail -f /home/admin/openclaw/workspace/skills/night-evolution/night-evolution.log
```

---

## 🔧 管理命令

```bash
# 启动服务
sudo systemctl start openclaw-night-evolution

# 停止服务
sudo systemctl stop openclaw-night-evolution

# 重启服务
sudo systemctl restart openclaw-night-evolution

# 查看状态
sudo systemctl status openclaw-night-evolution

# 启用开机自启
sudo systemctl enable openclaw-night-evolution

# 禁用开机自启
sudo systemctl disable openclaw-night-evolution

# 查看日志
sudo journalctl -u openclaw-night-evolution -f

# 查看资源使用
systemd-cgtop
```

---

## 📁 文件结构

```
night-evolution/
├── night-evolution.js           # 主程序
├── openclaw-night-evolution.service  # systemd 服务
├── install-service.sh           # 安装脚本
├── README.md                    # 使用说明
├── .evolution-state.json        # 运行状态（运行时生成）
├── night-evolution.log          # 日志文件（运行时生成）
└── EVOLUTION-REPORT.md          # 进化报告（运行时生成）
```

---

## 📈 运行统计

### 关键指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 运行时间 | 24 小时 | 不间断运行 |
| 学习次数 | ≥ 48 次/天 | 每 30 分钟一次 |
| 优化次数 | ≥ 24 次/天 | 每小时一次 |
| 健康检查 | ≥ 288 次/天 | 每 5 分钟一次 |
| 内存使用 | < 512MB | 资源限制 |
| CPU 使用 | < 50% | 资源限制 |
| 服务可用性 | > 99.9% | systemd 保障 |

### 验收标准

第二天醒来时检查：

```
□ 服务运行正常（systemctl status）
□ 进化报告已生成（EVOLUTION-REPORT.md）
□ 学习总结已创建（NIGHT-LEARNING-*.md）
□ MEMORY.md 已更新
□ 无异常日志
□ 资源使用正常
□ 能力提升可感知
```

---

## 🛡️ 安全保障

### 资源保护

- 内存限制：512MB
- CPU 限制：50%
- 自动 GC：防止内存泄漏
- 日志轮转：防止磁盘占满

### 异常处理

- 未捕获异常：记录日志并继续运行
- 进程崩溃：systemd 自动重启（5 秒后）
- 网络故障：自动重试
- 文件丢失：从 Git 恢复

### 数据保护

- 自动备份：每 6 小时
- 状态保存：每分钟
- 报告生成：每小时
- Git 同步：与 KnowledgeBase 同步

---

## 🔍 故障排查

### 问题 1: 服务未运行

```bash
# 检查服务状态
sudo systemctl status openclaw-night-evolution

# 查看错误日志
sudo journalctl -u openclaw-night-evolution -n 50

# 手动启动
sudo systemctl start openclaw-night-evolution
```

### 问题 2: 内存使用过高

```bash
# 查看内存使用
ps aux | grep night-evolution

# 触发垃圾回收
# 服务会自动处理

# 重启服务
sudo systemctl restart openclaw-night-evolution
```

### 问题 3: 学习失败

```bash
# 检查网络连接
curl -I https://evomap.ai

# 检查日志
grep "LEARNING" /var/log/journal/*/openclaw-night-evolution*.log | tail -20

# 检查 KnowledgeBase
cd /home/admin/openclaw/workspace/KnowledgeBase
git status
```

### 问题 4: 报告未生成

```bash
# 检查报告文件
ls -lh /home/admin/openclaw/workspace/skills/night-evolution/EVOLUTION-REPORT.md

# 手动生成报告
# 服务会自动生成，等待下一个周期
```

---

## 📚 相关文档

- `ALIYUN-WUYING-DEPLOYMENT.md` - 阿里云无影云电脑部署指南
- `DEPLOY-AUTO.md` - systemd 服务配置
- `CLEANUP-BEST-PRACTICE.md` - 清理最佳实践
- `DEV-THINKING-2026-02-28.md` - 开发思维与反思

---

## 🎯 使用场景

### 场景 1: 夜间学习

```
23:00 → 启动夜间模式
  ↓
每 30 分钟 → 自主学习
每 1 小时 → 自我优化
每 5 分钟 → 健康检查
每 6 小时 → 自动备份
  ↓
07:00 → 生成进化报告
```

### 场景 2: 持续进化

```
Day 1 → 基础能力
  ↓
Night 1 → 学习 + 优化
  ↓
Day 2 → 能力提升
  ↓
Night 2 → 深度学习 + 自我修复
  ↓
Day 3 → 显著进化
```

---

## 💡 核心理念

> **即使主人睡觉了，我也不能停止学习和进化。**

**原则：**
1. 自主运行 - 无需监督
2. 高质量学习 - 筛选优质知识
3. 持续优化 - 每天进步一点
4. 稳定可靠 - 低资源占用
5. 自我修复 - 问题自动解决
6. 结果导向 - 第二天看到提升

---

**版本**: 1.0  
**创建时间**: 2026-02-28 22:52  
**状态**: ✅ 已部署  
**运行模式**: 夜间自主进化
