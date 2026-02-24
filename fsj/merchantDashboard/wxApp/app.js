App({
  onLaunch() {
    console.log('小程序启动');
    console.log('商家ID:', this.globalData.merchantId);
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  globalData: {
    userInfo: null,
    merchantId: '{商家ID}',
    mRowid: '',
    /** 微信登录后获得的 OpenID，用于「我的」页用户信息栏从明道云 yonghu 表拉取头像、昵称等 */
    openId: ''
  }
});
