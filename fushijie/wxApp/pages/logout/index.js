Page({
  doLogout() {
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