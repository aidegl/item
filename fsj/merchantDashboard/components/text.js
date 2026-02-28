module.exports = {
  name: '文本',
  type: 'text',

  generateHTML(component) {
    return `  <text class="custom-text" style="font-size: ${component.properties.fontSize || 16}px; color: ${component.properties.color || '#333'};">${component.componentItems[0]}</text>`;
  },

  generateCSS() {
    return `.custom-text {
  padding: 10px;
  display: block;
}`;
  },

  getDefaultProperties() {
    return {
      fontSize: 16,
      color: '#333',
      textAlign: 'left'
    };
  },

  getDefaultItems() {
    return ['请输入文本内容'];
  },

  getPropertyLabels() {
    return {
      fontSize: '字体大小',
      color: '颜色',
      textAlign: '对齐方式'
    };
  }
};
