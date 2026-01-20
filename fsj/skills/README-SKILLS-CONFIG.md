# Cursor Skills 配置指南

本指南说明如何在另一台电脑上配置 Cursor 使用 `D:\Project\claude-skills` 的 skills。

## 📋 前置条件

1. **Skills 目录已存在**
   - 确保 `D:\Project\claude-skills` 目录存在
   - 目录应包含所有 skills 子目录（如 `hap-mcp-usage`、`hap-skills-updater` 等）

2. **获取 Skills**
   ```powershell
   # 如果还没有 skills，可以通过 git 获取
   git clone <skills-repo-url> D:\Project\claude-skills
   
   # 或从其他电脑复制整个目录
   ```

3. **管理员权限**
   - 创建符号链接需要管理员权限
   - 必须以管理员身份运行 PowerShell

## 🚀 快速配置（推荐）

### 方法一：使用配置脚本（最简单）

1. **以管理员身份打开 PowerShell**
   - 右键点击 PowerShell
   - 选择"以管理员身份运行"

2. **导航到脚本目录并执行**
   ```powershell
   cd D:\Project\fsj\skills
   .\setup-skills.ps1
   ```

3. **按提示操作**
   - 脚本会自动检查权限和路径
   - 创建符号链接
   - 显示配置信息

4. **重启 Cursor**
   - 完全关闭 Cursor（确保所有窗口都已关闭）
   - 重新打开 Cursor

### 方法二：手动配置

如果不想使用脚本，可以手动执行以下命令：

```powershell
# 1. 以管理员身份打开 PowerShell

# 2. 设置变量
$username = $env:USERNAME
$targetPath = "D:\Project\claude-skills"
$linkPath = "C:\Users\$username\.cursor\skills"

# 3. 创建 .cursor 目录（如果不存在）
$cursorDir = "C:\Users\$username\.cursor"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
}

# 4. 删除已存在的链接或目录
if (Test-Path $linkPath) {
    Remove-Item $linkPath -Recurse -Force -ErrorAction SilentlyContinue
}

# 5. 创建符号链接
New-Item -ItemType SymbolicLink -Path $linkPath -Target $targetPath

# 6. 验证
Get-Item $linkPath | Select-Object LinkType, Target
```

## ✅ 验证配置

### 1. 检查符号链接

```powershell
Get-Item "C:\Users\$env:USERNAME\.cursor\skills" | Select-Object LinkType, Target
```

**预期输出：**
```
LinkType: SymbolicLink
Target   : D:\Project\claude-skills
```

### 2. 检查 Skills 文件

```powershell
# 列出所有 skills
Get-ChildItem "C:\Users\$env:USERNAME\.cursor\skills" -Directory

# 应该看到类似：
# hap-mcp-usage
# hap-skills-updater
# hap-v3-api
# hap-view-plugin
```

### 3. 检查 SKILL.md 文件

```powershell
# 查找所有 SKILL.md 文件
Get-ChildItem "C:\Users\$env:USERNAME\.cursor\skills" -Recurse -Filter "SKILL.md"
```

### 4. 在 Cursor 中测试

重启 Cursor 后，尝试以下命令：

```
你: 帮我使用 HAP V3 API 查询数据
你: 帮我开发一个明道云视图插件
```

如果 Cursor 能识别并调用相应的 skills，说明配置成功。

## 🔧 配置脚本参数

`setup-skills.ps1` 脚本支持以下参数：

```powershell
# 指定不同的目标路径
.\setup-skills.ps1 -TargetPath "E:\MySkills"

# 强制模式（不询问确认）
.\setup-skills.ps1 -Force
```

## 🐛 故障排除

### 问题 1: 符号链接创建失败

**错误信息：**
```
New-Item: 无法创建符号链接，因为权限不足
```

**解决方案：**
1. 确保以管理员身份运行 PowerShell
2. 检查用户是否有管理员权限：
   ```powershell
   ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
   ```
   应该返回 `True`

### 问题 2: 目标路径不存在

**错误信息：**
```
❌ Skills 目录不存在: D:\Project\claude-skills
```

**解决方案：**
1. 检查路径是否正确：
   ```powershell
   Test-Path "D:\Project\claude-skills"
   ```
2. 如果路径不同，修改脚本中的 `$TargetPath` 变量
3. 或使用参数指定路径：
   ```powershell
   .\setup-skills.ps1 -TargetPath "你的实际路径"
   ```

### 问题 3: Cursor 无法识别 Skills

**可能原因和解决方案：**

1. **未重启 Cursor**
   - 完全关闭 Cursor（检查任务管理器确保进程已结束）
   - 重新打开 Cursor

2. **符号链接未正确创建**
   ```powershell
   # 验证符号链接
   $link = Get-Item "C:\Users\$env:USERNAME\.cursor\skills"
   $link.LinkType  # 应该是 SymbolicLink
   $link.Target    # 应该指向 D:\Project\claude-skills
   ```

3. **Skills 文件格式不正确**
   ```powershell
   # 检查是否有 SKILL.md 文件
   Get-ChildItem "C:\Users\$env:USERNAME\.cursor\skills" -Recurse -Filter "SKILL.md"
   ```

4. **Cursor 版本过旧**
   - 确保使用最新版本的 Cursor
   - 检查 Cursor 设置中是否有 skills 相关配置

### 问题 4: 链接路径被占用

**错误信息：**
```
New-Item: 无法创建项，因为文件已存在
```

**解决方案：**
1. 使用脚本的 `-Force` 参数：
   ```powershell
   .\setup-skills.ps1 -Force
   ```
2. 或手动删除后重新创建：
   ```powershell
   Remove-Item "C:\Users\$env:USERNAME\.cursor\skills" -Recurse -Force
   .\setup-skills.ps1
   ```

## 📝 配置原理

Cursor 会自动从 `C:\Users\<用户名>\.cursor\skills` 目录读取 skills。

通过创建符号链接，我们可以：
- 将 `C:\Users\<用户名>\.cursor\skills` 指向 `D:\Project\claude-skills`
- 这样 Cursor 读取 skills 时，实际读取的是 `D:\Project\claude-skills` 的内容
- 无需修改 Cursor 配置，也无需复制文件

**优势：**
- ✅ 保持 skills 在统一位置管理
- ✅ 可以通过 git 同步更新
- ✅ 多台电脑可以共享同一套 skills
- ✅ 无需修改 Cursor 配置

## 🔄 更新 Skills

当 skills 更新后：

1. **如果使用 git 管理**
   ```powershell
   cd D:\Project\claude-skills
   git pull
   ```

2. **如果从其他电脑复制**
   - 直接覆盖 `D:\Project\claude-skills` 目录
   - 或使用同步工具

3. **重启 Cursor**
   - 更新后需要重启 Cursor 才能识别新的 skills

## 📚 相关文档

- [Cursor Skills 官方文档](https://docs.cursor.com)（如果有）
- Skills 仓库文档（如果有）

## 💡 提示

1. **多台电脑配置**
   - 每台电脑都需要执行一次配置脚本
   - 确保每台电脑的 `D:\Project\claude-skills` 路径一致
   - 或使用脚本参数指定不同的路径

2. **路径自定义**
   - 如果另一台电脑的路径不同，可以修改脚本中的 `$TargetPath` 变量
   - 或使用参数：`.\setup-skills.ps1 -TargetPath "你的路径"`

3. **备份现有配置**
   - 脚本会自动备份已存在的目录
   - 备份文件名为：`skills.backup.yyyyMMdd_HHmmss`

4. **验证配置**
   - 配置后务必验证符号链接是否正确
   - 在 Cursor 中测试 skills 是否正常工作

## ❓ 常见问题

**Q: 为什么需要管理员权限？**  
A: Windows 创建符号链接需要管理员权限，这是 Windows 的安全限制。

**Q: 可以不用符号链接吗？**  
A: 可以，但需要将 skills 复制到 `C:\Users\<用户名>\.cursor\skills`，这样无法统一管理。

**Q: 符号链接会影响性能吗？**  
A: 不会，符号链接的性能开销可以忽略不计。

**Q: 如何移除配置？**  
A: 删除符号链接即可：
```powershell
Remove-Item "C:\Users\$env:USERNAME\.cursor\skills" -Force
```

**Q: 配置后需要重启电脑吗？**  
A: 不需要，只需重启 Cursor 即可。

---

**最后更新：** 2024年
