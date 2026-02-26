/**
 * PM2 进程配置
 * 使用方式: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'api-3003',
      script: 'start-3003.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
};
