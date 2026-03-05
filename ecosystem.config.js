/**
 * PM2 配置文件 - 远程服务器部署（宝塔版）
 * 保存位置：远程服务器 /www/wwwroot/100000whys.cn/project/fsj/ecosystem.config.js
 * 使用方式：pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'fsj-server',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        DOTENV_CONFIG_PATH: './config/.env.production'
      },
      error_file: '/www/wwwlogs/pm2-fsj-error.log',
      out_file: '/www/wwwlogs/pm2-fsj-out.log',
      log_file: '/www/wwwlogs/pm2-fsj-combined.log',
      time: true,
      restart_delay: 30000,
      max_memory_restart: '512M',
      port: 3010
    }
  ]
};
