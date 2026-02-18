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
    merchantId: '{商家ID}'
  }
});
