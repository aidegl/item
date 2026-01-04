/**
 * 微信小程序Webview登录模块
 * 用于在小程序嵌套Webview的场景下实现登录功能
 */

class WechatLogin {
  constructor(options = {}) {
    // 配置参数
    this.config = {
      miniProgramLoginUrl: options.miniProgramLoginUrl || '/pages/login/index',
      miniProgramLogoutUrl: options.miniProgramLogoutUrl || '/pages/login/index',
      mingdaoAppKey: options.mingdaoAppKey,
      mingdaoSign: options.mingdaoSign,
      mingdaoWorksheetId: options.mingdaoWorksheetId || 'yonghu', // 默认用户表
      mingdaoApiUrl: options.mingdaoApiUrl || 'https://api.mingdao.com/v2/open/worksheet/getRowByIdPost',
      openidField: options.openidField || 'openId', // 明道云中存储openid的字段名
      defaultAvatar: options.defaultAvatar || './assets/morentouxiang.webp',
      ...options
    };

    // 状态管理
    this.state = {
      isLoggedIn: false,
      userInfo: null,
      openid: null
    };

    // 初始化
    this.init();
  }

  /**
   * 初始化登录模块
   */
  init() {
    // 自动处理认证逻辑
    this.handleAuthLogic();

    // 监听hash变化
    window.addEventListener('hashchange', () => {
      this.handleAuthLogic();
    });

    // 页面加载时也检查一次
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.handleAuthLogic();
      });
    } else {
      this.handleAuthLogic();
    }
  }

  /**
   * 跳转到微信小程序登录页面
   */
  toWxLogin() {
    this.log('交互日志', '点击立即登录，跳转小程序');

    if (this.isInMiniProgram()) {
      this.ensureMiniProgramReady().then(() => {
        if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
          this.log('调用 wx.miniProgram.navigateTo', this.config.miniProgramLoginUrl);
          wx.miniProgram.navigateTo({
            url: this.config.miniProgramLoginUrl,
            success: (res) => {
              this.log('跳转成功', res);
            },
            fail: (err) => {
              this.error('跳转失败', err);
              alert('跳转失败: ' + JSON.stringify(err));
              if (typeof wx.miniProgram.postMessage === 'function') {
                this.postToMiniProgram({ action: 'navigate', url: this.config.miniProgramLoginUrl });
              }
            }
          });
        } else if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === 'function') {
          this.postToMiniProgram({ action: 'navigate', url: this.config.miniProgramLoginUrl });
        } else {
          this.error('微信JSSDK未加载');
          this.navigateToMiniProgram(this.config.miniProgramLoginUrl);
        }
      });
    } else {
      this.error('非小程序环境，无法跳转');
      alert('请在微信小程序中打开');
    }
  }

  /**
   * 跳转到微信小程序退出登录页面
   */
  toWxLogout() {
    this.log('交互日志', '点击退出登录，跳转小程序');

    if (this.isInMiniProgram()) {
      this.ensureMiniProgramReady().then(() => {
        if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
          wx.miniProgram.navigateTo({ url: this.config.miniProgramLogoutUrl });
        } else if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === 'function') {
          this.postToMiniProgram({ action: 'navigate', url: this.config.miniProgramLogoutUrl });
        } else {
          this.error('微信JSSDK未加载');
          this.navigateToMiniProgram(this.config.miniProgramLogoutUrl);
        }
      });
    } else {
      this.error('非小程序环境，无法跳转');
      alert('请在微信小程序中打开');
    }
  }

  /**
   * 通用的小程序跳转方法
   * @param {string} url - 小程序页面路径
   */
  navigateToMiniProgram(url) {
    // 如果有自定义的跳转方法，可以在这里实现
    // 例如：通过自定义协议或postMessage等方式
    this.log('尝试使用通用方法跳转小程序', url);

    // 可以在这里添加其他跳转方式的实现
    if (window.wx && typeof wx.miniProgram === 'undefined') {
      // 尝试重新初始化微信JSSDK
      this.initWxJSSDK();
    }
  }

  ensureMiniProgramReady(timeout = 2000) {
    return new Promise((resolve) => {
      if (this.isInMiniProgram() && window.wx && window.wx.miniProgram) {
        resolve(true);
        return;
      }
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve(true);
        }
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('WeixinJSBridgeReady', finish, { once: true });
        setTimeout(() => {
          finish();
        }, timeout);
      } else {
        resolve(false);
      }
    });
  }

  postToMiniProgram(message) {
    if (window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === 'function') {
      wx.miniProgram.postMessage({ data: message });
      this.log('发送消息到小程序', message);
    } else {
      this.error('postMessage不可用');
    }
  }

  /**
   * 初始化微信JSSDK（如果需要）
   */
  initWxJSSDK() {
    if (!window.wx) {
      this.error('微信JSSDK未加载');
      return;
    }

    // 这里可以添加JSSDK配置逻辑
    // 通常在小程序中不需要手动配置JSSDK
    this.log('检查微信JSSDK状态');
  }

  /**
   * 使用openid登录
   * @param {string} openid - 微信用户openid
   * @returns {Promise<boolean>} 登录是否成功
   */
  async loginWithOpenid(openid) {
    this.log('登录', '开始执行登录流程，openid:', openid);

    if (!openid) {
      this.error('错误: openid不能为空');
      return false;
    }

    try {
      this.mdLog('开始调用明道云查询', { worksheetId: this.config.mingdaoWorksheetId });
      // 构造查询用户数据的参数
      const filters = [
        {
          "controlId": this.config.openidField,
          "dataType": "2",
          "spliceType": "1",
          "filterType": "2",
          "value": openid
        },
        {
          "controlId": "del",
          "dataType": "2",
          "spliceType": "1",
          "filterType": "2",
          "value": 0
        }
      ];
      this.mdLog('构造过滤条件完成', { filters_count: filters.length });

      // 检查明道云API是否可用
      if (!window.MingDaoYunArrayAPI) {
        this.error('错误: MingDaoYunArrayAPI 组件未加载');
        this.mdLog('组件未加载', { component: 'MingDaoYunArrayAPI' });
        return false;
      }

      // 创建API实例并查询用户数据
      const api = new window.MingDaoYunArrayAPI();
      this.mdLog('创建API实例完成', { api_ready: !!api });
      const res = await api.getData({
        worksheetId: this.config.mingdaoWorksheetId,
        filters: JSON.stringify(filters),
        pageSize: 1
      });
      this.mdLog('发起查询', { worksheetId: this.config.mingdaoWorksheetId, pageSize: 1 });

      if (res && res.success && res.data && res.data.rows && res.data.rows.length > 0) {
        const userData = res.data.rows[0];
        this.mdLog('查询成功', { rows: res.data.rows.length });
        this.log('登录', '登录成功，用户数据获取完成');

        // 处理用户数据（可根据实际需求扩展）
        const processedUserData = this.processUserData(userData);

        // 更新状态
        this.state.userInfo = processedUserData;
        this.state.isLoggedIn = true;
        this.state.openid = openid;

        // 存储到本地存储
        localStorage.setItem('openid', openid);
        localStorage.setItem('userInfo', JSON.stringify(processedUserData));

        this.log('登录', '登录状态已保存到本地存储');
        this.mdLog('登录完成，已写入本地存储', { openid_stored: !!openid });
        return true;
      } else {
        this.error('错误: 获取数据失败或无数据');
        this.mdLog('查询失败或无数据', { success: res && res.success, rows: res && res.data && res.data.rows ? res.data.rows.length : 0 });
        return false;
      }
    } catch (e) {
      this.error('错误: 调用过程异常', e.message);
      this.mdLog('调用异常', { message: e && e.message });
      return false;
    }
  }

  /**
   * 处理用户数据
   * @param {Object} userData - 原始用户数据
   * @returns {Object} 处理后的用户数据
   */
  processUserData(userData) {
    return {
      name: userData.name || userData['姓名'] || '用户',
      avatar: userData.avatar || userData['头像'] || userData['头像1'] || this.config.defaultAvatar,
      raw: userData
    };
  }

  /**
   * 处理认证逻辑（支持Hash路由）
   */
  async handleAuthLogic() {
    // 解析Hash参数
    const hash = window.location.hash.substring(1); // 去掉 #
    const params = new URLSearchParams(hash);
    const rawOpenId = params.get('openid');
    const openid = rawOpenId && rawOpenId !== 'null' && rawOpenId !== 'undefined' ? rawOpenId : '';

    this.log('登录日志', '检测到Hash变化/初始化', { hash, openid });

    if (openid) {
      this.log('登录日志', '获取OpenID成功 (Hash模式)', openid);

      // 如果当前状态已经是登录且openid一致，跳过处理
      if (this.state.isLoggedIn && this.state.openid === openid) {
        this.log('登录日志', '状态一致，跳过重复处理');
        return;
      }

      // 调用登录函数
      await this.loginWithOpenid(openid);
    } else {
      // 检查是否在小程序环境中
      const isMiniprogram = this.isInMiniProgram();

      if (isMiniprogram) {
        // 小程序环境下，如果Hash没带openid，说明未登录或已退出
        if (this.state.isLoggedIn) {
          this.log('登录日志', 'Hash无OpenID，执行登出清理');
          this.logout();
        }
      } else {
        // 浏览器环境保留读取本地存储逻辑
        const stored = localStorage.getItem('openid');
        const storedUserInfo = localStorage.getItem('userInfo');

        if (stored && !this.state.isLoggedIn && storedUserInfo) {
          this.log('登录日志', '使用本地存储OpenID', stored);
          try {
            this.state.userInfo = JSON.parse(storedUserInfo);
            this.state.isLoggedIn = true;
            this.state.openid = stored;
          } catch (e) {
            this.error('解析本地用户信息失败', e);
          }
        }
      }
    }
  }

  /**
   * 退出登录
   */
  logout() {
    localStorage.removeItem('openid');
    localStorage.removeItem('userInfo');
    this.state.isLoggedIn = false;
    this.state.userInfo = null;
    this.state.openid = null;
  }

  /**
   * 检查是否在微信小程序环境中
   * @returns {boolean} 是否在小程序中
   */
  isInMiniProgram() {
    return window.__wxjs_environment === 'miniprogram' ||
      window.wx && window.wx.miniProgram ||
      /miniProgram/i.test(navigator.userAgent);
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return this.state.isLoggedIn;
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUserInfo() {
    return this.state.isLoggedIn ? this.state.userInfo : null;
  }

  /**
   * 获取openid
   * @returns {string|null} openid
   */
  getOpenid() {
    return this.state.isLoggedIn ? this.state.openid : null;
  }

  /**
   * 日志记录
   */
  log(...args) {
    console.log('[WechatLogin]', ...args);
  }

  mdLog(event, data) {
    try {
      console.log('[WechatLogin][MingdaoYun]', event, data || {});
      if (this.isInMiniProgram() && window.wx && window.wx.miniProgram && typeof wx.miniProgram.postMessage === 'function') {
        wx.miniProgram.postMessage({
          data: {
            action: 'log',
            scope: 'mdy',
            event,
            data: data || {}
          }
        });
      }
    } catch (e) {}
  }

  /**
   * 错误记录
   */
  error(...args) {
    console.error('[WechatLogin Error]', ...args);
  }

  /**
   * 调试信息
   */
  debug() {
    this.log('当前状态:', {
      isLoggedIn: this.state.isLoggedIn,
      userInfo: this.state.userInfo,
      openid: this.state.openid
    });
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  // Node.js环境
  module.exports = WechatLogin;
} else if (typeof window !== 'undefined') {
  // 浏览器环境
  window.WechatLogin = WechatLogin;
}
