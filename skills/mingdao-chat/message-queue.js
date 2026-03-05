#!/usr/bin/env node
/**
 * 本地消息队列 - WebUI 消息显示
 * 
 * 功能：
 * 1. 所有发送的消息都经过此队列
 * 2. WebUI 可以通过 WebSocket 订阅队列
 * 3. 支持消息历史查询
 * 
 * 架构：
 * 发送消息 → 消息队列 → 同时执行：
 *                   ├─→ 明道云 API（备份）
 *                   ├─→ WebSocket 发送给风（通知）
 *                   └─→ WebSocket 推送给 WebUI（显示）
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// 配置
const QUEUE_FILE = path.join(__dirname, '.message-queue.json');
const WS_PORT = 3012; // WebUI 订阅端口

// 消息队列
class MessageQueue {
  constructor() {
    this.messages = [];
    this.listeners = []; // WebUI 订阅者
    this.wsServer = null;
    this.load();
  }
  
  // 加载历史消息
  load() {
    try {
      if (fs.existsSync(QUEUE_FILE)) {
        const data = fs.readFileSync(QUEUE_FILE, 'utf-8');
        this.messages = JSON.parse(data);
        console.log(`📦 已加载 ${this.messages.length} 条历史消息`);
      }
    } catch (e) {
      console.error('❌ 加载消息队列失败:', e.message);
      this.messages = [];
    }
  }
  
  // 保存消息队列
  save() {
    try {
      fs.writeFileSync(QUEUE_FILE, JSON.stringify(this.messages, null, 2));
    } catch (e) {
      console.error('❌ 保存消息队列失败:', e.message);
    }
  }
  
  // 添加消息到队列
  add(message) {
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      ...message
    };
    
    this.messages.push(msg);
    
    // 限制队列大小（保留最近 1000 条）
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000);
    }
    
    // 保存到文件
    this.save();
    
    // 通知所有订阅者
    this.notifyListeners(msg);
    
    console.log(`📨 消息已入队：${msg.from} → ${msg.to}`);
    
    return msg;
  }
  
  // 订阅消息（WebUI 使用）
  subscribe(listener) {
    this.listeners.push(listener);
    console.log(`📡 新增订阅者，当前订阅数：${this.listeners.length}`);
  }
  
  // 取消订阅
  unsubscribe(listener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  // 通知所有订阅者
  notifyListeners(newMessage) {
    this.listeners.forEach(listener => {
      try {
        listener(newMessage, this.messages);
      } catch (e) {
        console.error('❌ 通知订阅者失败:', e.message);
      }
    });
  }
  
  // 获取历史消息
  getHistory(options = {}) {
    const { limit = 100, from, to, sender, receiver } = options;
    
    let filtered = this.messages;
    
    if (from) filtered = filtered.filter(m => m.from === from);
    if (to) filtered = filtered.filter(m => m.to === to);
    if (sender) filtered = filtered.filter(m => m.sender === sender);
    if (receiver) filtered = filtered.filter(m => m.receiver === receiver);
    
    return filtered.slice(-limit);
  }
  
  // 启动 WebSocket 服务器（WebUI 订阅）
  startWSServer(port = WS_PORT) {
    if (this.wsServer) {
      console.log('⚠️ WebSocket 服务器已启动');
      return;
    }
    
    this.wsServer = new WebSocket.Server({ port });
    
    this.wsServer.on('connection', (ws) => {
      console.log('🔌 WebUI 已连接');
      
      // 发送历史消息
      ws.send(JSON.stringify({
        type: 'history',
        messages: this.getHistory({ limit: 100 })
      }));
      
      // 订阅新消息
      const listener = (newMessage, allMessages) => {
        ws.send(JSON.stringify({
          type: 'new_message',
          message: newMessage
        }));
      };
      
      this.subscribe(listener);
      
      ws.on('close', () => {
        console.log('🔌 WebUI 已断开');
        this.unsubscribe(listener);
      });
      
      ws.on('error', (err) => {
        console.error('❌ WebSocket 错误:', err.message);
      });
    });
    
    console.log(`🚀 WebSocket 服务器已启动：ws://localhost:${port}`);
  }
  
  // 停止 WebSocket 服务器
  stopWSServer() {
    if (this.wsServer) {
      this.wsServer.close();
      this.wsServer = null;
      console.log('⏸️ WebSocket 服务器已停止');
    }
  }
}

// 导出单例
const queue = new MessageQueue();

module.exports = {
  MessageQueue,
  queue,
  add: (message) => queue.add(message),
  subscribe: (listener) => queue.subscribe(listener),
  getHistory: (options) => queue.getHistory(options),
  startWSServer: (port) => queue.startWSServer(port),
  stopWSServer: () => queue.stopWSServer()
};
