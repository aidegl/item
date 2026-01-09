Page({
  doLogin() {
    wx.showLoading({ title: '登录中...' });
    
    // 1. 调用微信登录
    wx.login({
      success: (res) => {
        if (res.code) {
          // 2. 模拟后端接口换取OpenID
          // 真实场景：request('https://api.yourserver.com/login', { code: res.code })
          setTimeout(() => {
            const mockOpenid = 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M'; // 示例OpenID
            wx.setStorageSync('openid', mockOpenid);
            
            wx.hideLoading();
            wx.showToast({ title: '登录成功', icon: 'success' });
            
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }, 1000);
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