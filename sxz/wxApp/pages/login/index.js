Page({
  doLogin() {
    wx.showLoading({ title: '登录中...' });
    
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('登录 code:', res.code);
          
          wx.request({
            url: "https://api.100000whys.cn/api/core/api/login",
            method: "POST",
            header: {
              "Content-Type": "application/json"
            },
            data: {
              code: res.code
            },
            success: (loginRes) => {
              console.log('后端登录接口返回:', loginRes.data);
              if (loginRes.data && loginRes.data.openid) {
                const openid = loginRes.data.openid;
                console.log('[Login] 登录成功，设置 openid:', openid);
                wx.setStorageSync('openid', openid);
                
                const app = getApp();
                if (app) {
                    app.globalData.openid = openid;
                    app.globalData.isAnonymous = false;
                    console.log('[Login] 全局数据已更新:', app.globalData);
                }
                
                wx.hideLoading();
                wx.showToast({ title: '登录成功', icon: 'success' });
                setTimeout(() => wx.navigateBack(), 1500);
              } else {
                wx.hideLoading();
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
