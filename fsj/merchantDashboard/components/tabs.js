module.exports = {
  name: '标签页面',
  type: 'tabs',

  generateHTML(component) {
    return `  <view class="tabs">
    <view class="tabs-header">
      ${component.componentItems.map((item, index) => `      <view class="tab-item ${index === 0 ? 'active' : ''}" data-index="${index}">${item}</view>`).join('\n')}
    </view>
    <view class="tabs-content">
      ${component.componentItems.map((item, index) => `      <view class="tab-pane ${index === 0 ? 'active' : ''}" data-index="${index}">
        <text>${item}内容</text>
      </view>`).join('\n')}
    </view>
  </view>`;
  },

  generateCSS() {
    return `.tabs {
  background: #fff;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
}

.tabs-header {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.tab-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #667eea;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.tabs-content {
  padding-top: 10px;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}`;
  },

  getDefaultProperties() {
    return {};
  },

  getDefaultItems() {
    return ['标签1', '标签2', '标签3'];
  },

  getPropertyLabels() {
    return {};
  }
};
