# Coze智能体对话API使用说明书

## 1. 功能介绍

Coze智能体对话API是一个独立封装的JavaScript库，提供与Coze智能体进行实时对话的功能。该库具有以下特点：

- ✅ 完整的聊天功能，支持消息发送和接收
- ✅ 流式消息更新，提供更好的用户体验
- ✅ 本地聊天记录存储（使用localStorage）
- ✅ 自定义UI元素选择器
- ✅ 事件回调机制
- ✅ 支持Markdown渲染（需要marked.js库）
- ✅ 响应式输入框

## 2. 安装和使用方法

### 2.1 基本使用

1. 引入必要的依赖库（如果需要Markdown支持）：

```html
<!-- 可选：Markdown渲染库 -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

2. 引入CozeChatAPI库：

```html
<script src="path/to/coze.js"></script>
```

3. 创建基本的HTML结构：

```html
<div id="chat-messages">
  <!-- 欢迎消息 -->
  <div class="message message-bot">
    <div class="message-avatar bot-avatar">
      <img src="./assets/agent1.png" alt="智能体">
    </div>
    <div class="message-content-wrapper">
      <div class="message-bubble bot-bubble">
        <p>你好！我是Coze智能体助手，很高兴为你服务。</p>
        <p>有什么我可以帮助你的吗？</p>
      </div>
      <div class="message-time">现在</div>
    </div>
  </div>

  <!-- 消息模板 -->
  <template id="message-template-user">
    <div class="message message-user">
      <div class="message-content-wrapper">
        <div class="message-bubble user-bubble"></div>
        <div class="message-time"></div>
      </div>
      <div class="message-avatar user-avatar">
        <img src="./assets/morentouxiang.webp" alt="用户">
      </div>
    </div>
  </template>

  <template id="message-template-bot">
    <div class="message message-bot">
      <div class="message-avatar bot-avatar">
        <img src="./assets/agent1.png" alt="智能体">
      </div>
      <div class="message-content-wrapper">
        <div class="message-bubble bot-bubble">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="message-time"></div>
      </div>
    </div>
  </template>
</div>

<!-- 输入区域 -->
<div class="chat-input-area">
  <div class="input-wrapper">
    <textarea id="chat-input" class="chat-input" placeholder="输入消息..." rows="1"></textarea>
    <button class="send-btn" id="send-btn">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
      </svg>
    </button>
  </div>
</div>
```

4. 初始化CozeChatAPI：

```html
<script>
  // 创建CozeChatAPI实例
  const cozeChat = new CozeChatAPI({
    // 配置选项（可选）
    botId: '7584776894743085106',
    userId: 'your_user_id',
    // 事件回调
    onMessageSent: (content) => {
      console.log('消息已发送:', content);
    },
    onMessageReceived: (message) => {
      console.log('消息已接收:', message);
    }
  });
</script>
```

## 3. 配置选项

创建CozeChatAPI实例时可以传入以下配置选项：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `botId` | String | `'7584776894743085106'` | Coze智能体的Bot ID |
| `userId` | String | `'111'` | 用户ID |
| `messagesContainer` | String | `'#chat-messages'` | 消息容器选择器 |
| `inputElement` | String | `'#chat-input'` | 输入框选择器 |
| `sendButton` | String | `'#send-btn'` | 发送按钮选择器 |
| `userTemplate` | String | `'#message-template-user'` | 用户消息模板选择器 |
| `botTemplate` | String | `'#message-template-bot'` | 机器人消息模板选择器 |
| `botStreamingTemplate` | String | `'#message-template-bot-streaming'` | 机器人流式消息模板选择器 |
| `apiUrl` | String | `'https://api.coze.cn/v3/chat'` | Coze API地址 |

## 4. 事件回调

可以通过配置选项设置以下事件回调：

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `onMessageSent` | `content` (String) | 消息发送成功时触发 |
| `onMessageReceived` | `message` (Object) | 消息接收成功时触发 |
| `onStreamingStart` | 无 | 流式消息开始时触发 |
| `onStreamingUpdate` | `content` (String) | 流式消息更新时触发 |
| `onStreamingEnd` | 无 | 流式消息结束时触发 |
| `onError` | `error` (Error) | 发生错误时触发 |

## 5. API方法

### 5.1 初始化和配置

#### `constructor(options)`
创建CozeChatAPI实例

```javascript
const cozeChat = new CozeChatAPI(options);
```

#### `init()`
初始化API，自动加载聊天记录并绑定事件

#### `bindEvents()`
绑定事件处理程序

### 5.2 消息操作

#### `sendMessage()`
发送当前输入框中的消息

```javascript
cozeChat.sendMessage();
```

#### `addUserMessage(content)`
添加用户消息到聊天窗口

```javascript
cozeChat.addUserMessage('你好，智能体！');
```

#### `addBotMessageLoading()`
添加机器人加载消息

#### `updateStreamingMessage(content)`
更新流式消息内容

#### `finishStreamingMessage()`
完成流式消息更新

### 5.3 聊天记录管理

#### `loadChatHistory()`
从localStorage加载聊天记录

#### `saveChatHistory()`
保存聊天记录到localStorage

#### `renderChatHistory()`
渲染聊天记录

#### `clearChatHistory()`
清除聊天记录

```javascript
cozeChat.clearChatHistory();
```

### 5.4 状态和工具方法

#### `getChatState()`
获取当前聊天状态

```javascript
const state = cozeChat.getChatState();
console.log(state.isStreaming); // 是否正在流式传输
console.log(state.messages); // 消息列表
```

#### `getChatHistory()`
获取聊天记录

```javascript
const history = cozeChat.getChatHistory();
```

#### `scrollToBottom()`
滚动到聊天窗口底部

#### `updateSendButtonState()`
更新发送按钮状态

#### `autoResize(textarea)`
自动调整输入框高度

#### `handleKeyDown(event)`
处理键盘事件

## 6. 完整示例

以下是一个完整的使用示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coze智能体对话示例</title>
  <!-- 引入Markdown渲染库 -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <!-- 引入CozeChatAPI -->
  <script src="./js/coze.js"></script>
  <!-- 基本样式 -->
  <style>
    /* 基本聊天样式 */
    .chat-container {
      max-width: 800px;
      margin: 0 auto;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .message {
      display: flex;
      margin-bottom: 15px;
    }

    .message-bot {
      flex-direction: row;
    }

    .message-user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 10px;
    }

    .message-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .message-content-wrapper {
      flex: 1;
      max-width: 70%;
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      line-height: 1.4;
    }

    .bot-bubble {
      background-color: #e8f0fe;
      color: #333;
      border-bottom-left-radius: 6px;
    }

    .user-bubble {
      background-color: #007aff;
      color: white;
      border-bottom-right-radius: 6px;
    }

    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      text-align: right;
    }

    /* 输入区域样式 */
    .chat-input-area {
      padding: 10px;
      background-color: white;
      border-top: 1px solid #eee;
    }

    .input-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }

    #chat-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 15px;
      font-size: 14px;
      resize: none;
      min-height: 40px;
      max-height: 120px;
    }

    #send-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background-color: #007aff;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* 加载指示器 */
    .typing-indicator {
      display: flex;
      gap: 4px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #999;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div id="chat-messages">
      <!-- 欢迎消息 -->
      <div class="message message-bot">
        <div class="message-avatar bot-avatar">
          <img src="https://picsum.photos/id/237/40/40" alt="智能体">
        </div>
        <div class="message-content-wrapper">
          <div class="message-bubble bot-bubble">
            <p>你好！我是Coze智能体助手，很高兴为你服务。</p>
            <p>有什么我可以帮助你的吗？</p>
          </div>
          <div class="message-time">现在</div>
        </div>
      </div>

      <!-- 消息模板 -->
      <template id="message-template-user">
        <div class="message message-user">
          <div class="message-content-wrapper">
            <div class="message-bubble user-bubble"></div>
            <div class="message-time"></div>
          </div>
          <div class="message-avatar user-avatar">
            <img src="https://picsum.photos/id/1005/40/40" alt="用户">
          </div>
        </div>
      </template>

      <template id="message-template-bot">
        <div class="message message-bot">
          <div class="message-avatar bot-avatar">
            <img src="https://picsum.photos/id/237/40/40" alt="智能体">
          </div>
          <div class="message-content-wrapper">
            <div class="message-bubble bot-bubble">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="message-time"></div>
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input-area">
      <div class="input-wrapper">
        <textarea id="chat-input" class="chat-input" placeholder="输入消息..." rows="1"></textarea>
        <button class="send-btn" id="send-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <script>
    // 初始化CozeChatAPI
    const cozeChat = new CozeChatAPI({
      botId: '7584776894743085106',
      userId: 'example_user_id',
      // 事件回调
      onMessageSent: (content) => {
        console.log('消息已发送:', content);
      },
      onMessageReceived: (message) => {
        console.log('消息已接收:', message);
      },
      onError: (error) => {
        console.error('发生错误:', error);
      }
    });
  </script>
</body>
</html>
```

## 7. 注意事项

1. **API密钥配置**：在实际使用中，需要在`sendMessage`方法中添加正确的授权头：

```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY' // 添加这一行
  },
  body: JSON.stringify(requestBody)
});
```

2. **Markdown支持**：如果需要Markdown渲染功能，请确保引入了marked.js库。

3. **浏览器兼容性**：该库使用了现代JavaScript特性（如async/await、class），请确保目标浏览器支持这些特性，或使用Babel进行转译。

4. **UI样式**：需要自行提供CSS样式以匹配HTML结构和选择器。

5. **CORS问题**：在使用时可能会遇到跨域问题，请确保Coze API已配置正确的CORS策略。

## 8. 更新日志

- **v1.0.1** (2026-01-09):
  - 修复 `Request parameter error` (Code 4000) 错误，修正请求体格式
  - 增加 `buffer` 缓冲机制，解决流式数据分包导致的解析错误
  - 增强 `sendMessage` 方法，支持详细的流循环日志打印
  - 优化调试面板功能
- **v1.0.0** (2026-01-09):
  - 首次发布
  - 完整的聊天功能
  - 流式消息支持
  - 本地聊天记录存储
  - 事件回调机制

## 9. 技术支持

如果在使用过程中遇到问题，请检查以下几点：

1. 确保所有依赖库都已正确引入
2. 检查HTML结构是否符合要求
3. 查看浏览器控制台是否有错误信息
4. 确认API配置是否正确

---

## 10. 开发与调试经验总结 (2026-01-09)

在接入 Coze API V3 过程中，我们总结了以下关键调试经验，供后续维护参考：

### 10.1 常见错误与解决方案

#### 1. `Request parameter error (Code 4000)`
- **现象**：API 返回 200 OK，但流式响应中包含 `status: "failed"` 和错误码 4000。
- **原因**：请求体参数错误。旧版 API 使用 `query` 字段，而 V3 Chat 接口必须使用 `additional_messages` 数组。
- **解决**：
  ```javascript
  // ❌ 错误写法
  const requestBody = {
      query: content, // V3 不支持
      stream: true
  };

  // ✅ 正确写法
  const requestBody = {
      additional_messages: [
          {
              role: 'user',
              content: content,
              content_type: 'text'
          }
      ],
      stream: true
  };
  ```

#### 2. 流式响应解析失败 (`{fullLength: 0}` 或 JSON Parse Error)
- **现象**：收到数据但无法解析，或者日志显示数据长度为 0。
- **原因**：
  1.  **分包问题**：网络传输时，一个完整的 JSON 行可能被切分到两个 chunk 中（例如 `data: {"con` 和 `tent": "hi"}`），直接按行 split 会导致 JSON 解析失败。
  2.  **事件混淆**：未正确区分 `event:` 和 `data:` 行。
- **解决**：引入 `buffer` 变量。
  ```javascript
  let buffer = '';
  while (true) {
      const { value, done } = await reader.read();
      // ... 解码 ...
      buffer += chunk; // 先追加到缓冲区
      const lines = buffer.split('\n'); // 按行分割
      buffer = lines.pop() || ''; // 将最后一行（可能不完整）留到下一次循环
      
      for (const line of lines) {
          // 处理完整的行...
      }
  }
  ```

### 10.2 调试技巧

#### 1. 原始流数据打印
在调试流式接口时，不要只打印解析后的对象。**务必打印原始 chunk 和 line**：
```javascript
this._log('DEBUG', '收到原始数据块', chunk);
this._log('DEBUG', '处理行', line);
```
通过观察原始数据，我们快速发现了 API 返回的错误信息（如 `Request parameter error`），而这些信息在前端应用层往往容易被忽略。

---

**免责声明**：本库仅用于演示和学习目的，请在实际项目中遵守Coze平台的使用条款和API限制。
