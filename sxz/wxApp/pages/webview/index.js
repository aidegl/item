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
    const PROD_URL = 'https://100000whys.cn/project/sxz/webview0/index.html';

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
    console.log('--- [步骤5] Webview 容器 onShow ---');
    console.log('当前 Webview URL:', this.data.url);
    console.log('当前 aiContent 数据状态:', this.data.aiContent ? '有数据(长度' + this.data.aiContent.length + ')' : '无数据');
    
    // 检查是否有来自原生页面的识别结果
    if (this.data.aiContent) {
      const content = this.data.aiContent;
      console.log('[步骤6] 准备将数据同步到 Webview Hash');
      // 清除 aiContent，防止重复处理
      this.setData({ aiContent: '' }, () => {
        console.log('[步骤7] aiContent 已清空，开始执行 sendDataToWebviewByHash');
        this.sendDataToWebviewByHash('stt_result', content);
      });
      return;
    }

    // 仅在非录音状态下尝试同步 openid，且不强制刷新
    if (!this.data.isRecording) {
      this.updateWebviewUrl(false);
    }

    // 检查录音权限
    this.checkRecordPermission();
  },

  // 通过 Hash 向 WebView 发送数据
  sendDataToWebviewByHash(key, value) {
    const currentUrl = this.data.url;
    if (!currentUrl) {
      console.error('[步骤8] 失败：currentUrl 为空');
      return;
    }

    // 移除旧的同名 hash 参数
    let baseUrl = currentUrl.split('#')[0];
    let hash = currentUrl.split('#')[1] || '';
    
    let hashParams = hash.split('&').filter(p => p && !p.startsWith(`${key}=`));
    hashParams.push(`${key}=${encodeURIComponent(value)}`);
    
    const newUrl = `${baseUrl}#${hashParams.join('&')}`;
    
    console.log('[步骤8] 更新 URL 以发送数据，新 URL:', newUrl);
    this.setData({ url: newUrl }, () => {
      console.log('[步骤9] Webview URL setData 完成，等待 WebView 内部监听');
    });
  },

  // 检查录音权限
  checkRecordPermission() {
    console.log('[Webview] 检查录音权限');
    wx.getSetting({
      success: (res) => {
        console.log('[Webview] 当前权限设置:', res.authSetting);
        if (!res.authSetting['scope.record']) {
          console.log('[Webview] 未授权录音权限，请求授权');
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              console.log('[Webview] 录音权限授权成功');
            },
            fail: () => {
              console.error('[Webview] 录音权限授权失败');
              wx.showToast({
                title: '需要录音权限',
                icon: 'none'
              });
              // 打开设置页面
              setTimeout(() => {
                wx.openSetting({
                  success: (res) => {
                    console.log('[Webview] 设置页面返回:', res.authSetting);
                  }
                });
              }, 1500);
            }
          });
        } else {
          console.log('[Webview] 已授权录音权限');
        }
      },
      fail: (err) => {
        console.error('[Webview] 获取权限设置失败:', err);
      }
    });
  },

  updateWebviewUrl(isInitial = false) {
    const app = getApp();
    const globalOpenid = (app && app.globalData && app.globalData.openid) || '';
    const storedOpenid = wx.getStorageSync('openid') || '';
    const openid = globalOpenid || storedOpenid;
    const baseUrl = this.data.baseUrl;

    if (!baseUrl) return;

    let finalUrl = baseUrl;
    if (openid) {
      finalUrl += `#openid=${openid}`;
    } else {
      finalUrl += `#openid=`;
    }

    const currentUrl = this.data.url;
    if (isInitial || !currentUrl) {
      this.setData({ url: finalUrl });
      return;
    }

    let currentOpenid = '';
    const hashIndex = currentUrl.indexOf('#');
    if (hashIndex >= 0) {
      const hash = currentUrl.slice(hashIndex + 1);
      const pairs = hash.split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.indexOf('openid=') === 0) {
          currentOpenid = decodeURIComponent(pair.split('=')[1] || '');
          break;
        }
      }
    }

    const nextOpenid = openid || '';
    if (currentOpenid !== nextOpenid) {
      console.log('[Webview] 登录状态变化，刷新 WebView，openid:', nextOpenid || '(空)');
      this.setData({ url: finalUrl });
    }
  },

  onMessage(e) {
    console.log('[Webview] 收到来自Webview的消息:', JSON.stringify(e.detail, null, 2));
    const data = e.detail.data;
    if (data && data.length > 0) {
      const lastMsg = data[data.length - 1];
      console.log('[Webview] 处理最后一条消息:', JSON.stringify(lastMsg, null, 2));

      // 处理来自Webview的消息
      if (lastMsg.type === 'STT_ACTION') {
        console.log('[Webview] 调用handleSTTAction:', lastMsg.action);
        this.handleSTTAction(lastMsg.action);
      }
      // 处理其他类型的消息
      else {
        console.log('[Webview] 收到未处理类型的消息:', lastMsg.type);
      }
    } else {
      console.log('[Webview] 未收到有效消息数据');
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
    console.log('[Webview] handleSTTAction 开始执行:', action);
    if (action === 'start') {
      console.log('[Webview] 开始录音');
      this.setData({ isRecording: true });
      try {
        manager.start({ duration: 30000, lang: 'zh_CN' });
        console.log('[Webview] manager.start 调用成功');
        wx.showToast({ title: '开始录音', icon: 'success' });
      } catch (error) {
        console.error('[Webview] manager.start 调用失败:', error);
        wx.showToast({ title: '录音失败', icon: 'none' });
        this.setData({ isRecording: false });
      }
    } else if (action === 'stop') {
      console.log('[Webview] 停止录音');
      try {
        manager.stop();
        console.log('[Webview] manager.stop 调用成功');
      } catch (error) {
        console.error('[Webview] manager.stop 调用失败:', error);
      }
    }
  },

  handleStopRecording() {
    this.handleSTTAction('stop');
  },

  sendTextToWebview(text) {
    console.log('[Webview] 调用sendTextToWebview:', text);

    // 使用postMessage直接向webview发送识别结果
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const webviewContext = wx.createWebViewContext('webview');

    webviewContext.postMessage({
      data: {
        type: 'STT_RESULT',
        text: text,
        timestamp: Date.now()
      }
    });

    console.log('[Webview] 识别结果已通过postMessage发送:', text);
  }
})
