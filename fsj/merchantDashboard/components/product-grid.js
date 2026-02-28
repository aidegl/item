module.exports = {
  name: '商品网格',
  type: 'product-grid',

  generateHTML(component) {
    const columns = component.properties.columns || 2;
    const showPrice = component.properties.showPrice !== false;
    
    return `  <view class="product-grid">
    <view class="product-grid-container" style="grid-template-columns: repeat(${columns}, 1fr);">
      ${component.componentItems.map((item, index) => `      <view class="product-item">
        <image class="product-image" src="${item.image || 'https://via.placeholder.com/200x200/eee/999?text=Product'}" mode="aspectFill"></image>
        <view class="product-info">
          <text class="product-name">${item.name || '商品名称'}</text>
          ${showPrice ? `<text class="product-price">¥${item.price || '99.00'}</text>` : ''}
        </view>
      </view>`).join('\n')}
    </view>
  </view>`;
  },

  generateCSS() {
    return `.product-grid {
  background: #fff;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
}

.product-grid-container {
  display: grid;
  gap: 10px;
}

.product-item {
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 160px;
  display: block;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 14px;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.product-price {
  font-size: 14px;
  color: #ff4400;
  font-weight: bold;
  display: block;
}`;
  },

  getDefaultProperties() {
    return {
      columns: 2,
      showPrice: true
    };
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {
      columns: '列数',
      showPrice: '显示价格'
    };
  }
};
