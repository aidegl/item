#!/usr/bin/env node
/**
 * 明道云消息队列发送器
 * 读取消息队列并发送到当前渠道
 */

const fs = require('fs');
const path = require('path');

const MESSAGE_QUEUE_FILE = path.join(__dirname, '.message-queue.json');
const SESSIONS_DIR = '/home/admin/.openclaw/agents/main/sessions';

function getCurrentSessionChannel() {
  // Look for the main session file
  const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
  
  for (const file of files) {
    const filePath = path.join(SESSIONS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      // Find the first message with channel info
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const msg = JSON.parse(lines[i]);
          if (msg.channel) {
            return msg.channel;
          }
          if (msg.message && msg.message.channel) {
            return msg.message.channel;
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  return 'webchat'; // default
}

async function sendMessages() {
  if (!fs.existsSync(MESSAGE_QUEUE_FILE)) {
    console.log('消息队列文件不存在');
    return;
  }
  
  let queue;
  try {
    queue = JSON.parse(fs.readFileSync(MESSAGE_QUEUE_FILE, 'utf8'));
  } catch (e) {
    console.error('读取队列失败:', e.message);
    return;
  }
  
  if (!queue.length) {
    console.log('队列为空');
    return;
  }
  
  const channel = getCurrentSessionChannel();
  console.log(`目标渠道: ${channel}`);
  console.log(`待发送消息数: ${queue.length}`);
  
  let sent = 0;
  let failed = 0;
  
  // Send messages via sessions_send (should work from daemon context)
  const { sessions_send } = require('@openclaw/tools');
  
  for (let i = queue.length - 1; i >= 0; i--) {
    const msg = queue[i];
    if (msg.injected) continue;
    
    const messageText = `[明道云消息]\n**${msg.sender}** ${new Date(msg.time).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n${msg.content}`;
    
    try {
      await sessions_send.send({
        sessionKey: null, // Use current session
        channel: channel,
        message: messageText
      });
      
      msg.injected = true;
      sent++;
      console.log(`✅ ${msg.sender}: ${msg.content.substring(0, 30)}...`);
    } catch (e) {
      console.error(`❌ ${msg.sender}: ${e.message}`);
      failed++;
    }
  }
  
  // Save updated queue
  fs.writeFileSync(MESSAGE_QUEUE_FILE, JSON.stringify(queue, null, 2));
  
  console.log(`\n发送完成: ${sent} 成功, ${failed} 失败`);
}

sendMessages().catch(console.error);
