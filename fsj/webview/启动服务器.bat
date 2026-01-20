@echo off
chcp 65001 >nul
title Webview 开发服务器
color 0A

echo ========================================
echo    Webview 开发服务器
echo ========================================
echo.

cd /d %~dp0

echo 正在启动服务器...
echo.
echo 服务器地址: http://localhost:8080
echo 测试页面:   http://localhost:8080/test.html
echo 主页面:     http://localhost:8080/index.html
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

REM 尝试使用 Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 Node.js 启动...
    npx http-server -p 8080 -c-1
    goto :end
)

REM 尝试使用 Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用 Python 启动...
    python -m http.server 8080
    goto :end
)

echo [错误] 未找到 Node.js 或 Python
echo.
echo 请安装以下任一工具:
echo   - Node.js: https://nodejs.org/
echo   - Python:  https://www.python.org/
echo.
pause

:end
