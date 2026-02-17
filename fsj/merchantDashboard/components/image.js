module.exports = {
  name: '图片',
  type: 'image',

  generateHTML(component) {
    return `  <image class="single-image" src="${component.componentItems[0]}" mode="widthFix"></image>`;
  },

  generateCSS() {
    return `.single-image {
  width: 100%;
  display: block;
}`;
  },

  getDefaultProperties() {
    return {
      height: 'auto',
      borderRadius: 0
    };
  },

  getDefaultItems() {
    return ['https://via.placeholder.com/750x400/667eea/ffffff?text=Image'];
  },

  getPropertyLabels() {
    return {
      height: '高度',
      borderRadius: '圆角'
    };
  }
};
