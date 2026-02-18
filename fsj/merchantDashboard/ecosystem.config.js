module.exports = {
  apps: [{
    name: 'miniprogram-generator-3001',
    script: './server.js',
    cwd: '/www/wwwroot/100000whys.cn/project/fsj/merchantDashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};