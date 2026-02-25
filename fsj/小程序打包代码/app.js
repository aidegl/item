App({
  onLaunch() {
    console.log('小程序启动');
  console.log('小程序版本: 1.2.3');
  const savedOpenId = wx.getStorageSync('openId');
  if (savedOpenId) {
    this.globalData.openId = savedOpenId;
    console.log('从缓存恢复 openId:', savedOpenId);
  } else {
    this.doLogin();
  }

    console.log('商家ID:', this.globalData.merchantId);
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  doLogin() {
    wx.login({
      success: (res) => {
        console.log('wx.login 结果, code:', res.code, '(需配置 globalConfig.loginApiUrl 将 code 换取 openId)');
      }
    });
  },


  globalData: {
    userInfo: null,
    merchantId: '75cf2e-0f73-4137-9e99-116d92c45a47',
    mRowid: '',
    /** 微信登录后获得的 OpenID，用于「我的」页用户信息栏从明道云 yonghu 表拉取头像、昵称等 */
    openId: '',
    loginApiUrl: '',
    phoneLoginApiUrl: ''
  }
});
