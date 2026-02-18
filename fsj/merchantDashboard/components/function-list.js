module.exports = {
  name: '功能列表',
  type: 'function-list',

  generateHTML(component) {
    return `  <view class="function-list">
    <view class="function-grid">
      ${component.componentItems.map(item => `      <view class="function-item"><image src="${item.icon}" mode="aspectFit"></image><text>${item.name}</text></view>`).join('\n')}
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
  }
};
