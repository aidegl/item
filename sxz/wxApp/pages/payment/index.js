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
    
    console.log('--- 准备发起支付 ---');
    console.log('商户名称:', zhifu.shmc);
    console.log('支付金额:', amount);
    
    wx.showLoading({ title: '正在下单...' });
    
    // 实际支付流程说明：
    // 1. 小程序端调用后端接口 (例如: https://your-backend.com/api/pay/createOrder)
    // 2. 后端接收请求，使用商户证书 (zhifu.pemkey, zhifu.pemcert) 和 密钥 (zhifu.apiv3) 
    //    向微信支付 V3 接口发起统一下单请求，获取 prepay_id。
    // 3. 后端对支付参数进行二次签名，并返回给小程序：
    //    { timeStamp, nonceStr, package, signType, paySign }
    // 4. 小程序调用 wx.requestPayment(params) 弹出支付窗口。

    // 注意：出于安全性考虑，支付签名必须在服务器端完成，不能在小程序前端直接使用私钥签名。
    // 这里我们模拟一个后端调用的过程。
    
    // 请在此处填写您的后端接口地址
    const BACKEND_API_URL = 'https://api.100000whys.cn/api/pay'; 

    console.log('正在请求后端支付接口:', BACKEND_API_URL);

    // 发起真实支付请求
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.hideLoading();
      wx.showModal({
        title: '支付失败',
        content: '未获取到用户身份(OpenID)，请重新登录后再试',
        showCancel: false
      });
      self.setData({ status: '身份缺失', loading: false });
      return;
    }

    wx.request({
      url: BACKEND_API_URL,
      method: 'POST',
      data: {
        amount: amount,
        openid: openid,
        description: '支付测试 - 0.01元'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('后端返回原始数据:', res.data);

        if (res.data && res.data.success && res.data.payParams) {
          const payParams = res.data.payParams;
          console.log('准备调用支付参数:', payParams);
          
          wx.requestPayment({
            ...payParams,
            success: (payRes) => {
              console.log('支付成功:', payRes);
              wx.showToast({ title: '支付成功', icon: 'success' });
              self.setData({ status: '支付成功', loading: false });
            },
            fail: (err) => {
              console.error('微信支付窗口调用失败:', err);
              if (err.errMsg.indexOf('cancel') > -1) {
                wx.showToast({ title: '用户取消支付', icon: 'none' });
                self.setData({ status: '支付已取消', loading: false });
              } else {
                wx.showModal({ title: '支付失败', content: err.errMsg, showCancel: false });
                self.setData({ status: '支付失败', loading: false });
              }
            }
          });
        } else {
          console.error('后端返回数据异常:', res.data);
          const errorMsg = res.data ? (res.data.message || JSON.stringify(res.data)) : '后端未返回有效数据';
          wx.showModal({ 
            title: '下单失败', 
            content: '后端接口未返回正确的支付参数。具体返回：' + errorMsg, 
            showCancel: false 
          });
          self.setData({ status: '下单失败', loading: false });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showModal({ title: '网络错误', content: '无法连接到支付服务器', showCancel: false });
        self.setData({ status: '连接失败', loading: false });
      }
    });
  },

  // 保留模拟支付逻辑供测试使用
  simulatePayment: function() {
    const self = this;
    const { amount } = this.data;
    wx.showLoading({ title: '正在模拟支付...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '支付成功(模拟)', icon: 'success' });
      self.setData({ status: '支付成功(模拟)', loading: false });
    }, 1500);
  },

  goBack: function () {
    wx.navigateBack();
  }
});
