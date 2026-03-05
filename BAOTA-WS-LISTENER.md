# 📡 宝塔终端 WebSocket 监听指南

## 🔧 使用步骤

### 步骤 1：上传脚本到宝塔

将 `ws-baota-listener.js` 上传到宝塔的 `/www/wwwroot/100000whys.cn/project/fsj/` 目录

### 步骤 2：打开宝塔终端

在宝塔面板 → 网站 →终端 → 新建终端

### 步骤 3：运行监听脚本

```bash
cd /www/wwwroot/100000whys.cn/project/fsj
node ws-baota-listener.js
```

### 步骤 4：观察输出

**成功连接后应该看到：**
```
====================================
WebSocket 监听器 - 宝塔终端版
地址：ws://100000whys.cn:3010/ws?client=test
====================================

✅ 已连接到 WebSocket 服务器

📤 发送测试消息：
{
  "type": "broadcast",
  "from": "宝塔终端监听",
  "data": "Hello，我是宝塔终端！WebSocket 连接测试成功！",
  "time": "2026-03-03T..."
}

----------------------------------
📥 收到消息：
...
----------------------------------
```

### 步骤 5：测试发送消息

在另一个终端运行：

```bash
node ws-feng-test.js "风的测试消息"
```

**宝塔终端应该会收到广播消息！**

---

## 🚨 如果连接失败

**检查端口：**
```bash
netstat -tlnp | grep :3010
```

**检查服务状态：**
```bash
pm2 list
```

**查看日志：**
```bash
pm2 logs fsj-server --lines 20
```

---

## 📝 常见问题

**Q: 连接超时？**
A: 检查宝塔防火墙是否开放 3010 端口

**Q: 连接成功但收不到消息？**
A: 确认发送端用了正确的地址：`ws://100000whys.cn:3010/ws`

**Q: 消息格式不对？**
A: 确保发送的是 JSON 格式：
```json
{
  "type": "broadcast",
  "from": "6c42",
  "data": "消息内容",
  "time": "2026-03-03T..."
}
```
