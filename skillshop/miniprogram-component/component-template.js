/**
 * 小程序组件模板
 * 
 * 复制此模板开始开发新组件
 * 文件命名：组件名.js（如 shop-info.js）
 */

module.exports = {
  // ========== 基础配置 ==========
  
  /**
   * 组件名称（必须）
   * 显示在装修页面的组件库中
   * 必须使用中文，与 generateHTML 中的变量名对应
   */
  name: '组件名称',
  
  /**
   * 组件类型（必须）
   * - '系统级组件': 数据来自固定表，自动加载（如轮播图、商品网格）
   * - '用户级组件': 数据由商家配置（如图片、文本）
   */
  type: '系统级组件',
  
  /**
   * 关联页面（可选）
   * 用于组件库筛选，只显示在对应页面
   * - 'home': 首页
   * - 'my': 我的页面
   * - 'category': 分类页面
   */
  relatedPage: 'home',
  
  // ========== 配置方法 ==========
  
  /**
   * 默认属性配置（必须）
   * 返回组件的默认属性，商家可以在属性面板修改
   */
  getDefaultProperties() {
    return {
      // 示例属性
      showTitle: true,        // 是否显示标题
      titleSize: 32,          // 标题大小 (rpx)
      cardStyle: 'default',   // 卡片样式
      themeColor: '{主题色}'   // 主题色（支持占位符）
    };
  },
  
  /**
   * 数据源配置（系统级组件必须）
   * 定义从明道云哪个表加载数据
   */
  dataSource: {
    worksheetId: 'shangjia',  // 工作表 ID
    fields: [                 // 需要的字段
      'mRowid',
      'mingcheng',
      'leixing',
      'zhuangtai',
      'fengmian'
    ],
    filterByMerchant: true    // 是否按商家 ID 筛选
  },
  
  // ========== 代码生成方法 ==========
  
  /**
   * 生成 WXML 代码（必须）
   * @param {Object} component - 组件配置对象
   * @returns {String} WXML 代码字符串
   */
  generateHTML(component) {
    const props = component.properties || this.getDefaultProperties();
    
    // 示例：简单的卡片结构
    return `
<view class="custom-card custom-card-${props.cardStyle}">
  ${props.showTitle ? `
  <text class="custom-title" style="font-size: ${props.titleSize}rpx">
    {{data.title}}
  </text>
  ` : ''}
  
  <view class="custom-content">
    <text>{{data.content}}</text>
  </view>
</view>
    `.trim();
  },
  
  /**
   * 生成 WXSS 样式（必须）
   * @param {Object} component - 组件配置对象
   * @returns {String} WXSS 代码字符串
   */
  generateCSS(component) {
    const props = component.properties || this.getDefaultProperties();
    const themeColor = props.themeColor === '{主题色}' ? '#667eea' : props.themeColor;
    
    return `
.custom-card {
  padding: 30rpx;
  border-radius: 16rpx;
  margin: 20rpx;
}

.custom-card-default {
  background: #ffffff;
  border: 1rpx solid #e0e0e0;
}

.custom-card-gradient {
  background: linear-gradient(135deg, ${themeColor} 0%, #764ba2 100%);
}

.custom-title {
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.custom-content {
  color: #666666;
  font-size: 28rpx;
}
    `.trim();
  },
  
  /**
   * 生成 JS 数据加载逻辑（必须）
   * @param {Object} component - 组件配置对象
   * @returns {String} JS 代码字符串
   */
  generateJS(component) {
    return `
// 加载组件数据
loadData() {
  const app = getApp();
  const merchantId = app.globalData.merchantId;
  
  wx.request({
    url: app.globalData.mingdaoApi + '/v2/worksheet/rows',
    method: 'POST',
    data: {
      worksheetId: '${this.dataSource.worksheetId}',
      filter: {
        eq: {
          mRowid: merchantId
        }
      },
      pageSize: 1,
      pageIndex: 1
    },
    success: (res) => {
      if (res.data.success && res.data.data.rows.length > 0) {
        const data = res.data.data.rows[0];
        this.setData({ data });
      }
    },
    fail: (err) => {
      console.error('加载数据失败:', err);
    }
  });
}
    `.trim();
  },
  
  /**
   * 生成 JSON 配置（必须）
   * @returns {String} JSON 配置字符串
   */
  generateJSON() {
    return `{
  "usingComponents": {},
  "navigationBarTitleText": "${this.name}"
}`;
  },
  
  // ========== 数据加载方法（系统级组件必须实现） ==========
  
  /**
   * 加载组件数据（系统级组件必须实现）
   * 在打包时被 server.js 调用，从明道云加载数据
   * 
   * @param {String} merchantId - 商家 ID
   * @param {String} outputDir - 输出目录
   * @returns {Promise<Array>} 格式化后的数据数组
   */
  async loadData(merchantId, outputDir) {
    console.log(`[组件名称] 开始加载数据，merchantId: ${merchantId}`);
    
    try {
      const { mingdaoGetFilterRows } = require('./utils/mingdaoServer');
      
      const result = await mingdaoGetFilterRows({
        appKey: process.env.MINGDAO_APP_KEY,
        sign: process.env.MINGDAO_SIGN,
        worksheetId: this.dataSource.worksheetId,
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
      
      console.log('[组件名称] 明道云返回:', result);
      
      if (result.success && result.data && result.data.rows.length > 0) {
        const row = result.data.rows[0];
        
        // 解析图片字段（如果有）
        let imgUrl = '';
        if (row.fengmian) {
          try {
            const imgArray = JSON.parse(row.fengmian);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              imgUrl = imgArray[0].large_thumbnail_full_path || 
                       imgArray[0].url || 
                       imgArray[0].thumbnail_full_path || '';
            }
          } catch (e) {
            console.error('[组件名称] 解析图片失败:', e);
          }
        }
        
        // 返回格式化数据
        return [{
          title: row.mingcheng || '默认标题',
          content: row.miaoshu || '',
          image: imgUrl,
          type: row.leixing || '',
          status: row.zhuangtai || 0
        }];
      } else {
        console.warn('[组件名称] 未找到数据');
        return [{
          title: '默认标题',
          content: '',
          image: '',
          type: '',
          status: 0
        }];
      }
    } catch (error) {
      console.error('[组件名称] 加载数据失败:', error);
      return [{
        title: '默认标题',
        content: '',
        image: '',
        type: '',
        status: 0
      }];
    }
  }
};
