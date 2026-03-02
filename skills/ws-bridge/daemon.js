#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKSPACE = '/home/admin/openclaw/workspace';
const SERVER_PATH = path.join(WORKSPACE, 'skills', 'ws-bridge', 'server.js');
const LOG_FILE = '/tmp/ws-bridge-daemon.log';

const RESTART_DELAY = 30000; // 30 秒后重启（降低重启频率，避免 frequent restarts）
const MAX_RESTARTS = 1000;

let process = null;
let restartCount = 0;

function log(message) {
  const timestamp = new Date().toLocaleString('zh-CN');
  const msg = `[${timestamp}] ${message}`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

function startServer() {
  log(`🚀 启动 WebSocket 服务 (第 ${restartCount + 1} 次)`);
  
  process = spawn('node', [SERVER_PATH], {
    cwd: WORKSPACE,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  process.stdout.on('data', (data) => {
    const line = data.toString().trim();
    if (line) log(`stdout: ${line}`);
  });
  
  process.stderr.on('data', (data) => {
    const line = data.toString().trim();
    if (line) log(`stderr: ${line}`);
  });
  
  process.on('close', (code) => {
    log(`❌ 服务意外退出，退出码: ${code}`);
    
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      log(`⏳ ${RESTART_DELAY / 1000} 秒后重启...`);
      setTimeout(startServer, RESTART_DELAY);
    } else {
      log(`❌ 已达到最大重启次数，停止尝试`);
    }
  });
  
  process.on('error', (error) => {
    log(`❌ 启动失败: ${error.message}`);
  });
}

log('WebSocket Bridge 守护进程已启动');
startServer();
