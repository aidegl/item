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
    const dataKey = component.dataKey || 'functionList';
    return `  <view class="function-list">
    <view class="function-grid {{functionList.length >= 9 ? 'grid-5' : (functionList.length >= 7 ? 'grid-4' : (functionList.length >= 6 ? 'grid-3' : 'grid-auto'))}}">
      <block wx:for="{{${dataKey}}}" wx:key="name">
        <view class="function-item"><image src="{{item.icon}}" mode="aspectFit"></image><text>{{item.name}}</text></view>
      </block>
    </view>
  </view>`;
  },

  generateCSS() {
    return `.function-list {
  background: #fff;
  padding: 10px 0;
}

.function-grid {
  display: grid;
  gap: 0;
}

.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(25%, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-5 {
  grid-template-columns: repeat(5, 1fr);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 0;
}

.function-item image {
  width: 44px;
  height: 44px;
  margin-bottom: 4px;
}

.function-item text {
  font-size: 10px;
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
  }
};
