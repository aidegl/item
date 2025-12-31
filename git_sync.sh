#!/bin/bash
# 定义变量：站点目录（替换为你的实际目录）、Git 分支（替换为你的分支名，如 master）
SITE_DIR="/www/wwwroot/your-site"
GIT_BRANCH="main"

# 切换到站点目录
cd $SITE_DIR || exit 1

# 拉取 Git 仓库最新代码（若为 HTTPS 仓库，需确保已配置凭证缓存，或用 SSH 免密）
git pull origin $GIT_BRANCH

# 可选：若项目需要依赖安装（如 PHP Composer、Node NPM），可添加以下命令
# composer install --no-dev
# npm install --production

# 可选：给站点目录赋予 www 权限（避免宝塔站点权限不足）
chown -R www:www $SITE_DIR