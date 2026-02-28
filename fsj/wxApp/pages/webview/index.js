Page({
  data: { url: '' },
  onLoad(o) {
    const url = o.url ? decodeURIComponent(o.url) : '';
    this.setData({ url });
  }
});