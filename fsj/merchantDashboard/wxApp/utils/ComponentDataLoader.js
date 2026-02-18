const MingDaoYunArrayAPI = require('./MingdaoYunArrayAPI');

const ComponentDataLoader = {
  async loadCarouselData() {
    console.log('[组件加载器] 开始加载轮播图数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'lunbotu',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 轮播图API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const carouselData = result.data.rows.map(row => {
          let url = '';
          
          if (row.url) {
            url = row.url;
          } else if (row.img) {
            try {
              const imgArray = JSON.parse(row.img);
              if (Array.isArray(imgArray) && imgArray.length > 0) {
                url = imgArray[0].large_thumbnail_full_path || imgArray[0].url;
              }
            } catch (e) {
              console.error('[组件加载器] 解析img字段失败:', e);
            }
          }
          
          return { url };
        }).filter(item => item.url);

        console.log('[组件加载器] 轮播图数据加载成功，共', carouselData.length, '张图片');
        return carouselData;
      }

      console.log('[组件加载器] 轮播图数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载轮播图数据失败:', error);
      return [];
    }
  },

  async loadFunctionListData() {
    console.log('[组件加载器] 开始加载功能列表数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'gongnengliebiao',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 功能列表API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const functionListData = result.data.rows.map(row => ({
          name: row.name || '',
          icon: row.icon || '',
          link: row.link || ''
        }));

        console.log('[组件加载器] 功能列表数据加载成功，共', functionListData.length, '项');
        return functionListData;
      }

      console.log('[组件加载器] 功能列表数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载功能列表数据失败:', error);
      return [];
    }
  },

  async loadProductGridData() {
    console.log('[组件加载器] 开始加载商品网格数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'shangpin',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 商品网格API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const productData = result.data.rows.map(row => ({
          name: row.name || '',
          price: row.price || '',
          image: row.image || '',
          link: row.link || ''
        }));

        console.log('[组件加载器] 商品网格数据加载成功，共', productData.length, '个商品');
        return productData;
      }

      console.log('[组件加载器] 商品网格数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载商品网格数据失败:', error);
      return [];
    }
  },

  async loadAnnouncementData() {
    console.log('[组件加载器] 开始加载公告数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'gonggao',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 公告API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const announcementData = result.data.rows.map(row => ({
          content: row.content || '',
          link: row.link || ''
        }));

        console.log('[组件加载器] 公告数据加载成功，共', announcementData.length, '条');
        return announcementData;
      }

      console.log('[组件加载器] 公告数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载公告数据失败:', error);
      return [];
    }
  },

  async loadContentListData() {
    console.log('[组件加载器] 开始加载内容列表数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'neirong',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 内容列表API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const contentData = result.data.rows.map(row => ({
          title: row.title || '',
          description: row.description || '',
          image: row.image || '',
          link: row.link || ''
        }));

        console.log('[组件加载器] 内容列表数据加载成功，共', contentData.length, '条');
        return contentData;
      }

      console.log('[组件加载器] 内容列表数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载内容列表数据失败:', error);
      return [];
    }
  },

  async loadImageData() {
    console.log('[组件加载器] 开始加载图片数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'tupian',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 图片API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const imageData = result.data.rows.map(row => {
          let url = '';
          
          if (row.url) {
            url = row.url;
          } else if (row.img) {
            try {
              const imgArray = JSON.parse(row.img);
              if (Array.isArray(imgArray) && imgArray.length > 0) {
                url = imgArray[0].large_thumbnail_full_path || imgArray[0].url;
              }
            } catch (e) {
              console.error('[组件加载器] 解析img字段失败:', e);
            }
          }
          
          return { url };
        }).filter(item => item.url);

        console.log('[组件加载器] 图片数据加载成功，共', imageData.length, '张');
        return imageData;
      }

      console.log('[组件加载器] 图片数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载图片数据失败:', error);
      return [];
    }
  },

  async loadTextData() {
    console.log('[组件加载器] 开始加载文本数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'wenben',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 文本API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const textData = result.data.rows.map(row => ({
          content: row.content || '',
          style: row.style || ''
        }));

        console.log('[组件加载器] 文本数据加载成功，共', textData.length, '条');
        return textData;
      }

      console.log('[组件加载器] 文本数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载文本数据失败:', error);
      return [];
    }
  },

  async loadTabData() {
    console.log('[组件加载器] 开始加载标签页数据');
    const api = new MingDaoYunArrayAPI();
    
    try {
      const result = await api.getData({
        worksheetId: 'biaoqianye',
        filters: [],
        pageSize: 50,
        pageIndex: 1
      });

      console.log('[组件加载器] 标签页API返回结果:', result);

      if (result.success && result.data && result.data.rows) {
        const tabData = result.data.rows.map(row => ({
          name: row.name || '',
          content: row.content || ''
        }));

        console.log('[组件加载器] 标签页数据加载成功，共', tabData.length, '个标签');
        return tabData;
      }

      console.log('[组件加载器] 标签页数据加载失败');
      return [];
    } catch (error) {
      console.error('[组件加载器] 加载标签页数据失败:', error);
      return [];
    }
  }
};

module.exports = ComponentDataLoader;
