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
  
  globalData: {
    userInfo: null
  }
});
