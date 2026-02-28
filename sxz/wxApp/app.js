// 引入明道云API调用组件
const MingDaoYunAPI = require('./MingdaoQuery.js');

App({
  globalData: {
    openid: null,
    isAnonymous: true,
    globalSettings: null // 存储全局设置数据
  },
  onLaunch() {
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数`);
    
    // 立即加载全局设置，不等待登录
    this.loadGlobalSettings();

    try {
      const stored = wx.getStorageSync('openid');
      if (stored) {
        this.globalData.openid = stored;
        this.globalData.isAnonymous = false;
        console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, { openid: stored, isAnonymous: false });
      }
    } catch (e) {
      console.error(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, e);
    }
    
    wx.login({
      success: (res) => {
        console.log(`[原生API日志] ${new Date().toLocaleString()} - login调用成功，返回数据：`, res);
        // 这里需要后端换取openid；当前未接入后端，标记为匿名登录
        this.globalData.openid = null;
        this.globalData.isAnonymous = true;
        console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了onLaunch函数，返回数据：`, { openid: null, isAnonymous: true });
      },
      fail: (err) => {
        console.error(`[原生API日志] ${new Date().toLocaleString()} - login调用失败，错误信息：`, err);
        this.globalData.openid = null;
        this.globalData.isAnonymous = true;
      }
    });
  },

  /**
   * 加载全局设置
   */
  async loadGlobalSettings() {
    console.log('[小程序全局数据] 开始加载全局设置...');
    try {
      if (typeof MingDaoYunAPI === 'undefined') {
        console.warn('[小程序全局数据] MingDaoYunAPI 未加载，跳过全局设置加载');
        return;
      }
      const api = new MingDaoYunAPI();
      const worksheetId = 'qjsz';
      const rowId = '9e5a5ed8-258b-4f20-a5c0-a1d9b9a97c2f';

      const result = await api.getData(rowId, worksheetId);
      if (result && result.success) {
        console.log('[小程序全局数据] 全局设置加载成功:', result.data);
        // 将全局设置保存到globalData中
        this.globalData.globalSettings = result.data;
        // 也可以保存到缓存中，提高下次加载速度
        try {
          wx.setStorageSync('globalSettings', result.data);
        } catch (e) {
          console.error('[小程序全局数据] 保存全局设置到缓存失败:', e);
        }
      } else {
        console.error('[小程序全局数据] 全局设置加载失败:', result ? result.error_msg : '未知错误');
        // 尝试从缓存中读取全局设置
        try {
          const cachedSettings = wx.getStorageSync('globalSettings');
          if (cachedSettings) {
            console.log('[小程序全局数据] 从缓存中读取全局设置成功');
            this.globalData.globalSettings = cachedSettings;
          }
        } catch (e) {
          console.error('[小程序全局数据] 从缓存中读取全局设置失败:', e);
        }
      }
    } catch (error) {
      console.error('[小程序全局数据] 加载全局设置异常:', error);
    }
  }
});
