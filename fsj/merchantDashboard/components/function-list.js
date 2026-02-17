module.exports = {
  name: '功能列表',
  type: 'function-list',

  generateHTML(component) {
    return `  <view class="function-list">
    <view class="function-grid">
      ${component.componentItems.map(item => `      <view class="function-item"><text>${item}</text></view>`).join('\n')}
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
  text-align: center;
  padding: 10px;
}

.function-item text {
  font-size: 12px;
  color: #666;
}`;
  },

  getDefaultProperties() {
    return {
      columns: 3
    };
  },

  getDefaultItems() {
    return ['圈子', '想法', '团送'];
  },

  getPropertyLabels() {
    return {
      columns: '列数'
    };
  }
};
