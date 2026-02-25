Page({
  data: {
  userInfo: {
    avatar: '',
    nickname: '用户昵称',
    userId: '--'
  },
  showLoginPrompt: true,

  },

  async onLoad(options) {
    console.log('我的页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '698826f3b35652a8d4f60e21';
    console.log('商家ID:', appMerchantId);
    console.log('小程序版本: 1.2.3');
    
    await this.initShangjiaRowid(appMerchantId);
    this.loadUserInfo();

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
    this.loadUserInfo();
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  },

  goLogin() {
    if (!this.data.showLoginPrompt) return;
    wx.navigateTo({ url: '/pages/login/index' });
  },

  async loadUserInfo() {
    try {
      const app = getApp();
      const openId = app && app.globalData && app.globalData.openId ? app.globalData.openId : '';
      if (!openId) {
        this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
        return;
      }
      this.setData({ showLoginPrompt: false });
      const MingDaoYunArrayAPI = require('../../utils/MingdaoYunArrayAPI');
      const api = new MingDaoYunArrayAPI();
      const result = await api.getData({
        worksheetId: 'yonghu',
        filters: [{ controlId: 'openId', dataType: 2, spliceType: 1, filterType: 2, value: openId }],
        pageSize: 1,
        pageIndex: 1
      });
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const row = result.data.rows[0];
        console.log('用户信息(明道云yonghu表):', row);
        const nickname = (row.nicheng || row.nickname || row['昵称'] || '用户昵称') + '';
        let avatar = '';
        try {
          const avatarField = row.touxiang || row.avatar || row['头像'];
          if (typeof avatarField === 'string' && avatarField) {
            const arr = JSON.parse(avatarField);
            if (Array.isArray(arr) && arr.length > 0) {
              const first = arr[0];
              avatar = first.large_thumbnail_full_path || first.url || first.large_thumbnail_path || first.path || '';
            }
          }
        } catch (e) {}
        const userId = (row.yonghuId || row.userId || row.rowid || '--') + '';
        this.setData({
          showLoginPrompt: false,
          userInfo: { avatar: avatar || '', nickname: nickname || '用户昵称', userId: userId || '--' }
        });
      } else {
        this.setData({ showLoginPrompt: false, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
    }
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.openId = '';
          wx.removeStorageSync('openId');
          this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
          wx.showToast({ title: '已退出', icon: 'success' });
          app.doLogin && app.doLogin();
        }
      }
    });
  },

});