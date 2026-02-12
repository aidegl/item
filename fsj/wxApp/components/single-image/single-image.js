Component({
  properties: {
    src: {
      type: String,
      value: ''
    },
    width: {
      type: String,
      value: '100%'
    },
    height: {
      type: String,
      value: 'auto'
    },
    borderRadius: {
      type: Number,
      value: 0
    }
  },

  methods: {
    onImageTap() {
      this.triggerEvent('imagetap');
    }
  }
});
