module.exports = {
  name: '内容列表',
  type: 'content-list',

  generateHTML(component) {
    return `  <view class="content-list">
    ${component.componentItems.map(item => `    <view class="content-item">
      <image class="content-image" src="${item.image || 'https://via.placeholder.com/120x120/eee/999?text=Image'}" mode="aspectFill"></image>
      <view class="content-info">
        <text class="content-title">${item.title || '标题'}</text>
        <text class="content-desc">${item.desc || '描述'}</text>
      </view>
    </view>`).join('\n')}
  </view>`;
  },

  generateCSS() {
    return `.content-list {
  background: #fff;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
}

.content-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.content-item:last-child {
  border-bottom: none;
}

.content-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
}

.content-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.content-title {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.content-desc {
  font-size: 12px;
  color: #666;
  display: block;
}`;
  },

  getDefaultProperties() {
    return {};
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {};
  }
};
