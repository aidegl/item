# HTML语义化标签使用规范

## 1. 概述

本规范旨在指导开发者在HTML文档中正确使用语义化标签，提高代码的可读性、可维护性，并增强网页的无障碍访问性。

## 2. 基本原则

### 2.1 语义化定义
- **语义化**：使用恰当的HTML标签来描述内容，使其具有明确的含义
- **结构化**：合理组织文档结构，清晰表达内容的层次关系
- **可访问性**：为辅助技术（如屏幕阅读器）提供明确的信息

### 2.2 核心原则
- 使用语义化标签替代通用容器
- 保持文档结构的逻辑性
- 为所有交互元素提供明确的标签
- 遵循HTML5标准规范

## 3. HTML5语义化标签使用规范

### 3.1 页面结构标签

#### 3.1.1 `<main>` 标签
**用途**：标识页面的主要内容区域
```html
<main id="main-content">
  <!-- 主要内容 -->
</main>
```
**使用规则**：
- 每个页面只能有一个`<main>`标签
- 用于包装页面独有的主要内容
- HTML5中`<main>`标签已隐含`role="main"`，无需显式添加

#### 3.1.2 `<section>` 标签
**用途**：对页面内容进行逻辑分组
```html
<section id="page-agent" class="page active" aria-labelledby="agent-title">
  <!-- 分组内容 -->
</section>
```
**使用规则**：
- 通常包含标题（h1-h6）
- 用于语义化地组织相关内容
- 可以嵌套使用，但需要保持逻辑结构

#### 3.1.3 `<article>` 标签
**用途**：表示独立、完整的内容单元
```html
<article class="message-wrapper" aria-labelledby="message-1-author">
  <!-- 独立内容 -->
</article>
```
**使用规则**：
- 内容应该可以独立存在和重用
- 适用于博客文章、评论、产品卡片等
- 通常包含标题和元数据

### 3.2 头部和导航标签

#### 3.2.1 `<header>` 标签
**用途**：表示页面或区块的头部信息
```html
<header class="page-header">
  <h1 id="agent-title" class="visually-hidden">沈仙子智能体助手</h1>
</header>
```
**使用规则**：
- 可以用于整个页面或特定区块
- 通常包含导航、标题、logo等
- HTML5中`<header>`标签作为页眉时已隐含`role="banner"`
- 不应与`<head>`标签混淆

#### 3.2.2 `<nav>` 标签（推荐添加）
**用途**：标识导航链接集合
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="/home">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```
**使用规则**：
- HTML5中`<nav>`标签已隐含`role="navigation"`，无需显式添加

### 3.3 内容结构标签

#### 3.3.1 `<ul>`、`<ol>`、`<li>` 标签
**用途**：表示列表内容
```html
<ul id="agent-history" class="agent-history" aria-label="对话历史记录">
  <li class="message-item">
    <!-- 列表项内容 -->
  </li>
</ul>
```
**使用规则**：
- `<ul>`：无序列表
- `<ol>`：有序列表
- `<li>`：列表项，必须包含在`<ul>`或`<ol>`内
- HTML5列表标签已隐含列表语义，大多数情况下无需添加`role="list"`和`role="listitem"`

#### 3.3.2 `<figure>` 和 `<figcaption>` 标签
**用途**：表示图片及其说明文字
```html
<figure class="message-avatar bot-avatar">
  <img src="./assets/agent1.png" alt="智能体助手头像">
  <figcaption class="visually-hidden">智能体助手</figcaption>
</figure>
```
**使用规则**：
- `<figure>`包装图片等媒体内容
- `<figcaption>`提供媒体内容的说明
- 可以是可选的，使用`class="visually-hidden"`隐藏

#### 3.3.3 `<time>` 标签
**用途**：表示日期和时间
```html
<time class="message-time" datetime="" aria-label="消息时间">现在</time>
```
**使用规则**：
- 使用`datetime`属性提供机器可读的时间格式
- 提供`aria-label`增强可访问性
- 适用于时间戳、发布日期等

### 3.4 页脚标签

#### 3.4.1 `<footer>` 标签
**用途**：表示页面或区块的底部信息
```html
<footer class="message-footer">
  <time class="message-time" datetime="" aria-label="消息时间">现在</time>
</footer>
```
**使用规则**：
- 可以用于整个页面或特定区块
- 通常包含元数据、版权信息、相关链接等

## 4. ARIA属性使用规范

### 4.1 角色属性（role）

#### 4.1.1 常用角色
- `role="main"`：主要内容区域
- `role="navigation"`：导航区域
- `role="list"`：列表容器
- `role="listitem"`：列表项
- `role="article"`：文章内容
- `role="region"`：区域容器

#### 4.1.2 使用原则
```html
<div class="agent-container" role="region" aria-label="对话区域">
  <!-- 区域内容 -->
</div>
```

### 4.2 标签属性（aria-label、aria-labelledby）

#### 4.2.1 `aria-label`
- 直接提供元素的标签文本
- 用于没有可见标签的元素
- 示例：`aria-label="对话历史记录"`

#### 4.2.2 `aria-labelledby`
- 引用其他元素的ID作为标签
- 用于有可见标题元素的情况
- 示例：`aria-labelledby="agent-title"`

### 4.3 其他常用ARIA属性

- `aria-hidden="true"`：隐藏元素对辅助技术
- `aria-expanded="false"`：折叠面板状态
- `aria-selected="true"`：选中状态
- `aria-disabled="true"`：禁用状态

## 5. 无障碍访问性规范

### 5.1 图片标签
```html
<!-- 推荐的图片标签写法 -->
<img src="./assets/agent1.png" alt="智能体助手头像">
```
- 总是提供有意义的`alt`属性
- 装饰性图片使用`alt=""`或`aria-hidden="true"`

### 5.2 链接标签
```html
<!-- 推荐的链接标签写法 -->
<a href="/contact" aria-label="联系我们页面">联系我们</a>
```

### 5.3 表单标签
```html
<!-- 推荐的表单标签写法 -->
<label for="username">用户名：</label>
<input type="text" id="username" aria-describedby="username-help">
<div id="username-help">请输入您的用户名</div>
```

## 6. 样式相关规范

### 6.1 隐藏元素类
```css
/* 屏幕阅读器可见，视觉隐藏 */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 7. 最佳实践示例

### 7.1 对话消息结构
```html
<ul class="message-list" aria-label="对话历史">
  <li class="message-item">
    <article class="message-wrapper" aria-labelledby="msg-1-author">
      <header class="message-header">
        <figure class="message-avatar">
          <img src="avatar.png" alt="用户头像">
          <figcaption id="msg-1-author">用户名</figcaption>
        </figure>
      </header>
      <div class="message-content">
        <div class="message-bubble">
          <p>消息内容</p>
        </div>
        <footer class="message-footer">
          <time datetime="2024-01-01T10:00:00">10:00</time>
        </footer>
      </div>
    </article>
  </li>
</ul>
```

## 8. 检查清单

### 8.1 结构检查
- [ ] 使用`<main>`标识主要内容区域
- [ ] 使用`<section>`对内容进行逻辑分组
- [ ] 使用`<article>`包装独立内容单元
- [ ] 使用`<header>`和`<footer>`标识区域边界

### 8.2 列表检查
- [ ] 使用`<ul>`、`<ol>`、`<li>`表示列表内容
- [ ] 移除冗余的`role="list"`和`role="listitem"`（除非为了修复特定浏览器的语义丢失）

### 8.3 媒体检查
- [ ] 使用`<figure>`和`<figcaption>`包装图片
- [ ] 为所有图片提供有意义的`alt`属性
- [ ] 使用`<time>`标签表示时间信息

### 8.4 可访问性检查
- [ ] 为所有交互元素添加适当的ARIA属性
- [ ] 使用`aria-label`或`aria-labelledby`提供标签
- [ ] 确保键盘导航支持
- [ ] 使用语义化标签替代通用容器，并精简冗余的role属性

### 8.5 代码质量检查
- [ ] 保持HTML结构的逻辑性
- [ ] 使用适当的HTML5语义化标签
- [ ] 避免过度嵌套
- [ ] 保持类名和ID的一致性
- [ ] 确保无冗余的role属性，代码简洁

## 9. 总结

遵循HTML语义化标签使用规范可以：

1. **提高可访问性**：为辅助技术提供清晰的结构信息
2. **增强SEO效果**：搜索引擎能更好理解页面内容
3. **改善代码维护性**：结构清晰，易于理解和修改
4. **提升用户体验**：更好的跨浏览器兼容性

请在开发过程中始终遵循这些规范，确保网页的质量和可用性。