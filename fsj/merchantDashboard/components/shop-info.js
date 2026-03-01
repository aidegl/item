/**
 * 店铺基本信息组件
 * 显示店铺 LOGO、名称、类型、营业状态
 * 
 * 数据源：shangjia 表
 * 字段：mingcheng, leixing, zhuangtai, logo
 */

module.exports = {
  name: '店铺信息',
  type: '基础组件',
  relatedPage: 'home',
  category: '基础组件',  // 组件分类：基础组件/商品组件/内容组件
  
  // ========== 默认属性配置 ==========
  getDefaultProperties() {
    return {
      showLogo: true,           // 显示 LOGO
      showType: true,           // 显示店铺类型
      showStatus: true,         // 显示营业状态
      logoSize: 80,             // LOGO 大小 (px)
      cardStyle: 'gradient',    // 卡片样式：gradient/solid/minimal
      themeColor: '{主题色}'     // 主题色（支持占位符）
    };
  },
  
  // ========== 数据源配置 ==========
  dataSource: {
    worksheetId: 'shangjia',
    fields: ['mRowid', 'mingcheng', 'leixing', 'zhuangtai', 'logo'],
    filterByMerchant: true      // 按商家 ID 筛选
  },
  
  // ========== 生成小程序 WXML 代码 ==========
  generateHTML(component) {
    const props = component.properties || this.getDefaultProperties();
    
    return `
<view class="shop-info-card shop-info-${props.cardStyle}">
  ${props.showLogo ? `
  <image class="shop-logo" 
         src="{{shopInfo.logo}}" 
         mode="aspectFill"
         style="width: ${props.logoSize}rpx; height: ${props.logoSize}rpx;" />
  ` : ''}
  
  <view class="shop-info-content">
    <text class="shop-name">{{shopInfo.mingcheng}}</text>
    
    ${props.showType ? `
    <text class="shop-type">类型：{{shopInfo.leixing}}</text>
    ` : ''}
    
    ${props.showStatus ? `
    <view class="shop-status {{shopInfo.zhuangtai == 1 ? 'active' : 'inactive'}}">
      <text>{{shopInfo.zhuangtai == 1 ? '营业中' : '已打烊'}}</text>
    </view>
    ` : ''}
  </view>
</view>
    `.trim();
  },
  
  // ========== 生成小程序 WXSS 样式 ==========
  generateCSS(component) {
    const props = component.properties || this.getDefaultProperties();
    const themeColor = props.themeColor === '{主题色}' ? '#667eea' : props.themeColor;
    
    return `
.shop-info-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-radius: 16rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

/* 渐变风格 */
.shop-info-gradient {
  background: linear-gradient(135deg, ${themeColor} 0%, #764ba2 100%);
}

/* 纯色风格 */
.shop-info-solid {
  background: ${themeColor};
}

/* 简约风格 */
.shop-info-minimal {
  background: #ffffff;
  border: 1rpx solid #e0e0e0;
}

.shop-logo {
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.15);
  background: #ffffff;
}

.shop-info-content {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.shop-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.shop-type {
  font-size: 26rpx;
  color: rgba(255,255,255,0.8);
}

.shop-status {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  width: fit-content;
}

.shop-status.active {
  background: rgba(76, 217, 100, 0.2);
  color: #4cd964;
}

.shop-status.inactive {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255,255,255,0.6);
}

/* 简约风格的颜色调整 */
.shop-info-minimal .shop-name,
.shop-info-minimal .shop-type {
  color: #333333;
}

.shop-info-minimal .shop-status.inactive {
  background: #f5f5f5;
  color: #999999;
}
    `.trim();
  },
  
  // ========== 生成小程序 JS 数据加载逻辑 ==========
  generateJS(component) {
    return `
// 加载店铺信息
loadShopInfo() {
  const app = getApp();
  const merchantId = app.globalData.merchantId;
  
  if (!merchantId) {
    console.error('[店铺信息] 缺少 merchantId');
    return;
  }
  
  wx.request({
    url: app.globalData.mingdaoApi + '/v2/worksheet/rows',
    method: 'POST',
    data: {
      worksheetId: 'shangjia',
      filter: {
        eq: {
          mRowid: merchantId
        }
      },
      pageSize: 1,
      pageIndex: 1
    },
    success: (res) => {
      console.log('[店铺信息] 获取成功:', res.data);
      
      if (res.data.success && res.data.data.rows.length > 0) {
        const shop = res.data.data.rows[0];
        
        // 解析 LOGO 图片
        let logoUrl = '';
        try {
          if (shop.logo) {
            const logoData = JSON.parse(shop.logo);
            if (Array.isArray(logoData) && logoData.length > 0) {
              logoUrl = logoData[0].large_thumbnail_full_path || 
                        logoData[0].url || 
                        logoData[0].thumbnail_full_path || '';
            }
          }
        } catch (e) {
          console.error('[店铺信息] 解析 LOGO 失败:', e);
        }
        
        // 更新数据
        this.setData({
          shopInfo: {
            logo: logoUrl || '/images/default-shop-logo.png',
            mingcheng: shop.mingcheng || '未命名店铺',
            leixing: shop.leixing || '综合店铺',
            zhuangtai: shop.zhuangtai || 0
          }
        });
        
        console.log('[店铺信息] 数据已更新:', this.data.shopInfo);
      } else {
        console.warn('[店铺信息] 未找到店铺数据');
        // 使用默认数据
        this.setData({
          shopInfo: {
            logo: '/images/default-shop-logo.png',
            mingcheng: '未命名店铺',
            leixing: '综合店铺',
            zhuangtai: 0
          }
        });
      }
    },
    fail: (err) => {
      console.error('[店铺信息] 请求失败:', err);
    }
  });
}
    `.trim();
  },
  
  // ========== 生成小程序 JSON 配置 ==========
  generateJSON() {
    return `{
  "usingComponents": {},
  "navigationBarTitleText": "店铺信息"
}`;
  },
  
  // ========== 系统级组件：实现 loadData 方法 ==========
  async loadData(merchantId, outputDir) {
    console.log(`[店铺信息] 开始加载数据，merchantId: ${merchantId}`);
    
    try {
      const { mingdaoGetFilterRows } = require('./utils/mingdaoServer');
      
      const result = await mingdaoGetFilterRows({
        appKey: process.env.MINGDAO_APP_KEY,
        sign: process.env.MINGDAO_SIGN,
        worksheetId: 'shangjia',
        filters: [{
          controlId: 'mRowid',
          dataType: 2,
          spliceType: 1,
          filterType: 2,
          value: merchantId
        }],
        pageSize: 1,
        pageIndex: 1
      });
      
      console.log('[店铺信息] 明道云返回:', result);
      
      if (result.success && result.data && result.data.rows.length > 0) {
        const shop = result.data.rows[0];
        
        // 解析 LOGO
        let logoUrl = '';
        try {
          if (shop.logo) {
            const logoData = JSON.parse(shop.logo);
            if (Array.isArray(logoData) && logoData.length > 0) {
              logoUrl = logoData[0].large_thumbnail_full_path || 
                        logoData[0].url || 
                        logoData[0].thumbnail_full_path || '';
            }
          }
        } catch (e) {
          console.error('[店铺信息] 解析 LOGO 失败:', e);
        }
        
        // 返回格式化数据
        return [{
          logo: logoUrl,
          mingcheng: shop.mingcheng || '未命名店铺',
          leixing: shop.leixing || '综合店铺',
          zhuangtai: shop.zhuangtai || 0
        }];
      } else {
        console.warn('[店铺信息] 未找到店铺数据');
        return [{
          logo: '',
          mingcheng: '未命名店铺',
          leixing: '综合店铺',
          zhuangtai: 0
        }];
      }
    } catch (error) {
      console.error('[店铺信息] 加载数据失败:', error);
      return [{
        logo: '',
        mingcheng: '未命名店铺',
        leixing: '综合店铺',
        zhuangtai: 0
      }];
    }
  }
};
