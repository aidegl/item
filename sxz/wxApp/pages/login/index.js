Page({
  doLogin() {
    wx.showLoading({ title: '登录中...' });
    
    // 1. 调用微信登录
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('登录 code:', res.code);
          // --- 注意：此处需要调用后端接口换取真实 OpenID ---
          // 请确保你的后端有 /api/login 或类似接口，并返回真实的 openid
          
          wx.request({
            url: 'https://api.100000whys.cn/api/login', // 假设你的后端登录接口是这个
            method: 'POST',
            data: { code: res.code },
            success: (loginRes) => {
              console.log('后端登录接口返回:', loginRes.data);
              if (loginRes.data && loginRes.data.openid) {
                wx.setStorageSync('openid', loginRes.data.openid);
                wx.hideLoading();
                wx.showToast({ title: '登录成功', icon: 'success' });
                setTimeout(() => wx.navigateBack(), 1500);
              } else {
                wx.hideLoading();
                // 打印出后端具体的错误信息
                const errMsg = loginRes.data ? JSON.stringify(loginRes.data) : '空响应';
                wx.showModal({
                  title: '登录失败',
                  content: '后端未返回OpenID。具体信息：' + errMsg,
                  showCancel: false
                });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showModal({
                title: '连接失败',
                content: '无法连接到登录服务器，请检查域名和SSL配置。',
                showCancel: false
              });
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '调用失败', icon: 'none' });
      }
    });
  },
  goBack() {
    wx.navigateBack();
  }
})