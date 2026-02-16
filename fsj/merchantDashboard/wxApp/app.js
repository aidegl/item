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
    merchantId: '{商家ID}',
    imageMap: []
  },

  async initMerchantData(merchantId) {
    console.log('[初始化] 开始初始化商家数据，商家ID:', merchantId);

    const rows = await initMerchantData(merchantId);

    if (rows && Array.isArray(rows)) {
      console.log('[初始化] 商家数据加载成功，共', rows.length, '条记录');

      const apiResponse = {
        data: {
          rows: rows
        }
      };

      this.globalData.imageMap = processImageData(apiResponse);
      console.log('[全局] 图片映射已加载，共', this.globalData.imageMap.length, '张图片');
      console.log('[全局] 图片映射详情:', JSON.stringify(this.globalData.imageMap, null, 2));

      console.log('[全局] 完整全局数据:', JSON.stringify(this.globalData, null, 2));
    } else {
      console.error('[初始化] 商家数据加载失败');
    }
  },

  getImageUrl(rowid) {
    return getImageUrl(this.globalData.imageMap, rowid);
  }
});
