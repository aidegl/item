let globalCssText = '';

function ensureGlobalStyle(cssText) {
    const id = 'global-style';
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement('style');
        el.id = id;
        head.appendChild(el);
    }
    if (el.textContent !== cssText) el.textContent = cssText;
}

function pickCssText(row) {
    if (!row || typeof row !== 'object') return '';
    const keys = ['css', 'style', 'globalCss', 'globalStyle', 'yangshi', '样式', '主题', 'theme', 'cssText'];
    for (const k of keys) {
        const v = row[k];
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    for (const k of Object.keys(row)) {
        const v = row[k];
        if (typeof v === 'string') {
            const s = v.trim();
            if (!s) continue;
            if (s.includes('{') && s.includes('}') && (s.includes('.') || s.includes('#') || s.includes(':root'))) return s;
        }
    }
    return '';
}

function handleGlobalConfig(data) {
    const action = data && data.action;
    if (action !== 'globalConfig') return;
    const payload = data && data.payload;
    const row = payload && payload.row;
    console.log('[GlobalConfig] received:', payload);
    const cssText = pickCssText(row);
    if (cssText && cssText !== globalCssText) {
        globalCssText = cssText;
        ensureGlobalStyle(cssText);
    }
}

function parseQueryParams() {
    const out = {};
    const qs = (location.search || '').replace(/^\?/, '');
    if (!qs) return out;
    qs.split('&').forEach(function (kv) {
        if (!kv) return;
        const idx = kv.indexOf('=');
        const k = idx >= 0 ? kv.slice(0, idx) : kv;
        const v = idx >= 0 ? kv.slice(idx + 1) : '';
        const key = decodeURIComponent(k || '');
        if (!key) return;
        out[key] = decodeURIComponent(v || '');
    });
    return out;
}

function initGlobalConfig() {
    try {
        const params = parseQueryParams();
        const rowId = params.item;
        const worksheetId = params.worksheetId || params.sheet || 'qjsz';
        if (rowId && window.MingDaoYunAPI) {
            const api = new window.MingDaoYunAPI();
            api.getData(rowId, worksheetId).then(function (res) {
                if (res && res.success) {
                    handleGlobalConfig({
                        action: 'globalConfig',
                        payload: { rowId: rowId, worksheetId: worksheetId, row: res.data }
                    });
                } else {
                    handleGlobalConfig({
                        action: 'globalConfig',
                        payload: { rowId: rowId, worksheetId: worksheetId, error: 'mingdao_failed', response: res || null }
                    });
                }
            }).catch(function (err) {
                handleGlobalConfig({
                    action: 'globalConfig',
                    payload: { rowId: rowId, worksheetId: worksheetId, error: 'request_exception', message: String(err && (err.message || err.errMsg) || err) }
                });
            });
        }
    } catch (e) {
        console.error('[GlobalConfig] init exception:', e);
    }

    window.addEventListener('message', (e) => {
        const payload = e && e.data;
        if (!payload) return;
        if (payload && payload.action) {
            handleGlobalConfig(payload);
            return;
        }
        if (payload && payload.data && payload.data.action) {
            handleGlobalConfig(payload.data);
            return;
        }
        if (Array.isArray(payload) && payload.length > 0) {
            const last = payload[payload.length - 1];
            if (last && last.action) handleGlobalConfig(last);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.VConsole && !window.vConsole) {
        window.vConsole = new window.VConsole();
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

    function setPageTheme(name) {
        document.body.classList.toggle('is-page-agent', name === 'agent');
    }

    function showPage(name) {
        Object.keys(pages).forEach(function (key) {
            var el = pages[key];
            if (el) el.classList.remove('active');
        });
        var target = pages[name];
        if (target) target.classList.add('active');
        setPageTheme(name);
    }

    tabItems.forEach(item => {
        item.addEventListener('click', function () {
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

    initGlobalConfig();
    showPage('home');
});
