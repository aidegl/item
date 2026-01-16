# Webview 资源强制刷新与缓存控制技术方案

在小程序 Webview 开发中，由于微信内部浏览器（X5内核或 WKWebView）存在较强的缓存机制，经常会出现代码更新后 Webview 内容不生效的问题。本项目采用了一套多维度的“强制刷新”技术方案，确保用户始终能获取到最新的资源。

## 1. 动态资源版本化 (Cache Busting)

这是最有效且最直接的手段。通过在资源 URL 后添加时间戳或版本号，使浏览器将其视为全新的请求，从而跳过缓存。

### HTML 注入示例

在 `index.html` 中，我们不直接通过 `<link>` 标签引入 CSS，而是使用 JavaScript 动态写入：

```javascript
// index.html
<script>
    // 使用当前毫秒级时间戳作为版本号，确保每次加载都是唯一的
    document.write('<link rel="stylesheet" href="styles.css?v=' + new Date().getTime() + '">');
</script>
```

## 2. HTTP 头部强力禁用缓存

在 `index.html` 的 `<head>` 部分配置多重 Meta 标签。虽然 Meta 标签在现代浏览器中的权重有所下降，但在移动端 Webview 中仍具有一定的兼容性参考价值。

```html
<!-- index.html -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta http-equiv="Cache-Control" content="max-age=0" />
```

## 3. 页面初始化状态校验 (Initialization Fallback)

在单页应用 (SPA) 中，脚本加载和 DOM 就绪的顺序可能因网络抖动而不确定。我们通过状态检测确保初始化逻辑（尤其是首屏渲染）必定触发。

### DOM 就绪检测

在 `app.js` 结尾，我们不直接调用 `initApp`，而是根据 `document.readyState` 判断：

```javascript
// app.js
if (document.readyState === 'loading') {
    // 如果 DOM 还在加载中，监听 DOMContentLoaded 事件
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // 如果 DOM 已经加载完成，立即执行初始化
    initApp();
}
```

## 4. 异步渲染补救方案

针对某些机型 Webview 渲染竞争导致的“白屏”或“渲染不完整”问题，我们引入了微任务/宏任务延迟机制。

```javascript
function initApp() {
    // ... 初始化逻辑
  
    // 强制初始渲染使用 setTimeout(0)，将其推入下一个事件循环
    // 确保此时所有的 DOM 节点都已经渲染完毕且可用
    setTimeout(() => {
        console.log('执行强制初始渲染');
        renderCurrentPage();
    }, 0);
}
```

## 5. 跨组件状态联动刷新

通过自定义事件（Custom Events）机制，当底层的登录组件（WechatLogin）状态发生变化时，强制触发 Webview 的 UI 重新渲染。

```javascript
// 监听登录状态变化事件
window.addEventListener('wechatlogin:change', () => {
    console.log('登录状态变化，强制同步 UI');
    renderCurrentPage(); // 重新渲染当前页面以应用最新的登录态
});
```

## 总结

这套方案通过 **URL 随机化（防缓存）**、**Meta 配置（禁缓存）**、**状态检测（保运行）** 以及 **异步补救（保渲染）** 四个维度，彻底解决了 Webview 资源滞后和初始化失败的问题，是移动端混合开发中保障稳定性的核心技术。