/**
 * 应用入口 - SPA单页面应用
 */
class App {
    constructor() {
        this.currentPage = null;
        this.init();
    }

    init() {
        // 初始化路由
        this.initRouter();
        // 加载默认页面
        this.loadPage('pixel-canvas');
    }

    initRouter() {
        // 监听路由变化（可根据小程序webview的postMessage实现）
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'navigate') {
                this.loadPage(event.data.page);
            }
        });
    }

    async loadPage(pageName) {
        const app = document.getElementById('app');
        
        if (!app) {
            console.error('找不到 #app 元素');
            return;
        }
        
        // 清理当前页面
        if (this.currentPage && this.currentPage.destroy) {
            this.currentPage.destroy();
        }
        app.innerHTML = '';

        // 动态加载页面
        try {
            const pageModule = await import(`./pages/${pageName}/index.js`);
            const page = new pageModule.default(app);
            this.currentPage = page;
        } catch (error) {
            console.error('页面加载失败:', error);
            app.innerHTML = `<div style="padding: 20px; color: red;">页面加载失败: ${error.message}<br>请确保使用开发服务器运行（如：python -m http.server 8080）</div>`;
        }
    }
}

// 启动应用
new App();
