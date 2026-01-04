document.addEventListener('DOMContentLoaded', function() {
    // 版本号逻辑
    var version = "v1.0.0";
    console.log("App Version: " + version);
    var versionEl = document.getElementById('app-version');
    if (versionEl) {
        versionEl.innerText = version;
    }

    // 底部导航栏切换逻辑
    const tabItems = document.querySelectorAll('.tab-item');
    
    // 图标资源映射 (未选中状态 -> 选中状态)
    // 注意：task (中间按钮) 只有一张图，不需要切换
    const iconMap = {
        'home': { normal: './assets/img/home0.png', active: './assets/img/home1.png' },
        'agent': { normal: './assets/img/agent0.png', active: './assets/img/agent1.png' },
        'chat': { normal: './assets/img/chat0.png', active: './assets/img/chat1.png' },
        'me': { normal: './assets/img/me0.png', active: './assets/img/me1.png' }
    };

    const pages = {
        home: document.getElementById('page-home'),
        agent: document.getElementById('page-agent'),
        chat: document.getElementById('page-chat'),
        me: document.getElementById('page-me')
    };

    function showPage(name) {
        Object.keys(pages).forEach(function(key) {
            var el = pages[key];
            if (el) el.classList.remove('active');
        });
        var target = pages[name];
        if (target) target.classList.add('active');
    }

    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 中间按钮(task)特殊处理，可能不需要切换选中状态，或者有单独逻辑
            if (tabName === 'task') {
                console.log('点击了发布/任务按钮');
                return;
            }

            // 移除所有激活状态
            tabItems.forEach(tab => {
                tab.classList.remove('active');
                const tName = tab.getAttribute('data-tab');
                const iconImg = tab.querySelector('.tab-icon');
                
                // 恢复普通图标
                if (iconMap[tName] && iconImg) {
                    iconImg.src = iconMap[tName].normal;
                }
            });

            // 激活当前点击项
            this.classList.add('active');
            const iconImg = this.querySelector('.tab-icon');
            if (iconMap[tabName] && iconImg) {
                iconImg.src = iconMap[tabName].active;
            }
            
            console.log('切换到标签:', tabName);
            showPage(tabName);
        });
    });

    showPage('home');

    var login = new WechatLogin({
        miniProgramLoginUrl: '/pages/login/index',
        miniProgramLogoutUrl: '/pages/login/index',
        defaultAvatar: './assets/img/me0.png'
    });
    function syncUserUI() {
        var nameEl = document.querySelector('#page-me .user-name');
        var avatarEl = document.querySelector('#page-me .user-avatar');
        if (!nameEl || !avatarEl) return;
        if (login.isLoggedIn()) {
            var info = login.getUserInfo();
            nameEl.innerText = info && info.name ? info.name : '已登录';
            if (info && info.avatar) {
                avatarEl.src = info.avatar;
            }
        } else {
            nameEl.innerText = '未登录';
            avatarEl.src = './assets/img/me0.png';
        }
    }
    var settingsItem = Array.from(document.querySelectorAll('#page-me .me-menu .menu-item')).find(function(item) {
        var t = item.querySelector('.menu-text');
        return t && t.textContent.trim() === '设置';
    });
    if (settingsItem) {
        settingsItem.addEventListener('click', function() {
            login.toWxLogin();
        });
    }
    window.addEventListener('hashchange', syncUserUI);
    syncUserUI();
});
