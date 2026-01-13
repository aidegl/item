const zhifu = require('../../zhifu.js');

Page({
  data: {
    amount: '0.01',
    status: '正在发起支付...',
    loading: true
  },

  onLoad: function (options) {
    console.log('支付页面加载，参数:', options);
    if (options.amount) {
      this.setData({ amount: options.amount });
    }
    
    // 模拟支付逻辑，实际应调用 wx.requestPayment
    this.initiatePayment();
  },

  initiatePayment: function () {
    const self = this;
    const { amount } = this.data;
    
    console.log('使用商户配置进行支付:', zhifu.shmc);
    
    // 这里是实际发起支付的地方
    // 1. 调用后端接口获取支付参数 (timeStamp, nonceStr, package, paySign等)
    // 2. 使用获取到的参数调用 wx.requestPayment
    
    wx.showLoading({ title: '准备支付中' });
    
    // 模拟一个支付过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '支付测试',
        content: `正在为您向【${zhifu.shmc}】发起 ${amount} 元的支付测试。`,
        confirmText: '模拟成功',
        cancelText: '模拟失败',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '支付成功', icon: 'success' });
            self.setData({ status: '支付成功', loading: false });
          } else {
            wx.showToast({ title: '支付取消', icon: 'none' });
            self.setData({ status: '支付失败', loading: false });
          }
        }
      });
    }, 1500);
  },

  goBack: function () {
    wx.navigateBack();
  }
});
