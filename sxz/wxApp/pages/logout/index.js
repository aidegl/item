Page({
  doLogout() {
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.openid = '';
      app.globalData.isAnonymous = true;
    }
    wx.removeStorageSync('openid');
    wx.showToast({ title: '已退出', icon: 'none' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  goBack() {
    wx.navigateBack();
  }
})
