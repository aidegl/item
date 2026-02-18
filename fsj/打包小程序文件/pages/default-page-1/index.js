Page({
  data: {
  轮播图: [],
  },

  onLoad(options) {
    console.log('首页页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '698826f3b35652a8d4f60e21';
    console.log('商家ID:', appMerchantId);
    
    console.log('=== 组件数据 ===');
    console.log('组件列表:', ['轮播图']);
        console.log('轮播图数据:', this.data.轮播图);
    console.log('=== 组件数据结束 ===');
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