Page({
  data: {
    baseUrl: '', // 存储带版本号的基础URL
    url: '',
    globalConfig: null,
    webviewLoaded: false
  },

  onLoad() {
    // 1. 在页面加载时初始化基础URL（只生成一次版本号，防止onShow时刷新）
    const BASE_URL = 'https://100000whys.cn/project/fushijie/webview/dist/index.html?item=c10c60ae-78e5-48da-9401-aa8d3e3908f4';
<<<<<<< HEAD

=======
>>>>>>> parent of 6aa0550 (Merge branch 'main' of https://github.com/aidegl/item)

    let rawBaseUrl = BASE_URL;
    console.log('[Webview] onLoad rawBaseUrl:', rawBaseUrl);

    // 添加防缓存参数（仅在小程序冷启动时生成一次）
    const timestamp = new Date().getTime();
    const separator = rawBaseUrl.includes('?') ? '&' : '?';
    const baseUrlWithVersion = `${rawBaseUrl}${separator}v=${timestamp}`;

    this.setData({ baseUrl: baseUrlWithVersion });
    console.log('[Webview] onLoad baseUrlWithVersion:', baseUrlWithVersion);

    // 初始化完整URL
    this.updateWebviewUrl();
    this.loadGlobalConfig(rawBaseUrl);
  },

  onShow() {
    this.updateWebviewUrl();
  },

  onWebviewLoad() {
    this.setData({ webviewLoaded: true });
    console.log('[Webview] onWebviewLoad webviewLoaded=true');
    this.postGlobalConfigToWebview();
  },

  parseQueryParam(url, key) {
    try {
      const queryIndex = url.indexOf('?');
      const hashIndex = url.indexOf('#');
      const queryPart = queryIndex >= 0
        ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined)
        : '';
      if (!queryPart) return '';
      const pairs = queryPart.split('&').filter(Boolean);
      for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (decodeURIComponent(k || '') === key) return decodeURIComponent(v || '');
      }
      return '';
    } catch (e) {
      return '';
    }
  },

  async loadGlobalConfig(rawBaseUrl) {
    const rowId = this.parseQueryParam(rawBaseUrl, 'item');
    if (!rowId) {
      console.warn('[Webview] loadGlobalConfig missing item(rowId)');
      this.setData({ globalConfig: { error: 'missing_item', rawBaseUrl } });
      this.postGlobalConfigToWebview();
      return;
    }

    const worksheetId = this.parseQueryParam(rawBaseUrl, 'worksheetId') || this.parseQueryParam(rawBaseUrl, 'sheet') || 'qjsz';
    const appKey = 'b37a969f03b3cf0b';
    const sign = 'MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==';
    const apiUrl = 'https://api.mingdao.com/v2/open/worksheet/getRowByIdPost';
    console.log('[Webview] loadGlobalConfig request:', { apiUrl, worksheetId, rowId });

    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: apiUrl,
          method: 'POST',
          data: {
            appKey,
            sign,
            worksheetId,
            rowId,
            getSystemControl: 'false'
          },
          header: {
            'content-type': 'application/json'
          },
          timeout: 8000,
          success: resolve,
          fail: reject
        });
      });

      const body = res && res.data;
      if (!body || !body.success) {
        console.warn('[Webview] loadGlobalConfig failed:', body);
        this.setData({
          globalConfig: {
            rowId,
            worksheetId,
            error: 'mingdao_failed',
            response: body || null
          }
        });
        this.postGlobalConfigToWebview();
        return;
      }
      const configRow = body.data || null;
      console.log('[Webview] loadGlobalConfig success:', { rowId, worksheetId, hasRow: !!configRow });
      this.setData({ globalConfig: { rowId, worksheetId, row: configRow } });
      this.postGlobalConfigToWebview();
    } catch (e) {
      console.error('[Webview] loadGlobalConfig exception:', e);
      this.setData({
        globalConfig: {
          rowId,
          worksheetId,
          error: 'request_exception',
          message: e && (e.errMsg || e.message) ? (e.errMsg || e.message) : String(e)
        }
      });
      this.postGlobalConfigToWebview();
    }
  },

  postGlobalConfigToWebview() {
    if (!this.data.webviewLoaded) {
      console.log('[Webview] postGlobalConfigToWebview skipped: webviewLoaded=false');
      return;
    }
    if (!this.data.globalConfig) {
      console.log('[Webview] postGlobalConfigToWebview skipped: globalConfig=null');
      return;
    }
    const ctx = wx.createWebViewContext('app-webview', this);
    console.log('[Webview] postGlobalConfigToWebview sending:', this.data.globalConfig);
    ctx.postMessage({
      data: {
        action: 'globalConfig',
        payload: this.data.globalConfig
      }
    });
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
