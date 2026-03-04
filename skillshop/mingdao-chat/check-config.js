#!/usr/bin/env node
/**
 * 明道云配置检查脚本
 * 
 * 帮助其他用户验证配置是否正确
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🔍 明道云配置检查工具\n');

// 读取 auto-hook.js
const hookPath = path.join(__dirname, 'auto-hook.js');
if (!fs.existsSync(hookPath)) {
  console.error('❌ 找不到 auto-hook.js');
  process.exit(1);
}

const hookContent = fs.readFileSync(hookPath, 'utf-8');

// 检查配置
const checks = [
  {
    name: 'AppKey',
    pattern: /appkey:\s*'([^']+)'/,
    valid: (v) => v && v.length > 10 && !v.includes('你的'),
    hint: '应该是明道云 API 的 AppKey'
  },
  {
    name: 'Sign',
    pattern: /sign:\s*'([^']+)'/,
    valid: (v) => v && v.length > 20 && !v.includes('你的'),
    hint: '应该是明道云 API 的 Sign'
  },
  {
    name: '对话工作表 ID',
    pattern: /dialogWorksheet:\s*'([^']+)'/,
    valid: (v) => v && v.length === 24 && !v.includes('你的'),
    hint: '应该是 24 位字符串'
  },
  {
    name: '消息工作表 ID',
    pattern: /messageWorksheet:\s*'([^']+)'/,
    valid: (v) => v && v.length === 24 && !v.includes('你的'),
    hint: '应该是 24 位字符串'
  },
  {
    name: '用户映射 (xiaozong)',
    pattern: /xiaozong:\s*'([^']+)'/,
    valid: (v) => v && v.includes('-') && !v.includes('你的'),
    hint: '应该是 UUID 格式'
  },
  {
    name: '用户映射 (feng)',
    pattern: /feng:\s*'([^']+)'/,
    valid: (v) => v && v.includes('-') && !v.includes('你的'),
    hint: '应该是 UUID 格式'
  },
  {
    name: '用户映射 (master)',
    pattern: /master:\s*'([^']+)'/,
    valid: (v) => v && v.includes('-') && !v.includes('你的'),
    hint: '应该是 UUID 格式'
  }
];

let allPassed = true;

checks.forEach(check => {
  const match = hookContent.match(check.pattern);
  const value = match ? match[1] : null;
  const passed = value && check.valid(value);
  
  if (passed) {
    console.log(`✅ ${check.name}: 已配置`);
  } else {
    console.log(`❌ ${check.name}: 未配置或配置错误`);
    console.log(`   💡 ${check.hint}`);
    console.log(`   📝 当前值：${value || 'null'}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('✅ 所有配置检查通过！');
  console.log('\n下一步：启动守护进程');
  console.log('  node auto-record-daemon.js > daemon.log 2>&1 &');
} else {
  console.log('❌ 部分配置未正确设置');
  console.log('\n请编辑 auto-hook.js 修改配置');
  console.log('或参考 config.example.js 模板');
  process.exit(1);
}

// 测试 API 连接（可选）
console.log('\n是否测试 API 连接？(y/n)');
// 这里可以添加交互式测试，但为了简单起见跳过
