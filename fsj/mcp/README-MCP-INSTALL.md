# MCP 服务器安装指南

本指南说明如何在 Cursor 中安装 `hap-mcp-孚世界` MCP 服务器。

## 📋 什么是 MCP

MCP（Model Context Protocol）是一种协议，允许 Cursor 等 AI 编辑器调用外部工具和服务。MCP 服务器提供工具和资源，扩展 Cursor 的功能。

## 🚀 快速安装

### 方法一：手动配置（推荐，最简单）

1. **打开配置文件**
   - 路径：`C:\Users\<用户名>\.cursor\mcp.json`
   - 如果文件不存在，创建新文件

2. **复制配置内容**
   
   如果文件为空或不存在，直接复制以下内容：
   ```json
   {
     "mcpServers": {
       "hap-mcp-孚世界": {
         "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
       }
     }
   }
   ```
   
   如果文件已有其他 MCP 配置，在 `mcpServers` 对象中添加：
   ```json
   {
     "mcpServers": {
       "其他MCP服务器": {
         "url": "..."
       },
       "hap-mcp-孚世界": {
         "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
       }
     }
   }
   ```

3. **保存文件**
   - 确保文件编码为 UTF-8
   - 确保 JSON 格式正确

4. **重启 Cursor**
   - 完全关闭 Cursor
   - 重新打开 Cursor

### 方法二：使用安装脚本

1. **打开 PowerShell**
   - 无需管理员权限（普通用户权限即可）

2. **执行安装脚本**
   ```powershell
   cd D:\Project\fsj\mcp
   .\install-mcp.ps1
   ```
   
   如果遇到编码问题，建议使用手动配置方法。

3. **重启 Cursor**
   - 完全关闭 Cursor
   - 重新打开 Cursor

4. **验证安装**
   - 在 Cursor 设置中查看 MCP 服务器状态
   - 测试 MCP 工具是否可用

### 方法三：复制示例文件

1. **打开配置文件**
   - 路径：`C:\Users\<用户名>\.cursor\mcp.json`
   - 如果文件不存在，创建新文件

2. **编辑配置文件**
   
   如果文件为空或不存在，添加以下内容：
   ```json
   {
     "mcpServers": {
       "hap-mcp-孚世界": {
         "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
       }
     }
   }
   ```
   
   如果文件已有其他 MCP 配置，在 `mcpServers` 对象中添加新项：
   ```json
   {
     "mcpServers": {
       "其他MCP服务器": {
         "url": "..."
       },
       "hap-mcp-孚世界": {
         "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
       }
     }
   }
   ```

3. **保存文件**
   - 确保文件编码为 UTF-8
   - 确保 JSON 格式正确（无语法错误）

4. **重启 Cursor**

## ✅ 验证安装

### 1. 检查配置文件

```powershell
# 查看配置文件内容
Get-Content "C:\Users\$env:USERNAME\.cursor\mcp.json" | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. 在 Cursor 中检查

1. 打开 Cursor 设置
2. 找到 **Features → MCP** 或 **MCP Servers** 部分
3. 查看 `hap-mcp-孚世界` 是否显示
4. 检查状态是否为绿色（已启用）

### 3. 测试 MCP 工具

在 Cursor 的 Composer 或 Agent 模式中：
- 询问："有哪些可用的工具？"
- 或直接使用 MCP 提供的功能

## 🔧 脚本参数

`install-mcp.ps1` 脚本支持自定义参数：

```powershell
# 使用默认配置
.\install-mcp.ps1

# 自定义服务器名称和 URL
.\install-mcp.ps1 -McpName "我的MCP服务器" -McpUrl "https://example.com/mcp"
```

## 📝 配置文件位置

- **Windows**: `C:\Users\<用户名>\.cursor\mcp.json`
- **macOS**: `~/.cursor/mcp.json`
- **Linux**: `~/.cursor/mcp.json`

## 🐛 故障排除

### 问题 1: 配置文件格式错误

**错误信息：**
```
ConvertFrom-Json: 无法解析 JSON
```

**解决方案：**
1. 检查 JSON 格式是否正确
2. 使用在线 JSON 验证工具验证
3. 确保所有引号、括号匹配
4. 确保文件编码为 UTF-8

### 问题 2: MCP 服务器不显示

**可能原因：**
1. 未重启 Cursor
2. 配置文件路径错误
3. JSON 格式错误

**解决方案：**
1. 完全关闭并重新打开 Cursor
2. 检查配置文件路径是否正确
3. 验证 JSON 格式

### 问题 3: MCP 服务器状态为红色

**可能原因：**
1. URL 无法访问
2. 网络连接问题
3. 服务器端错误

**解决方案：**
1. 在浏览器中测试 URL 是否可访问
2. 检查网络连接
3. 查看 Cursor 日志中的错误信息

### 问题 4: 权限错误

**错误信息：**
```
无法写入文件: 访问被拒绝
```

**解决方案：**
1. 确保有文件写入权限
2. 检查文件是否被其他程序占用
3. 以管理员身份运行 PowerShell（通常不需要）

## 📚 配置文件示例

### 单个 MCP 服务器

```json
{
  "mcpServers": {
    "hap-mcp-孚世界": {
      "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
    }
  }
}
```

### 多个 MCP 服务器

```json
{
  "mcpServers": {
    "hap-mcp-孚世界": {
      "url": "https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=="
    },
    "另一个MCP服务器": {
      "command": "node",
      "args": ["path/to/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 本地 MCP 服务器（stdio）

如果 MCP 服务器是本地运行的进程：

```json
{
  "mcpServers": {
    "本地MCP服务器": {
      "command": "node",
      "args": ["D:\\Project\\mcp-server\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🔄 更新配置

如果需要更新 MCP 服务器配置：

1. **使用脚本更新**
   ```powershell
   .\install-mcp.ps1 -McpUrl "新的URL"
   ```

2. **手动更新**
   - 编辑 `mcp.json` 文件
   - 修改相应的配置项
   - 保存文件
   - 重启 Cursor

## ❓ 常见问题

**Q: 需要管理员权限吗？**  
A: 不需要，普通用户权限即可。

**Q: 配置后需要重启电脑吗？**  
A: 不需要，只需重启 Cursor 即可。

**Q: 如何移除 MCP 服务器？**  
A: 编辑 `mcp.json` 文件，删除对应的配置项，然后重启 Cursor。

**Q: 可以配置多个 MCP 服务器吗？**  
A: 可以，在 `mcpServers` 对象中添加多个配置项即可。

**Q: URL 中的参数会过期吗？**  
A: 如果 URL 中包含签名或令牌，可能会过期。过期后需要更新 URL。

---

**最后更新：** 2024年
