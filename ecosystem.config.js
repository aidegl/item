// PM2 配置文件 - /home/admin/openclaw/workspace/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ws-bridge',
      script: '/home/admin/openclaw/workspace/skills/ws-bridge/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/tmp/pm2-ws-bridge-error.log',
      out_file: '/tmp/pm2-ws-bridge-out.log',
      log_file: '/tmp/pm2-ws-bridge-combined.log',
      time: true,
      restart_delay: 30000,
      max_memory_restart: '512M'
    }
  ]
};
