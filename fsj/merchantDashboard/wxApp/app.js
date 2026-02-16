const MingDaoYunArrayAPI = require('./utils/MingdaoYunArrayAPI');

App({
  onLaunch() {
    console.log('小程序启动');
    this.initMerchantData();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  globalData: {
    userInfo: null,
    merchantData: null
  },

  async initMerchantData() {
    try {
      const api = new MingDaoYunArrayAPI();

      const filters = [
        {
          "controlId": "mid",
          "dataType": 2,
          "spliceType": 1,
          "filterType": 2,
          "value": "{商家ID}"
        },
        {
          "controlId": "use",
          "dataType": 2,
          "spliceType": 1,
          "filterType": 2,
          "value": "1"
        }
      ];

      const result = await api.getData({
        worksheetId: 'scgl',
        filters: filters,
        pageSize: 50,
        pageIndex: 1
      });

      if (result.success) {
        this.globalData.merchantData = result.data;
        console.log('商家数据加载成功：', result.data);
      } else {
        console.error('商家数据加载失败：', result.error_msg);
      }
    } catch (error) {
      console.error('初始化商家数据异常：', error);
    }
  }
});
