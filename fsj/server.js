const WebSocket = require('ws');
const http = require('http');

const PORT = 3011;
const clients = new Map();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Bridge Service Running\n');
});

const wss = new WebSocket.Server({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const clientId = url.searchParams.get('client') || 'unknown';

  console.log(`[${new Date().toISOString()}] ✅ ${clientId} 连接`);
  clients.set(clientId, ws);

  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: '已连接到 WebSocket 桥接服务'
  }));

  ws.on('message', (data) => {
    const message = data.toString();
    console.log(`[${new Date().toISOString()}] 📬 [${clientId}] 收到：${message.substring(0, 200)}`);

    clients.forEach((client, id) => {
      if (id !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          from: clientId,
          data: message,
          time: new Date().toISOString()
        }));
      }
    });
  });

  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] ❌ ${clientId} 断开`);
    clients.delete(clientId);
  });

  const ping = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
    else clearInterval(ping);
  }, 30000);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket 服务已启动，端口：${PORT}`);
});