# MCP 服务器安装 - 快速开始

## ⚡ 一分钟安装（手动配置，推荐）

1. **打开配置文件**
   - 路径：`C:\Users\<你的用户名>\.cursor\mcp.json`
   - 如果文件不存在，创建新文件

2. **复制以下配置**
   ```json
   {
     "mcpServers": {
       "hap-mcp-孚世界": {
         "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
       }
     }
   }
   ```
   
   如果文件已有其他配置，在 `mcpServers` 对象中添加 `hap-mcp-孚世界` 项。

3. **保存文件**（确保编码为 UTF-8）

4. **重启 Cursor**
   - 完全关闭 Cursor
   - 重新打开

5. **验证**
   - 在 Cursor 设置中查看 MCP 服务器状态
   - 应该能看到 `hap-mcp-孚世界` 服务器

## 🔧 使用脚本安装（可选）

如果手动配置遇到问题，可以尝试使用脚本：

```powershell
cd D:\Project\fsj\mcp
.\install-mcp.ps1
```

**注意**：如果脚本执行时遇到编码问题，建议使用手动配置方法。

## ✅ 验证安装

```powershell
# 检查配置文件
Get-Content "C:\Users\$env:USERNAME\.cursor\mcp.json"
```

## 📝 配置文件位置

`C:\Users\<用户名>\.cursor\mcp.json`

## ❓ 遇到问题？

查看详细文档：`README-MCP-INSTALL.md`
