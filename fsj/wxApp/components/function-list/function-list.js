Component({
  properties: {
    items: {
      type: Array,
      value: []
    },
    columns: {
      type: Number,
      value: 3
    },
    iconSize: {
      type: Number,
      value: 48
    }
  },

  methods: {
    onItemTap(e) {
      const index = e.currentTarget.dataset.index;
      this.triggerEvent('itemtap', { index, item: this.properties.items[index] });
    }
  }
});
