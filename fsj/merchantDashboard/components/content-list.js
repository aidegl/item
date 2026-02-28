module.exports = {
  name: '内容列表',
  type: 'content-list',

  generateHTML(component) {
    const dataKey = component.dataKey || 'contentList';
    const enableTabs = component.properties?.enableTabs || false;
    const tabs = component.properties?.tabs || [];
    const tabThemeColor = component.properties?.tabThemeColor || '#667eea';

    let tabsConfig = '[]';
    if (enableTabs && tabs.length > 0) {
      tabsConfig = JSON.stringify([
        { label: '全部', field: '', value: '' },
        ...tabs.map(t => ({
          label: t.label || '',
          field: t.field || '',
          value: t.value || ''
        }))
      ]);
    }

    const showTabs = enableTabs && tabs.length > 0;

    const tabsHTML = showTabs ? `
    <view class="content-tabs">
      <scroll-view class="tabs-scroll" scroll-x="{{true}}" enhanced="{{true}}" show-scrollbar="{{false}}">
        <view class="tabs-container">
          <block wx:for="{{contentTabs}}" wx:key="index">
            <view class="tab-item {{currentTabIndex === index ? 'tab-active' : ''}}" 
                  style="{{currentTabIndex === index ? 'color: ' + tabThemeColor + '; border-bottom-color: ' + tabThemeColor + ';' : ''}}"
                  data-index="{{index}}" 
                  data-field="{{item.field}}" 
                  data-value="{{item.value}}"
                  bindtap="onContentTabTap">
              <text>{{item.label}}</text>
            </view>
          </block>
        </view>
      </scroll-view>
    </view>` : '';

    return `  <view class="content-list">
${tabsHTML}
    <view wx:if="${dataKey}.length > 0" class="content-items">
      <block wx:for="{{${dataKey}}}" wx:key="rowid">
        <view class="content-item {{!item.fengmian ? 'content-item-full' : ''}}">
          <view class="content-main">
            <view class="content-body">
              <text class="content-title">{{item.mingcheng}}</text>
              <text class="content-desc">{{item.miaoshu}}</text>
              <view class="content-meta">
                <view class="content-tags" wx:if="{{item.biaoqian.length > 0}}">
                  <block wx:for="{{item.biaoqian}}" wx:for-item="tag" wx:key="*this">
                    <text class="content-tag">{{tag}}</text>
                  </block>
                </view>
                <text class="content-price" wx:if="{{item.jiage}}">¥{{item.jiage}}</text>
              </view>
            </view>
            <image class="content-cover" src="{{item.fengmian}}" mode="aspectFill" wx:if="{{item.fengmian}}"></image>
          </view>
          <view class="content-footer">
            <view class="content-author">
              <image class="author-avatar" src="{{item.zztx}}" mode="aspectFill" wx:if="{{item.zztx}}"></image>
              <text class="author-name" wx:if="{{item.zznc}}">{{item.zznc}}</text>
              <text class="content-date">{{item.ctimeFormatted}}</text>
            </view>
            <view class="content-stats">
              <text class="stat-text">👍 {{item.dianzan || 0}}</text>
              <text class="stat-text">💬 {{item.pinglun || 0}}</text>
              <text class="stat-text">⭐ {{item.shoucang || 0}}</text>
              <text class="stat-text">👁️ {{item.yueduliang || 0}}</text>
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
  margin: 1px 0;
  padding: 10px;
}

.content-tabs {
  padding: 10px 10px 0;
  background: #fff;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-container {
  display: flex;
  gap: 12px;
}

.tab-item {
  font-size: 14px;
  color: #666;
  padding: 8px 4px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  position: relative;
}

.tab-active {
  font-weight: 500;
}

.content-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: flex;
  flex-direction: column;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.content-main {
  display: flex;
  gap: 12px;
}

.content-item-full .content-main .content-body {
  flex: 1;
}

.content-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.content-cover {
  width: 100px;
  height: 80px;
  border-radius: 5px;
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
  font-weight: 700;
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
  gap: 2px;
}

.content-tag {
  font-size: 10px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 3px;
  border-radius: 4px;
  margin-right: 4px;
  white-space: nowrap;
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
}

.content-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.content-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-text {
  font-size: 11px;
  color: #999;
}

.author-avatar {
  width: 16px;
  height: 16px;
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
      dateField: 'ctime',
      enableTabs: false,
      tabThemeColor: '#667eea',
      tabs: []
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
      dateField: '发布日期字段',
      enableTabs: '开启标签页',
      tabThemeColor: '标签主题色',
      tabs: '标签配置'
    };
  }
};
