/**
 * PM2 进程配置
 * 使用方式: pm2 start ecosystem.config.js
 */
module.exports = {
  apps: [
    {
      name: 'api-3003',
      script: 'wxApp.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        PORT: '3003'
      },
      autorestart: true,
      watch: false
    }
  ]
};
