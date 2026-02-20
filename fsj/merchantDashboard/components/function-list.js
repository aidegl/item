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
  name: '功能列表',
  type: 'function-list',

  generateHTML(component) {
    return `  <view class="function-list">
    <view class="function-grid">
      <block wx:for="{{${component.componentName}}}" wx:key="name">
        <view class="function-item"><image src="{{item.icon}}" mode="aspectFit"></image><text>{{item.name}}</text></view>
      </block>
    </view>
  </view>`;
  },

  generateCSS() {
    return `.function-list {
  background: #fff;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px;
}

.function-item image {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.function-item text {
  font-size: 12px;
  color: #666;
}`;
  },

  getDefaultProperties() {
    return {
      columns: 3,
      iconSize: 48
    };
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {
      columns: '列数',
      iconSize: '图标大小'
    };
  },

  async loadData(merchantId, outputDir) {
    try {
      console.log('加载功能列表数据...');
      const api = new MingDaoYunArrayAPI();
      const imagesDir = path.join(outputDir, 'images');

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const result = await api.getData({
        worksheetId: 'gongnengliebiao',
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
        const functionListData = result.data.rows.map(row => ({
          icon: row.icon,
          name: row.name
        }));

        for (let i = 0; i < functionListData.length; i++) {
          const filename = `function_${i}.png`;
          const filepath = path.join(imagesDir, filename);
          await downloadImage(functionListData[i].icon, filepath);
          functionListData[i].icon = `/images/${filename}`;
        }

        console.log(`功能列表加载成功，共 ${functionListData.length} 个功能`);
        return functionListData;
      }

      return [];
    } catch (error) {
      console.error('加载功能列表数据失败:', error);
      return [];
    }
  }
};
