App({
  onLaunch() {
    console.log('小程序启动');
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(msg) {
    console.error('小程序错误:', msg);
  },

  globalData: {
    userInfo: null,
    merchantId: null
  }
});
