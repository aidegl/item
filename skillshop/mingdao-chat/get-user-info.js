#!/usr/bin/env node
/**
 * 获取 OpenClaw 用户信息工具
 * 
 * 帮助 mingdao-chat 技能安装者获取必要的用户信息
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OpenClaw 用户信息获取工具\n');
console.log('='.repeat(50));

// 读取当前会话信息
const sessionsDir = '/home/admin/.openclaw/agents/main/sessions';
const currentSessionFile = process.argv[2];

console.log('\n📋 步骤 1: 获取你的 OpenClaw 用户信息\n');

console.log('请运行以下命令获取你的会话 ID：');
console.log('```bash');
console.log('ls -lt /home/admin/.openclaw/agents/main/sessions/*.jsonl | head -1');
console.log('```\n');

console.log('然后查看最新的会话文件内容：');
console.log('```bash');
console.log('tail -20 /path/to/your/latest-session.jsonl');
console.log('```\n');

console.log('在输出中查找：');
console.log('  - 你的用户名（role: "user" 的消息）');
console.log('  - AI 的用户名（role: "assistant" 的消息）');
console.log('  - 会话 ID（文件名）\n');

console.log('='.repeat(50));
console.log('\n📋 步骤 2: 获取明道云用户 RowID\n');

console.log('1. 登录明道云');
console.log('2. 进入应用 → 用户管理');
console.log('3. 找到对应用户，点击查看详情');
console.log('4. 复制 RowID（UUID 格式，如：7548a483-2b5b-4de0-be06-63b318ca52c4）\n');

console.log('你需要获取：');
console.log('  - AI 助手的 RowID（对应 xiaozong）');
console.log('  - 你的 RowID（对应 master 或 feng）\n');

console.log('='.repeat(50));
console.log('\n📋 步骤 3: 修改配置\n');

console.log('编辑 auto-hook.js：');
console.log('```javascript');
console.log('const USERS = {');
console.log('  xiaozong: \'你的 AI 助手 RowID\',  // ⚠️ 替换这里');
console.log('  feng: \'风的 RowID\',             // ⚠️ 替换这里（如果有）');
console.log('  master: \'你的 RowID\'            // ⚠️ 替换这里');
console.log('};');
console.log('```\n');

console.log('='.repeat(50));
console.log('\n📋 步骤 4: 验证配置\n');

console.log('运行配置检查：');
console.log('```bash');
console.log('cd /path/to/mingdao-chat');
console.log('node check-config.js');
console.log('```\n');

console.log('如果全部显示 ✅，说明配置正确！\n');

console.log('='.repeat(50));
console.log('\n💡 提示：\n');
console.log('1. RowID 是 UUID 格式，包含连字符（-）');
console.log('2. 确保不要复制错行或有多余空格');
console.log('3. 如果不确定，可以先测试一条消息');
console.log('4. 测试命令：node -e "require(\'./auto-hook.js\').enable(\'master\')"\n');

console.log('='.repeat(50));
console.log('\n✅ 完成以上步骤后，你的 mingdao-chat 技能就可以正常使用了！\n');
