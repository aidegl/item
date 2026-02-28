/**
 * 启动 wxApp 登录服务在 3003 端口
 * 用法: node start-3003.js 或 pm2 start start-3003.js --name api-3003
 */
process.env.PORT = '3003';
require('./wxApp.js');
