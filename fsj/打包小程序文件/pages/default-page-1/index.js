Page({
  data: {
  轮播图: ["image1.png","image2.png","image3.png"],
  },

  onLoad(options) {
    console.log('首页页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '698826f3b35652a8d4f60e21';
    console.log('商家ID:', appMerchantId);
  },

  onReady() {
    console.log('页面渲染完成');
  },

  onShow() {
    console.log('页面显示');
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  }
});