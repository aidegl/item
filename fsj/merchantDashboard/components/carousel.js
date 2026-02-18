const MingDaoYunArrayAPI = require('../wxApp/utils/MingdaoYunArrayAPI');
const https = require('https');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`图片下载成功: ${filepath}`);
          resolve();
        });
      } else {
        console.error(`图片下载失败: ${url}, 状态码: ${response.statusCode}`);
        reject(new Error(`图片下载失败: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`图片下载错误: ${url}`, err);
      reject(err);
    });
  });
}

module.exports = {
  name: '轮播图',
  type: 'carousel',

  generateHTML(component) {
    return `  <swiper class="carousel" indicator-dots autoplay interval="3000">
    ${component.componentItems.map(item => `    <swiper-item><image src="${item.url}" mode="aspectFill"></image></swiper-item>`).join('\n')}
  </swiper>`;
  },

  generateCSS() {
    return `.carousel {
  width: 100%;
  height: 200px;
}

.carousel image {
  width: 100%;
  height: 100%;
}`;
  },

  getDefaultProperties() {
    return {
      height: 200,
      autoplay: true,
      interval: 3000
    };
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {
      height: '高度',
      autoplay: '自动播放',
      interval: '间隔时间'
    };
  },

  async loadData(merchantId, outputDir) {
    try {
      console.log('加载轮播图数据...');
      const api = new MingDaoYunArrayAPI();
      const imagesDir = path.join(outputDir, 'images');

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const result = await api.getData({
        worksheetId: 'lunbotu',
        filters: [
          {
            controlId: 'use',
            dataType: 2,
            spliceType: 1,
            filterType: 2,
            value: '1'
          }
        ],
        pageSize: 50,
        pageIndex: 1
      });

      if (result.success && result.data && result.data.rows) {
        const carouselData = result.data.rows.map(row => ({
          url: row.url
        }));

        for (let i = 0; i < carouselData.length; i++) {
          const filename = `carousel_${i}.png`;
          const filepath = path.join(imagesDir, filename);
          await downloadImage(carouselData[i].url, filepath);
        }

        console.log(`轮播图加载成功，共 ${carouselData.length} 张图片`);
        return carouselData;
      }

      return [];
    } catch (error) {
      console.error('加载轮播图数据失败:', error);
      return [];
    }
  }
};
