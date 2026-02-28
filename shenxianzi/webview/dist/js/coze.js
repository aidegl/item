// Coze智能体对话API - 独立封装版本
// 版本: 1.0.0
// 日期: 2026-01-09
// 用途: 提供Coze智能体对话功能的独立封装，便于在不同项目中复用

class CozeChatAPI {
    constructor(options = {}) {
        this.options = {
            // 默认配置
            botId: '7584776894743085106',
            userId: '111',
            messagesContainer: '#chat-messages',
            inputElement: '#chat-input',
            sendButton: '#send-btn',
            debugContainer: '#agent-debug',
            userTemplate: '#message-template-user',
            botTemplate: '#message-template-bot',
            botStreamingTemplate: '#message-template-bot-streaming',
            apiUrl: 'https://api.coze.cn/v3/chat',
            // 事件回调
            onMessageSent: null,
            onMessageReceived: null,
            onStreamingStart: null,
            onStreamingUpdate: null,
            onStreamingEnd: null,
            onError: null,
            ...options
        };

        // 聊天状态管理
        this.chatState = {
            conversation_id: '',
            isStreaming: false,
            messages: [],
            streamingMessage: null
        };

        // 初始化
        this.init();
    }

    // 初始化API
    init() {
        // 加载聊天记录
        this.loadChatHistory();
        // 绑定事件
        this.bindEvents();
        // 更新发送按钮状态
        this.updateSendButtonState();
    }

    // 绑定事件
    bindEvents() {
        const input = document.querySelector(this.options.inputElement);
        const sendBtn = document.querySelector(this.options.sendButton);

        if (input) {
            // 自动调整输入框高度
            input.addEventListener('input', (e) => this.autoResize(e.target));
            // 处理键盘事件
            input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        if (sendBtn) {
            // 发送按钮点击事件
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
    }

    // 自动调整输入框高度
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        this.updateSendButtonState();
    }

    // 处理键盘事件
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    // 更新发送按钮状态
    updateSendButtonState() {
        const input = document.querySelector(this.options.inputElement);
        const sendBtn = document.querySelector(this.options.sendButton);

        if (!input || !sendBtn) return;

        const isEmpty = !input.value.trim();
        sendBtn.disabled = isEmpty || this.chatState.isStreaming;
        sendBtn.style.opacity = (isEmpty || this.chatState.isStreaming) ? '0.5' : '1';
    }

    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 格式化消息内容（支持换行）
    formatMessageContent(content) {
        if (!content) return '';
        return content.split('\n').map(line => `<p>${this.escapeHtml(line)}</p>`).join('');
    }

    // 格式化Markdown内容（智能体专用）
    formatMarkdownContent(content) {
        if (!content) return '';
        try {
            if (typeof marked !== 'undefined' && marked.parse) {
                return marked.parse(content);
            } else {
                console.warn('Marked library not found, using plain text format');
                return this.formatMessageContent(content);
            }
        } catch (e) {
            console.error('Markdown渲染失败:', e);
            return this.formatMessageContent(content);
        }
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 添加用户消息
    addUserMessage(content) {
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        const template = document.querySelector(this.options.userTemplate);

        if (!messagesContainer || !template) {
            console.error('消息容器或模板未找到');
            return;
        }

        const clone = template.content.cloneNode(true);
        const bubble = clone.querySelector('.message-bubble');
        bubble.innerHTML = this.formatMessageContent(content);
        clone.querySelector('.message-time').textContent = this.getCurrentTime();

        messagesContainer.appendChild(clone);
        this.scrollToBottom();

        this.chatState.messages.push({
            role: 'user',
            content: content,
            time: this.getCurrentTime()
        });

        this.saveChatHistory();

        // 触发消息发送事件
        if (this.options.onMessageSent) {
            this.options.onMessageSent(content);
        }
    }

    // 添加机器人消息（加载中）
    addBotMessageLoading() {
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        const template = document.querySelector(this.options.botTemplate);

        if (!messagesContainer || !template) {
            console.error('消息容器或模板未找到');
            return null;
        }

        // 克隆模板内容
        const clone = document.importNode(template.content, true);
        clone.querySelector('.message-time').textContent = this.getCurrentTime();
        messagesContainer.appendChild(clone);
        this.scrollToBottom();

        this.chatState.streamingMessage = {
            role: 'bot',
            content: '',
            time: this.getCurrentTime()
        };

        // 触发流式传输开始事件
        if (this.options.onStreamingStart) {
            this.options.onStreamingStart();
        }

        return clone.querySelector('.message-bubble');
    }

    // 更新流式消息内容
    updateStreamingMessage(content) {
        if (!this.chatState.streamingMessage) return;

        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.classList.contains('message-bot')) return;

        const bubble = lastMessage.querySelector('.message-bubble');
        if (bubble.querySelector('.typing-indicator')) {
            bubble.innerHTML = this.formatMarkdownContent(content);
            bubble.classList.add('streaming');
        } else {
            bubble.innerHTML = this.formatMarkdownContent(content);
        }

        this.chatState.streamingMessage.content = content;
        this.scrollToBottom();

        // 触发流式传输更新事件
        if (this.options.onStreamingUpdate) {
            this.options.onStreamingUpdate(content);
        }
    }

    // 完成流式消息
    finishStreamingMessage() {
        if (!this.chatState.streamingMessage) return;

        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.classList.contains('message-bot')) return;

        const bubble = lastMessage.querySelector('.message-bubble');
        bubble.classList.remove('streaming');
        bubble.querySelectorAll('.cursor').forEach(c => c.remove());

        this.chatState.messages.push({ ...this.chatState.streamingMessage });
        this.chatState.streamingMessage = null;
        this.saveChatHistory();

        // 触发消息接收事件
        if (this.options.onMessageReceived) {
            this.options.onMessageReceived(this.chatState.messages[this.chatState.messages.length - 1]);
        }

        // 触发流式传输结束事件
        if (this.options.onStreamingEnd) {
            this.options.onStreamingEnd();
        }
    }

    // 滚动到底部
    scrollToBottom() {
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // 保存聊天记录
    saveChatHistory() {
        try {
            localStorage.setItem('coze_chat_history', JSON.stringify({
                conversation_id: this.chatState.conversation_id,
                messages: this.chatState.messages
            }));
        } catch (e) {
            console.error('聊天记录保存失败:', e);
        }
    }

    // 加载聊天记录
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('coze_chat_history');
            if (saved) {
                const data = JSON.parse(saved);
                this.chatState.conversation_id = data.conversation_id || '';
                this.chatState.messages = data.messages || [];
                this.renderChatHistory();
            }
        } catch (e) {
            console.error('聊天记录加载失败:', e);
        }
    }

    // 渲染聊天记录
    renderChatHistory() {
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        if (!messagesContainer) return;

        // 清除现有消息（保留欢迎消息以外的所有消息）
        const welcomeMsg = messagesContainer.querySelector('.message-bot');
        const messages = messagesContainer.querySelectorAll('.message:not(.message-bot)');
        messages.forEach(msg => msg.remove());

        // 渲染历史消息
        this.chatState.messages.forEach(msg => {
            if (msg.role === 'user') {
                this.addUserMessage(msg.content);
            } else if (msg.role === 'bot') {
                const bubble = this.addBotMessageLoading();
                if (bubble) {
                    bubble.innerHTML = this.formatMarkdownContent(msg.content);
                    bubble.querySelector('.typing-indicator')?.remove();
                    this.chatState.streamingMessage = null;
                }
            }
        });
    }

    // 发送消息
    async sendMessage() {
        const input = document.querySelector(this.options.inputElement);
        const content = input?.value.trim() || '';

        if (!content || this.chatState.isStreaming) {
            return;
        }

        // 清空输入框
        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }

        // 添加用户消息
        this.addUserMessage(content);

        // 显示加载状态
        const bubble = this.addBotMessageLoading();
        if (!bubble) {
            console.error('UI错误: 消息气泡模板未找到');
            return;
        }

        this.chatState.isStreaming = true;
        this.updateSendButtonState();

        try {
            const url = this.chatState.conversation_id
                ? `${this.options.apiUrl}?conversation_id=${this.chatState.conversation_id}`
                : this.options.apiUrl;

            const requestBody = {
                bot_id: this.options.botId,
                user_id: this.options.userId,
                query: content
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 注意：在实际使用时需要添加授权头
                    // 'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let responseText = '';

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    responseText += chunk;

                    // 更新流式消息
                    this.updateStreamingMessage(responseText);
                }
            }

            // 解析完整响应
            const data = JSON.parse(responseText);
            if (data.conversation_id) {
                this.chatState.conversation_id = data.conversation_id;
            }

            // 完成流式消息
            this.finishStreamingMessage();

        } catch (e) {
            console.error('发送消息失败:', e);

            // 更新错误消息
            const messages = document.querySelectorAll('.message');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.classList.contains('message-bot')) {
                const bubble = lastMessage.querySelector('.message-bubble');
                if (bubble) {
                    bubble.innerHTML = `<p>发送消息失败: ${e.message}</p>`;
                    bubble.querySelector('.typing-indicator')?.remove();
                }
            }

            // 重置状态
            this.chatState.isStreaming = false;
            this.chatState.streamingMessage = null;

            // 触发错误事件
            if (this.options.onError) {
                this.options.onError(e);
            }
        } finally {
            this.chatState.isStreaming = false;
            this.updateSendButtonState();
        }
    }

    // 切换调试日志显示
    toggleDebug() {
        const debugEl = document.querySelector(this.options.debugContainer);
        if (debugEl) {
            debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
        }
    }

    // 清除聊天记录
    clearChatHistory() {
        this.chatState = {
            conversation_id: '',
            isStreaming: false,
            messages: [],
            streamingMessage: null
        };
        localStorage.removeItem('coze_chat_history');

        // 清除DOM中的消息
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        if (messagesContainer) {
            const welcomeMsg = messagesContainer.querySelector('.message-bot');
            const messages = messagesContainer.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
            if (welcomeMsg) {
                messagesContainer.appendChild(welcomeMsg);
            }
        }
    }

    // 获取当前聊天状态
    getChatState() {
        return { ...this.chatState };
    }

    // 获取聊天记录
    getChatHistory() {
        return [...this.chatState.messages];
    }
}

// 导出API
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CozeChatAPI;
} else if (typeof window !== 'undefined') {
    window.CozeChatAPI = CozeChatAPI;
}
