Page({
  data: {
    themeColor: '#0557e1',
    userAgreementUrl: '',
    privacyPolicyUrl: '',
    phoneLoginApiUrl: 'https://api.100000whys.cn/api/core/api/phone-login',
    loginApiUrl: 'https://api.100000whys.cn/api/core/api/login'
  },

  onGoVerifyLogin() {
    wx.navigateTo({ url: '/pages/login-verify/index' });
  },

  onGetPhoneNumber(e) {
    console.log('[登录] getPhoneNumber 回调:', e.detail);
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '需要授权手机号才能登录', icon: 'none' });
      return;
    }
    const { code, encryptedData, iv } = e.detail;
    const app = getApp();
    const url = this.data.phoneLoginApiUrl || (app.globalData && app.globalData.phoneLoginApiUrl) || (app.globalData && app.globalData.loginApiUrl) || '';
    console.log('[登录] 请求URL:', url, 'merchantId:', app.globalData.merchantId);
    if (!url) {
      wx.showToast({ title: '请在商家后台配置登录接口URL', icon: 'none', duration: 2500 });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    wx.login({
      success: (loginRes) => {
        const loginCode = loginRes.code || '';
        console.log('[登录] wx.login 返回, loginCode:', loginCode ? '有(' + loginCode.substring(0,8) + '...)' : '无');
        if (!loginCode) {
          wx.hideLoading();
          wx.showToast({ title: '获取登录凭证失败，请重试', icon: 'none' });
          return;
        }
        const merchantId = app.globalData.merchantId || '';
        const postData = { code: code || '', encryptedData: encryptedData || '', iv: iv || '', loginCode, merchantId };
        console.log('[登录] 即将请求:', url, 'merchantId:', merchantId, 'data keys:', Object.keys(postData));
        wx.request({
          url: url,
          method: 'POST',
          data: postData,
          header: { 'Content-Type': 'application/json' },
          success: (res) => {
            console.log('[登录] 响应 status:', res.statusCode, 'data:', JSON.stringify(res.data));
            if (res.data && (res.data.openId || res.data.openid)) {
              console.log('[登录] 拿到 openId:', (res.data.openId || res.data.openid).substring(0, 8) + '...');
            }
            const openId = (res.data && res.data.openId) || (res.data && res.data.openid) || (res.data && res.data.data && res.data.data.openId);
            if (openId) {
              wx.hideLoading();
              app.globalData.openId = openId;
              wx.setStorageSync('openId', openId);
              wx.showToast({ title: '登录成功', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 500);
              return;
            }
            if (res.statusCode === 404 || res.statusCode >= 500) {
              console.log('[登录] phone-login 失败，尝试用 loginCode 调 login 接口');
              const loginUrl = this.data.loginApiUrl || (app.globalData && app.globalData.loginApiUrl) || url.replace(/phone-login/g, 'login');
              wx.request({
                url: loginUrl,
                method: 'POST',
                data: { code: loginCode, merchantId: app.globalData.merchantId || '', merchant_id: app.globalData.merchantId || '' },
                header: { 'Content-Type': 'application/json' },
                success: (r2) => {
                  wx.hideLoading();
                  const oid = (r2.data && r2.data.openId) || (r2.data && r2.data.openid);
                  if (oid) {
                    app.globalData.openId = oid;
                    wx.setStorageSync('openId', oid);
                    wx.showToast({ title: '登录成功', icon: 'success' });
                    setTimeout(() => wx.navigateBack(), 500);
                  } else {
                    wx.showToast({ title: (r2.data && r2.data.message) || '登录失败', icon: 'none' });
                  }
                },
                fail: () => { wx.hideLoading(); wx.showToast({ title: '登录服务不可用', icon: 'none' }); }
              });
              return;
            }
            wx.hideLoading();
            const msg = (res.data && res.data.msg) || (res.data && res.data.message) || ('登录失败(' + res.statusCode + ')');
            wx.showToast({ title: msg, icon: 'none', duration: 2000 });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('[登录] 网络/请求失败:', err);
            wx.showToast({ title: (err.errMsg || '网络错误') + (err.statusCode ? ' ' + err.statusCode : ''), icon: 'none', duration: 2500 });
          }
        });
      },
      fail: (loginErr) => {
        wx.hideLoading();
        console.error('[登录] wx.login 失败:', loginErr);
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
      }
    });
  },

  onAgreementTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent(url) });
    else wx.showToast({ title: '协议链接未配置', icon: 'none' });
  }
});