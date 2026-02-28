module.exports = {
  name: '公告',
  type: 'notice',

  generateHTML(component) {
    const icon = component.properties.icon || '📢';
    const bgColor = component.properties.backgroundColor || '#fff7e6';
    const textColor = component.properties.textColor || '#ff6b00';
    
    return `  <view class="notice" style="background: ${bgColor}; color: ${textColor};">
    <text class="notice-icon">${icon}</text>
    <text class="notice-text">${component.componentItems[0] || '公告内容'}</text>
  </view>`;
  },

  generateCSS() {
    return `.notice {
  padding: 10px;
  border-radius: 8px;
  margin: 10px;
  display: flex;
  align-items: center;
}

.notice-icon {
  margin-right: 8px;
  font-size: 16px;
}

.notice-text {
  flex: 1;
  font-size: 14px;
}`;
  },

  getDefaultProperties() {
    return {
      backgroundColor: '#fff7e6',
      textColor: '#ff6b00',
      icon: '📢'
    };
  },

  getDefaultItems() {
    return ['欢迎使用本小程序'];
  },

  getPropertyLabels() {
    return {
      backgroundColor: '背景色',
      textColor: '文字色',
      icon: '图标'
    };
  }
};
