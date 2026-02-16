const { initMerchantData } = require('./utils/initMerchant');
const { processImageData, getImageUrl } = require('./utils/imageMapper');

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
    merchantId: '{商家ID}',
    imageMap: []
  },

  async initMerchantData(merchantId) {
    const rows = await initMerchantData(merchantId);
    if (rows && Array.isArray(rows)) {
      this.globalData.merchantData = rows;
      
      const apiResponse = {
        data: {
          rows: rows
        }
      };
      
      this.globalData.imageMap = processImageData(apiResponse);
      console.log('[全局] 图片映射已加载，共', this.globalData.imageMap.length, '张图片');
    }
  },

  getImageUrl(rowid) {
    return getImageUrl(this.globalData.imageMap, rowid);
  }
});
