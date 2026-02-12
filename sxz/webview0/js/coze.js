// Coze智能体对话API - 独立封装版本
// 版本: 1.0.1
// 日期: 2026-01-09
// 用途: 提供Coze智能体对话功能的独立封装，便于在不同项目中复用

class CozeChatAPI {
    constructor(options = {}) {
        this.options = {
            // 默认配置
            botId: '7593641609586819106',
            userId: '111',
            messagesContainer: '#chat-messages',
            inputElement: '#chat-input',
            sendButton: '#send-btn',
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
        // 1. 更新状态
        this.chatState.messages.push({
            role: 'user',
            content: content,
            time: this.getCurrentTime()
        });
        this.saveChatHistory();

        // 2. 触发事件
        if (this.options.onMessageSent) {
            this.options.onMessageSent(content);
        }

        // 3. 更新UI
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        const template = document.querySelector(this.options.userTemplate);

        if (!messagesContainer || !template) {
            // 无UI模式，仅更新状态
            return;
        }

        const clone = template.content.cloneNode(true);
        const bubble = clone.querySelector('.message-bubble');
        bubble.innerHTML = this.formatMessageContent(content);
        clone.querySelector('.message-time').textContent = this.getCurrentTime();

        messagesContainer.appendChild(clone);
        this.scrollToBottom();
    }

    // 添加机器人消息（加载中）
    addBotMessageLoading() {
        // 1. 更新状态
        this.chatState.streamingMessage = {
            role: 'bot',
            content: '',
            time: this.getCurrentTime()
        };

        // 2. 触发事件
        if (this.options.onStreamingStart) {
            this.options.onStreamingStart();
        }

        // 3. 更新UI
        const messagesContainer = document.querySelector(this.options.messagesContainer);
        const template = document.querySelector(this.options.botTemplate);

        if (!messagesContainer || !template) {
            // 无UI模式，仅更新状态
            return null;
        }

        // 克隆模板内容
        const clone = document.importNode(template.content, true);
        clone.querySelector('.message-time').textContent = this.getCurrentTime();
        messagesContainer.appendChild(clone);
        this.scrollToBottom();

        return clone.querySelector('.message-bubble');
    }

    // 更新流式消息内容
    updateStreamingMessage(content) {
        if (!this.chatState.streamingMessage) return;

        // 1. 更新状态
        this.chatState.streamingMessage.content = content;

        // 2. 触发事件
        if (this.options.onStreamingUpdate) {
            this.options.onStreamingUpdate(content);
        }

        // 3. 更新UI
        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.classList.contains('message-bot')) return;

        const bubble = lastMessage.querySelector('.message-bubble');
        if (bubble) {
            if (bubble.querySelector('.typing-indicator')) {
                bubble.innerHTML = this.formatMarkdownContent(content);
                bubble.classList.add('streaming');
            } else {
                bubble.innerHTML = this.formatMarkdownContent(content);
            }
        }
        this.scrollToBottom();
    }

    // 完成流式消息
    finishStreamingMessage() {
        if (!this.chatState.streamingMessage) return;

        // 1. 更新状态
        this.chatState.messages.push({ ...this.chatState.streamingMessage });
        const finalMessage = this.chatState.messages[this.chatState.messages.length - 1];

        this.chatState.streamingMessage = null;
        this.saveChatHistory();

        // 2. 触发事件
        if (this.options.onMessageReceived) {
            this.options.onMessageReceived(finalMessage);
        }

        if (this.options.onStreamingEnd) {
            this.options.onStreamingEnd();
        }

        // 3. 更新UI
        const messages = document.querySelectorAll('.message');
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || !lastMessage.classList.contains('message-bot')) return;

        const bubble = lastMessage.querySelector('.message-bubble');
        if (bubble) {
            bubble.classList.remove('streaming');
            bubble.querySelectorAll('.cursor').forEach(c => c.remove());
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
    async sendMessage(text = null, actualContent = null) {
        const input = document.querySelector(this.options.inputElement);
        const displayContent = text || input?.value.trim() || '';
        // 如果没有提供 actualContent，则使用 displayContent
        const apiContent = actualContent || displayContent;

        if (!displayContent || this.chatState.isStreaming) {
            return;
        }

        // 清空输入框
        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }

        // 添加用户消息（显示内容）
        this.addUserMessage(displayContent);

        // 显示加载状态
        const bubble = this.addBotMessageLoading();
        // if (!bubble) {
        //     // 无UI模式，继续执行
        // }

        this.chatState.isStreaming = true;
        this.updateSendButtonState();

        // 开启调试日志
        this._log('INFO', '开始发送消息', { displayContent, apiContent });

        try {
            const url = this.chatState.conversation_id
                ? `${this.options.apiUrl}?conversation_id=${this.chatState.conversation_id}`
                : this.options.apiUrl;

            const requestBody = {
                bot_id: this.options.botId,
                user_id: this.options.userId,
                stream: true,
                auto_save_history: true,
                additional_messages: [
                    {
                        role: 'user',
                        content: apiContent, // 使用实际发送的内容
                        content_type: 'text'
                    }
                ]
            };

            this._log('API', '发起请求', { url, body: requestBody });

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer pat_KNA17LR4GzTvkBciLlSs0nfW5jDavQMQ0uXO0GpOWNIX0Z3q7lZJ0fe3xwitGtl3'
            };

            this._log('API', '请求头', headers);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            this._log('API', '收到响应状态', response.status);

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let streamingContent = '';
            let currentEvent = '';
            let currentData = '';
            let buffer = '';

            while (true) {
                const { value, done: doneReading } = await reader.read();
                if (doneReading) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                this._log('DEBUG', '收到原始数据块', chunk);

                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    this._log('DEBUG', '处理行', line);

                    if (line.startsWith('event:')) {
                        currentEvent = line.slice(6).trim();
                    } else if (line.startsWith('data:')) {
                        currentData = line.slice(5).trim();
                    } else if (line === '') {
                        // 空行，触发事件处理
                        if (currentEvent && currentData) {
                            try {
                                const data = JSON.parse(currentData);

                                // 更新conversation_id
                                if (data.conversation_id) {
                                    this.chatState.conversation_id = data.conversation_id;
                                }

                                // 处理消息增量
                                if (currentEvent === 'conversation.message.delta') {
                                    const content = data.content || '';
                                    if (content) {
                                        streamingContent += content;
                                        this.updateStreamingMessage(streamingContent);
                                    }
                                } else if (currentEvent === 'conversation.message.completed') {
                                    // 消息完成
                                    this._log('STREAM', '消息接收完成', data);
                                } else {
                                    // 其他事件
                                    // this._log('STREAM', '收到事件', currentEvent);
                                }
                            } catch (e) {
                                this._log('WARN', '解析事件失败', { event: currentEvent, error: e.message });
                            }
                            // 重置状态
                            // currentEvent = ''; // SSE规范中event类型可能会被复用，但Coze API通常每次都会发送
                            // currentData = '';
                        }
                    }
                }
            }

            this._log('INFO', '流式接收完成', { fullLength: streamingContent.length });

            // 完成流式消息
            this.finishStreamingMessage();

        } catch (e) {
            this._log('ERROR', '请求失败', e.message);
            console.error('发送消息失败:', e);
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

    // 内部日志记录
    _log(type, message, detail = null) {
        const time = new Date().toLocaleTimeString();

        // 控制台输出
        console.log(`[${type}] ${time} - ${message}`, detail || '');
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