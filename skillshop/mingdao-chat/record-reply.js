#!/usr/bin/env node
/**
 * 记录回复到明道云
 * 
 * 用法：
 *   node record-reply.js "回复内容"
 * 
 * 或在代码中：
 *   const recordReply = require('./record-reply.js');
 *   await recordReply("回复内容");
 */

const autoHook = require('./auto-hook.js');

async function recordReply(content, userId = 'master') {
  try {
    // 启用自动记录（如果还没启用）
    if (!autoHook.isEnabled) {
      autoHook.enable(userId);
    }
    
    // 记录回复（保持原始换行符）
    await autoHook.recordReply(content, userId);
    
    console.log('✅ 已记录到明道云');
  } catch (error) {
    console.error('❌ 记录失败:', error.message);
    throw error;
  }
}

// CLI 模式 - 从 stdin 读取完整内容（保留换行符）
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--stdin')) {
    // 从 stdin 读取（保留完整格式）
    let content = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        content += chunk;
      }
    });
    process.stdin.on('end', () => {
      content = content.trim();
      if (content) {
        recordReply(content).catch(err => {
          console.error('错误:', err.message);
          process.exit(1);
        });
      }
    });
  } else if (args.length >= 1) {
    // 从参数读取（处理转义）
    const content = args.join(' ').replace(/\\n/g, '\n');
    
    recordReply(content).catch(err => {
      console.error('错误:', err.message);
      process.exit(1);
    });
  } else {
    console.log('用法：node record-reply.js "回复内容"');
    console.log('   或：echo "内容" | node record-reply.js --stdin');
    process.exit(1);
  }
}

// 导出
module.exports = recordReply;
