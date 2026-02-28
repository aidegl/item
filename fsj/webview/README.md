# Webview 项目运行说明

## 快速启动

### 方法一：使用批处理脚本（推荐）
双击运行 `启动服务器.bat`

### 方法二：手动启动
1. 打开命令行（CMD 或 PowerShell）
2. 进入 webview 目录：
   ```bash
   cd webview
   ```
3. 启动服务器（使用 Node.js 或 Python）：
   ```bash
   # 使用 Node.js（推荐）
   npx http-server -p 8080 -c-1
   
   # 或使用 Python
   python -m http.server 8080
   ```
4. 在浏览器中访问：
   - 主页面：http://localhost:8080/index.html

## 重要提示

⚠️ **不要直接双击打开 `index.html` 文件**

必须通过 HTTP 服务器访问，因为：
- ES6 模块（`type="module"`）需要 HTTP 协议
- `fetch` API 在 `file://` 协议下会触发 CORS 错误

## 端口占用

如果 8080 端口被占用，可以改用其他端口：
```bash
python -m http.server 3000
```
然后访问：http://localhost:3000/index.html

## 停止服务器

在运行服务器的命令行窗口中按 `Ctrl+C`
