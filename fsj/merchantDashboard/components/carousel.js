module.exports = {
  name: '轮播图',
  type: 'carousel',

  generateHTML(component) {
    const dataKey = component.dataKey || 'carouselImages';
    return `  <swiper class="carousel" indicator-dots autoplay interval="3000">
    <block wx:for="{{${dataKey}}}" wx:key="url">
      <swiper-item><image src="{{item.url}}" mode="aspectFill"></image></swiper-item>
    </block>
  </swiper>`;
  },

  generateCSS() {
    return `.carousel {
  width: 100%;
  height: 160px;
}

.carousel image {
  width: 100%;
  height: 100%;
}`;
  },

  getDefaultProperties() {
    return {
      height: 160,
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
