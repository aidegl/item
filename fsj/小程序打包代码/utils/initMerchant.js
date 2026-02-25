// 初始化商家数据工具
const MingDaoYunArrayAPI = require('./MingdaoYunArrayAPI');

async function initMerchantData(merchantId) {
  try {
    const api = new MingDaoYunArrayAPI();
    
    const filters = [
      {
        'controlId': 'mid',
        'dataType': 2,
        'spliceType': 1,
        'filterType': 2,
        'value': merchantId || '{商家ID}'
      },
      {
        'controlId': 'use',
        'dataType': 2,
        'spliceType': 1,
        'filterType': 2,
        'value': '1'
      }
    ];
    
    const result = await api.getData({
      worksheetId: 'scgl',
      filters: filters,
      pageSize: 50,
      pageIndex: 1
    });
    
    if (result.success) {
      console.log('商家数据加载成功，共', result.data.rows.length, '条记录');
      return result.data.rows;
    } else {
      console.error('商家数据加载失败：', result.error_msg);
      return null;
    }
  } catch (error) {
    console.error('初始化商家数据异常：', error);
    return null;
  }
}

module.exports = {
  initMerchantData
};
