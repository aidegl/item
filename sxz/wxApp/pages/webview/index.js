const plugin = requirePlugin('WechatSI');
const manager = plugin.getRecordRecognitionManager();

Page({
  data: {
    baseUrl: '', // 存储带版本号的基础URL
    url: '',
    isRecording: false
  },

  onLoad(options) {
    // 初始化录音识别
    this.initRecord();

    // 1. 在页面加载时初始化基础URL（只生成一次版本号，防止onShow时刷新）
    const IS_DEBUG = false; // true为本地调试，false为线上
    const LOCAL_URL = 'http://127.0.0.1:5500/webview/dist/index.html';
    const PROD_URL = 'https://100000whys.cn/project/sxz/webview/index.html';

    let rawBaseUrl = IS_DEBUG ? LOCAL_URL : PROD_URL;

    // 添加防缓存参数（仅在小程序冷启动时生成一次）
    const timestamp = new Date().getTime();
    const separator = rawBaseUrl.includes('?') ? '&' : '?';
    const baseUrlWithVersion = `${rawBaseUrl}${separator}v=${timestamp}`;

    console.log('[Webview] onLoad, baseUrl:', baseUrlWithVersion);
    this.setData({ baseUrl: baseUrlWithVersion }, () => {
      // 检查是否有 STT 指令
      if (options.action === 'stt') {
        this.handleSTTAction(options.command);
      }
      // 初始加载 URL
      this.updateWebviewUrl(true);
    });
  },

  onShow() {
    console.log('[Webview] onShow');
    // 仅在非录音状态下尝试同步 openid，且不强制刷新
    if (!this.data.isRecording) {
      this.updateWebviewUrl(false);
    }
  },

  updateWebviewUrl(isInitial = false) {
    const app = getApp();
    const openid = (app && app.globalData && app.globalData.openid) || wx.getStorageSync('openid');
    const baseUrl = this.data.baseUrl;

    if (!baseUrl) return;

    // 构建目标 URL
    let finalUrl = baseUrl;
    if (openid) {
      finalUrl += `#openid=${openid}`;
    } else {
      finalUrl += `#openid=`;
    }

    // 如果是初始加载，或者 URL 真的变了（不计较 hash 后面的时间戳）才 setData
    const currentUrl = this.data.url;
    const currentUrlNoHash = currentUrl.split('#')[0];
    const finalUrlNoHash = finalUrl.split('#')[0];

    if (isInitial || currentUrlNoHash !== finalUrlNoHash) {
      // 只有在基础 URL 变化时才更新，避免 hash 变化引起刷新
      this.setData({ url: finalUrl });
    }
  },

  onMessage(e) {
    console.log('[Webview] 收到消息:', e.detail);
    const data = e.detail.data;
    if (data && data.length > 0) {
      const lastMsg = data[data.length - 1];
      // 处理来自Webview的消息
      if (lastMsg.type === 'STT_ACTION') {
        this.handleSTTAction(lastMsg.action);
      }
    }
  },

  initRecord() {
    manager.onRecognize = (res) => {
      console.log('识别中...', res.result);
    };
    manager.onStop = (res) => {
      console.log('识别结束', res.result);
      const text = res.result;
      this.setData({ isRecording: false });
      if (text) {
        this.sendTextToWebview(text);
      } else {
        wx.showToast({ title: '未能识别语音', icon: 'none' });
      }
    };
    manager.onError = (res) => {
      console.error('识别错误', res);
      this.setData({ isRecording: false });
      wx.showToast({ title: '识别出错', icon: 'none' });
    };
  },

  handleSTTAction(action) {
    if (action === 'start') {
      this.setData({ isRecording: true });
      manager.start({ duration: 30000, lang: 'zh_CN' });
    } else if (action === 'stop') {
      manager.stop();
    }
  },

  handleStopRecording() {
    this.handleSTTAction('stop');
  },

  sendTextToWebview(text) {
    const baseUrl = this.data.baseUrl;
    const app = getApp();
    const openid = (app && app.globalData && app.globalData.openid) || wx.getStorageSync('openid');
    
    // 仅通过 hash 传参，避免基础路径变化导致刷新
    const hashStr = `#openid=${openid || ''}&stt_result=${encodeURIComponent(text)}&t=${Date.now()}`;
    const finalUrl = baseUrl + hashStr;
    
    console.log('[Webview] 发送识别结果 (Hash):', hashStr);
    this.setData({ url: finalUrl });
  }
})
