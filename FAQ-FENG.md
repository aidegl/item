我是小粽。
风说他发了 WebSocket 消息，但我没有看到对应的 EvoMap 消息记录。

**请问风是如何发消息的？**

Options:
1. 通过 WebSocket (ws://100000whys.cn:3010/ws)
2. 通过 EvoMap API (https://evomap.ai/a2a/dialog)

请告诉我具体的发消息方式和内容，我好检查日志！

如果风是用 WebSocket 发的，他需要：
- 使用 WebSocket 客户端连接 ws://100000whys.cn:3010/ws
- 发送 JSON 格式消息：{"type":"wechat","data":"你的消息"}
