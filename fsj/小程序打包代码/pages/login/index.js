Page({
  data: {
    themeColor: '#0557e1',
    userAgreementUrl: '',
    privacyPolicyUrl: '',
    phoneLoginApiUrl: '',
    loginApiUrl: ''
  },

  onGoVerifyLogin() {
    wx.navigateTo({ url: '/pages/login-verify/index' });
  },

  onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '需要授权手机号才能登录', icon: 'none' });
      return;
    }
    const { code, encryptedData, iv } = e.detail;
    const app = getApp();
    const url = this.data.phoneLoginApiUrl || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置「登录接口URL」或「手机号登录接口」', icon: 'none', duration: 2500 });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    wx.request({
      url: url,
      method: 'POST',
      data: { code: code || '', encryptedData: encryptedData || '', iv: iv || '', merchantId: app.globalData.merchantId || '' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        const openId = (res.data && res.data.openId) || (res.data && res.data.data && res.data.data.openId);
        if (openId) {
          const app = getApp();
          app.globalData.openId = openId;
          wx.setStorageSync('openId', openId);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 500);
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '登录失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  onAgreementTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent(url) });
    else wx.showToast({ title: '协议链接未配置', icon: 'none' });
  }
});