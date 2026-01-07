# 明道云接口调用项目规则

## 1. 数据交互规范

### 1.1 接口调用要求
- 所有数据交互必须通过明道云API接口实现
- 必须严格遵循明道云API规范进行数据调取和操作
- 接口调用必须使用组件封装的方法，不得直接调用明道云原生接口

### 1.2 组件使用规范
项目中提供了以下四个明道云API调用组件，必须通过这些组件进行接口调用：
- `MingDaoYunAPI`：单条数据查询（getRowByIdPost接口）
- `MingDaoYunAddAPI`：新增数据（addRow接口）
- `MingDaoYunUpdateAPI`：更新数据（editRow接口）
- `MingDaoYunArrayAPI`：批量查询数据（getFilterRows接口）

### 1.3 组件调用方式
所有组件均已暴露到全局window对象，可通过以下方式调用：
```javascript
const api = new window.MingDaoYunArrayAPI();
const result = await api.getData(params);
```

## 2. Filters参数格式规范

### 2.1 强制要求
- **filters参数必须严格使用数组格式**，不得使用其他数据结构
- 数组中的每个元素必须是包含指定字段的对象

### 2.2 标准结构
```javascript
[
  {
    "controlId": "字段ID",
    "dataType": 数据类型,
    "spliceType": 拼接类型,
    "filterType": 过滤类型,
    "value": 过滤值
  }
]
```

### 2.3 字段说明
| 字段名 | 类型 | 说明 | 必填 |
|-------|------|------|------|
| controlId | String | 明道云中字段的唯一标识 | 是 |
| dataType | Number | 数据类型（如2表示文本类型） | 是 |
| spliceType | Number | 拼接类型（1表示AND，2表示OR） | 是 |
| filterType | Number | 过滤类型（如2表示等于，24表示包含） | 是 |
| value | Any | 过滤值 | 是 |

### 2.4 示例
```javascript
[
  {
    "controlId": "openid",
    "dataType": 2,
    "spliceType": 1,
    "filterType": 24,
    "value": "openid"
  },
  {
    "controlId": "del",
    "dataType": 2,
    "spliceType": 1,
    "filterType": 2,
    "value": 0
  }
]
```

## 3. 删除功能规范

### 3.1 物理删除
- **物理删除必须在明道云平台直接进行**
- 前端系统严禁执行任何物理删除操作

### 3.2 逻辑删除
- 前端系统仅允许执行逻辑删除操作
- 逻辑删除通过操作"del"字段实现
- 删除时将"del"字段值设置为1

### 3.3 过滤要求
- 所有数据查询接口调用时必须包含del字段过滤条件
- 默认过滤条件：`{"controlId": "del", "dataType": 2, "spliceType": 1, "filterType": 2, "value": 0}`

## 4. 组件修改限制

### 4.1 修改原则
- 仅在组件的基本通用调用功能出现问题时方可进行修改
- 无明确功能问题时，保持现有组件代码不变

### 4.2 允许修改的情况
- 接口调用失败且确定是组件代码问题
- 明道云API规范变更导致现有组件不兼容
- 组件存在明显的性能问题或安全漏洞

### 4.3 修改流程
1. 记录问题并分析原因
2. 提出修改方案并进行评估
3. 进行修改并测试
4. 更新相关文档

## 5. 错误处理规范

### 5.1 组件返回格式
所有组件均返回统一格式的结果：
```javascript
{
  "success": Boolean,  // 是否成功
  "data": Object,     // 返回数据
  "error_msg": String,// 错误信息
  "error_code": Number// 错误代码
}
```

### 5.2 错误处理要求
- 必须对组件返回的结果进行错误判断
- 错误信息必须友好展示给用户
- 重要错误必须记录日志

## 6. 性能与安全规范

### 6.1 超时设置
组件已内置5秒超时机制，无需额外设置

### 6.2 重试机制
组件已内置网络错误自动重试1次的机制

### 6.3 数据安全
- 不得在前端代码中暴露敏感信息
- 接口调用必须使用组件内置的安全配置

## 7. 版本控制

- 组件版本变更必须记录在案
- 版本变更必须确保向后兼容
- 重大变更必须通知所有相关开发人员

## 8. UI开发规范

### 8.1 弹窗层级管理
- **DOM 位置**：所有全屏弹窗（Modal）的 DOM 节点建议放置在 `<body>` 标签的直接子级最末尾，确保在 DOM 顺序上位于普通页面内容之后。
- **层叠上下文（Stacking Context）**：
  - 若遇到 `z-index` 设置极大但仍然被遮挡的情况，通常是因为父级元素建立了层叠上下文。
  - **解决方案**：
    1. 将受影响的弹窗 DOM 节点移至 `<body>` 的最末尾（确保在所有其他弹窗节点之后）。
    2. 给该弹窗添加 CSS 属性 `transform: translateZ(0);` 或 `will-change: transform;` 以强制建立独立的根层叠上下文，脱离原有层级限制。

### 8.2 多层弹窗处理
- 当存在多层弹窗叠加场景（如：在"详情弹窗"中点击打开"编辑弹窗"），必须保证"编辑弹窗"的 DOM 节点在 HTML 结构中位于"详情弹窗"之后，否则即使 `z-index` 更高也可能被覆盖。

## 9. 代码分离规范

### 9.1 基本原则
为保证代码可读性、可维护性和团队协作效率，项目必须严格遵循HTML、CSS、JavaScript三分离原则：

- **HTML负责页面结构**：仅包含语义化标签和内容结构
- **CSS负责样式表现**：仅包含样式定义和视觉效果
- **JavaScript负责行为逻辑**：仅包含交互功能和业务逻辑

### 9.2 HTML规范

#### 9.2.1 文件组织
- HTML文件应放置在项目根目录或相应的页面目录中
- 文件命名使用小写字母和连字符，如：`index.html`、`user-profile.html`
- 每个HTML页面应有明确的功能定位

#### 9.2.2 内容要求
```html
<!-- 正确示例：结构清晰，使用语义化标签 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>页面标题</title>
  <link rel="stylesheet" href="./css/main.css">
</head>
<body>
  <main id="main-content" role="main">
    <header class="page-header">
      <h1>页面标题</h1>
    </header>
    <section class="content-section">
      <div class="message-list" role="list">
        <article class="message-item" role="listitem">
          <div class="message-content">消息内容</div>
        </article>
      </div>
    </section>
  </main>
  <script src="./js/app.js"></script>
</body>
</html>
```

#### 9.2.3 禁止内容
- **禁止内联样式**：`style` 属性
- **禁止内联脚本**：`onclick`、`onload` 等事件处理器
- **禁止样式标签**：`<style>` 标签
- **禁止脚本标签**：`<script>` 标签（除必要的外链）

### 9.3 CSS规范

#### 9.3.1 文件组织
- CSS文件应统一放置在 `css/` 目录中
- 文件命名使用小写字母和连字符，如：`main.css`、`components.css`
- 按功能模块划分样式文件
- 主样式文件命名为 `index.css` 或 `main.css`

#### 9.3.2 样式组织
```css
/* 正确示例：样式清晰，职责单一 */

/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: #333;
}

/* 布局样式 */
.page-header {
  padding: 1rem;
  background-color: #f8f9fa;
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* 组件样式 */
.message-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.message-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
}
```

#### 9.3.3 禁止内容
- **禁止在CSS中混入JavaScript**：如 `:hover` 事件中调用JS函数
- **禁止使用 !important**：除非是覆盖第三方样式
- **避免过于具体的选择器**：保持选择器的简洁性

### 9.4 JavaScript规范

#### 9.4.1 文件组织
- JavaScript文件应统一放置在 `js/` 目录中
- 文件命名使用小写字母和连字符，如：`app.js`、`user.js`、`api.js`
- 按功能模块划分脚本文件

#### 9.4.2 代码组织
```javascript
// 正确示例：职责清晰，模块化

// 1. 工具函数模块
const utils = {
  formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN').format(date);
  },
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// 2. API调用模块
const apiService = {
  async fetchMessages(userId) {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('获取消息失败:', error);
      throw error;
    }
  }
};

// 3. UI控制模块
const uiController = {
  init() {
    this.bindEvents();
    this.loadInitialData();
  },
  
  bindEvents() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupMessageList();
      this.setupEventListeners();
    });
  },
  
  setupMessageList() {
    const messageList = document.querySelector('.message-list');
    if (!messageList) return;
    
    // 初始化消息列表逻辑
    this.renderMessages([]);
  },
  
  renderMessages(messages) {
    const messageList = document.querySelector('.message-list');
    if (!messageList) return;
    
    messageList.innerHTML = messages.map(message => `
      <li class="message-item" role="listitem">
        <article class="message-wrapper">
          <div class="message-content">${message.content}</div>
          <time class="message-time">${utils.formatDate(message.createdAt)}</time>
        </article>
      </li>
    `).join('');
  }
};

// 4. 初始化
uiController.init();
```

#### 9.4.3 禁止内容
- **禁止内联JavaScript**：HTML中的 `onclick`、`onload` 等
- **禁止在JavaScript中混入样式**：如直接修改元素样式
- **避免全局变量污染**：使用模块化或立即执行函数表达式

### 9.5 依赖管理规范

#### 9.5.1 外部资源引用
```html
<!-- 外部CSS库 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css@latest/normalize.css">

<!-- 外部JavaScript库 -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- 内部资源 -->
<link rel="stylesheet" href="./css/main.css">
<script src="./js/app.js"></script>
```

#### 9.5.2 加载顺序
- CSS文件应在 `<head>` 中加载
- JavaScript文件应在 `</body>` 前加载
- 第三方库优先于内部脚本加载

### 9.6 性能优化规范

#### 9.6.1 资源加载
- CSS和JavaScript文件应进行压缩
- 图片资源应进行优化
- 使用CDN加载常用第三方库

#### 9.6.2 缓存策略
- 为静态资源设置合理的缓存头
- 使用文件版本号控制缓存更新

### 9.7 代码检查规范

#### 9.7.1 HTML检查
- 使用W3C HTML验证器检查语法
- 确保所有图片有适当的alt属性
- 检查语义化标签的正确使用

#### 9.7.2 CSS检查
- 使用CSS Lint检查代码质量
- 检查选择器的性能影响
- 确保样式的可维护性

#### 9.7.3 JavaScript检查
- 使用ESLint检查代码规范
- 避免未定义的变量
- 检查函数和变量的命名规范

### 9.8 调试和开发规范

#### 9.8.1 开发环境
- 使用浏览器开发者工具进行调试
- 保持控制台输出整洁
- 使用断点调试代替console.log

#### 9.8.2 错误处理
- JavaScript错误应有适当的处理机制
- 网络请求应有失败重试机制
- 用户操作应有友好的错误提示

### 9.9 团队协作规范

#### 9.9.1 代码风格
- 统一使用4个空格缩进
- CSS属性按字母顺序排列
- JavaScript使用有意义的变量和函数名

#### 9.9.2 文件组织
- 保持目录结构的清晰
- 按功能模块组织相关文件
- 避免文件过大，适当拆分

## 10. 版本管理规范

### 10.1 版本号规范
- **版本格式**：vX.Y.Z
  - X（第一个数字）：项目期数
  - Y（第二个数字）：主版本号（功能更新）
  - Z（第三个数字）：修订号（bug修复）
- **起始版本**：v0.0.0

### 10.2 版本更新规则
- **主版本号（Y）**：添加重大功能或破坏性变更时增加
- **修订号（Z）**：修复bug或小改动时增加
- **期数（X）**：重大项目里程碑或架构变更时增加

### 10.3 版本发布流程
- **每次代码发布前**：必须生成新版本号
- **版本号发布**：每次对话完成后必须将当前版本号告知用户
- **版本追踪**：所有版本变更必须在版本日志中记录

### 10.4 版本显示要求
- **聊天界面**：首页智能体聊天对话区域顶部显示当前版本号
- **控制台日志**：版本变更信息必须在浏览器控制台中输出
- **用户界面**：版本信息应对用户可见但不影响主要功能

### 10.5 版本管理实现
```javascript
// 版本管理配置
const VERSION_CONFIG = {
  currentVersion: 'v0.0.1',
  releaseInfo: {
    date: '2025-01-03',
    author: '开发团队',
    description: '初始版本发布'
  }
};

// 版本显示组件
const VersionDisplay = {
  init() {
    this.displayInChatHeader();
    this.logVersionInfo();
  },
  
  displayInChatHeader() {
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
      const versionBadge = document.createElement('div');
      versionBadge.className = 'version-badge';
      versionBadge.textContent = VERSION_CONFIG.currentVersion;
      versionBadge.title = `发布时间：${VERSION_CONFIG.releaseInfo.date}`;
      chatHeader.appendChild(versionBadge);
    }
  },
  
  logVersionInfo() {
    console.log(`🚀 版本信息：${VERSION_CONFIG.currentVersion}`);
    console.log(`📅 发布时间：${VERSION_CONFIG.releaseInfo.date}`);
    console.log(`👥 发布者：${VERSION_CONFIG.releaseInfo.author}`);
    console.log(`📝 描述：${VERSION_CONFIG.releaseInfo.description}`);
  }
};

// 页面加载时初始化版本显示
document.addEventListener('DOMContentLoaded', () => {
  VersionDisplay.init();
});
```

### 10.6 版本更新通知
- **用户通知**：版本变更时在聊天界面显示通知消息
- **变更记录**：详细记录每次版本更新的内容和修复问题
- **兼容性说明**：重要版本更新时提供兼容性说明

---

**生效日期**：2025-12-29
**修订版本**：1.2
**版本管理生效日期**：2025-01-03
**当前版本**：v0.0.1
