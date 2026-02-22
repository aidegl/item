module.exports = {
  name: '内容列表',
  type: 'content-list',

  generateHTML(component) {
    const dataKey = component.dataKey || 'contentList';
    return `  <view class="content-list">
    <view wx:if="${dataKey}.length > 0" class="content-items">
      <block wx:for="{{${dataKey}}}" wx:key="rowid">
        <view class="content-item">
          <image class="content-cover" src="{{item.fengmian}}" mode="aspectFill"></image>
          <view class="content-body">
            <text class="content-title">{{item.mingcheng}}</text>
            <text class="content-desc">{{item.miaoshu}}</text>
            <view class="content-meta">
              <view class="content-tags" wx:if="{{item.biaoqian}}">
                <text class="content-tag">{{item.biaoqian}}</text>
              </view>
              <text class="content-price" wx:if="{{item.jiage}}">¥{{item.jiage}}</text>
            </view>
            <view class="content-author">
              <image class="author-avatar" src="{{item.zztx}}" mode="aspectFill" wx:if="{{item.zztx}}"></image>
              <text class="author-name" wx:if="{{item.zznc}}">{{item.zznc}}</text>
              <text class="content-date">{{item.cjsj}}</text>
            </view>
          </view>
        </view>
      </block>
    </view>
    <view wx:else class="content-empty">
      <text>暂无内容</text>
    </view>
  </view>`;
  },

  generateCSS() {
    return `.content-list {
  background: #fff;
  margin: 5px 10px;
}

.content-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.content-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.content-cover {
  width: 100px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #f5f5f5;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.content-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.content-desc {
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.content-tags {
  display: flex;
  gap: 4px;
}

.content-tag {
  font-size: 10px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.content-price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: 500;
}

.content-author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f5f5f5;
}

.author-name {
  font-size: 11px;
  color: #666;
}

.content-date {
  font-size: 11px;
  color: #999;
}

.content-empty {
  padding: 40px 0;
  text-align: center;
}

.content-empty text {
  font-size: 14px;
  color: #999;
}`;
  },

  getDefaultProperties() {
    return {
      worksheetId: 'neirong',
      titleField: 'mingcheng',
      descField: 'miaoshu',
      coverField: 'fengmian',
      tagsField: 'biaoqian',
      priceField: 'jiage',
      authorAvatarField: 'zztx',
      authorNameField: 'zznc',
      dateField: 'cjsj'
    };
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {
      worksheetId: '数据表别名',
      titleField: '标题字段',
      descField: '描述字段',
      coverField: '封面字段',
      tagsField: '标签组字段',
      priceField: '价格字段',
      authorAvatarField: '作者头像字段',
      authorNameField: '作者昵称字段',
      dateField: '发布日期字段'
    };
  }
};
