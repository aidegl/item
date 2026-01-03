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
        });
    });
});
