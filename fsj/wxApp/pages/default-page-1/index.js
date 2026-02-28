Page({
  data: {

  },

  async onLoad(options) {
    console.log('首页页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '698826f3b35652a8d4f60e21';
    console.log('商家ID:', appMerchantId);
    console.log('小程序版本: 1.2.3');
    
    await this.initShangjiaRowid(appMerchantId);

    console.log('=== 开始加载组件数据 ===');

    console.log('=== 组件数据加载结束 ===');

  },



  async initShangjiaRowid(mRowid) {
    try {
      const app = getApp();
      const api = require('../../utils/MingdaoYunArrayAPI');
      const apiInstance = new api();
      
      const filters = [
        {
          'controlId': 'mRowid',
          'dataType': 2,
          'spliceType': 1,
          'filterType': 2,
          'value': mRowid
        }
      ];
      
      const result = await apiInstance.getData({
        worksheetId: 'shangjia',
        filters: filters,
        pageSize: 1,
        pageIndex: 1
      });
      
      console.log('=== 查询shangjia表返回结果 ===');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const shangjiaRowid = result.data.rows[0].rowid;
        console.log('商家rowid:', shangjiaRowid);
        app.globalData.mRowid = shangjiaRowid;
      } else {
        console.log('未找到对应的商家记录');
      }
    } catch (error) {
      console.error('查询shangjia表失败:', error);
    }
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
  },

});