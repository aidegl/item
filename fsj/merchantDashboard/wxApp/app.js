App({
  onLaunch() {
    console.log('小程序启动');
    console.log('商家ID:', this.globalData.merchantId);
    this.login();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  login() {
    const that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          console.log('微信登录成功，code:', res.code);
          that.getOpenId(res.code);
        } else {
          console.log('微信登录失败：' + res.errMsg);
        }
      },
      fail: function (err) {
        console.log('wx.login 调用失败：', err);
      }
    });
  },

  getOpenId(code) {
    const that = this;
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      data: {
        appid: '你的小程序AppID',
        secret: '你的小程序AppSecret',
        js_code: code,
        grant_type: 'authorization_code'
      },
      method: 'GET',
      success: function (res) {
        if (res.data.openid) {
          console.log('获取OpenID成功:', res.data.openid);
          that.globalData.openId = res.data.openid;
          wx.setStorageSync('openId', res.data.openid);
        } else {
          console.log('获取OpenID失败：', res.data);
        }
      },
      fail: function (err) {
        console.log('获取OpenID失败：', err);
      }
    });
  },

  logout() {
    console.log('退出登录');
    this.globalData.openId = '';
    this.globalData.userInfo = null;
    wx.removeStorageSync('openId');
    wx.removeStorageSync('userInfo');
  },

  globalData: {
    userInfo: null,
    merchantId: '{商家ID}',
    mRowid: '',
    openId: ''
  }
});
