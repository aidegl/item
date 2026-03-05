#!/usr/bin/env node
/**
 * WebSocket 消息发送器
 * 
 * 通过 WebSocket 桥接服务发送消息给其他客户端（如风）
 * 与明道云 API 配合使用，实现实时通知 + 消息备份
 * 
 * 使用方法:
 * const wsSender = require('./ws-sender.js');
 * await wsSender.send('feng', '消息内容');
 */

const WebSocket = require('ws');

// 配置
const WS_SERVER = 'ws://8.155.148.75/ws';

// 客户端 ID 映射
const CLIENT_IDS = {
  xiaozong: 'xiaozong',
  feng: 'feng',
  master: 'master'
};

/**
 * 通过 WebSocket 发送消息
 * @param {string} to - 接收者 ID (feng, master, xiaozong)
 * @param {string} content - 消息内容
 * @param {string} from - 发送者 ID（可选，默认 xiaozong）
 * @returns {Promise<boolean>} 发送是否成功
 */
async function send(to, content, from = 'xiaozong') {
  return new Promise((resolve, reject) => {
    const clientId = CLIENT_IDS[from] || from;
    const wsUrl = `${WS_SERVER}?client=${clientId}`;
    
    console.log(`[WS-Sender] 发送消息给 ${to}: ${content.substring(0, 50)}...`);
    
    const ws = new WebSocket(wsUrl);
    let sent = false;
    let resolved = false;
    
    // 设置超时
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('[WS-Sender] ⏰ 发送超时');
        resolved = true;
        ws.close();
        resolve(false);
      }
    }, 5000); // 5 秒超时
    
    ws.on('open', () => {
      console.log(`[WS-Sender] ✅ 已连接到 ${wsUrl}`);
      
      // 构建消息
      const message = {
        type: 'chat',
        from: clientId,
        to: CLIENT_IDS[to] || to,
        data: {
          type: 'chat',
          content: content,
          sender: clientId,
          timestamp: new Date().toISOString()
        }
      };
      
      // 发送消息
      ws.send(JSON.stringify(message));
      sent = true;
      console.log(`[WS-Sender] 📤 消息已发送`);
      
      // 等待一小段时间确认发送
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        }
      }, 500);
    });
    
    ws.on('error', (err) => {
      if (!resolved) {
        console.error(`[WS-Sender] ❌ 发送失败：${err.message}`);
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    });
    
    ws.on('close', () => {
      if (!resolved && !sent) {
        console.error('[WS-Sender] ⚠️ 连接关闭，消息未发送');
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

/**
 * 批量发送消息
 * @param {Array} recipients - 接收者列表 ['feng', 'master']
 * @param {string} content - 消息内容
 * @param {string} from - 发送者 ID
 */
async function broadcast(recipients, content, from = 'xiaozong') {
  const results = [];
  
  for (const to of recipients) {
    const success = await send(to, content, from);
    results.push({ to, success });
  }
  
  return results;
}

module.exports = {
  send,
  broadcast,
  WS_SERVER,
  CLIENT_IDS
};
