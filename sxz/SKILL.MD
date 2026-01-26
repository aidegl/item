# 全栈开发必备技能与避坑指南 (SKILL.MD)

本文档用于记录项目开发过程中遇到的经典问题、性能陷阱及最佳实践，旨在积累失败经验，提升全栈开发能力。

## 1. 前端性能与加载优化

### 1.1 严禁使用 `document.write` 动态加载资源

**🔴 问题现象**
- 页面加载出现明显的白屏或卡顿（尤其是首屏）。
- 浏览器控制台可能出现 `[Intervention] ... blocked` 警告。
- 在移动端或弱网环境下，浏览器（如 Chrome）甚至可能直接拦截此类调用，导致资源加载失败。

**🧐 原因分析**
- **阻塞渲染（Parser Blocking）**：`document.write` 是同步执行的。当浏览器解析器遇到它时，必须暂停 DOM 树的构建，去下载并执行脚本，然后才能继续解析后续 HTML。这直接打断了浏览器的渲染流水线。
- **历史包袱**：这是 Web 早期（2000年代）的遗留 API。虽然写法简单（一行代码），但在现代 Web 开发中已被视为反模式。
- **AI 生成陷阱**：AI 模型可能因训练数据包含大量旧代码而倾向于生成此方案，开发者需具备识别能力。

**✅ 最佳实践**
使用 DOM API (`document.createElement`) 动态创建节点。这种方式允许浏览器在后台并行下载资源，不阻塞主线程渲染。

**❌ 错误写法 (Blocking)**
```javascript
// 这里的 write 会强制浏览器暂停渲染，直到 CSS 下载并解析完成
document.write('<link rel="stylesheet" href="styles.css?v=' + v + '">');
```

**✅ 正确写法 (Non-blocking)**
```javascript
// 创建 DOM 节点，浏览器会异步下载资源，不阻塞页面展示
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'styles.css?v=' + v;
document.head.appendChild(link);
```

### 1.2 动态脚本的顺序控制 (`async` vs `defer`)

当使用 `document.createElement` 动态加载多个 JS 文件时，默认行为是**异步无序**的（谁先下载完谁先执行）。如果脚本间有依赖关系（例如 `app.js` 依赖 `jquery.js`），必须人工干预。

**✅ 解决方案：`async = false`**
设置 `script.async = false` 可以告知浏览器：虽然你可以并行下载这些文件，但执行时**必须按照我添加到 DOM 的顺序**依次执行。

```javascript
var scripts = ['core.js', 'plugin.js', 'app.js'];

scripts.forEach(function(src) {
    var script = document.createElement('script');
    script.src = src;
    // 关键点：设置为 false，确保按数组顺序执行 (core -> plugin -> app)
    // 如果不设置，app.js 可能在 core.js 之前执行，导致报错 "undefined"
    script.async = false; 
    document.body.appendChild(script);
});
```

---

## 2. 状态管理与 UI 同步

### 2.1 避免在非上下文区域显示操作控件

**🔴 问题现象**
- 在“患者详情”页面的历史记录列表中，出现了仅应在“备忘录”中显示的“待提醒/已完成”下拉操作框。
- 用户在查看历史记录时误操作修改了状态，导致逻辑混乱。

**✅ 最佳实践**
- **上下文感知 (Context Awareness)**：UI 组件应感知其所处的环境（Context）。
- **读写分离**：在详情页/历史记录页（Read-Only Context）仅展示状态标签（Badge）；仅在工作台/备忘录页（Actionable Context）展示可交互的控件（Select/Button）。

```javascript
// ❌ 错误：在所有地方复用相同的渲染逻辑，包含操作控件
renderList(items);

// ✅ 正确：根据上下文传入 flag 或拆分渲染逻辑
if (isMemoContext) {
    renderActionableList(items); // 带下拉框
} else {
    renderReadonlyList(items);   // 纯文本/标签
}
```

---

## 3. 代码组织与维护

### 3.1 严格遵循 HTML/CSS/JS 三分离原则

**🔴 常见误区**
- **HTML 中写样式**：为了图省事，直接在标签上写 `style="..."` 或使用 `<style>` 标签。
- **HTML 中写逻辑**：直接在 `onclick` 中写大段 JS 代码。
- **混杂导致的问题**：
  - **维护噩梦**：修改一个样式需要翻遍所有 HTML 文件。
  - **无法缓存**：内联样式和脚本无法被浏览器独立缓存，增加页面体积和流量消耗。
  - **协作冲突**：前端改样式、后端改模板时容易产生代码冲突。

**✅ 最佳实践**
- **结构 (HTML)**：只负责页面的语义和骨架。
- **表现 (CSS)**：所有样式提取到 `.css` 文件。
- **行为 (JS)**：所有逻辑提取到 `.js` 文件。

**❌ 错误写法 (Coupled)**
```html
<!-- 样式和逻辑混杂在结构中，难以阅读和维护 -->
<button style="background: red; color: white;" onclick="if(confirm('Delete?')) { fetch('/api/del')... }">
  删除
</button>
```

**✅ 正确写法 (Decoupled)**
```html
<!-- HTML: 仅包含结构和语义化类名 -->
<button class="btn btn-danger" id="deleteBtn">删除</button>
```

```css
/* CSS: 样式统一定义，方便复用和主题修改 */
.btn-danger {
  background: red;
  color: white;
}
```

```javascript
// JS: 逻辑独立，支持复杂的交互流程
document.getElementById('deleteBtn').addEventListener('click', function() {
    if(confirm('Delete?')) {
        // ... 业务逻辑
    }
});
```

**💡 经验总结**
哪怕是再小的功能，也应该坚持三分离。这不仅是代码洁癖，更是为了让代码在三个月后还能被自己和他人看懂、维护和扩展。

---
*(持续更新中...)*
