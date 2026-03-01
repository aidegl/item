# 小程序组件开发 Skill

## 🎯 功能

帮助开发者创建可在 merchantDashboard 装修页面拖拽使用的小程序组件，打包后能在小程序中正常显示。

---

## 📦 完整组件结构

一个完整的组件必须包含以下文件：

```
components/
└── shop-info.js          # 组件定义文件
```

---

## 🔧 组件开发规范

### 1. 组件 exports 结构

```javascript
module.exports = {
  name: '组件名称',              // 必须：中文名称，显示在组件库
  type: '组件类型',              // 必须：系统级/用户级
  relatedPage: 'home',          // 可选：页面筛选（home/my/category）
  
  // 默认属性配置
  getDefaultProperties() {
    return {
      // 属性键值对
    };
  },
  
  // 数据源配置（系统级组件）
  dataSource: {
    worksheetId: 'shangjia',
    fields: ['mRowid', 'mingcheng'],
    filterByMerchant: true
  },
  
  // 生成 WXML 代码
  generateHTML(component) {
    return `<view>...</view>`;
  },
  
  // 生成 WXSS 样式
  generateCSS(component) {
    return `.class { ... }`;
  },
  
  // 生成 JS 数据加载逻辑
  generateJS(component) {
    return `Page({ ... })`;
  },
  
  // 生成 JSON 配置
  generateJSON() {
    return `{ "usingComponents": {} }`;
  },
  
  // 系统级组件必须实现：打包时加载数据
  async loadData(merchantId, outputDir) {
    // 从明道云加载数据
    return [...];
  }
};
```

---

### 2. 组件分类

| 类型 | 说明 | 必须实现 | 示例 |
|------|------|----------|------|
| **系统级** | 数据来自固定表，自动加载 | `loadData()` | 轮播图、商品网格 |
| **用户级** | 数据由商家配置，按需加载 | 不需要 | 图片、文本 |

---

### 3. 明道云字段命名规范

**必须使用拼音缩写：**

| 含义 | 字段名 | 类型 |
|------|--------|------|
| 名称 | `mingcheng` | 文本 |
| 描述 | `miaoshu` | 文本 |
| 封面 | `fengmian` | 附件 |
| 标签 | `biaoqian` | 文本（多选项） |
| 价格 | `jiage` | 数字 |
| 类型 | `leixing` | 选项 |
| 状态 | `zhuangtai` | 数字 |
| 作者头像 | `zztx` | 附件 |
| 作者昵称 | `zznc` | 文本 |
| 点赞 | `dianzan` | 数字 |
| 评论 | `pinglun` | 数字 |
| 收藏 | `shoucang` | 数字 |
| 阅读量 | `yueduliang` | 数字 |

---

### 4. 图片处理规范

**统一解析方式：**

```javascript
// 明道云返回的图片字段是 JSON 字符串
const imgArray = JSON.parse(row.fengmian);

// 提取图片 URL（优先级顺序）
const imgUrl = imgArray[0]?.large_thumbnail_full_path || 
               imgArray[0]?.url || 
               imgArray[0]?.thumbnail_full_path || '';
```

---

### 5. 主题色占位符

**支持 `{主题色}` 替换：**

```javascript
const props = component.properties || this.getDefaultProperties();
const themeColor = props.themeColor === '{主题色}' 
  ? '#667eea'  // 默认主题色
  : props.themeColor;

// 在 CSS 中使用
background: ${themeColor};
```

---

## 📝 组件开发步骤

### Step 1: 创建组件文件

```bash
cd /home/admin/.openclaw/workspace/item/fsj/merchantDashboard/components
touch shop-info.js
```

### Step 2: 实现组件方法

```javascript
// shop-info.js
module.exports = {
  name: '店铺信息',
  type: '商家端专属组件',
  
  getDefaultProperties() {
    return {
      showLogo: true,
      logoSize: 80
    };
  },
  
  generateHTML(component) {
    const props = component.properties || this.getDefaultProperties();
    return `
<view class="shop-info">
  <image src="{{shopInfo.logo}}" style="width: ${props.logoSize}rpx" />
  <text>{{shopInfo.mingcheng}}</text>
</view>`;
  },
  
  generateCSS() {
    return `
.shop-info {
  display: flex;
  padding: 30rpx;
}`;
  },
  
  generateJS() {
    return `
Page({
  data: { shopInfo: {} },
  onLoad() { this.loadShopInfo(); },
  loadShopInfo() {
    // 加载数据逻辑
  }
});`
  },
  
  async loadData(merchantId, outputDir) {
    // 系统级组件实现
    const { mingdaoGetFilterRows } = require('./utils/mingdaoServer');
    const result = await mingdaoGetFilterRows({...});
    return [...];
  }
};
```

### Step 3: 在 server.js 中注册

组件文件创建后，server.js 会自动通过 `componentRegistry` 加载：

```javascript
const { registerComponent, getComponent } = require('./components/componentRegistry');

// 组件会自动注册，通过 getComponent 获取
const comp = getComponent('店铺信息');
```

### Step 4: 测试打包

1. 访问 merchantDashboard 门店装修页面
2. 在组件库中找到新组件
3. 拖拽到预览区域
4. 点击"打包小程序"
5. 下载 ZIP 并导入微信开发者工具

---

## 🧪 组件测试清单

开发完成后逐项检查：

- [ ] 组件名称显示在组件库
- [ ] 可以拖拽到预览区域
- [ ] 属性面板可以配置
- [ ] 打包生成 WXML 代码正确
- [ ] 打包生成 WXSS 样式正确
- [ ] 打包生成 JS 数据加载逻辑正确
- [ ] 小程序中能正常渲染
- [ ] 数据能从明道云加载
- [ ] 图片能正常显示
- [ ] 主题色占位符能替换
- [ ] 错误处理完善

---

## 📚 参考组件

学习现有组件的实现：

| 组件 | 文件 | 类型 | 学习点 |
|------|------|------|--------|
| 轮播图 | `carousel.js` | 系统级 | 图片轮播、自动播放 |
| 功能列表 | `function-list.js` | 系统级 | 网格布局、图标显示 |
| 商品网格 | `product-grid.js` | 系统级 | 商品数据加载、价格显示 |
| 内容列表 | `content-list.js` | 系统级 | 标签页筛选、列表渲染 |
| 图片 | `image.js` | 用户级 | 简单图片显示 |
| 文本 | `text.js` | 用户级 | 静态文本配置 |

---

## 🔌 与 server.js 集成

### server.js 调用组件流程

```javascript
// 1. 加载组件数据（打包时）
async function loadComponentData(page, merchantId, outputDir) {
  for (const component of page.components) {
    const comp = getComponent(component.componentName);
    if (comp && comp.loadData) {
      const data = await comp.loadData(merchantId, outputDir);
      component.componentItems = data;
    }
  }
}

// 2. 生成页面代码
function generatePageWXML(page) {
  const componentsHTML = page.components.map(comp => {
    return generateComponentHTML(comp);
  }).join('');
  return `<view class="page">${componentsHTML}</view>`;
}

function generateComponentHTML(component) {
  const comp = getComponent(component.componentName);
  if (comp && comp.generateHTML) {
    return comp.generateHTML(component);
  }
  return '';
}
```

---

## ⚠️ 常见错误

### 1. 组件不显示

**原因：** 组件名称不匹配
```javascript
// 错误
name: 'ShopInfo'  // 英文名

// 正确
name: '店铺信息'   // 中文名，与装修页面一致
```

### 2. 数据加载失败

**原因：** 字段名用英文
```javascript
// 错误
fields: ['name', 'type']

// 正确
fields: ['mingcheng', 'leixing']
```

### 3. 图片不显示

**原因：** 没有解析 JSON
```javascript
// 错误
logo: row.fengmian  // 直接取值，是 JSON 字符串

// 正确
const imgArray = JSON.parse(row.fengmian);
logo: imgArray[0]?.large_thumbnail_full_path
```

### 4. 打包后样式丢失

**原因：** generateCSS 没有返回字符串
```javascript
// 错误
generateCSS() {
  return `.class { color: red }`;  // 忘记 return
}

// 正确
generateCSS() {
  return `.class { color: red }`;
}
```

---

## 🚀 快速开始

复制这个模板开始开发：

```javascript
/**
 * 组件名称
 * 功能描述
 */

module.exports = {
  name: '组件名称',
  type: '系统级组件/用户级组件',
  relatedPage: 'home',
  
  getDefaultProperties() {
    return {
      // 属性配置
    };
  },
  
  dataSource: {
    worksheetId: 'shangjia',
    fields: ['mRowid', 'mingcheng']
  },
  
  generateHTML(component) {
    return `<view>HTML 代码</view>`;
  },
  
  generateCSS(component) {
    return `.class { 样式代码 }`;
  },
  
  generateJS(component) {
    return `Page({ 数据加载逻辑 })`;
  },
  
  generateJSON() {
    return `{ "usingComponents": {} }`;
  },
  
  async loadData(merchantId, outputDir) {
    // 系统级组件实现
    return [...];
  }
};
```

---

## 📋 提交规范

组件开发完成后：

1. **提交到自己的分支**（如 `ai-feng`）
2. **不要直接提交 main**
3. **等待东城确认**后再推送

```bash
cd /home/admin/.openclaw/workspace/item/fsj
git checkout ai-feng
git add merchantDashboard/components/shop-info.js
git commit -m "feat: 新增 XXX 组件"
# 等待确认后 push
```

---

**版本：** 1.0.0
**最后更新：** 2026-03-01
**维护者：** 风 (Feng)
