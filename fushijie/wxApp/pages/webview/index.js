Page({
  data: {
    baseUrl: '', // 存储带版本号的基础URL
    url: ''
  },

  onLoad() {
    // 1. 在页面加载时初始化基础URL（只生成一次版本号，防止onShow时刷新）
    const BASE_URL = 'https://100000whys.cn/project/fushijie/webview/dist/index.html';

    let rawBaseUrl = BASE_URL;

    // 添加防缓存参数（仅在小程序冷启动时生成一次）
    const timestamp = new Date().getTime();
    const separator = rawBaseUrl.includes('?') ? '&' : '?';
    const baseUrlWithVersion = `${rawBaseUrl}${separator}v=${timestamp}`;

    this.setData({ baseUrl: baseUrlWithVersion });

    // 初始化完整URL
    this.updateWebviewUrl();
  },

  onShow() {
    this.updateWebviewUrl();
  },

  updateWebviewUrl() {
    const openid = wx.getStorageSync('openid');
    console.log('[Webview] 当前 openid:', openid);
    // 使用 onLoad 中生成的固定基础 URL
    const baseUrl = this.data.baseUrl;

    if (!baseUrl) return; // 防止异常

    if (openid) {
      // 登录状态：添加 Hash 参数（Hash 变化不会导致页面刷新，只会触发 hashchange）
      // 添加时间戳确保每次 onShow 都能触发 Hash 变化（通知 Webview 同步状态）
      const t = new Date().getTime();
      const finalUrl = `${baseUrl}#openid=${openid}&t=${t}`;

      // 只有当 URL 真正变化时才更新（避免重复 setData）
      if (this.data.url !== finalUrl) {
        this.setData({ url: finalUrl });
        console.log('[Webview] 更新 Hash (无刷新):', finalUrl);
      }
    } else {
      // 未登录或匿名：传递空 openid 标识
      const t = new Date().getTime();
      const emptyUrl = `${baseUrl}#openid=&t=${t}`;
      if (this.data.url !== emptyUrl) {
        this.setData({ url: emptyUrl });
        console.log('[Webview] 未登录/匿名，更新 Hash:', emptyUrl);
      }
    }
  },

  onMessage(e) {
    const data = e.detail.data;
    if (!data || data.length === 0) return;
    const lastMsg = data[data.length - 1];
    if (!lastMsg || typeof lastMsg !== 'object') return;
    const action = lastMsg.action;
    if (action === 'navigate' && lastMsg.url) {
      const url = lastMsg.url;
      if (lastMsg.method === 'switchTab') {
        wx.switchTab({ url });
      } else {
        wx.navigateTo({ url });
      }
    } else if (action === 'logout') {
      wx.removeStorageSync('openid');
      this.updateWebviewUrl();
    } else if (action === 'log') {
      const scope = lastMsg.scope || 'H5';
      const event = lastMsg.event || '-';
      const info = lastMsg.data || lastMsg.payload || lastMsg.message || {};
      console.log(`[Webview] 来自H5日志 [${scope}] ${event}:`, info);
    }
  }
}) 
