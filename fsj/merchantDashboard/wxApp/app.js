const { initMerchantData } = require('./utils/initMerchant');

App({
  onLaunch() {
    console.log('小程序启动');
    const merchantId = this.globalData.merchantId;
    this.initMerchantData(merchantId);
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  globalData: {
    userInfo: null,
    merchantData: null,
    merchantId: '{商家ID}'
  },

  async initMerchantData(merchantId) {
    const data = await initMerchantData(merchantId);
    if (data) {
      this.globalData.merchantData = data;
    }
  }
});
