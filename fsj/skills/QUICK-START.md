# Cursor Skills 配置 - 快速开始

## ⚡ 一分钟配置

1. **以管理员身份打开 PowerShell**
   ```
   右键 PowerShell → 以管理员身份运行
   ```

2. **执行配置脚本**
   ```powershell
   cd D:\Project\fsj\skills
   .\setup-skills.ps1
   ```

3. **重启 Cursor**
   - 完全关闭 Cursor
   - 重新打开

4. **测试**
   ```
   在 Cursor 中输入：帮我使用 HAP V3 API 查询数据
   ```

## ✅ 验证配置

```powershell
# 检查符号链接
Get-Item "C:\Users\$env:USERNAME\.cursor\skills" | Select-Object LinkType, Target
```

应该显示：
- `LinkType: SymbolicLink`
- `Target: D:\Project\claude-skills`

## ❓ 遇到问题？

查看详细文档：`README-SKILLS-CONFIG.md`

## 📝 注意事项

- ✅ 需要管理员权限
- ✅ 确保 `D:\Project\claude-skills` 目录存在
- ✅ 配置后必须重启 Cursor
