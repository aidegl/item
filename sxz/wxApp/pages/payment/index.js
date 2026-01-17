const zhifu = require('../../zhifu.js');

Page({
  data: {
    amount: '0.01',
    description: '会员订阅',
    productName: '会员套餐',
    expiryDate: '',
    currentTime: '',
    status: '正在发起支付...',
    loading: true,
    // 新增字段
    orderId: '',
    validityPeriod: '',
    originalPrice: '0.00',
    discountAmount: '0.00',
    // 弹窗相关
    showModal: false,
    modalType: '', // success, error, cancel
    modalTitle: '',
    modalDesc: ''
  },

  onLoad: function (options) {
    console.log('支付页面加载，参数:', options);
    
    // 获取小程序实例
    const app = getApp();
    // 尝试获取全局设置数据
    const globalSettings = app.globalData.globalSettings;
    console.log('[支付页面] 从全局数据获取的设置:', globalSettings);
    
    // 如果全局设置已加载，可以直接使用
    if (globalSettings) {
      console.log('[支付页面] 全局设置已加载，使用缓存数据');
      // 这里可以根据需要使用全局设置数据
      // 例如：this.setData({ someSetting: globalSettings.someField });
    } else {
      console.log('[支付页面] 全局设置尚未加载，监听全局数据变化');
      // 如果全局设置尚未加载，可以尝试重新加载或监听变化
      // 重新加载全局设置
      app.loadGlobalSettings().then(() => {
        const newSettings = app.globalData.globalSettings;
        console.log('[支付页面] 重新加载后的全局设置:', newSettings);
        // 这里可以根据需要使用重新加载后的全局设置数据
      });
    }
    const amount = options.amount || '0.01';
    const description = options.description ? decodeURIComponent(options.description) : '会员订阅';
    
    // 提取产品名称
    let productName = description.replace('购买', '');
    
    // 生成订单编号
    const now = new Date();
    const orderId = `ORDER${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // 计算当前时间和到期时间
    const currentTimeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let durationMonths = 0;
    let validityPeriod = '';
    if (productName.includes('月')) {
      durationMonths = 1;
      validityPeriod = '1个月';
    } else if (productName.includes('季')) {
      durationMonths = 3;
      validityPeriod = '3个月';
    } else if (productName.includes('年')) {
      durationMonths = 12;
      validityPeriod = '12个月';
    }
    
    const expiry = new Date(now.getFullYear(), now.getMonth() + durationMonths, now.getDate());
    const expiryDateStr = `${expiry.getFullYear()}-${(expiry.getMonth() + 1).toString().padStart(2, '0')}-${expiry.getDate().toString().padStart(2, '0')}`;

    // 计算价格明细
    const originalPrice = parseFloat(amount) * 1.2; // 假设原价是实付的1.2倍
    const discountAmount = originalPrice - parseFloat(amount);

    this.setData({ 
      amount, 
      description,
      productName,
      expiryDate: expiryDateStr,
      currentTime: currentTimeStr,
      orderId,
      validityPeriod,
      originalPrice: originalPrice.toFixed(2),
      discountAmount: discountAmount.toFixed(2)
    });
    
    // 延迟发起支付，让用户先看到订单详情
    setTimeout(() => {
      this.initiatePayment();
    }, 1500);
  },

  initiatePayment: function () {
    const self = this;
    const { amount, description, orderId } = this.data;
    
    console.log('--- 准备发起支付 ---');
    console.log('订单编号:', orderId);
    console.log('商户名称:', zhifu.shmc);
    console.log('支付金额:', amount);
    console.log('支付描述:', description);
    
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
      self.showPaymentModal('error', '支付失败', '未获取到用户身份(OpenID)，请重新登录后再试');
      self.setData({ status: '身份缺失', loading: false });
      return;
    }

    wx.request({
      url: BACKEND_API_URL,
      method: 'POST',
      data: {
        amount: amount,
        openid: openid,
        description: description,
        orderId: orderId
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
              self.showPaymentModal('success', '支付成功', '会员权益已自动生效，可在我的页面查看详细信息');
              self.setData({ status: '支付成功', loading: false });
            },
            fail: (err) => {
              console.error('微信支付窗口调用失败:', err);
              if (err.errMsg.indexOf('cancel') > -1) {
                self.showPaymentModal('cancel', '支付已取消', '订单还未完成，权益尚未生效');
                self.setData({ status: '支付已取消', loading: false });
              } else {
                self.showPaymentModal('error', '支付失败', err.errMsg);
                self.setData({ status: '支付失败', loading: false });
              }
            }
          });
        } else {
          console.error('后端返回数据异常:', res.data);
          const errorMsg = res.data ? (res.data.message || JSON.stringify(res.data)) : '后端未返回有效数据';
          self.showPaymentModal('error', '下单失败', '后端接口未返回正确的支付参数');
          self.setData({ status: '下单失败', loading: false });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        self.showPaymentModal('error', '网络错误', '无法连接到支付服务器，请检查网络设置');
        self.setData({ status: '连接失败', loading: false });
      }
    });
  },

  // 显示支付状态弹窗
  showPaymentModal: function(type, title, desc) {
    this.setData({
      showModal: true,
      modalType: type,
      modalTitle: title,
      modalDesc: desc
    });
  },

  // 关闭弹窗
  closeModal: function() {
    this.setData({
      showModal: false
    });
    // 如果是成功状态，点击关闭或返回按钮也应该跳转
    if (this.data.modalType === 'success') {
      this.goBack();
    }
  },

  // 跳转到我的页面
  goToMyPage: function() {
    // 成功后跳转，通常跳转到个人中心或会员中心
    wx.switchTab({
      url: '/pages/my/index' // 假设个人中心是 tab 页
    }).catch(() => {
      wx.navigateTo({
        url: '/pages/my/index'
      });
    });
  },

  // 打开服务协议
  openAgreement: function() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
  },

  // 打开隐私政策
  openPrivacy: function() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    });
  },

  // 保留模拟支付逻辑供测试使用
  simulatePayment: function() {
    const self = this;
    const { amount } = this.data;
    wx.showLoading({ title: '正在模拟支付...' });
    
    setTimeout(() => {
      wx.hideLoading();
      self.showPaymentModal('success', '支付成功(模拟)', '会员权益已自动生效，可在我的页面查看详细信息');
      self.setData({ status: '支付成功(模拟)', loading: false });
    }, 1500);
  },

  goBack: function () {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
});
