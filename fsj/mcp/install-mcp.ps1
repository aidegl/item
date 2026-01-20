# 安装 MCP 服务器脚本
# 用途：在 Cursor 中安装 hap-mcp-孚世界 MCP 服务器
# 使用方法：直接运行此脚本

param(
    [string]$McpName = "hap-mcp-孚世界",
    [string]$McpUrl = 'https://api.mingdao.com/mcp?HAP-Appkey=b37a969f03b3cf0b&HAP-Sign=MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg=='
)

$ErrorActionPreference = "Stop"

# 获取配置文件路径
$username = $env:USERNAME
$cursorDir = "C:\Users\$username\.cursor"
$mcpConfigPath = Join-Path $cursorDir "mcp.json"

Write-Host ""
Write-Host "🔧 安装 MCP 服务器: $McpName" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

# 创建 .cursor 目录（如果不存在）
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
    Write-Host "✓ 创建目录: $cursorDir" -ForegroundColor Green
} else {
    Write-Host "✓ 目录已存在: $cursorDir" -ForegroundColor Green
}

# 读取或创建配置文件
$mcpConfig = @{}

if (Test-Path $mcpConfigPath) {
    Write-Host "✓ 找到现有配置文件: $mcpConfigPath" -ForegroundColor Green
    
    try {
        $configContent = Get-Content $mcpConfigPath -Raw -Encoding UTF8
        $mcpConfig = $configContent | ConvertFrom-Json -AsHashtable
        
        if (-not $mcpConfig) {
            $mcpConfig = @{}
        }
        
        # 确保 mcpServers 存在
        if (-not $mcpConfig.ContainsKey("mcpServers")) {
            $mcpConfig["mcpServers"] = @{}
        }
    } catch {
        Write-Host "⚠️  配置文件格式错误，将创建新配置" -ForegroundColor Yellow
        $mcpConfig = @{
            mcpServers = @{}
        }
    }
} else {
    Write-Host "✓ 创建新配置文件: $mcpConfigPath" -ForegroundColor Green
    $mcpConfig = @{
        mcpServers = @{}
    }
}

# 检查是否已存在
if ($mcpConfig["mcpServers"].ContainsKey($McpName)) {
    Write-Host "⚠️  MCP 服务器 '$McpName' 已存在" -ForegroundColor Yellow
    $existing = $mcpConfig["mcpServers"][$McpName]
    
    if ($existing.url -eq $McpUrl) {
        Write-Host "✓ 配置相同，无需更新" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 当前配置：" -ForegroundColor Blue
        Write-Host "  名称: $McpName" -ForegroundColor White
        Write-Host "  URL: $McpUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "✨ MCP 服务器已配置！如果 Cursor 中看不到，请重启 Cursor。" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "⚠️  配置不同，将更新" -ForegroundColor Yellow
        Write-Host "  旧 URL: $($existing.url)" -ForegroundColor White
        Write-Host "  新 URL: $McpUrl" -ForegroundColor White
    }
}

# 添加或更新 MCP 服务器配置
$mcpConfig["mcpServers"][$McpName] = @{
    url = $McpUrl
}

# 保存配置文件
try {
    # 构建 JSON 对象结构
    $jsonObject = @{
        mcpServers = @{}
    }
    
    # 复制所有 MCP 服务器配置
    foreach ($key in $mcpConfig["mcpServers"].Keys) {
        $serverConfig = $mcpConfig["mcpServers"][$key]
        $jsonObject.mcpServers[$key] = @{}
        foreach ($prop in $serverConfig.Keys) {
            $jsonObject.mcpServers[$key][$prop] = $serverConfig[$prop]
        }
    }
    
    # 转换为 JSON，格式化输出
    # 使用 Compress 参数可以生成紧凑格式，不使用则生成格式化输出
    $jsonContent = ($jsonObject | ConvertTo-Json -Depth 10)
    
    # 保存文件（UTF-8 with BOM，确保中文正确显示）
    [System.IO.File]::WriteAllText($mcpConfigPath, $jsonContent, [System.Text.Encoding]::UTF8)
    
    Write-Host "✅ MCP 服务器配置已保存！" -ForegroundColor Green
    Write-Host ""
    
    # 显示配置信息
    Write-Host "📋 配置信息：" -ForegroundColor Blue
    Write-Host "  配置文件: $mcpConfigPath" -ForegroundColor White
    Write-Host "  服务器名称: $McpName" -ForegroundColor White
    Write-Host "  URL: $McpUrl" -ForegroundColor White
    Write-Host ""
    
    # 列出所有已配置的 MCP 服务器
    $serverCount = $mcpConfig["mcpServers"].Keys.Count
    Write-Host "📦 已配置的 MCP 服务器 ($serverCount 个)：" -ForegroundColor Blue
    foreach ($serverName in $mcpConfig["mcpServers"].Keys) {
        $server = $mcpConfig["mcpServers"][$serverName]
        if ($server.url) {
            Write-Host "  - $serverName : $($server.url)" -ForegroundColor White
        } else {
            Write-Host "  - $serverName : (command/stdio)" -ForegroundColor White
        }
    }
    Write-Host ""
    
    Write-Host "✨ 配置完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 下一步操作：" -ForegroundColor Yellow
    Write-Host "  1. 完全关闭 Cursor（确保所有窗口都已关闭）" -ForegroundColor White
    Write-Host "  2. 重新打开 Cursor" -ForegroundColor White
    Write-Host "  3. 在 Cursor 设置中检查 MCP 服务器状态" -ForegroundColor White
    Write-Host "  4. 测试 MCP 工具是否可用" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ 保存配置文件失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "  1. 文件被其他程序占用" -ForegroundColor White
    Write-Host "  2. 权限不足" -ForegroundColor White
    Write-Host "  3. 磁盘空间不足" -ForegroundColor White
    Write-Host ""
    exit 1
}
