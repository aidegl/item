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
  }
};
