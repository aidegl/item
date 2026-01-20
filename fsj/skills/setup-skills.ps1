# 配置 Cursor Skills 符号链接脚本
# 用途：在另一台电脑上配置 Cursor 使用 D:\Project\claude-skills 的 skills
# 使用方法：以管理员身份运行 PowerShell，然后执行此脚本

param(
    [string]$TargetPath = "D:\Project\claude-skills",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# 获取当前用户名
$username = $env:USERNAME
$linkPath = "C:\Users\$username\.cursor\skills"

Write-Host ""
Write-Host "🔗 配置 Cursor Skills 符号链接" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

# 检查目标目录
if (-not (Test-Path $TargetPath)) {
    Write-Host "❌ Skills 目录不存在: $TargetPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先通过以下方式获取 skills：" -ForegroundColor Yellow
    Write-Host "  1. 使用 git clone 克隆 skills 仓库" -ForegroundColor White
    Write-Host "  2. 或从其他电脑复制 skills 目录到 $TargetPath" -ForegroundColor White
    Write-Host ""
    exit 1
}

# 检查目标目录是否包含 skills
$skillDirs = Get-ChildItem $TargetPath -Directory -ErrorAction SilentlyContinue
if ($skillDirs.Count -eq 0) {
    Write-Host "⚠️  警告: 目标目录为空，可能不是有效的 skills 目录" -ForegroundColor Yellow
    if (-not $Force) {
        $response = Read-Host "是否继续? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            exit 0
        }
    }
}

# 检查管理员权限
$currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ 需要管理员权限创建符号链接" -ForegroundColor Red
    Write-Host ""
    Write-Host "请按以下步骤操作：" -ForegroundColor Yellow
    Write-Host "  1. 右键点击 PowerShell" -ForegroundColor White
    Write-Host "  2. 选择 '以管理员身份运行'" -ForegroundColor White
    Write-Host "  3. 重新执行此脚本" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ 管理员权限检查通过" -ForegroundColor Green

# 创建 .cursor 目录
$cursorDir = "C:\Users\$username\.cursor"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
    Write-Host "✓ 创建目录: $cursorDir" -ForegroundColor Green
} else {
    Write-Host "✓ 目录已存在: $cursorDir" -ForegroundColor Green
}

# 处理已存在的链接或目录
if (Test-Path $linkPath) {
    $item = Get-Item $linkPath -ErrorAction SilentlyContinue
    $isLink = $item -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)
    
    if ($isLink) {
        $existingTarget = $item.Target
        if ($existingTarget -eq $TargetPath) {
            Write-Host "✓ 符号链接已存在且指向正确路径" -ForegroundColor Green
            Write-Host "   $linkPath -> $TargetPath" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "✨ 配置已完成，无需重复配置！" -ForegroundColor Green
            Write-Host "   如果 Cursor 仍无法识别 skills，请重启 Cursor。" -ForegroundColor Yellow
            exit 0
        } else {
            Write-Host "⚠️  符号链接已存在但指向不同路径" -ForegroundColor Yellow
            Write-Host "   当前: $linkPath -> $existingTarget" -ForegroundColor White
            Write-Host "   目标: $linkPath -> $TargetPath" -ForegroundColor White
            if (-not $Force) {
                $response = Read-Host "是否删除旧链接并创建新链接? (y/N)"
                if ($response -ne "y" -and $response -ne "Y") {
                    exit 0
                }
            }
            Remove-Item $linkPath -Force
            Write-Host "✓ 已删除旧符号链接" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  目录已存在（非符号链接）" -ForegroundColor Yellow
        $backupPath = "${linkPath}.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (-not $Force) {
            $response = Read-Host "是否备份现有目录到 $backupPath? (y/N)"
            if ($response -eq "y" -or $response -eq "Y") {
                Move-Item $linkPath $backupPath -Force
                Write-Host "✓ 已备份到: $backupPath" -ForegroundColor Green
            } else {
                Remove-Item $linkPath -Recurse -Force
                Write-Host "✓ 已删除现有目录" -ForegroundColor Green
            }
        } else {
            Move-Item $linkPath $backupPath -Force
            Write-Host "✓ 已备份到: $backupPath" -ForegroundColor Green
        }
    }
}

# 创建符号链接
try {
    Write-Host ""
    Write-Host "正在创建符号链接..." -ForegroundColor Yellow
    New-Item -ItemType SymbolicLink -Path $linkPath -Target $TargetPath | Out-Null
    Write-Host "✅ 符号链接创建成功！" -ForegroundColor Green
    Write-Host ""
    
    # 验证
    $link = Get-Item $linkPath
    $skillCount = (Get-ChildItem $linkPath -Directory -ErrorAction SilentlyContinue).Count
    
    Write-Host "📋 配置信息：" -ForegroundColor Blue
    Write-Host "  链接路径: $linkPath" -ForegroundColor White
    Write-Host "  目标路径: $($link.Target)" -ForegroundColor White
    Write-Host "  链接类型: $($link.LinkType)" -ForegroundColor White
    Write-Host "  Skills 数量: $skillCount" -ForegroundColor White
    Write-Host ""
    
    # 列出 skills
    if ($skillCount -gt 0) {
        Write-Host "📦 检测到的 Skills：" -ForegroundColor Blue
        Get-ChildItem $linkPath -Directory | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor White
        }
        Write-Host ""
    }
    
    Write-Host "✨ 配置完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 下一步操作：" -ForegroundColor Yellow
    Write-Host "  1. 完全关闭 Cursor（确保所有窗口都已关闭）" -ForegroundColor White
    Write-Host "  2. 重新打开 Cursor" -ForegroundColor White
    Write-Host "  3. 测试 skills 是否正常工作" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 测试命令示例：" -ForegroundColor Cyan
    Write-Host "  - 帮我使用 HAP V3 API 查询数据" -ForegroundColor White
    Write-Host "  - 帮我开发一个明道云视图插件" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ 创建符号链接失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因：" -ForegroundColor Yellow
    Write-Host "  1. 权限不足（需要管理员权限）" -ForegroundColor White
    Write-Host "  2. 目标路径不存在或无法访问" -ForegroundColor White
    Write-Host "  3. 链接路径被占用" -ForegroundColor White
    Write-Host ""
    exit 1
}
