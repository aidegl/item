App({
  globalData: {
    openid: null,
    isAnonymous: true
  },
  onLaunch() {
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数`);
    try {
      const stored = wx.getStorageSync('openid');
      if (stored) {
        this.globalData.openid = stored;
        this.globalData.isAnonymous = false;
        console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, { openid: stored, isAnonymous: false });
        return;
      }
    } catch (e) {
      console.error(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, e);
    }
    wx.login({
      success: (res) => {
        console.log(`[原生API日志] ${new Date().toLocaleString()} - login调用成功，返回数据：`, res);
        // 这里需要后端换取openid；当前未接入后端，标记为匿名登录
        this.globalData.openid = null;
        this.globalData.isAnonymous = true;
        console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, { openid: null, isAnonymous: true });
      },
      fail: (err) => {
        console.error(`[原生API日志] ${new Date().toLocaleString()} - login调用失败，错误信息：`, err);
        this.globalData.openid = null;
        this.globalData.isAnonymous = true;
      }
    });
  }
});
