Page({
  data: {
    themeColor: '#0557e1',
    phone: '',
    code: '',
    countdown: 0,
    phoneLoginApiUrl: 'https://api.100000whys.cn/api/core/api/phone-login',
    loginApiUrl: 'https://api.100000whys.cn/api/core/api/login'
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },

  onGetCode() {
    const phone = this.data.phone;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    const app = getApp();
    const url = this.data.phoneLoginApiUrl || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置登录接口', icon: 'none' });
      return;
    }
    wx.request({
      url: url + '/sendCode',
      method: 'POST',
      data: { phone, merchantId: app.globalData.merchantId || '' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.data && (res.data.success || res.data.code === 0)) {
          this.startCountdown();
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '发送失败', icon: 'none' });
        }
      }
    });
  },

  startCountdown() {
    let c = 60;
    this.setData({ countdown: c });
    const t = setInterval(() => {
      c--;
      this.setData({ countdown: c });
      if (c <= 0) clearInterval(t);
    }, 1000);
  },

  onVerifyLogin() {
    const { phone, code } = this.data;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!code || code.length < 4) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    const app = getApp();
    const url = this.data.loginApiUrl || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置登录接口', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    wx.request({
      url: url + '/verify',
      method: 'POST',
      data: { phone, code, merchantId: app.globalData.merchantId || '' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        const openId = (res.data && res.data.openId) || (res.data && res.data.data && res.data.data.openId);
        if (openId) {
          const app = getApp();
          app.globalData.openId = openId;
          wx.setStorageSync('openId', openId);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => wx.navigateBack({ delta: 2 }), 500);
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '验证码错误', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});