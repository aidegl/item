module.exports = {
  name: '内容列表',
  type: 'content-list',

  generateHTML(component) {
    const dataKey = component.dataKey || 'contentList';
    const props = component.properties || {};
    const showTabs = props.showTabs === true;
    
    let html = `  <view class="content-list">`;
    
    if (showTabs) {
      html += `
    <view class="tabs-wrapper">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs">
          <block wx:for="{{${dataKey}Tabs}}" wx:key="value">
            <view class="tab-item {{currentTab === item.value ? 'active' : ''}}" data-value="{{item.value}}" bindtap="onTabChange">{{item.label}}</view>
          </block>
        </view>
      </scroll-view>
    </view>`;
    }
    
    html += `
    <view class="content-items">
      <block wx:for="{{${dataKey}}}" wx:key="rowid">
        <view class="content-item">
          <image class="content-cover" src="{{item.fengmian}}" mode="aspectFill"></image>
          <view class="content-body">
            <view class="content-main">
              <text class="content-title">{{item.mingcheng}}</text>
              <text class="content-desc">{{item.miaoshu}}</text>
            </view>
            <view class="content-meta">
              <view class="content-tags" wx:if="{{item.biaoqian && item.biaoqian.length > 0}}">
                <block wx:for="{{item.biaoqian}}" wx:for-item="tag" wx:key="index">
                  <text class="content-tag">{{tag}}</text>
                </block>
              </view>
              <text class="content-price" wx:if="{{item.jiage}}">¥{{item.jiage}}</text>
            </view>
            <view class="content-author">
              <image class="author-avatar" src="{{item.zztx}}" mode="aspectFill"></image>
              <text class="author-name">{{item.zznc}}</text>
              <text class="content-date">{{item.cjsj_display}}</text>
            </view>
          </view>
        </view>
      </block>
    </view>
  </view>`;
    
    return html;
  },

  generateCSS() {
    return `.content-list {
  background: #fff;
}

.tabs-wrapper {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}

.tabs-scroll {
  white-space: nowrap;
  padding: 0 12px;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 0;
}

.tab-item {
  display: inline-block;
  padding: 6px 16px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  flex-shrink: 0;
}

.tab-item.active {
  color: #fff;
  background: #667eea;
}

.content-items {
  padding: 0 12px 12px;
}

.content-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.content-item:last-child {
  border-bottom: none;
}

.content-cover {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  flex-shrink: 0;
}

.content-body {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.content-main {
  display: flex;
  flex-direction: column;
}

.content-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
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
  margin-top: 4px;
}

.content-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.content-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}

.content-tag {
  font-size: 10px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.content-price {
  font-size: 14px;
  font-weight: 600;
  color: #ff4d4f;
  flex-shrink: 0;
  margin-left: 8px;
}

.content-author {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.author-name {
  font-size: 11px;
  color: #666;
  margin-left: 6px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-date {
  font-size: 11px;
  color: #999;
  flex-shrink: 0;
}`;
  },

  getDefaultProperties() {
    return {
      showTabs: false,
      themeColor: '',
      defaultTab: ''
    };
  },

  getDefaultItems() {
    return [];
  },

  getPropertyLabels() {
    return {
      showTabs: '显示标签页',
      themeColor: '主题色',
      defaultTab: '默认标签'
    };
  },

  formatTime(timestamp) {
    if (!timestamp) return '';
    
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours}小时前`;
    } else if (diff < 2 * day) {
      return '昨天';
    } else if (diff < 7 * day) {
      const days = Math.floor(diff / day);
      return `${days}天前`;
    } else {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayStr}`;
    }
  }
};
