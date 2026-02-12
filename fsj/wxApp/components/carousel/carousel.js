Component({
  properties: {
    images: {
      type: Array,
      value: []
    },
    height: {
      type: Number,
      value: 200
    },
    autoplay: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 3000
    }
  },

  data: {
    current: 0
  },

  methods: {
    onSwiperChange(e) {
      this.setData({
        current: e.detail.current
      });
    },

    onImageTap(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('imagetap', { index });
    }
  }
});
