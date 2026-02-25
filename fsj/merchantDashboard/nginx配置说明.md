# Nginx 完整配置（api.100000whys.cn）

**关键修改**：`location /api/core/` 的 `proxy_pass` 去掉末尾斜杠，让 Node 收到完整路径 `/api/core/api/phone-login`，与 wxApp 路由一致。
