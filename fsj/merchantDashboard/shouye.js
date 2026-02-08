async function loadShopData(mRowid) {
  console.log('[shouye.js] 开始加载商家数据，原始 mRowid:', mRowid);

  let actualRowid = mRowid.replace(/%23/g, '#');
  console.log('[shouye.js] 替换 %23 为 # 后:', actualRowid);

  actualRowid = actualRowid.substring(2);
  console.log('[shouye.js] 处理后的 mRowid (去掉前2个字符):', actualRowid);

  const filters = [
    {
      "controlId": "mRowid",
      "dataType": 2,
      "spliceType": 1,
      "filterType": 2,
      "value": actualRowid
    }
  ];

  const params = {
    worksheetId: 'shangjia',
    filters: filters,
    pageSize: 10,
    pageIndex: 1
  };

  console.log('[shouye.js] 调用明道云接口，参数:', params);
  console.log('[shouye.js] 请求体:', JSON.stringify(params, null, 2));

  try {
    const api = new window.MingDaoYunArrayAPI();
    const result = await api.getData(params);

    console.log('[shouye.js] 接口返回结果:', result);

    if (result.success) {
      console.log('[shouye.js] 查询成功，数据:', result.data);
      console.log('[shouye.js] 数据条数:', result.data.total);
      console.log('[shouye.js] 数据列表:', result.data.rows);

      if (result.data.rows && result.data.rows.length > 0) {
        const shopData = result.data.rows[0];
        console.log('[shouye.js] 商家详细信息:', shopData);
        updateShopInfo(shopData);
      } else {
        console.warn('[shouye.js] 未查询到商家数据');
      }
    } else {
      console.error('[shouye.js] 查询失败:', result.error_msg, '错误代码:', result.error_code);

      if (result.error_code === 430022) {
        console.error('[shouye.js] worksheetId不存在，请检查：');
        console.error('[shouye.js] 1. 工作表别名是否正确');
        console.error('[shouye.js] 2. appKey和sign是否有权限访问该表');
        console.error('[shouye.js] 3. 工作表是否在正确的应用下');
      }
    }
  } catch (error) {
    console.error('[shouye.js] 调用异常:', error);
  }
}

function updateShopInfo(shopData) {
  console.log('[shouye.js] 更新页面商家信息');

  if (shopData.mingcheng) {
    document.getElementById('shopName').textContent = shopData.mingcheng;
  }

  if (shopData.dqsj) {
    document.getElementById('expireTime').textContent = '到期时间: ' + shopData.dqsj;
  }

  if (shopData.leixing) {
    document.getElementById('shopType').textContent = '店铺类型: ' + shopData.leixing;
  }

  if (shopData.zhuangtai !== undefined) {
    const statusElement = document.getElementById('shopStatus');
    if (shopData.zhuangtai === 1) {
      statusElement.textContent = '营业中';
      statusElement.style.background = '#e6f7ff';
      statusElement.style.color = '#1890ff';
    } else {
      statusElement.textContent = '已打烊';
      statusElement.style.background = '#fff1f0';
      statusElement.style.color = '#ff4d4f';
    }
  }

  console.log('[shouye.js] 赋值后的数据:', shopData);

  localStorage.setItem('merchantData', JSON.stringify(shopData));
  console.log('[shouye.js] 数据已保存到 localStorage (merchantData)');

  const savedData = localStorage.getItem('merchantData');
  console.log('[shouye.js] localStorage 中的 merchant.json:', savedData);

  const merchantData = JSON.parse(localStorage.getItem('merchantData'));
  const logoData = JSON.parse(merchantData.logo)[0];
  console.log('[shouye.js] logo[0]:', logoData);

  console.log('[shouye.js] 页面信息更新完成');
}