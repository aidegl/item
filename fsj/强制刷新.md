# Webview 资源全链路强制刷新方案 (推荐)

本项目采用“全链路版本控制”技术，彻底解决了微信 Webview 缓存顽固导致的更新不生效问题。

## 1. 核心原理：全链路版本联动 (关键点)

这是解决缓存最有效的方法。其核心在于**版本号由小程序下发，并穿透到 H5 的所有资源层级**。

### 1.1 小程序端：发令枪
在 `pages/webview/index.js` 中，仅在**冷启动 (onLoad)** 时生成唯一版本号，并拼接到 URL 中：
```javascript
const timestamp = new Date().getTime();
this.setData({ url: `https://.../index.html?v=${timestamp}` });
```

### 1.2 H5 端：全量资源刷新
在 `index.html` 中，不再直接写死 `<script>` 或 `<link>`，而是通过 JS 动态注入。这确保了只要 URL 里的 `v` 变了，所有资源都会同步更新：

```javascript
// index.html
(function () {
    // 1. 获取 URL 中的 v 参数
    var v = new URLSearchParams(window.location.search).get('v') || new Date().getTime();
    
    // 2. 动态注入 CSS
    document.write('<link rel="stylesheet" href="./styles.css?v=' + v + '">');
    
    // 3. 动态注入所有 JS 脚本
    var scripts = ['./js/WechatLogin.js', './js/app-core.js'];
    scripts.forEach(function(src) {
        document.write('<script src="' + src + '?v=' + v + '"><\/script>');
    });
})();
```

---

## 2. 简化后的辅助策略

为保持项目简洁，移除了冗余的 Meta 标签和复杂的初始化检测，仅保留以下核心辅助手段：

### 2.1 基础缓存控制
在 `index.html` 头部保留基本的 Meta 标签，防止部分机型对 HTML 本身进行强缓存：
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
```

### 2.2 资源加载顺序优化
通过 `app-core.js` 异步加载体积最大的业务逻辑 `app.js`，并同样透传版本号：
```javascript
// app-core.js
var v = new URLSearchParams(window.location.search).get('v') || Date.now();
var script = document.createElement('script');
script.src = './js/app.js?v=' + v;
document.head.appendChild(script);
```

---

## 3. 验证刷新是否生效

1. **查看控制台**：在 `vConsole` 日志中查看 `[Webview] 资源版本号: xxx`。
2. **检查网络请求**：确认 `app.js`、`styles.css` 等资源的请求 URL 后缀是否带上了与小程序一致的 `v` 参数。
3. **冷启动**：微信中彻底关闭小程序再重新进入，版本号必须发生变化。

## 总结
**全链路刷新的关键在于：不要让 H5 资源自己猜版本号，而要让小程序通过 URL 直接指挥所有资源的刷新。**
