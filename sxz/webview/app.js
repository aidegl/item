// ==================== 应用状态管理 ====================
const AppState = {
    currentTab: 'ai',
    currentView: 'main',
    currentPatientId: null,
    currentConsultationId: null,
    onboardingStep: 1,
    patients: [],
    consultations: [],
    reminders: [],
    chatMessages: [],
    globalSettings: null,
    aiQuickQuestionsHidden: false,
    patientSearchTerm: '',

    init() {
        this.loadFromStorage();
        this.chatMessages = [];
        this.saveToStorage();
        this.checkOnboarding();
    },

    loadFromStorage() {
        const stored = localStorage.getItem('appData');
        if (stored) {
            const data = JSON.parse(stored);
            this.patients = data.patients || [];
            this.consultations = data.consultations || [];
            this.reminders = data.reminders || [];
            this.chatMessages = [];
        } else {
            this.initMockData();
        }
    },

    saveToStorage() {
        const data = {
            patients: this.patients,
            consultations: this.consultations,
            reminders: this.reminders
        };
        localStorage.setItem('appData', JSON.stringify(data));
    },

    initMockData() {
        // 初始化一些示例数据
        this.patients = [
            {
                id: '1',
                name: '张三',
                age: 65,
                gender: '男',
                phone: '138****1234',
                medicalHistory: '高血压、糖尿病',
                allergies: '青霉素',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                name: '李四',
                age: 58,
                gender: '女',
                phone: '139****5678',
                medicalHistory: '无',
                allergies: '无',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.reminders = [
            {
                id: '1',
                title: '张三陪诊',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                time: '09:00',
                type: 'appointment',
                patientId: '1',
                completed: false
            },
            {
                id: '2',
                title: '准备病历资料',
                date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                time: '14:00',
                type: 'task',
                completed: false
            }
        ];

        this.saveToStorage();
    },

    checkOnboarding() {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            showOnboarding();
        }
    }
};

// ==================== 新手引导功能 ====================
function showOnboarding() {
    const modal = document.getElementById('onboarding');
    modal.classList.remove('hidden');
    AppState.onboardingStep = 1;
    updateOnboardingStep();
}

function closeOnboarding() {
    const modal = document.getElementById('onboarding');
    modal.classList.add('hidden');
    localStorage.setItem('hasSeenOnboarding', 'true');
}

function nextOnboardingStep() {
    if (AppState.onboardingStep < 4) {
        AppState.onboardingStep++;
        updateOnboardingStep();
    } else {
        closeOnboarding();
    }
}

function updateOnboardingStep() {
    const steps = document.querySelectorAll('.onboarding-step');
    const indicators = document.querySelectorAll('.indicator');
    const button = document.querySelector('.onboarding-footer .btn-primary');

    steps.forEach((step, index) => {
        if (index + 1 === AppState.onboardingStep) {
            step.classList.remove('hidden');
        } else {
            step.classList.add('hidden');
        }
    });

    indicators.forEach((indicator, index) => {
        if (index + 1 <= AppState.onboardingStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });

    if (AppState.onboardingStep === 4) {
        button.textContent = '开始使用';
    } else {
        button.textContent = '下一步';
    }
}

// ==================== 导航功能 ====================
function switchTab(tab) {
    AppState.currentTab = tab;
    AppState.currentView = 'main';
    if (tab === 'ai') {
        AppState.aiQuickQuestionsHidden = false;
    }

    // 更新导航按钮状态
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 渲染对应页面
    renderCurrentPage();
}

function renderCurrentPage() {
    const content = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    if (!content) {
        console.warn('未找到 main-content 容器');
        return;
    }

    // 每次切换页面时，先滚动到顶部，避免旧页面的滚动位置影响新页面布局
    window.scrollTo(0, 0);

    document.body.classList.toggle('ai-tab', AppState.currentTab === 'ai');

    // 控制底部导航栏显示/隐藏：只有四个主页面显示
    if (bottomNav) {
        const isMainPage =
            (AppState.currentTab === 'ai') ||
            (AppState.currentTab === 'patients' && AppState.currentView === 'main') ||
            (AppState.currentTab === 'records') ||
            (AppState.currentTab === 'settings');

        bottomNav.style.display = isMainPage ? 'flex' : 'none';
    }

    switch (AppState.currentTab) {
        case 'ai':
            renderAIAssistant(content);
            break;
        case 'patients':
            if (AppState.currentView === 'main') {
                renderPatientList(content);
            } else if (AppState.currentView === 'add' || AppState.currentView === 'edit') {
                renderAddPatient(content);
            } else if (AppState.currentView === 'detail') {
                renderPatientDetail(content);
            } else if (AppState.currentView === 'consultation') {
                renderConsultationFlow(content);
            }
            break;
        case 'records':
            renderRecordsList(content);
            break;
        case 'settings':
            renderSettings(content);
            break;
    }
}

// ==================== AI助手页面 ====================
function renderAIAssistant(container) {
    const quickQuestions = AppState.aiQuickQuestionsHidden
        ? ''
        : `
            <div class="card mb-2">
                <div class="card-header">
                    <h3 class="card-title">常见问题</h3>
                </div>
                <div class="quick-questions">
                    <button class="quick-question-btn" onclick="askQuestion('如何准备就诊材料？')">
                        📋 如何准备就诊材料？
                    </button>
                    <button class="quick-question-btn" onclick="askQuestion('陪诊时需要注意什么？')">
                        ⚠️ 陪诊时需要注意什么？
                    </button>
                    <button class="quick-question-btn" onclick="askQuestion('如何与医生沟通？')">
                        💬 如何与医生沟通？
                    </button>
                    <button class="quick-question-btn" onclick="askQuestion('如何记录医嘱？')">
                        📝 如何记录医嘱？
                    </button>
                </div>
            </div>
        `;

    container.innerHTML = `
        <!-- 固定顶部上传按钮 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px;">
            <input type="file" id="imageUploadInput" accept="image/*,.pdf" class="hidden" onchange="handleImageUpload(this)">
            <button class="upload-btn" onclick="document.getElementById('imageUploadInput').click()" style="display: flex; align-items: center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-right: 8px;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>上传文件进行分析</span>
            </button>
        </div>

        <div class="ai-chat-content" style="padding: 12px 16px 0 16px;">
            ${quickQuestions}
            
            ${renderChatMessages()}
        </div>
        
        <!-- 输入框 -->
        <div class="chat-input-container">
            <textarea id="chatInput" class="input" placeholder="输入您的问题..." onkeypress="handleChatKeyPress(event)" oninput="autoResizeTextarea(this)" style="resize: none; min-height: 40px; max-height: 120px;"></textarea>
            <button class="btn btn-primary btn-icon" onclick="sendMessage()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </div>
    `;

    setTimeout(() => {
        const inputContainer = document.querySelector('.chat-input-container');
        const bottomNav = document.querySelector('.bottom-nav');
        const content = document.querySelector('.ai-chat-content');

        const bottomNavHeight = bottomNav
            ? bottomNav.getBoundingClientRect().height
            : 0;

        if (inputContainer) {
            inputContainer.style.bottom = `${bottomNavHeight}px`;
        }

        if (content && inputContainer) {
            const inputHeight = inputContainer.getBoundingClientRect().height;
            content.style.paddingBottom = `${bottomNavHeight + inputHeight + 24}px`;
        }

        // 智能滚动：只有当内容高度超过可视区域时才滚动到底部
        // 否则滚动到顶部，确保能看到顶部的上传按钮
        const availableHeight = window.innerHeight - bottomNavHeight - (inputContainer ? inputContainer.getBoundingClientRect().height : 0);
        const mainContent = document.getElementById('main-content');
        // 使用 main-content 的高度来计算，因为它包含了 header 和 content
        const actualContentHeight = (mainContent ? mainContent.scrollHeight : content.scrollHeight) - parseFloat(content.style.paddingBottom || '0');

        // 只有在有聊天记录且内容超过可视区域时才滚动到底部
        if (AppState.chatMessages.length > 0 && actualContentHeight > availableHeight) {
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            window.scrollTo(0, 0);
        }
    }, 100);
}

function renderChatMessages() {
    if (AppState.chatMessages.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <p class="empty-text">开始对话，我会尽力帮助您</p>
            </div>
        `;
    }

    return AppState.chatMessages.map(msg => {
        let contentHtml = msg.content;

        // 处理图片消息
        if (msg.type === 'image') {
            contentHtml = `<img src="${msg.content}" style="max-width: 100%; border-radius: 8px; display: block;">`;
        }
        else if (msg.role === 'system') {
            contentHtml = `<div style="font-size: 12px; color: var(--text-secondary); text-align: center; white-space: pre-wrap;">${escapeHtml(msg.content)}</div>`;
        }
        // 如果是机器人/助手消息，尝试使用 Marked 渲染 Markdown
        else if ((msg.role === 'assistant' || msg.role === 'bot') && typeof marked !== 'undefined') {
            try {
                contentHtml = marked.parse(msg.content);
            } catch (e) {
                console.error('Markdown 渲染失败:', e);
                // 降级处理：简单的换行转换
                contentHtml = msg.content.replace(/\n/g, '<br>');
            }
        } else {
            // 用户消息，进行 HTML 转义防止 XSS，并处理换行
            contentHtml = escapeHtml(msg.content).replace(/\n/g, '<br>');
        }

        return `
        <div class="chat-message ${msg.role}" ${msg.role === 'system' ? 'style="background: transparent; box-shadow: none; padding: 0;"' : ''}>
            ${msg.role !== 'system' ? `
            <div class="message-avatar">
                ${msg.role === 'user' ? '👤' : '🤖'}
            </div>
            ` : ''}
            <div class="message-content" ${msg.role === 'system' ? 'style="background: transparent; padding: 4px;"' : ''}>
                <div class="message-text">${contentHtml}</div>
                ${msg.role !== 'system' ? `<div class="message-time">${formatTime(msg.timestamp)}</div>` : ''}
            </div>
        </div>
    `}).join('');
}

function handleImageUpload(input) {
    // 检查登录状态
    if (!checkLoginAndProceed()) return;

    const file = input.files[0];
    if (!file) return;

    // 显示上传中状态
    const loadingId = 'loading-' + Date.now();
    AppState.chatMessages.push({
        role: 'user',
        type: 'text', // 暂时用 text，等上传成功后如果是图片则更新为 image
        content: `📤 正在上传文件: ${file.name}...`,
        id: loadingId,
        timestamp: new Date().toISOString()
    });
    AppState.aiQuickQuestionsHidden = true;
    renderCurrentPage();

    // 构造 FormData
    const formData = new FormData();
    formData.append('file', file);

    // 发送请求
    fetch('https://100000whys.cn/api/tmp.php', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            // 检查是否为 JSON 响应
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                // 如果不是 JSON，尝试读取文本并抛出错误或尝试解析
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        throw new Error('Server response not valid JSON: ' + text.substring(0, 50));
                    }
                });
            }
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            const fileUrl = data.url || data.link;
            if (!fileUrl) {
                throw new Error('No URL returned from server');
            }

            console.log('Upload success, temporary link:', fileUrl);

            // 自动复制到剪贴板
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fileUrl).catch(err => {
                    console.error('Failed to copy URL:', err);
                });
            }

            // 更新消息列表中的 loading 消息
            const loadingMsgIndex = AppState.chatMessages.findIndex(msg => msg.id === loadingId);
            if (loadingMsgIndex !== -1) {
                // 移除 loading 消息
                AppState.chatMessages.splice(loadingMsgIndex, 1);

                // 根据文件类型添加展示消息
                const isImage = file.type.startsWith('image/');
                AppState.chatMessages.push({
                    role: 'user',
                    type: isImage ? 'image' : 'text',
                    content: isImage ? fileUrl : `📄 已上传文件: [${file.name}](${fileUrl})`,
                    timestamp: new Date().toISOString()
                });

                // 添加系统提示消息（包含链接和复制提示）
                AppState.chatMessages.push({
                    role: 'system', // 需要在 renderChatMessages 中处理 system 角色
                    content: `文件上传成功！\n临时链接: ${fileUrl}\n(链接已尝试复制到剪贴板)`,
                    timestamp: new Date().toISOString()
                });
            }

            renderCurrentPage();

            // 调用 Coze 工作流 API
            setTimeout(async () => {
                if (window.cozeWorkflow) {
                    // 将图片链接发送给 Coze 工作流 API
                    const result = await window.cozeWorkflow.runWorkflow(fileUrl);
                    // API 会自动打印请求体和返回结果到控制台和页面日志
                } else {
                    AppState.chatMessages.push({
                        role: 'assistant',
                        content: '已收到您的文件链接。目前仅支持链接接收，后续将升级深度分析功能。',
                        timestamp: new Date().toISOString()
                    });
                    renderCurrentPage();
                    AppState.saveToStorage();
                }
            }, 500);

        })
        .catch(error => {
            console.error('Upload failed:', error);

            // 更新 loading 消息为错误消息
            const loadingMsgIndex = AppState.chatMessages.findIndex(msg => msg.id === loadingId);
            if (loadingMsgIndex !== -1) {
                AppState.chatMessages[loadingMsgIndex].content = `❌ 上传失败: ${error.message}`;
            } else {
                showToast('上传失败: ' + error.message);
            }
            renderCurrentPage();
        });

    // 重置 input
    input.value = '';
}

function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendMessage();
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 防止插入换行符
        sendMessage();
    }
}

let cozeAPI = null;

function initCozeAPI() {
    if (typeof CozeChatAPI === 'undefined') {
        console.error('CozeChatAPI not found');
        return;
    }

    cozeAPI = new CozeChatAPI({
        botId: '7584776894743085106',
        userId: 'user_' + Date.now(),
        // 禁用默认的 UI 绑定
        messagesContainer: null,
        inputElement: null,
        sendButton: null,

        onStreamingStart: () => {
            // 添加"正在思考中..."的AI消息占位
            AppState.chatMessages.push({
                role: 'assistant',
                content: '正在思考中...',
                timestamp: new Date().toISOString(),
                isLoading: true
            });
            // 渲染页面，显示加载状态
            renderCurrentPage();
        },

        onStreamingUpdate: (content) => {
            // 更新最后一条消息的内容
            const msgs = AppState.chatMessages;
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
                // 如果是加载状态，移除标记
                if (msgs[msgs.length - 1].isLoading) {
                    delete msgs[msgs.length - 1].isLoading;
                }
                msgs[msgs.length - 1].content = content;

                // 直接更新 DOM 以获得更好的流式体验
                // 查找最后一个助手消息的气泡
                const assistantMessages = document.querySelectorAll('.chat-message.assistant .message-text');
                const lastBubble = assistantMessages[assistantMessages.length - 1];

                if (lastBubble) {
                    if (typeof marked !== 'undefined') {
                        try {
                            lastBubble.innerHTML = marked.parse(content);
                        } catch (e) {
                            lastBubble.innerText = content;
                        }
                    } else {
                        lastBubble.innerText = content;
                    }
                }
            }
        },

        onMessageReceived: (message) => {
            AppState.saveToStorage();
            // 可以在这里做一些收尾工作，比如移除光标效果等
            // 由于 renderChatMessages 会重新渲染整个列表，如果这里调用 renderCurrentPage() 会导致重绘
            // 我们已经通过 direct DOM update 更新了内容，所以这里可以选择不重绘，或者为了数据一致性重绘一次
            // renderCurrentPage();
        },

        onError: (error) => {
            console.error('Coze API Error:', error);
            const msgs = AppState.chatMessages;
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
                msgs[msgs.length - 1].content += `\n\n[出错了: ${error.message}]`;
                renderCurrentPage();
            }
            AppState.saveToStorage();
        }
    });
}

function sendMessage() {
    // 检查登录状态
    if (!checkLoginAndProceed()) return;

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // 如果 API 未初始化，尝试初始化
    if (!cozeAPI) {
        initCozeAPI();
    }

    AppState.aiQuickQuestionsHidden = true;

    // 添加用户消息
    AppState.chatMessages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    input.value = '';
    renderCurrentPage();

    // 调用 Coze API
    if (cozeAPI) {
        cozeAPI.sendMessage(message);
    } else {
        // 降级处理：先显示加载状态
        AppState.chatMessages.push({
            role: 'assistant',
            content: '正在思考中...',
            timestamp: new Date().toISOString(),
            isLoading: true
        });
        renderCurrentPage();

        setTimeout(() => {
            // 更新为实际回复
            const aiResponse = "抱歉，智能体服务暂时无法连接。";
            const msgs = AppState.chatMessages;
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant' && msgs[msgs.length - 1].isLoading) {
                delete msgs[msgs.length - 1].isLoading;
                msgs[msgs.length - 1].content = aiResponse;
                msgs[msgs.length - 1].timestamp = new Date().toISOString();
            }
            AppState.saveToStorage();
            renderCurrentPage();
        }, 1000);
    }
}

function getAIResponse(question) {
    const responses = {
        '如何准备就诊材料？': '准备就诊材料的建议：\n\n1. 身份证件：患者本人身份证或医保卡\n2. 既往病历：之前的诊断报告、检查结果\n3. 用药记录：正在服用的药物清单\n4. 检查报告：近期的体检报告、影像资料\n5. 费用准备：现金或银行卡\n\n建议提前整理成文件夹，方便查阅。',

        '陪诊时需要注意什么？': '陪诊注意事项：\n\n1. 准时到达：提前15-30分钟到达医院\n2. 记录要点：准备笔记本记录医生诊断和建议\n3. 主动沟通：帮助患者清楚描述症状\n4. 保持冷静：遇到突发情况保持镇定\n5. 关注细节：注意医嘱和用药说明\n6. 尊重隐私：保护患者隐私信息',

        '如何与医生沟通？': '与医生沟通技巧：\n\n1. 提前准备：列出要问的问题清单\n2. 清晰描述：准确描述症状、持续时间、严重程度\n3. 主动提问：不明白的地方及时询问\n4. 记录信息：记下医生的诊断和建议\n5. 确认理解：复述医嘱确保理解正确\n6. 礼貌尊重：保持礼貌，尊重医生的专业意见',

        '如何记录医嘱？': '医嘱记录要点：\n\n1. 用药信息：药名、剂量、频次、时间\n2. 注意事项：用药禁忌、副作用\n3. 复诊安排：复诊时间、需要携带的资料\n4. 生活建议：饮食、运动、休息等建议\n5. 检查项目：需要做的检查及注意事项\n\n建议使用本应用的记录功能，自动整理医嘱信息。'
    };

    // 检查是否有匹配的预设回复
    for (const [key, value] of Object.entries(responses)) {
        if (question.includes(key) || key.includes(question)) {
            return value;
        }
    }

    // 通用回复
    return `我理解您的问题。作为陪诊助手，我建议：\n\n1. 保持专业和耐心\n2. 详细记录就诊信息\n3. 及时与患者和家属沟通\n4. 注意患者的情绪和需求\n\n如果您有更具体的问题，欢迎继续询问。您也可以在患者库中记录详细信息，我会根据患者情况提供更个性化的建议。`;
}

// ==================== 患者列表页面 ====================
// 添加一个标志位，防止API请求无限循环
let isFetchingPatients = false;

function renderPatientList(container) {
    const isLoggedIn = window.wechatLogin && window.wechatLogin.isLoggedIn();

    // 只在已登录且页面首次加载或数据为空时获取API数据，避免无限循环
    if (isLoggedIn && AppState.patients.length === 0 && !isFetchingPatients) {
        let openid = '';
        if (window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function') {
            const userInfo = window.wechatLogin.getUserInfo();
            openid = userInfo?.openid || '';
        }
        if (!openid) {
            openid = localStorage.getItem('openid') || '';
        }

        fetchPatientData(openid || 'ae75cf2e-0f73-4137-9e99-116d92c45a47');
    }

    container.innerHTML = `
        <!-- 固定顶部标题、新增按钮和搜索框 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 0;">
            <!-- 标题和新增按钮 -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div style="font-size: 20px; font-weight: 600;">患者库</div>
                    ${isLoggedIn ? `<div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">共 ${AppState.patients.length} 位患者</div>` : ''}
                </div>
                ${isLoggedIn ? `
                <button class="btn btn-primary" onclick="goToAddPatient()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; font-size: 16px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center;">
                    新增
                </button>
                ` : ''}
            </div>
            ${isLoggedIn ? `
            <div class="search-container" style="position: relative; width: 100%;">
                <input type="text" 
                       id="patientSearchInput" 
                       class="input search-input" 
                       placeholder="搜索姓名、电话或病史..." 
                       value="${AppState.patientSearchTerm}"
                       oninput="handlePatientSearch(event)"
                       style="width: 100%; padding-right: 40px; box-sizing: border-box;">
                <div class="search-icon" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; vertical-align: middle; display: block;">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="p-2" id="patients-list-container">
            ${isLoggedIn ? renderPatientItems() : `
                <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">请先登录以查看患者数据</p>
                    <button class="btn btn-primary" onclick="window.wechatLogin.toWxLogin()" style="width: 120px; display: inline-flex; align-items: center; justify-content: center;">前往登录</button>
                </div>
            `}
        </div>
    `;
}

function renderEmptyPatients() {
    return `
        <div class="empty-state">
            <div class="empty-icon">👥</div>
            <p class="empty-text">还没有患者信息</p>
            <button class="btn btn-primary" onclick="goToAddPatient()" style="display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 16px;">添加第一位患者</button>
        </div>
    `;
}

// 处理患者搜索输入
function handlePatientSearch(event) {
    AppState.patientSearchTerm = event.target.value;
    const patientsListContainer = document.getElementById('patients-list-container');
    if (patientsListContainer) {
        patientsListContainer.innerHTML = renderPatientItems();
    }
}

// 过滤患者列表的辅助函数
function filterPatients(patients, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return patients;
    }

    const term = searchTerm.toLowerCase().trim();

    return patients.filter(patient => {
        // 简单的相似度匹配 - 检查搜索词是否在姓名、电话或病史中出现
        const nameMatch = patient.name.toLowerCase().includes(term);
        const phoneMatch = patient.phone.toLowerCase().includes(term);
        const historyMatch = patient.medicalHistory && patient.medicalHistory.toLowerCase().includes(term);

        return nameMatch || phoneMatch || historyMatch;
    });
}

function renderPatientItems() {
    // 根据搜索词过滤患者列表
    const filteredPatients = filterPatients(AppState.patients, AppState.patientSearchTerm);

    if (filteredPatients.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p class="empty-text">未找到匹配的患者</p>
                <button class="btn btn-primary" onclick="clearPatientSearch()" style="display: inline-flex; align-items: center; justify-content: center; height: 36px; padding: 0 16px;">清除搜索</button>
            </div>
        `;
    }

    return filteredPatients.map(patient => `
        <div class="card" onclick="goToPatientDetail('${patient.id}')" style="cursor: pointer;">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="patient-avatar">${patient.name[0]}</div>
                    <div>
                        <div class="flex items-center gap-1">
                            <span style="font-weight: 600;">${patient.name}</span>
                            <span class="badge badge-primary">${patient.gender}</span>
                            <span class="badge badge-primary">${patient.age}岁</span>
                        </div>
                        <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                            ${patient.phone}
                        </div>
                    </div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </div>
            ${patient.medicalHistory && patient.medicalHistory !== '无' ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary);">病史：${patient.medicalHistory}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 清除搜索
function clearPatientSearch() {
    AppState.patientSearchTerm = '';
    const searchInput = document.getElementById('patientSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    renderCurrentPage();
}

function goToAddPatient() {
    if (!checkLoginAndProceed()) return;
    AppState.currentView = 'add';
    renderCurrentPage();
}

async function goToPatientDetail(patientId) {
    AppState.currentPatientId = patientId;
    AppState.currentView = 'detail';

    // 加载陪诊记录
    await loadConsultations(patientId);

    renderCurrentPage();
}

async function loadConsultations(patientId) {
    console.log('开始加载陪诊记录, patientId:', patientId);
    try {
        if (typeof window.MingDaoYunArrayAPI === 'undefined') {
            console.error('MingDaoYunArrayAPI未加载');
            return;
        }

        const queryParams = {
            worksheetId: 'pzfwjl',
            pageSize: 50,
            pageIndex: 1,
            filters: [
                {
                    "controlId": "patientId",
                    "dataType": 2,
                    "spliceType": 1,
                    "filterType": 24,
                    "value": patientId
                },
                {
                    "controlId": "del",
                    "dataType": 2,
                    "spliceType": 1,
                    "filterType": 2,
                    "value": 0
                }
            ]
        };

        console.log('明道云查询请求参数 (pzfwjl):', JSON.stringify(queryParams, null, 2));

        const api = new window.MingDaoYunArrayAPI();
        const result = await api.getData(queryParams);

        console.log('明道云查询结果:', result);

        // 模仿 fetchPatientData 的取值逻辑，增加健壮性
        const rows = (result.success && result.data && Array.isArray(result.data.rows)) ? result.data.rows : [];

        console.log(`实际获取到的陪诊记录数量: ${rows.length}`);
        if (rows.length > 0) {
            console.log('第一条原始数据样本:', JSON.stringify(rows[0], null, 2));
        }

        // 将明道云数据映射回本地格式 (即使 rows 为空也进行更新，以清除旧数据)
        AppState.consultations = rows.map(row => {
            // 关键：处理关联字段返回的 JSON 字符串或数组格式
            let pId = row.patientId;
            if (typeof pId === 'string' && pId.startsWith('[')) {
                try {
                    const parsed = JSON.parse(pId);
                    pId = parsed[0]?.sid || pId;
                } catch (e) { }
            } else if (Array.isArray(pId)) {
                pId = pId[0]?.sid || pId;
            }

            return {
                id: row.rowid || row.rowId,
                patientId: pId,
                date: row.appointmentTime,
                hospital: row.medicalOrgName,
                department: row.departmentName,
                doctor: row.doctorName,
                coreAppeal: row.serviceTitle,
                onsetDate: row.actualStartDate,
                duration: row.cxfzsj_pl,
                associatedSymptoms: row.bszz,
                patientQuestions: [row.wentiyi, row.wentier, row.wentisan].filter(q => q),
                doctorAnswers: [row.wtyjd, row.wtejd, row.wtsjd].filter(a => a),
                diagnosis: row.specialNote,
                examSummary: row.zhjy,
                lifestyleAdvice: row.zjbz,
                followupDate: row.hxfcap,
                nurseReminder: row.pzszhtx,
                medication: row.yyzd,
                advice: row.nextAction,
                shouzhen: (function(val) {
                    if (val == '1' || val == 1) return 1;
                    if (Array.isArray(val) && val[0] == '1') return 1;
                    if (typeof val === 'string' && val.includes('1')) return 1; // 处理可能出现的 "[\"1\"]" 格式
                    return 0;
                })(row.shouzhen),
                firstRecordId: row.firstRecordId,
                status: (row.specialNote && row.specialNote !== '未记录') ? 'completed' : 'pending',
                createdAt: row.ctime
            };
        });
        AppState.saveToStorage();
        console.log('映射后的陪诊记录:', AppState.consultations);
    } catch (error) {
        console.error('加载陪诊记录失败:', error);
    }
}

// ==================== 添加患者页面 ====================
function renderAddPatient(container) {
    // 检查是否是编辑模式
    const isEditMode = AppState.currentView === 'edit';
    const patient = isEditMode ? AppState.patients.find(p => p.id === AppState.currentPatientId) : null;

    // 设置标题
    const pageTitle = isEditMode ? '编辑患者信息' : '添加患者信息';

    // 设置表单提交事件
    const formSubmitEvent = isEditMode ? 'handleEditPatient(event)' : 'handleAddPatient(event)';

    // 填充患者数据
    const name = patient ? patient.name : '';
    const age = patient ? patient.age : '';
    const genderMale = patient && patient.gender === '男' ? 'checked' : '';
    const genderFemale = patient && patient.gender === '女' ? 'checked' : '';
    const phone = patient ? patient.phone : '';
    const medicalHistory = patient ? patient.medicalHistory : '';
    const allergies = patient ? patient.allergies : '';

    container.innerHTML = `
        <!-- 返回按钮 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                    <button class="btn btn-icon btn-outline" onclick="${isEditMode ? 'goToPatientDetail(AppState.currentPatientId)' : 'backToPatientList()'}" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                </div>
                <div style="font-size: 16px; font-weight: 500; text-align: center;">${pageTitle}</div>
                <div style="display: flex; align-items: center;">
                    <button class="btn btn-primary" type="submit" form="addPatientForm" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; font-size: 16px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center;">
                        保存
                    </button>
                </div>
        </div>
        
        <div class="p-2">
            <form id="addPatientForm" onsubmit="${formSubmitEvent}">
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">姓名 *</label>
                        <input type="text" name="name" class="input" placeholder="请输入患者姓名" value="${name}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">年龄 *</label>
                        <input type="number" name="age" class="input" placeholder="请输入年龄" value="${age}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">性别 *</label>
                        <div class="flex gap-2">
                            <label class="radio-label">
                                <input type="radio" name="gender" value="男" ${genderMale}> 男
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="gender" value="女" ${genderFemale}> 女
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">联系电话 *</label>
                        <input type="tel" name="phone" class="input" placeholder="请输入联系电话" value="${phone}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">既往病史</label>
                        <textarea name="medicalHistory" class="textarea" placeholder="请输入既往病史，如高血压、糖尿病等">${medicalHistory}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">过敏史</label>
                        <textarea name="allergies" class="textarea" placeholder="请输入过敏史，如青霉素过敏等">${allergies}</textarea>
                    </div>
                </div>
                

            </form>
            
            ${isEditMode ? `
            <!-- 删除按钮 -->
            <button class="btn btn-outline btn-lg btn-danger-outline w-full" onclick="handleDeletePatient('${patient.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                删除患者
            </button>
            ` : ''}
        </div>
    `;
}

async function handleAddPatient(event) {
    if (!checkLoginAndProceed()) return;
    console.log('handleAddPatient函数被调用');
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // 必填项校验
    const requiredFields = [
        { name: 'name', label: '姓名' },
        { name: 'age', label: '年龄' },
        { name: 'gender', label: '性别' },
        { name: 'phone', label: '联系电话' }
    ];

    for (const field of requiredFields) {
        const value = formData.get(field.name);
        if (!value || !value.trim()) {
            showConfirmDialog('患者核心信息未填写完整！', null, null, '去填写', '');
            return;
        }
    }

    // 构造患者数据对象
    const patientData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        phone: formData.get('phone'),
        medicalHistory: formData.get('medicalHistory') || '无',
        allergies: formData.get('allergies') || '无'
    };

    // 校验电话号码
    if (!validatePhoneNumber(patientData.phone)) {
        showToast('请输入正确的11位中国手机号码');
        return;
    }

    console.log('患者数据对象:', patientData);

    // 获取当前登录用户的rowid
    let userRowId = null;
    const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function' ? window.wechatLogin.getUserInfo() : null;
    if (userInfo) {
        const rawUser = userInfo.raw || userInfo;
        userRowId = rawUser.rowid || rawUser.rowId;
    }

    console.log('当前登录用户rowid:', userRowId);

    // 构造明道云API请求体
    const apiControls = [
        { "controlId": "姓名", "value": patientData.name },
        { "controlId": "年龄", "value": String(patientData.age) },
        { "controlId": "性别", "value": patientData.gender },
        { "controlId": "电话", "value": patientData.phone },
        { "controlId": "pastMedicalHistory", "value": patientData.medicalHistory },
        { "controlId": "allergy_history", "value": patientData.allergies },
        { "controlId": "del", "value": "0" }, // 设置为未删除状态
        { "controlId": "yonghu", "value": userRowId } // 关联当前登录用户
    ];

    // 打印请求体
    console.log('明道云API请求体:', { worksheetId: 'hzxxgl', controls: apiControls });

    try {
        // 检查明道云API组件是否可用
        if (typeof window.MingDaoYunAddAPI === 'undefined') {
            console.error('MingDaoYunAddAPI组件未加载');
            alert('明道云API组件未加载，请刷新页面重试');
            return;
        }

        // 调用明道云API添加患者数据
        console.log('准备创建MingDaoYunAddAPI实例');
        const api = new window.MingDaoYunAddAPI();
        console.log('MingDaoYunAddAPI实例创建成功');
        console.log('准备调用明道云API');
        const result = await api.getData(
            'hzxxgl', // 患者数据表别名
            apiControls
        );
        console.log('明道云API调用完成');

        // 打印API调用结果
        console.log('明道云API添加结果:', result);

        if (result.success) {
            // 处理API返回结果：可能是字符串格式的rowid或包含rowid/rowId的对象
            let rowId;

            // 检查返回的data类型
            if (typeof result.data === 'string') {
                // 直接返回字符串rowid
                rowId = result.data;
            } else {
                // 返回对象，可能包含rowid或rowId
                rowId = result.data?.rowid || result.data?.rowId;
            }

            if (!rowId) {
                console.error('新增患者成功但未返回有效的rowid:', result);
                showToast('患者添加成功，但无法获取记录ID，可能无法删除');
                backToPatientList();
                return;
            }

            // 构造新患者对象，使用API返回的rowid作为id，并确保转换为字符串类型
            const newPatient = {
                id: String(rowId), // 使用明道云返回的rowid并转换为字符串
                ...patientData,
                pastMedicalHistory: patientData.medicalHistory, // 存储为pastMedicalHistory以保持一致性
                allergy_history: patientData.allergies, // 存储为allergy_history以保持一致性
                createdAt: new Date().toISOString()
            };

            // 添加到本地存储
            AppState.patients.unshift(newPatient);
            AppState.saveToStorage();

            showToast('患者添加成功');
            backToPatientList();
        } else {
            console.error('明道云添加失败:', result.error_msg, '错误代码:', result.error_code);
            alert('添加失败：' + result.error_msg);
        }
    } catch (error) {
        console.error('调用明道云API异常:', error);
        console.error('异常堆栈:', error.stack);
        alert('网络异常，请稍后重试');
    }
}

async function handleEditPatient(event) {
    if (!checkLoginAndProceed()) return;
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // 必填项校验
    const requiredFields = [
        { name: 'name', label: '姓名' },
        { name: 'age', label: '年龄' },
        { name: 'gender', label: '性别' },
        { name: 'phone', label: '联系电话' }
    ];

    for (const field of requiredFields) {
        const value = formData.get(field.name);
        if (!value || !value.trim()) {
            showConfirmDialog('患者核心信息未填写完整！', null, null, '去填写', '');
            return;
        }
    }

    const patientIndex = AppState.patients.findIndex(p => p.id === AppState.currentPatientId);
    if (patientIndex !== -1) {
        const updatedPatient = {
            ...AppState.patients[patientIndex],
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            medicalHistory: formData.get('medicalHistory') || '无',
            allergies: formData.get('allergies') || '无'
        };

        // 校验电话号码
        if (!validatePhoneNumber(updatedPatient.phone)) {
            showToast('请输入正确的11位中国手机号码');
            return;
        }

        // 构造明道云API请求体
        const apiControls = [
            { "controlId": "name", "value": updatedPatient.name },
            { "controlId": "age", "value": String(updatedPatient.age) },
            { "controlId": "gender", "value": updatedPatient.gender },
            { "controlId": "phone", "value": updatedPatient.phone },
            { "controlId": "pastMedicalHistory", "value": updatedPatient.medicalHistory },
            { "controlId": "allergy_history", "value": updatedPatient.allergies }
        ];

        try {
            // 检查明道云API组件是否可用
            if (typeof window.MingDaoYunUpdateAPI === 'undefined') {
                console.error('MingDaoYunUpdateAPI组件未加载');
                alert('明道云API组件未加载，请刷新页面重试');
                return;
            }

            // 调用明道云API更新患者数据
            const api = new window.MingDaoYunUpdateAPI();
            const result = await api.getData(
                AppState.currentPatientId,
                'hzxxgl',
                apiControls
            );

            if (result.success) {
                // 更新本地存储
                AppState.patients[patientIndex] = updatedPatient;
                AppState.saveToStorage();
                showToast('患者信息更新成功');
                goToPatientDetail(AppState.currentPatientId);
            } else {
                console.error('明道云更新失败:', result.error_msg, '错误代码:', result.error_code);
                alert('更新失败：' + result.error_msg);
            }
        } catch (error) {
            console.error('调用明道云API异常:', error);
            alert('网络异常，请稍后重试');
        }
    }
}

function backToPatientList() {
    AppState.currentView = 'main';
    AppState.currentPatientId = null;
    renderCurrentPage();
}

function handleDeletePatient(patientId) {
    if (!checkLoginAndProceed()) return;
    const patient = AppState.patients.find(p => p.id === patientId);
    if (patient) {
        showDeleteVerificationDialog(patientId, patient.name);
    }
}

// ==================== 患者详情页面 ====================
function renderPatientDetail(container) {
    const patient = AppState.patients.find(p => p.id === AppState.currentPatientId);

    if (!patient) {
        backToPatientList();
        return;
    }

    const patientConsultations = AppState.consultations.filter(c => c.patientId === patient.id);

    container.innerHTML = `
        <!-- 返回按钮 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="backToPatientList()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">患者信息</div>
            <div style="width: 72px;"></div> <!-- 占位 -->
        </div>
        
        <div class="p-2">
            <!-- 患者基本信息 -->
            <div class="card mb-2">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 class="card-title mb-0">基本信息</h3>
                    <button class="btn btn-icon btn-outline" onclick="editPatient('${patient.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">姓名：</span>
                        <span>${patient.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">性别：</span>
                        <span>${patient.gender}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">年龄：</span>
                        <span>${patient.age}岁</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">电话：</span>
                        <span>${patient.phone}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">病史：</span>
                        <span>${patient.pastMedicalHistory || patient.medicalHistory || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">过敏：</span>
                        <span>${patient.allergy_history || patient.allergies || ''}</span>
                    </div>
                </div>
            </div>
            
            <!-- 陪诊记录 -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3 class="card-title mb-0">陪诊记录 (${patientConsultations.length})</h3>
                    <button class="btn btn-icon btn-primary" onclick="startConsultation('${patient.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                    </button>
                </div>
                ${patientConsultations.length === 0 ? `
                    <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                        暂无陪诊记录
                    </p>
                ` : patientConsultations.map(c => `
                    <div class="list-item" onclick="viewConsultation('${c.id}')">
                        <div class="flex justify-between items-center">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 4px; height: 46px; border-radius: 3px; background-color: ${c.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)'}; flex-shrink: 0;"></div>
                                <div>
                                    <div style="font-weight: 500;">${c.hospital} - ${c.department}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                        ${formatDate(c.date)}
                                    </div>
                                </div>
                            </div>
                            <span class="badge ${c.status === 'completed' ? 'badge-success' : 'badge-warning'}">
                                ${c.status === 'completed' ? '已完成' : '进行中'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function startConsultation(patientId) {
    if (!checkLoginAndProceed()) return;
    AppState.currentPatientId = patientId;
    AppState.currentView = 'consultation';
    AppState.currentConsultationId = null;
    renderCurrentPage();
}

function editPatient(patientId) {
    if (!checkLoginAndProceed()) return;
    AppState.currentPatientId = patientId;
    AppState.currentView = 'edit';
    renderCurrentPage();
}

function viewConsultation(consultationId) {
    const consultation = AppState.consultations.find(c => c.id === consultationId);
    if (consultation) {
        AppState.currentPatientId = consultation.patientId;
        AppState.currentConsultationId = consultationId;
        AppState.currentView = 'consultation';
        renderCurrentPage();
    } else {
        showToast('未找到该陪诊记录');
    }
}

// 文本框自动调整高度函数
function autoResizeTextarea(textarea) {
    // 重置高度为auto，以便准确计算scrollHeight
    textarea.style.height = 'auto';

    // 设置高度为scrollHeight，但不超过maxHeight
    const maxHeight = parseInt(textarea.style.maxHeight) || 120;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // 如果高度变化，重新计算底部导航栏和输入框容器的位置
    const inputContainer = document.querySelector('.chat-input-container');
    const bottomNav = document.querySelector('.bottom-nav');
    const content = document.querySelector('.ai-chat-content');

    if (inputContainer && bottomNav && content) {
        const bottomNavHeight = bottomNav.getBoundingClientRect().height;
        const inputHeight = inputContainer.getBoundingClientRect().height;

        inputContainer.style.bottom = `${bottomNavHeight}px`;
        content.style.paddingBottom = `${bottomNavHeight + inputHeight + 24}px`;
    }
}

// 标签页切换函数
function switchConsultationTab(tabName) {
    // 每次切换标签时，自动滚动到顶部，确保用户看到的是新页面的开始部分
    window.scrollTo(0, 0);

    // 更新标签按钮状态
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        // 移除所有指示器
        const existingIndicator = btn.querySelector('.tab-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    });

    // 更新当前标签按钮状态并添加指示器
    const activeBtn = document.querySelector(`[onclick="switchConsultationTab('${tabName}')"]`);
    activeBtn.classList.add('active');

    // 添加蓝色指示器
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    indicator.style.cssText = 'position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;';
    activeBtn.appendChild(indicator);

    // 更新标签内容显示
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// 上传语音函数
function uploadVoice(tabType) {
    // 创建隐藏的文件输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.display = 'none';

    // 添加文件选择事件处理
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            showToast(`正在上传${tabType === 'pre' ? '诊前' : '诊后'}语音...`);
            // 这里可以添加实际的语音上传逻辑
            setTimeout(() => {
                showToast(`语音上传成功：${file.name}`);
            }, 1000);
        }
    });

    // 触发文件选择
    document.body.appendChild(fileInput);
    fileInput.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 1000);
}

// OCR识别函数
function ocrRecognition() {
    // 创建隐藏的文件输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf';
    fileInput.style.display = 'none';

    // 添加文件选择事件处理
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            showToast('正在进行OCR识别...');
            // 这里可以添加实际的OCR识别逻辑
            setTimeout(() => {
                showToast(`OCR识别完成：${file.name}`);
            }, 1500);
        }
    });

    // 触发文件选择
    document.body.appendChild(fileInput);
    fileInput.click();

    // 清理
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 1000);
}

// ==================== 陪诊流程页面 ====================
function renderConsultationFlow(container) {
    const patient = AppState.patients.find(p => p.id === AppState.currentPatientId);
    const consultation = AppState.currentConsultationId ? AppState.consultations.find(c => c.id === AppState.currentConsultationId) : null;
    const isEditMode = !!consultation;

    if (!patient) {
        backToPatientList();
        return;
    }

    container.innerHTML = `
        <!-- 返回按钮和保存按钮 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goToPatientDetail('${patient.id}')" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">${isEditMode ? '编辑陪诊记录' : '创建陪诊记录'}</div>
            <div style="width: 72px; display: flex; justify-content: flex-end;">
                <button type="submit" form="consultationForm" class="btn btn-primary" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; font-size: 16px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center;">
                    保存
                </button>
            </div>
        </div>
        
        <!-- 标签页导航 -->
        <div class="tab-nav" style="position: sticky; top: 54px; z-index: 99; display: flex; border-bottom: 1px solid var(--border-color); background-color: var(--bg-color);">
            <button class="tab-btn active" onclick="switchConsultationTab('pre')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">诊前</button>
            <button class="tab-btn" onclick="switchConsultationTab('post')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">诊后</button>
        </div>
        
        <div class="p-2 pt-0">
            <form id="consultationForm" onsubmit="handleConsultationSubmit(event)">
                <!-- 诊前内容 -->
                <div id="pre-tab" class="tab-content">
                <div class="card mb-2">
                    <h3 class="card-title mb-2">语音记录</h3>
                    <div class="upload-voice-section" style="padding: 16px;">
                        <button class="upload-btn" onclick="uploadVoice('pre')" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; font-size: 14px; font-weight: 400; width: 100%;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                            <span>语音识别</span>
                        </button>
                    </div>
                </div>
                <div class="card mb-2">
                    <h3 class="card-title mb-2">就诊信息</h3>
                    
                    <div class="form-group">
                        <label class="form-label">是否初诊 *</label>
                        <div class="radio-group" style="display: flex; gap: 24px; margin-top: 8px;">
                            <label class="radio-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="radio" name="shouzhen" value="1" ${!isEditMode || (consultation.shouzhen == 1 || consultation.shouzhen == '1') ? 'checked' : ''} onchange="handleShouzhenChange(this)" style="width: 16px; height: 16px;">
                                <span style="font-size: 14px; color: var(--text-primary);">是</span>
                            </label>
                            <label class="radio-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                <input type="radio" name="shouzhen" value="0" ${isEditMode && (consultation.shouzhen == 0 || consultation.shouzhen == '0') ? 'checked' : ''} onchange="handleShouzhenChange(this)" style="width: 16px; height: 16px;">
                                <span style="font-size: 14px; color: var(--text-primary);">否</span>
                            </label>
                        </div>
                    </div>

                    <div id="followup-section" style="display: ${isEditMode && (consultation.shouzhen == 0 || consultation.shouzhen == '0') ? 'block' : 'none'}; margin-top: 16px; padding: 12px; background: rgba(59, 130, 246, 0.03); border-radius: 8px; border: 1px dashed rgba(59, 130, 246, 0.2);">
                        <div class="form-group mb-0">
                            <label class="form-label" style="font-size: 13px; color: var(--text-secondary);">系统是否记录了该复诊的首次陪诊记录？</label>
                            <div class="radio-group" style="display: flex; gap: 24px; margin-top: 8px;">
                                <label class="radio-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="hasFirstRecord" value="1" ${isEditMode && consultation.firstRecordId ? 'checked' : ''} onchange="handleHasFirstRecordChange(this)" style="width: 14px; height: 14px;">
                                    <span style="font-size: 13px; color: var(--text-primary);">是</span>
                                </label>
                                <label class="radio-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="hasFirstRecord" value="0" ${isEditMode && !consultation.firstRecordId ? 'checked' : ''} onchange="handleHasFirstRecordChange(this)" style="width: 14px; height: 14px;">
                                    <span style="font-size: 13px; color: var(--text-primary);">否</span>
                                </label>
                            </div>
                        </div>

                        <div id="first-record-selector" style="display: ${isEditMode && consultation.firstRecordId ? 'block' : 'none'}; margin-top: 16px; border-top: 1px solid rgba(59, 130, 246, 0.1); pt-12;">
                            <label class="form-label" style="font-size: 13px; color: var(--text-secondary); margin-top: 12px;">请选择该复诊的首次陪诊记录 *</label>
                            <select name="firstRecordId" class="input" style="height: 38px; margin-top: 6px; font-size: 13px; background-color: white;">
                                <option value="">-- 请选择记录 --</option>
                                ${AppState.consultations
                                    .filter(c => c.patientId === AppState.currentPatientId && (c.shouzhen == 1 || c.shouzhen == '1') && c.id !== (isEditMode ? consultation.id : ''))
                                    .map(c => `
                                        <option value="${c.id}" ${isEditMode && consultation.firstRecordId === c.id ? 'selected' : ''}>
                                            ${formatDate(c.date)} - ${c.hospital} - ${c.doctor || '未记录'}
                                        </option>
                                    `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">就诊日期 *</label>
                        <input type="date" name="date" class="input" style="height: 40px; resize: none;" value="${isEditMode ? formatDateForInput(consultation.date) : new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医院 *</label>
                        <input type="text" name="hospital" class="input" placeholder="请输入医院名称" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" value="${isEditMode ? (consultation.hospital || '') : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">科室</label>
                        <input type="text" name="department" class="input" placeholder="请输入就诊科室" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" value="${isEditMode ? (consultation.department || '') : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医生</label>
                        <input type="text" name="doctor" class="input" placeholder="请输入医生姓名" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" value="${isEditMode ? (consultation.doctor || '') : ''}">
                    </div>
                </div>
                
                <div class="card mb-2">
                    <h3 class="card-title mb-2">症状描述</h3>
                    
                    <div class="form-group">
                        <label class="form-label">就诊核心诉求 *</label>
                        <textarea name="coreAppeal" class="textarea" placeholder="示例：确诊反复头痛原因、复查甲状腺结节大小、咨询用药副作用缓解方案等">${isEditMode ? (consultation.coreAppeal || '') : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">起病时间</label>
                        <input type="date" name="onsetDate" class="input" placeholder="年/月/日" style="height: 40px; resize: none;" value="${isEditMode ? formatDateForInput(consultation.onsetDate) : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">持续时间/发作频率</label>
                        <textarea name="duration" class="textarea" placeholder="请描述症状的持续时间或发作频率">${isEditMode ? (consultation.duration || '') : ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">伴随症状</label>
                        <textarea name="associatedSymptoms" class="textarea" placeholder="示例：头痛伴恶心呕吐、咳嗽伴咳痰发热、腹痛伴腹泻等，无则填'无'">${isEditMode ? (consultation.associatedSymptoms || '') : ''}</textarea>
                    </div>
                </div>
                
                <div class="card mb-2">
                    <h3 class="card-title mb-2">患者核心疑问</h3>
                    
                    <div id="questions-container">
                        ${isEditMode && consultation.patientQuestions && consultation.patientQuestions.length > 0 ?
            consultation.patientQuestions.map((q, i) => `
                                <div class="form-group question-item" data-question-index="${i + 1}">
                                    <div class="flex justify-between items-center mb-2">
                                        <h4 class="question-title">问题${i + 1}</h4>
                                        ${i > 0 ? `
                                        <button type="button" class="btn btn-danger-outline btn-sm delete-question-btn" onclick="deleteQuestion(${i + 1})">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                        ` : ''}
                                    </div>
                                    <div class="mb-3">
                                        <textarea name="patientQuestions[]" class="textarea w-full" placeholder="请输入患者的核心疑问" rows="2" oninput="syncQuestionsToAnswers()">${escapeHtml(q)}</textarea>
                                    </div>
                                    ${i === consultation.patientQuestions.length - 1 && i < 2 ? `
                                    <div class="flex justify-end mt-3">
                                        <button type="button" class="btn btn-outline btn-sm add-question-btn" onclick="addQuestion()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            添加问题
                                        </button>
                                    </div>
                                    ` : ''}
                                </div>
                            `).join('') : `
                                <div class="form-group question-item" data-question-index="1">
                                    <div class="mb-2">
                                        <h4 class="question-title">问题1</h4>
                                    </div>
                                    <div class="mb-3">
                                        <textarea name="patientQuestions[]" class="textarea w-full" placeholder="请输入患者的核心疑问" rows="2" oninput="syncQuestionsToAnswers()"></textarea>
                                    </div>
                                    <div class="flex justify-end mt-3">
                                        <button type="button" class="btn btn-outline btn-sm add-question-btn" onclick="addQuestion()">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                                <line x1="12" y1="5" x2="12" y2="19"/>
                                                <line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            添加问题
                                        </button>
                                    </div>
                                </div>
                            `
        }
                    </div>
                </div>
                </div>
                
                <!-- 诊后内容 -->
                <div id="post-tab" class="tab-content hidden">
                    <div class="card mb-2">
                        <h3 class="card-title mb-2">辅助功能</h3>
                        <div class="upload-buttons-section" style="padding: 8px 0; display: flex; gap: 8px;">
                            <button class="upload-btn" onclick="uploadVoice('post')" style="display: flex; align-items: center; padding: 8px 16px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; flex: 1; font-size: 14px; font-weight: 400; gap: 0;">
                                <div style="width: 30%; display: flex; justify-content: center;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                    </svg>
                                </div>
                                <div style="width: 70%; text-align: center; flex-shrink: 0;">语音识别</div>
                            </button>
                            <button class="ocr-btn" onclick="ocrRecognition()" style="display: flex; align-items: center; padding: 8px 16px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; flex: 1; font-size: 14px; font-weight: 400;">
                                <div style="width: 30%; display: flex; justify-content: center;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                </div>
                                <div style="width: 70%; text-align: center; flex-shrink: 0;">OCR识别</div>
                            </button>
                        </div>
                    </div>

                    <div class="card mb-2">
                        <h3 class="card-title mb-2">诊疗详情</h3>
                        
                        <div class="form-group">
                            <label class="form-label">医生诊断</label>
                            <textarea name="diagnosis" class="textarea" placeholder="请输入医生的诊疗详情...">${isEditMode ? (consultation.diagnosis || '') : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">检查结果摘要</label>
                            <textarea name="examSummary" class="textarea" placeholder="请输入检查结果摘要...">${isEditMode ? (consultation.examSummary || '') : ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">医嘱检查项目</label>
                            <textarea name="advice" class="textarea" placeholder="请输入医生的其他建议...">${isEditMode ? (consultation.advice || '') : ''}</textarea>
                        </div>
                    </div>

                    <!-- 用药指导板块 -->
                    <div class="card mb-2">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="card-title mb-0">用药指导</h3>
                            <button type="button" class="btn btn-outline btn-sm" onclick="addMedicationRow()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px;">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                添加药物
                            </button>
                        </div>
                        <div id="medication-container">
                            <!-- 动态生成的用药行将放在这里 -->
                        </div>
                    </div>

                    <!-- 医生诊后建议板块 -->
                    <div class="card mb-2">
                        <h3 class="card-title mb-2">医生诊后建议</h3>
                        <div class="form-group">
                            <label class="form-label">生活方式调整</label>
                            <textarea name="lifestyleAdvice" class="textarea" placeholder="如：低盐低脂饮食、加强体育锻炼等...">${isEditMode ? (consultation.lifestyleAdvice || '') : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">后续复查安排</label>
                            <input type="date" name="followupDate" class="input w-full" value="${isEditMode ? formatDateForInput(consultation.followupDate) : ''}">
                        </div>
                    </div>

                    <!-- 疑问解答板块 -->
                    <div id="answers-container">
                        <!-- 动态生成的疑问解答项将放在这里 -->
                    </div>

                    <!-- 其他板块 -->
                    <div class="card mb-2">
                        <h3 class="card-title mb-2">其他</h3>
                        <div class="form-group">
                            <label class="form-label">陪诊师诊后提醒</label>
                            <textarea name="nurseReminder" class="textarea" placeholder="请输入陪诊师给患者的诊后温馨提醒...">${isEditMode ? (consultation.nurseReminder || '') : ''}</textarea>
                        </div>
                    </div>

                    ${isEditMode ? `
                    <div style="margin: 20px 0; padding: 0 16px;">
                        <button type="button" class="btn btn-danger w-full" onclick="handleConsultationDelete('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500;">
                            删除陪诊记录
                        </button>
                    </div>
                    ` : ''}
                </div>
        
        </form>
        </div>
    `;

    // 初始化诊后疑问解答板块
    if (isEditMode && consultation.doctorAnswers) {
        syncQuestionsToAnswers(consultation.doctorAnswers);
    } else {
        syncQuestionsToAnswers();
    }

    // 初始化用药记录
    if (isEditMode && consultation.medication) {
        try {
            const medications = JSON.parse(consultation.medication);
            if (Array.isArray(medications)) {
                medications.forEach(med => addMedicationRow(med));
            }
        } catch (e) {
            console.error('解析用药记录失败:', e);
        }
    }

    // 检查问题输入框数量，确保按钮状态正确
    checkQuestionCount();

    // 为初始激活的标签页添加蓝色指示器
    const initialActiveBtn = document.querySelector('.tab-btn.active');
    if (initialActiveBtn) {
        const indicator = document.createElement('div');
        indicator.className = 'tab-indicator';
        indicator.style.cssText = 'position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;';
        initialActiveBtn.appendChild(indicator);
    }
}

async function handleConsultationSubmit(event) {
    if (!checkLoginAndProceed()) return;
    event.preventDefault();

    const isEditMode = !!AppState.currentConsultationId;
    const form = event.target;
    const formData = new FormData(form);

    // 必填项校验
    const requiredFields = [
        { name: 'date', label: '就诊日期' },
        { name: 'hospital', label: '医院' },
        { name: 'coreAppeal', label: '就诊核心诉求' }
    ];

    for (const field of requiredFields) {
        const value = formData.get(field.name);
        if (!value || !value.trim()) {
            showConfirmDialog('诊前核心信息未填写完整！', null, null, '去填写', '');
            return;
        }
    }

    // 初诊/复诊逻辑校验
    const shouzhen = formData.get('shouzhen');
    const consultationDate = formData.get('date');
    const today = new Date().toISOString().split('T')[0];

    if (shouzhen === '1') {
        if (consultationDate < today) {
            showToast('初诊不能选择今天以前的日期');
            return;
        }
    }

    let firstRecordId = null;
    if (shouzhen === '0') {
        const hasFirstRecord = formData.get('hasFirstRecord');
        if (!hasFirstRecord) {
            showConfirmDialog('请确认系统是否记录了首次陪诊记录！', null, null, '去填写', '');
            return;
        }
        if (hasFirstRecord === '1') {
            firstRecordId = formData.get('firstRecordId');
            if (!firstRecordId) {
                showConfirmDialog('请选择首次陪诊记录！', null, null, '去选择', '');
                return;
            }
        }
    }

    // 获取患者核心疑问和医生解答
    const patientQuestions = [];
    const doctorAnswers = [];

    const questionTextareas = form.querySelectorAll('textarea[name="patientQuestions[]"]');
    questionTextareas.forEach(textarea => {
        const value = textarea.value.trim();
        patientQuestions.push(value || '');
    });

    const answerTextareas = form.querySelectorAll('textarea[name="doctorAnswers[]"]');
    answerTextareas.forEach(textarea => {
        const value = textarea.value.trim();
        doctorAnswers.push(value || '');
    });

    // 获取用药指导数据
    const medicationList = [];
    const medRows = form.querySelectorAll('.medication-row');
    medRows.forEach(row => {
        const nameInput = row.querySelector('input[name="med_name[]"]');
        const dosageInput = row.querySelector('input[name="med_dosage[]"]');
        const frequencyInput = row.querySelector('input[name="med_frequency[]"]');
        const durationInput = row.querySelector('input[name="med_duration[]"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const dosage = dosageInput ? dosageInput.value.trim() : '';
        const frequency = frequencyInput ? frequencyInput.value.trim() : '';
        const duration = durationInput ? durationInput.value.trim() : '';

        if (name) {
            medicationList.push({ name, dosage, frequency, duration });
        }
    });

    // 构造明道云API请求体
    const apiControls = [
        { "controlId": "appointmentTime", "value": formData.get('date') },
        { "controlId": "medicalOrgName", "value": formData.get('hospital') },
        { "controlId": "departmentName", "value": formData.get('department') || '未记录' },
        { "controlId": "doctorName", "value": formData.get('doctor') || '未记录' },
        { "controlId": "serviceTitle", "value": formData.get('coreAppeal') },
        { "controlId": "actualStartDate", "value": formData.get('onsetDate') },
        { "controlId": "cxfzsj_pl", "value": formData.get('duration') },
        { "controlId": "bszz", "value": formData.get('associatedSymptoms') || '未记录' },
        { "controlId": "wentiyi", "value": patientQuestions[0] || '' },
        { "controlId": "wentier", "value": patientQuestions[1] || '' },
        { "controlId": "wentisan", "value": patientQuestions[2] || '' },
        { "controlId": "specialNote", "value": formData.get('diagnosis') || '未记录' },
        { "controlId": "zhjy", "value": formData.get('examSummary') || '未记录' },
        { "controlId": "nextAction", "value": formData.get('advice') || '未记录' },
        { "controlId": "yyzd", "value": JSON.stringify(medicationList) },
        { "controlId": "zjbz", "value": formData.get('lifestyleAdvice') || '未记录' },
        { "controlId": "hxfcap", "value": formData.get('followupDate') || '未记录' },
        { "controlId": "wtyjd", "value": doctorAnswers[0] || '' },
        { "controlId": "wtejd", "value": doctorAnswers[1] || '' },
        { "controlId": "wtsjd", "value": doctorAnswers[2] || '' },
        { "controlId": "pzszhtx", "value": formData.get('nurseReminder') || '未记录' },
        { "controlId": "shouzhen", "value": shouzhen === '1' ? 1 : 0 },
        { "controlId": "firstRecordId", "value": firstRecordId || '' },
        { "controlId": "patientId", "value": AppState.currentPatientId }, // 关联患者ID
        { "controlId": "del", "value": "0" } // 逻辑删除标识
    ];

    try {
        let result;
        if (isEditMode) {
            if (typeof window.MingDaoYunUpdateAPI === 'undefined') {
                showToast('更新API组件未加载，请刷新页面');
                return;
            }
            const api = new window.MingDaoYunUpdateAPI();
            result = await api.getData(AppState.currentConsultationId, 'pzfwjl', apiControls);
        } else {
            if (typeof window.MingDaoYunAddAPI === 'undefined') {
                showToast('新增API组件未加载，请刷新页面');
                return;
            }
            const api = new window.MingDaoYunAddAPI();
            result = await api.getData('pzfwjl', apiControls);
        }

        if (result.success) {
            const rowId = isEditMode ? AppState.currentConsultationId : (typeof result.data === 'string' ? result.data : (result.data?.rowid || result.data?.rowId));

            const consultation = {
                id: String(rowId),
                patientId: AppState.currentPatientId,
                date: formData.get('date'),
                hospital: formData.get('hospital'),
                department: formData.get('department') || '未记录',
                doctor: formData.get('doctor') || '未记录',
                coreAppeal: formData.get('coreAppeal'),
                onsetDate: formData.get('onsetDate'),
                duration: formData.get('duration'),
                associatedSymptoms: formData.get('associatedSymptoms') || '未记录',
                patientQuestions: patientQuestions,
                doctorAnswers: doctorAnswers,
                diagnosis: formData.get('diagnosis') || '未记录',
                examSummary: formData.get('examSummary') || '未记录',
                lifestyleAdvice: formData.get('lifestyleAdvice') || '未记录',
                followupDate: formData.get('followupDate') || '未记录',
                nurseReminder: formData.get('nurseReminder') || '未记录',
                medication: JSON.stringify(medicationList),
                advice: formData.get('advice') || '未记录',
                shouzhen: parseInt(shouzhen),
                firstRecordId: firstRecordId,
                status: (formData.get('diagnosis') && formData.get('diagnosis') !== '未记录') ? 'completed' : 'pending',
                createdAt: new Date().toISOString()
            };

            if (isEditMode) {
                const index = AppState.consultations.findIndex(c => c.id === String(rowId));
                if (index !== -1) {
                    AppState.consultations[index] = consultation;
                }
            } else {
                AppState.consultations.unshift(consultation);
            }

            AppState.saveToStorage();

            showToast(isEditMode ? '陪诊记录已更新' : '陪诊记录已保存');

            setTimeout(() => {
                goToPatientDetail(AppState.currentPatientId);
            }, 1000);
        } else {
            console.error('明道云保存失败:', result.error_msg);
            alert('保存失败：' + result.error_msg);
        }
    } catch (error) {
        console.error('保存异常:', error);
        alert('网络异常，请稍后重试');
    }
}

async function handleConsultationDelete(consultationId) {
    if (!checkLoginAndProceed()) return;
    if (!confirm('确定要删除这条陪诊记录吗？')) {
        return;
    }

    try {
        if (typeof window.MingDaoYunUpdateAPI === 'undefined') {
            showToast('API组件未加载，请刷新页面');
            return;
        }

        const api = new window.MingDaoYunUpdateAPI();
        const result = await api.getData(consultationId, 'pzfwjl', [
            { "controlId": "del", "value": "1" }
        ]);

        if (result.success) {
            AppState.consultations = AppState.consultations.filter(c => c.id !== consultationId);
            AppState.saveToStorage();
            showToast('陪诊记录已删除');
            setTimeout(() => {
                goToPatientDetail(AppState.currentPatientId);
            }, 1000);
        } else {
            console.error('明道云删除失败:', result.error_msg);
            alert('删除失败：' + result.error_msg);
        }
    } catch (error) {
        console.error('删除异常:', error);
        alert('网络异常，请稍后重试');
    }
}

// ==================== 确认对话框 ====================
function handleShouzhenChange(radio) {
    const followupSection = document.getElementById('followup-section');
    const dateInput = document.querySelector('input[name="date"]');
    
    if (radio.value === '1') {
        followupSection.style.display = 'none';
        // 清重置复诊相关的选择
        const hasFirstRecordRadios = document.getElementsByName('hasFirstRecord');
        hasFirstRecordRadios.forEach(r => r.checked = false);
        document.getElementById('first-record-selector').style.display = 'none';
        const select = document.querySelector('select[name="firstRecordId"]');
        if (select) select.value = '';
        
        // 初诊逻辑：自动设置为当天
        const today = new Date().toISOString().split('T')[0];
        if (dateInput) {
            dateInput.value = today;
            // 虽然设置了当天，但用户可能还是想改（比如昨天初诊今天录入），
            // 但根据要求：“初诊选择日期时校验：不能选择今天以前的日期”
            // 以及“选择初诊后，就诊日期自动显示当天，且不能修改其他日期”
            // 这里的“不能修改其他日期”可能意味着变灰或者只读，但用户又说“初诊选择日期时校验”，这有点矛盾。
            // 最稳妥的做法是：自动设为今天，但允许修改，提交时校验不能早于今天。
            // 如果要严格执行“不能修改其他日期”，就设为 readOnly。
            // 我们按用户说的“初诊选择日期时校验”和“自动显示当天”来做。
        }
    } else {
        followupSection.style.display = 'block';
    }
}

function handleHasFirstRecordChange(radio) {
    const selector = document.getElementById('first-record-selector');
    if (radio.value === '1') {
        selector.style.display = 'block';
    } else {
        selector.style.display = 'none';
        const select = document.querySelector('select[name="firstRecordId"]');
        if (select) select.value = '';
    }
}

function showConfirmDialog(message, onConfirm, onCancel, confirmText = '确认', cancelText = '取消') {
    // 创建对话框容器
    const dialogContainer = document.createElement('div');
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '0';
    dialogContainer.style.left = '0';
    dialogContainer.style.right = '0';
    dialogContainer.style.bottom = '0';
    dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.alignItems = 'center';
    dialogContainer.style.justifyContent = 'center';
    dialogContainer.style.zIndex = '1000';
    dialogContainer.style.padding = '20px';
    dialogContainer.id = 'confirm-dialog';

    // 创建对话框内容
    const dialogContent = document.createElement('div');
    dialogContent.style.backgroundColor = 'var(--card-bg)';
    dialogContent.style.borderRadius = '12px';
    dialogContent.style.maxWidth = '320px';
    dialogContent.style.width = '100%';
    dialogContent.style.boxShadow = 'var(--shadow-lg)';
    dialogContent.style.padding = '16px';

    // 创建对话框头部
    const dialogHeader = document.createElement('div');
    dialogHeader.style.marginBottom = '16px';

    const dialogTitle = document.createElement('h3');
    dialogTitle.style.fontSize = '16px';
    dialogTitle.style.fontWeight = '600';
    dialogTitle.style.color = 'var(--text-primary)';
    dialogTitle.textContent = '提示';

    const dialogMessage = document.createElement('p');
    dialogMessage.style.marginTop = '4px';
    dialogMessage.style.fontSize = '14px';
    dialogMessage.style.color = 'var(--text-secondary)';
    dialogMessage.textContent = message;

    dialogHeader.appendChild(dialogTitle);
    dialogHeader.appendChild(dialogMessage);

    // 创建对话框按钮区域
    const dialogButtons = document.createElement('div');
    dialogButtons.style.display = 'flex';
    dialogButtons.style.gap = '8px';
    dialogButtons.style.justifyContent = 'flex-end';

    if (cancelText) {
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-outline';
        cancelButton.onclick = hideConfirmDialog;
        cancelButton.textContent = cancelText;
        dialogButtons.appendChild(cancelButton);
    }

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'btn btn-primary';
    confirmButton.onclick = handleConfirm;
    confirmButton.textContent = confirmText;

    dialogButtons.appendChild(confirmButton);

    // 组装对话框
    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(dialogButtons);
    dialogContainer.appendChild(dialogContent);

    // 添加到页面
    document.body.appendChild(dialogContainer);

    // 保存回调函数
    window.confirmCallbacks = {
        onConfirm,
        onCancel
    };
}

function hideConfirmDialog() {
    const dialog = document.getElementById('confirm-dialog');
    if (dialog) {
        dialog.remove();
    }

    // 调用取消回调
    if (window.confirmCallbacks?.onCancel) {
        window.confirmCallbacks.onCancel();
    }

    // 清理回调
    window.confirmCallbacks = null;
}

function handleConfirm() {
    // 调用确认回调
    if (window.confirmCallbacks?.onConfirm) {
        window.confirmCallbacks.onConfirm();
    }

    hideConfirmDialog();
}

// ==================== 患者核心疑问动态添加 ====================
function addQuestion() {
    const container = document.getElementById('questions-container');
    const questionItems = container.querySelectorAll('.question-item');

    // 最多允许3个问题输入框
    if (questionItems.length >= 3) {
        return;
    }

    // 隐藏所有现有添加按钮
    const addButtons = container.querySelectorAll('.add-question-btn');
    addButtons.forEach(btn => {
        btn.style.display = 'none';
    });

    // 计算新问题的索引
    const newIndex = questionItems.length + 1;

    // 创建新的问题输入框
    const newQuestionItem = document.createElement('div');
    newQuestionItem.className = 'form-group question-item';
    newQuestionItem.setAttribute('data-question-index', newIndex);
    newQuestionItem.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h4 class="question-title">问题${newIndex}</h4>
            <button type="button" class="btn btn-danger-outline btn-sm delete-question-btn" onclick="deleteQuestion(${newIndex})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
        <div class="mb-3">
            <textarea name="patientQuestions[]" class="textarea w-full" placeholder="请输入患者的核心疑问" rows="2" oninput="syncQuestionsToAnswers()"></textarea>
        </div>
    `;

    // 如果还没达到最大数量，添加"添加问题"按钮
    if (newIndex < 3) {
        newQuestionItem.innerHTML += `
            <div class="flex justify-end mt-3">
                <button type="button" class="btn btn-outline btn-sm add-question-btn" onclick="addQuestion()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加问题
                </button>
            </div>
        `;
    }

    container.appendChild(newQuestionItem);

    // 同步到诊后板块
    syncQuestionsToAnswers();
}

// ==================== 同步问题到诊后解答板块 ====================
function syncQuestionsToAnswers(initialAnswers = null) {
    const questionsContainer = document.getElementById('questions-container');
    const answersContainer = document.getElementById('answers-container');

    if (!questionsContainer || !answersContainer) return;

    const questionTextareas = questionsContainer.querySelectorAll('textarea[name="patientQuestions[]"]');

    // 记录当前的答案，优先使用传入的 initialAnswers，否则使用 DOM 中的
    let currentAnswers = [];
    if (initialAnswers && Array.isArray(initialAnswers)) {
        currentAnswers = initialAnswers;
    } else {
        const answerTextareas = answersContainer.querySelectorAll('textarea[name="doctorAnswers[]"]');
        answerTextareas.forEach(ta => currentAnswers.push(ta.value));
    }

    // 构建新的解答板块 HTML
    if (questionTextareas.length === 0) {
        answersContainer.innerHTML = '';
        return;
    }

    let itemsHtml = '';
    questionTextareas.forEach((textarea, index) => {
        const questionText = textarea.value.trim() || '(请在诊前页填写问题内容)';
        const savedAnswer = currentAnswers[index] || '';
        const questionNum = index + 1;

        itemsHtml += `
            <div class="answer-item mb-3" data-answer-index="${questionNum}">
                <div class="form-group mb-1">
                    <div class="question-display" style="display: block; font-size: 14px; font-weight: 500; color: var(--text-primary); line-height: 1.5;">
                        问题${questionNum}：${escapeHtml(questionText)}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size: 13px; color: var(--text-secondary); font-weight: 400;">医生解答：</label>
                    <textarea name="doctorAnswers[]" class="textarea w-full" placeholder="请输入医生的解答..." rows="3">${escapeHtml(savedAnswer)}</textarea>
                </div>
            </div>
        `;
    });

    answersContainer.innerHTML = `
        <div class="card mb-2">
            <h3 class="card-title mb-3">患者疑问解答</h3>
            ${itemsHtml}
        </div>
    `;
}

// ==================== 删除患者验证对话框 ====================
function showDeleteVerificationDialog(patientId, patientName) {
    // 创建对话框容器
    const dialogContainer = document.createElement('div');
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '0';
    dialogContainer.style.left = '0';
    dialogContainer.style.right = '0';
    dialogContainer.style.bottom = '0';
    dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.alignItems = 'center';
    dialogContainer.style.justifyContent = 'center';
    dialogContainer.style.zIndex = '1000';
    dialogContainer.style.padding = '20px';
    dialogContainer.id = 'delete-verification-dialog';

    // 创建对话框内容
    const dialogContent = document.createElement('div');
    dialogContent.style.backgroundColor = 'var(--card-bg)';
    dialogContent.style.borderRadius = '12px';
    dialogContent.style.maxWidth = '320px';
    dialogContent.style.width = '100%';
    dialogContent.style.boxShadow = 'var(--shadow-lg)';
    dialogContent.style.padding = '20px';

    // 创建对话框头部
    const dialogHeader = document.createElement('div');
    dialogHeader.style.marginBottom = '16px';

    const dialogTitle = document.createElement('h3');
    dialogTitle.style.fontSize = '18px';
    dialogTitle.style.fontWeight = '600';
    dialogTitle.style.color = 'var(--danger-color)';
    dialogTitle.textContent = '确认删除患者';

    dialogHeader.appendChild(dialogTitle);

    // 创建对话框消息
    const dialogMessage = document.createElement('p');
    dialogMessage.style.marginTop = '4px';
    dialogMessage.style.fontSize = '14px';
    dialogMessage.style.color = 'var(--text-secondary)';
    dialogMessage.style.lineHeight = '1.5';
    dialogMessage.innerHTML = '删除后数据不可恢复，请谨慎操作。<br><br>请输入患者姓名 "<strong>' + escapeHtml(patientName) + '</strong>" 进行确认：';

    // 创建输入框
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input';
    nameInput.style.marginTop = '12px';
    nameInput.style.marginBottom = '16px';
    nameInput.placeholder = '请输入患者姓名';

    // 创建错误提示
    const errorHint = document.createElement('p');
    errorHint.style.color = 'var(--danger-color)';
    errorHint.style.fontSize = '12px';
    errorHint.style.marginTop = '-12px';
    errorHint.style.marginBottom = '16px';
    errorHint.style.display = 'none';
    errorHint.textContent = '姓名输入错误，请重新输入';

    // 创建对话框按钮区域
    const dialogButtons = document.createElement('div');
    dialogButtons.style.display = 'flex';
    dialogButtons.style.gap = '8px';
    dialogButtons.style.justifyContent = 'flex-end';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-outline';
    cancelButton.onclick = hideDeleteVerificationDialog;
    cancelButton.textContent = '取消';

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'btn btn-danger-outline';
    confirmButton.onclick = () => handleDeleteVerification(patientId, patientName, nameInput, errorHint);
    confirmButton.textContent = '确认删除';

    dialogButtons.appendChild(cancelButton);
    dialogButtons.appendChild(confirmButton);

    // 组装对话框
    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(dialogMessage);
    dialogContent.appendChild(nameInput);
    dialogContent.appendChild(errorHint);
    dialogContent.appendChild(dialogButtons);
    dialogContainer.appendChild(dialogContent);

    // 添加到页面
    document.body.appendChild(dialogContainer);

    // 自动聚焦输入框
    nameInput.focus();
}

function hideDeleteVerificationDialog() {
    const dialog = document.getElementById('delete-verification-dialog');
    if (dialog) {
        dialog.remove();
    }
}

function handleDeleteVerification(patientId, expectedName, nameInput, errorHint) {
    const enteredName = nameInput.value.trim();
    if (enteredName === expectedName) {
        // 姓名验证通过，执行删除操作
        hideDeleteVerificationDialog();
        performDeletePatient(patientId);
    } else {
        // 姓名验证失败，显示错误提示
        errorHint.style.display = 'block';
        nameInput.focus();
    }
}

// ==================== 执行患者删除 ====================
async function performDeletePatient(patientId) {
    const patient = AppState.patients.find(p => p.id === patientId);
    if (!patient) return;

    try {
        // 调用明道云API进行逻辑删除
        const api = new window.MingDaoYunUpdateAPI();
        const result = await api.getData(
            patientId, // rowid
            'hzxxgl', // 患者数据表别名
            [
                {
                    "controlId": "del",
                    "value": 1 // 设置为已删除状态
                }
            ]
        );

        if (result.success) {
            // 从本地数组中删除患者数据
            const patientIndex = AppState.patients.findIndex(p => p.id === patientId);
            if (patientIndex !== -1) {
                AppState.patients.splice(patientIndex, 1);
                AppState.saveToStorage();
            }

            showToast('患者删除成功');
            backToPatientList();
        } else {
            console.error('明道云删除失败:', result.error_msg, '错误代码:', result.error_code);
            alert('删除失败：' + result.error_msg);
        }
    } catch (error) {
        console.error('调用明道云API异常:', error);
        alert('网络异常，请稍后重试');
    }
}

// ==================== 删除问题 ====================
function deleteQuestion(index) {
    // 问题1不能删除
    if (index === 1) {
        return;
    }

    // 显示确认对话框
    showConfirmDialog(
        '确定要删除这个问题及其解答吗？此操作不可恢复。',
        () => {
            // 用户确认删除
            const container = document.getElementById('questions-container');
            const questionItem = container.querySelector(`[data-question-index="${index}"]`);

            if (questionItem) {
                // 移除问题条目
                questionItem.remove();

                // 重新编号剩余的问题条目
                const remainingItems = container.querySelectorAll('.question-item');
                remainingItems.forEach((item, idx) => {
                    const newIndex = idx + 1;
                    item.setAttribute('data-question-index', newIndex);

                    // 更新标题
                    const title = item.querySelector('.question-title');
                    if (title) {
                        title.textContent = `问题${newIndex}`;
                    }

                    // 更新删除按钮的onclick事件
                    const deleteBtn = item.querySelector('.delete-question-btn');
                    if (deleteBtn) {
                        deleteBtn.onclick = () => deleteQuestion(newIndex);
                    }
                });

                // 如果删除后数量少于3，确保最后一个问题条目有添加按钮
                if (remainingItems.length < 3) {
                    const lastItem = remainingItems[remainingItems.length - 1];
                    let addBtn = lastItem.querySelector('.add-question-btn');

                    if (!addBtn) {
                        // 创建添加按钮
                        addBtn = document.createElement('button');
                        addBtn.type = 'button';
                        addBtn.className = 'btn btn-outline btn-sm add-question-btn';
                        addBtn.onclick = addQuestion;
                        addBtn.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            添加问题
                        `;

                        // 创建按钮容器
                        const btnContainer = document.createElement('div');
                        btnContainer.className = 'flex justify-end mt-3';
                        btnContainer.appendChild(addBtn);

                        lastItem.appendChild(btnContainer);
                    } else {
                        // 显示已存在的添加按钮
                        addBtn.style.display = 'inline-flex';
                    }
                }

                // 同步到诊后板块
                syncQuestionsToAnswers();
            }
        },
        () => {
            // 用户取消删除
            console.log('删除操作已取消');
        }
    );
}

// 页面加载完成后检查问题输入框数量
function checkQuestionCount() {
    const container = document.getElementById('questions-container');
    if (container) {
        const questionItems = container.querySelectorAll('.question-item');
        if (questionItems.length >= 3) {
            const addButtons = container.querySelectorAll('.add-question-btn');
            addButtons.forEach(btn => {
                btn.style.display = 'none';
            });
        }
    }
}

// 用药指导相关功能
function addMedicationRow(initialData = null) {
    const container = document.getElementById('medication-container');
    if (!container) return;

    const rowCount = container.querySelectorAll('.medication-row').length;
    const row = document.createElement('div');
    row.className = 'medication-row mt-2 mb-1 px-2 py-1 bg-gray-50 rounded-lg relative border border-gray-100';
    row.innerHTML = `
        <div class="flex justify-between items-center mb-1">
            <h4 class="text-xs font-semibold text-gray-500 medication-title" style="font-size: 10px;">药品${rowCount + 1}</h4>
            <button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteMedicationRow(this)" style="padding: 2px 4px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div class="form-group mb-1">
                <label class="form-label text-xs" style="font-size: 10px; margin-bottom: 2px;">药物名称</label>
                <input type="text" name="med_name[]" class="input w-full text-sm" placeholder="如：阿莫西林" style="padding: 4px 8px; font-size: 12px; height: 28px;" value="${initialData ? (initialData.name || '') : ''}">
            </div>
            <div class="form-group mb-1">
                <label class="form-label text-xs" style="font-size: 10px; margin-bottom: 2px;">服用剂量</label>
                <input type="text" name="med_dosage[]" class="input w-full text-sm" placeholder="如：3 颗" style="padding: 4px 8px; font-size: 12px; height: 28px;" value="${initialData ? (initialData.dosage || '') : ''}">
            </div>
            <div class="form-group mb-0">
                <label class="form-label text-xs" style="font-size: 10px; margin-bottom: 2px;">服用频率</label>
                <input type="text" name="med_frequency[]" class="input w-full text-sm" placeholder="如：早晚" style="padding: 4px 8px; font-size: 12px; height: 28px;" value="${initialData ? (initialData.frequency || '') : ''}">
            </div>
            <div class="form-group mb-0">
                <label class="form-label text-xs" style="font-size: 10px; margin-bottom: 2px;">服用时长</label>
                <input type="text" name="med_duration[]" class="input w-full text-sm" placeholder="如：4 天" style="padding: 4px 8px; font-size: 12px; height: 28px;" value="${initialData ? (initialData.duration || '') : ''}">
            </div>
        </div>
    `;
    container.appendChild(row);
}

function updateMedicationTitles() {
    const container = document.getElementById('medication-container');
    if (!container) return;
    const titles = container.querySelectorAll('.medication-title');
    titles.forEach((title, index) => {
        title.textContent = `药品${index + 1}`;
    });
}

function deleteMedicationRow(button) {
    const row = button.closest('.medication-row');
    row.remove();
    updateMedicationTitles();
}

// ==================== 备忘录页面 ====================
function renderRecordsList(container) {
    const today = new Date();
    const upcomingReminders = AppState.reminders
        .filter(r => !r.completed && new Date(r.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
        <!-- 固定顶部标题 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px;">
            <div>
                <div style="font-size: 20px; font-weight: 600;">备忘录</div>
                <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">${upcomingReminders.length} 个待办事项</div>
            </div>
        </div>
        
        <div class="p-2">
            <!-- 即将到来的提醒 -->
            <div class="card mb-2">
                <h3 class="card-title mb-2">即将到来</h3>
                ${upcomingReminders.length === 0 ? `
                    <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                        暂无待办事项
                    </p>
                ` : upcomingReminders.map(r => `
                    <div class="list-item">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" onchange="toggleReminder('${r.id}')" ${r.completed ? 'checked' : ''}>
                            <div class="flex-1">
                                <div style="font-weight: 500;">${r.title}</div>
                                <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                    ${formatDate(r.date)} ${r.time}
                                </div>
                            </div>
                            <span class="badge ${r.type === 'appointment' ? 'badge-primary' : 'badge-warning'}">
                                ${r.type === 'appointment' ? '陪诊' : '任务'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- 已完成 -->
            ${renderCompletedReminders()}
        </div>
    `;
}

function renderCompletedReminders() {
    const completed = AppState.reminders.filter(r => r.completed);

    if (completed.length === 0) return '';

    return `
        <div class="card">
            <h3 class="card-title mb-2">已完成 (${completed.length})</h3>
            ${completed.map(r => `
                <div class="list-item" style="opacity: 0.6;">
                    <div class="flex items-center gap-2">
                        <input type="checkbox" checked onchange="toggleReminder('${r.id}')">
                        <div class="flex-1">
                            <div style="font-weight: 500; text-decoration: line-through;">${r.title}</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                ${formatDate(r.date)} ${r.time}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}



function toggleReminder(id) {
    const reminder = AppState.reminders.find(r => r.id === id);
    if (reminder) {
        reminder.completed = !reminder.completed;
        AppState.saveToStorage();
        renderCurrentPage();
    }
}

// ==================== 设置页面 ====================
function renderSettings(container) {
    const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function'
        ? window.wechatLogin.getUserInfo()
        : null;
    const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
    const userNickname = userInfo
        ? (rawUser && rawUser.mingcheng ? rawUser.mingcheng : (userInfo.name || '用户'))
        : '未登录';
    const userAvatar = userInfo
        ? (getTouxiangUrl(rawUser && rawUser.touxiang) || userInfo.avatar || DEFAULT_AVATAR)
        : DEFAULT_AVATAR;
    const userId = userInfo
        ? (rawUser && rawUser.escortCode ? rawUser.escortCode : '-')
        : '-';
    const userLevel = userInfo && rawUser && rawUser.dengji ? rawUser.dengji : '免费版';

    container.innerHTML = `
        <div class="p-2">
            <div class="card mb-2 user-info-card">
                <div class="user-avatar-wrapper">
                    <img src="${escapeHtml(userAvatar)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22><circle cx=%2212%22 cy=%228%22 r=%224%22/><path d=%22M12 14c-4.4 0-8 2-8 5v1h16v-1c0-3-3.6-5-8-5z%22/></svg>'" alt="头像">
                </div>
                <div class="user-details">
                    <div class="user-nickname" onclick="handleNicknameClick('${userInfo ? 'logged' : 'notlogged'}')" style="cursor: pointer; ${userInfo ? 'text-decoration: underline;' : ''}">${escapeHtml(userNickname)}</div>
                    <div class="user-info-bottom">
                        <span class="user-welcome">欢迎回来</span>
                        <span class="user-id">ID: ${escapeHtml(userId)}</span>
                    </div>
                </div>
                ${userInfo ? `
                <div class="user-membership">
                    <span class="membership-badge">${escapeHtml(userLevel)}</span>
                </div>
                ` : ''}
            </div>

            <div class="card mb-2">
                <h3 class="card-title mb-2">会员相关</h3>
                
                <div class="list-item" onclick="showMyOrders()">
                    <div class="flex justify-between items-center">
                        <span>我的订单</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
                
                <div class="list-item" onclick="showMembershipBenefits()">
                    <div class="flex justify-between items-center">
                        <span>会员权益</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
                
                <div class="list-item" onclick="showConsumptionDetails()">
                    <div class="flex justify-between items-center">
                        <span>消耗明细</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="card mb-2">
                <h3 class="card-title mb-2">常规设置</h3>
                
                <div class="list-item" onclick="showOnboarding()">
                    <div class="flex justify-between items-center">
                        <span>新手引导</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
                
                <div class="list-item" onclick="exportData()">
                    <div class="flex justify-between items-center">
                        <span>导出数据</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
                
                <div class="list-item" onclick="clearData()">
                    <div class="flex justify-between items-center">
                        <span style="color: var(--danger-color);">清空所有数据</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--danger-color);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="settings-auth-actions">
                ${userInfo ? '' : `<button class="btn btn-secondary btn-lg w-full mb-2" onclick="mockLogin()" style="display: flex; align-items: center; justify-content: center;">模拟登录 (调试用)</button>`}
                ${userInfo ?
            `<button class="btn btn-outline btn-lg btn-danger-outline w-full" onclick="logout()" style="display: flex; align-items: center; justify-content: center;">退出登录</button>` :
            `<button class="btn btn-primary btn-lg w-full" onclick="goToLogin()" style="display: flex; align-items: center; justify-content: center;">立即登录</button>`
        }
                <button class="btn btn-outline btn-lg w-full mt-2" onclick="testPayment()" style="display: flex; align-items: center; justify-content: center; border-color: var(--primary-color); color: var(--primary-color);">支付测试</button>
            </div>
            
            <div class="card">
                <h3 class="card-title mb-2">关于</h3>
                <div style="color: var(--text-secondary); line-height: 1.8;">
                    <p>版本：1.0.14 (强制刷新已启用)</p>
                    <p style="margin-top: 12px; font-size: 12px;">Hash ID: ${getHashId()}</p>
                    <p style="margin-top: 12px;">© 2026 陪诊助手</p>
                </div>
            </div>
        </div>
    `;

    // 移除了 Coze API 测试代码
}



function goToLogin() {
    if (window.wechatLogin && typeof window.wechatLogin.toWxLogin === 'function') {
        window.wechatLogin.toWxLogin();
        return;
    }

    const wx = window.wx;
    if (wx && wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
        wx.miniProgram.navigateTo({ url: '/pages/login/index' });
        return;
    }
    showToast('请在小程序内打开以登录');
}

/**
 * 支付测试：跳转小程序原生支付页面
 */
function testPayment() {
    console.log('开始支付测试...');
    
    // 获取全局设置中的商户信息
    const settings = AppState.globalSettings;
    if (!settings) {
        showToast('全局设置尚未加载，请稍后再试');
        console.warn('支付测试失败：AppState.globalSettings 为空');
        return;
    }

    const wx = window.wx;
    if (wx && wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
        // 构建支付测试参数
        // 包含用户提到的商户密钥信息（虽然通常由后端处理，但按要求传递给小程序原生端）
        const payData = {
            type: 'test_payment',
            amount: 0.01,
            shmc: settings.shmc || '',
            pemkey: settings.pemkey || '',
            apiv2: settings.apiv2 || '',
            pemcert: settings.pemcert || '',
            apiv3: settings.apiv3 || '',
            timestamp: Date.now()
        };

        // 将参数序列化为查询字符串
        const queryString = Object.keys(payData)
            .map(key => `${key}=${encodeURIComponent(payData[key])}`)
            .join('&');

        const targetUrl = `/pages/payment/index?${queryString}`;
        console.log('正在跳转至小程序支付页面:', targetUrl);
        
        wx.miniProgram.navigateTo({
            url: targetUrl,
            success: function() {
                console.log('跳转小程序支付页面成功');
            },
            fail: function(err) {
                console.error('跳转小程序支付页面失败:', err);
                showToast('跳转支付失败，请检查环境');
            }
        });
    } else {
        console.error('当前环境不支持微信小程序跳转');
        showToast('请在微信小程序环境内进行支付测试');
    }
}

// 处理昵称点击事件
function handleNicknameClick(status) {
    if (status === 'notlogged') {
        // 未登录状态，跳转到登录
        goToLogin();
    } else {
        // 已登录状态，显示修改昵称对话框
        showEditNicknameDialog();
    }
}

// 显示修改昵称对话框
function showEditNicknameDialog() {
    // 获取当前用户信息
    const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function'
        ? window.wechatLogin.getUserInfo()
        : null;
    const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
    const currentNickname = rawUser && rawUser.mingcheng ? rawUser.mingcheng : (userInfo.name || '用户');

    // 创建对话框容器
    const dialogContainer = document.createElement('div');
    dialogContainer.style.position = 'fixed';
    dialogContainer.style.top = '0';
    dialogContainer.style.left = '0';
    dialogContainer.style.right = '0';
    dialogContainer.style.bottom = '0';
    dialogContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    dialogContainer.style.display = 'flex';
    dialogContainer.style.alignItems = 'center';
    dialogContainer.style.justifyContent = 'center';
    dialogContainer.style.zIndex = '1000';
    dialogContainer.style.padding = '20px';
    dialogContainer.id = 'edit-nickname-dialog';

    // 创建对话框内容
    const dialogContent = document.createElement('div');
    dialogContent.style.backgroundColor = 'var(--card-bg)';
    dialogContent.style.borderRadius = '12px';
    dialogContent.style.maxWidth = '320px';
    dialogContent.style.width = '100%';
    dialogContent.style.boxShadow = 'var(--shadow-lg)';
    dialogContent.style.padding = '20px';

    // 对话框头部
    const dialogHeader = document.createElement('div');
    dialogHeader.style.marginBottom = '16px';

    const dialogTitle = document.createElement('h3');
    dialogTitle.style.fontSize = '18px';
    dialogTitle.style.fontWeight = '600';
    dialogTitle.style.color = 'var(--text-primary)';
    dialogTitle.textContent = '修改昵称';

    dialogHeader.appendChild(dialogTitle);

    // 输入框
    const nicknameInput = document.createElement('input');
    nicknameInput.type = 'text';
    nicknameInput.value = currentNickname;
    nicknameInput.style.width = '100%';
    nicknameInput.style.padding = '12px';
    nicknameInput.style.border = '1px solid var(--border-color)';
    nicknameInput.style.borderRadius = '8px';
    nicknameInput.style.fontSize = '16px';
    nicknameInput.style.marginBottom = '16px';
    nicknameInput.style.boxSizing = 'border-box';

    // 聚焦输入框并选中内容
    nicknameInput.onfocus = function () {
        setTimeout(() => {
            this.select();
        }, 100);
    };

    // 错误提示
    const errorHint = document.createElement('div');
    errorHint.style.color = 'var(--danger-color)';
    errorHint.style.fontSize = '14px';
    errorHint.style.marginBottom = '16px';
    errorHint.style.minHeight = '20px';

    // 对话框按钮
    const dialogButtons = document.createElement('div');
    dialogButtons.style.display = 'flex';
    dialogButtons.style.gap = '8px';
    dialogButtons.style.justifyContent = 'flex-end';

    // 取消按钮
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.className = 'btn btn-outline';
    cancelButton.style.width = '80px';
    cancelButton.onclick = function () {
        closeEditNicknameDialog();
    };

    // 确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '保存';
    confirmButton.className = 'btn btn-primary';
    confirmButton.style.width = '80px';
    confirmButton.onclick = function () {
        const newNickname = nicknameInput.value.trim();
        if (!newNickname) {
            errorHint.textContent = '昵称不能为空';
            return;
        }
        if (newNickname === currentNickname) {
            errorHint.textContent = '昵称未变化';
            return;
        }

        // 更新昵称
        updateNickname(newNickname);
    };

    dialogButtons.appendChild(cancelButton);
    dialogButtons.appendChild(confirmButton);

    // 组装对话框
    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(nicknameInput);
    dialogContent.appendChild(errorHint);
    dialogContent.appendChild(dialogButtons);
    dialogContainer.appendChild(dialogContent);

    // 添加到页面
    document.body.appendChild(dialogContainer);

    // 自动聚焦输入框
    nicknameInput.focus();
}

// 关闭修改昵称对话框
function closeEditNicknameDialog() {
    const dialog = document.getElementById('edit-nickname-dialog');
    if (dialog) {
        dialog.remove();
    }
}

// 更新昵称函数
async function updateNickname(newNickname) {
    try {
        // 获取当前用户信息
        const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function'
            ? window.wechatLogin.getUserInfo()
            : null;

        if (!userInfo || !userInfo.raw) {
            showToast('获取用户信息失败');
            closeEditNicknameDialog();
            return;
        }

        const rawUser = userInfo.raw;
        const rowid = rawUser.rowId || rawUser.id;
        const worksheetId = 'yonghu'; // 用户表的工作表ID

        if (!rowid) {
            showToast('获取用户ID失败');
            closeEditNicknameDialog();
            return;
        }

        // 构造更新字段
        const controls = [
            {
                "controlId": "mingcheng", // 昵称字段的controlId
                "value": newNickname
            }
        ];

        console.log('更新昵称请求参数:', { rowid, worksheetId, controls });

        // 调用明道云更新API
        const api = new window.MingDaoYunUpdateAPI();
        const result = await api.getData(rowid, worksheetId, controls);

        console.log('更新昵称请求结果:', result);

        if (result.success) {
            // 更新成功，刷新用户信息
            if (window.wechatLogin && typeof window.wechatLogin.refreshUserInfo === 'function') {
                window.wechatLogin.refreshUserInfo();
            }

            showToast('昵称更新成功');
            closeEditNicknameDialog();

            // 重新渲染设置页面
            const container = document.getElementById('main-content');
            renderSettings(container);
        } else {
            // 更新失败
            const errorMsg = result.error_msg || '昵称更新失败';
            showToast(errorMsg);
            console.error('昵称更新失败:', errorMsg);
        }
    } catch (error) {
        // 处理异常
        console.error('更新昵称异常:', error);
        showToast('网络异常，请稍后重试');
    }
}

// 获取患者数据函数（调试用）
function fetchPatientData(userId) {
    // 如果已经在请求中，直接返回
    if (isFetchingPatients) {
        console.log('患者数据请求正在进行中，跳过本次请求');
        return;
    }

    // 设置请求中标志
    isFetchingPatients = true;

    console.log('=== 开始获取患者数据（真实API调用） ===');
    console.log('用户ID:', userId);

    // 构造请求体
    const patientData = {
        "appKey": "59c7bdc2cdf74e5e",
        "sign": "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==",
        "worksheetId": "hzxxgl",
        "filters": [
            {
                "controlId": "yonghu",
                "dataType": 2,
                "spliceType": 1,
                "filterType": 24,
                "value": userId
            },
            {
                "controlId": "del",
                "dataType": 2,
                "spliceType": 1,
                "filterType": 2,
                "value": 0
            }
        ],
        "pageSize": 100,
        "pageIndex": 1
    };

    console.log('患者数据请求体:', JSON.stringify(patientData, null, 2));

    const headers = {
        'Content-Type': 'application/json',
    };
    console.log('患者数据API请求头:', headers);

    // 调用明道云的getFilterRows接口获取患者数据
    fetch('https://api.mingdao.com/v2/open/worksheet/getFilterRows', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(patientData)
    })
        .then(response => {
            console.log('患者数据API响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('患者数据API响应数据:', JSON.stringify(data, null, 2));

            if (data.success) {
                // 确保data.data.rows是数组
                const patientList = Array.isArray(data.data?.rows) ? data.data.rows : [];

                console.log('实际获取到的患者数据:', patientList);

                // 如果获取到的数据为空，且当前是模拟登录/调试模式，保留现有的模拟数据
                if (patientList.length === 0 && (userId === 'ae75cf2e-0f73-4137-9e99-116d92c45a47' || userId === '0940f8f5-23c9-4111-9265-f2dec3eaeba4')) {
                    console.log('API 返回数据为空，但在模拟/调试模式下保留现有模拟数据');
                    // 如果当前没有数据，初始化一些模拟数据
                    if (AppState.patients.length === 0) {
                        AppState.initMockData();
                    }
                } else {
                    // 将获取到的患者数据保存到应用状态
                    AppState.patients = patientList.map(patient => ({
                        id: patient.rowid || patient.rowId,
                        name: patient.name || '未知姓名',
                        age: patient.age || 0,
                        gender: patient.gender || '未知',
                        phone: patient.phone || '未知电话',
                        pastMedicalHistory: patient.pastMedicalHistory || '无',
                        allergy_history: patient.allergy_history || '无',
                        medicalHistory: patient.pastMedicalHistory || '无',
                        allergies: patient.allergy_history || '无',
                        createdAt: new Date().toISOString()
                    }));
                }

                AppState.saveToStorage();
                console.log('患者数据已处理完成');
                // 数据更新后重新渲染当前页面
                renderCurrentPage();
            } else {
                showToast(`获取患者数据失败: ${data.error_msg || '未知错误'}`);
            }
        })
        .catch(error => {
            console.error('患者数据API调用失败:', error);
            showToast(`获取患者数据失败: ${error.message}`);
        })
        .finally(() => {
            // 重置请求中标志，允许后续请求
            isFetchingPatients = false;
            console.log('=== 获取患者数据完成 ===');
        });
}

// 模拟登录功能（调试用）
function mockLogin() {
    console.log('=== 开始模拟登录（真实API调用） ===');

    // 参考明道云API的调用格式
    const rowid = '0940f8f5-23c9-4111-9265-f2dec3eaeba4';
    const worksheetId = 'yonghu'; // 用户表的别名

    // 使用与明道云API一致的请求体格式
    const loginData = {
        "appKey": "59c7bdc2cdf74e5e",
        "sign": "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==",
        "worksheetId": worksheetId,
        "rowId": rowid,
        "getSystemControl": "false"
    };

    console.log('登录API请求体:', JSON.stringify(loginData, null, 2));

    const headers = {
        'Content-Type': 'application/json',
    };
    console.log('登录API请求头:', headers);

    // 调用明道云的getRowByIdPost接口获取用户信息（参考MingdaoQuery.js）
    fetch('https://api.mingdao.com/v2/open/worksheet/getRowByIdPost', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(loginData)
    })
        .then(response => {
            console.log('登录API响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('登录API响应数据:', JSON.stringify(data, null, 2));

            // 处理登录成功的响应
            if (data.success && data.data) {
                // 保存用户信息到window.wechatLogin
                if (!window.wechatLogin) {
                    window.wechatLogin = {};
                }

                // 转换明道云返回的用户数据格式为系统需要的格式
                const userInfo = {
                    name: data.data.mingcheng || '用户',
                    avatar: data.data.touxiang || 'https://via.placeholder.com/150',
                    openid: data.data.rowid, // 模拟登录时将 rowid 作为 openid 使用
                    raw: data.data // 保存原始数据
                };

                // 注入必要的方法确保兼容性
                window.wechatLogin.getUserInfo = () => userInfo;
                window.wechatLogin.isLoggedIn = () => true;
                window.wechatLogin.getOpenid = () => data.data.rowid;

                showToast('登录成功！');

                // 调试信息：打印用户ID
                console.log('登录成功，用户ID:', data.data.rowid);

                // 触发登录状态变更事件，通知系统更新
                window.dispatchEvent(new CustomEvent('wechatlogin:change', {
                    detail: { type: 'login', isLoggedIn: true, userInfo: userInfo }
                }));

                // 重新渲染页面
                renderCurrentPage();
            } else {
                // 登录失败
                showToast(`登录失败: ${data.error_msg || '未知错误'}`);
            }
        })
        .catch(error => {
            console.error('登录API调用失败:', error);

            // 如果API调用失败，可以提供降级方案或提示用户
            showToast(`登录API调用失败: ${error.message}`);

            // 降级方案：使用模拟数据（仅作为备选）
            console.log('使用降级方案：模拟登录数据');
            const mockUserInfo = {
                name: '调试用户',
                avatar: 'https://via.placeholder.com/150',
                openid: 'ae75cf2e-0f73-4137-9e99-116d92c45a47',
                raw: {
                    mingcheng: '调试用户',
                    touxiang: '',
                    escortCode: 'ae75cf2e-0f73-4137-9e99-116d92c45a47',
                    rowid: 'ae75cf2e-0f73-4137-9e99-116d92c45a47'
                }
            };

            if (!window.wechatLogin) {
                window.wechatLogin = {};
            }

            window.wechatLogin.getUserInfo = () => mockUserInfo;
            window.wechatLogin.isLoggedIn = () => true;
            window.wechatLogin.getOpenid = () => mockUserInfo.openid;

            // 触发登录状态变更事件
            window.dispatchEvent(new CustomEvent('wechatlogin:change', {
                detail: { type: 'login', isLoggedIn: true, userInfo: mockUserInfo }
            }));

            renderCurrentPage();
        })
        .finally(() => {
            console.log('=== 模拟登录完成 ===');
        });
}

// ==================== 会员与订单功能 ====================
function showMyOrders() {
    renderMyOrdersPage();
}

// 渲染我的订单页面
function renderMyOrdersPage() {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // Mock数据 - 我的订单 (仅显示已完成记录)
    const myOrders = [
        { id: 'ORD20260112001', date: '2026-01-12 10:30', name: '高级套餐 (3个月)', price: 258, status: '已支付', statusClass: 'success', type: 'membership' },
        { id: 'ORD20260105002', date: '2026-01-05 15:45', name: '资源点充值 (100点)', price: 99, status: '已支付', statusClass: 'success', type: 'resource' },
        { id: 'ORD20251228003', date: '2025-12-28 09:20', name: '基础套餐 (1个月)', price: 99, status: '已完成', statusClass: 'secondary', type: 'membership' },
        { id: 'ORD20251215004', date: '2025-12-15 14:10', name: '资源点充值 (50点)', price: 50, status: '已完成', statusClass: 'secondary', type: 'resource' }
    ];

    container.innerHTML = `
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goBackToSettings()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">我的订单</div>
            <div style="width: 72px;"></div> <!-- 占位 -->
        </div>
        
        <!-- Tab切换 -->
        <div class="tab-nav" style="position: sticky; top: 54px; z-index: 99; display: flex; border-bottom: 1px solid var(--border-color); background-color: var(--bg-color);">
            <button class="tab-btn active" onclick="switchOrderTab('all')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">
                全部
                <div class="tab-indicator" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;"></div>
            </button>
            <button class="tab-btn" onclick="switchOrderTab('membership')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">会员</button>
            <button class="tab-btn" onclick="switchOrderTab('resource')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">资源点</button>
        </div>
        
        <div class="p-2">
            <!-- 全部订单 -->
            <div id="all-orders" class="tab-content active">
                ${myOrders.map(order => `
                    <div class="card mb-2">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">订单号: ${order.id}</div>
                            <div class="badge badge-${order.statusClass}">${order.status}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                    <span style="font-size: 10px; padding: 1px 4px; border-radius: 4px; background-color: ${order.type === 'membership' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${order.type === 'membership' ? 'var(--primary-color)' : 'var(--success-color)'}; border: 1px solid ${order.type === 'membership' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'};">
                                        ${order.type === 'membership' ? '会员' : '资源点'}
                                    </span>
                                    <div style="font-size: 15px; font-weight: 600;">${order.name}</div>
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${order.date}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 16px; font-weight: 600; color: var(--primary-color);">￥${order.price}</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; mt-2; padding-top: 10px;">
                            <button class="btn btn-sm btn-outline">查看详情</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- 会员订单 -->
            <div id="membership-orders" class="tab-content" style="display: none;">
                ${myOrders.filter(o => o.type === 'membership').map(order => `
                    <div class="card mb-2">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">订单号: ${order.id}</div>
                            <div class="badge badge-${order.statusClass}">${order.status}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${order.name}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${order.date}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 16px; font-weight: 600; color: var(--primary-color);">￥${order.price}</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; mt-2; padding-top: 10px;">
                            <button class="btn btn-sm btn-outline">查看详情</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- 资源点订单 -->
            <div id="resource-orders" class="tab-content" style="display: none;">
                ${myOrders.filter(o => o.type === 'resource').map(order => `
                    <div class="card mb-2">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">订单号: ${order.id}</div>
                            <div class="badge badge-${order.statusClass}">${order.status}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">${order.name}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${order.date}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 16px; font-weight: 600; color: var(--primary-color);">￥${order.price}</div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; mt-2; padding-top: 10px;">
                            <button class="btn btn-sm btn-outline">查看详情</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 我的订单tab切换功能
function switchOrderTab(tabId) {
    // 更新标签按钮状态
    const tabButtons = document.querySelectorAll('.tab-nav .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        // 移除所有指示器
        const existingIndicator = btn.querySelector('.tab-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    });

    // 获取当前点击的按钮
    const button = event.currentTarget;

    // 更新当前标签按钮状态并添加指示器
    button.classList.add('active');

    // 添加蓝色指示器
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    indicator.style.cssText = 'position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;';
    button.appendChild(indicator);

    // 隐藏所有tab内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // 显示当前tab内容
    let contentId = '';
    if (tabId === 'all') contentId = 'all-orders';
    else if (tabId === 'membership') contentId = 'membership-orders';
    else if (tabId === 'resource') contentId = 'resource-orders';

    const currentTabContent = document.getElementById(contentId);
    if (currentTabContent) {
        currentTabContent.classList.add('active');
        currentTabContent.style.display = 'block';
    }
}

// 会员套餐数据
function getMembershipPackages() {
    const settings = AppState.globalSettings || {};
    return [
        {
            id: 1,
            name: '免费版',
            price: '免费版',
            isFree: true,
            description: settings.mfbms || '- 10次AI咨询\n- 基础陪诊记录\n- 药品信息查询'
        },
        {
            id: 2,
            name: '月卡会员',
            price: settings.ykjg || '258',
            description: settings.ykms || '- 30次AI咨询\n- 高级陪诊记录\n- 药品信息查询\n- 健康提醒'
        },
        {
            id: 3,
            name: '季卡会员',
            price: settings.jkjg || '598',
            description: settings.jkms || '- 60次AI咨询\n- 高级陪诊记录\n- 药品信息查询\n- 健康提醒\n- 优先客服'
        },
        {
            id: 4,
            name: '年卡会员',
            price: settings.nkjg || '1998',
            description: settings.nkms || '- 无限次AI咨询\n- 高级陪诊记录\n- 药品信息查询\n- 健康提醒\n- 优先客服\n- 专属顾问'
        }
    ];
}

// 渲染会员权益页面
function renderMembershipPage() {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    const packages = getMembershipPackages();
    
    // 获取当前用户的会员等级
    let userLevel = '免费版';
    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        const userInfo = window.wechatLogin.getUserInfo();
        if (userInfo && userInfo.raw && userInfo.raw.dengji) {
            userLevel = userInfo.raw.dengji;
        }
    }

    // 定义等级权重，用于比较高低
    const levelWeights = {
        '免费版': 1,
        '月卡会员': 2,
        '季卡会员': 3,
        '年卡会员': 4
    };
    const currentUserWeight = levelWeights[userLevel] || 1;

    // 默认选中当前等级的套餐
    let selectedPackage = packages.find(pkg => pkg.name === userLevel) || packages[0];

    // 获取全局设置中的资源剩余量
    const globalSettings = AppState.globalSettings || {};
    const monthlyRemaining = globalSettings.dy_sy || '103444';
    const fixedRemaining = globalSettings.gd_sy || '109289';

    container.innerHTML = `
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goBackToSettings()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">会员权益</div>
            <div style="width: 72px;"></div> <!-- 占位 -->
        </div>
        
        <div class="p-2" style="padding-bottom: 80px;">
            <div class="card mb-2">
                <!-- 资源剩余显示 -->
                <div style="display: flex; gap: 12px; margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.1);">
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            当月剩余
                        </div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">${monthlyRemaining}<span style="font-size: 12px; font-weight: 400; margin-left: 2px; color: var(--text-secondary);">资源</span></div>
                    </div>
                    <div style="width: 1px; background-color: rgba(59, 130, 246, 0.1);"></div>
                    <div style="flex: 1; padding-left: 12px;">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            固定剩余
                        </div>
                        <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">${fixedRemaining}<span style="font-size: 12px; font-weight: 400; margin-left: 2px; color: var(--text-secondary);">资源</span></div>
                    </div>
                </div>

                <h3 class="card-title mb-2">选择权益</h3>
                
                <div class="package-list" id="packageList">
                    ${packages.map(pkg => {
                        const pkgWeight = levelWeights[pkg.name] || 0;
                        const isCurrentLevel = pkg.name === userLevel;
                        const isDisabled = pkgWeight < currentUserWeight;
                        const isSelected = pkg.id === selectedPackage.id;
                        
                        let itemStyle = `border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 12px; position: relative; transition: all 0.2s;`;
                        if (isCurrentLevel) {
                            itemStyle += `border-color: #10b981; background-color: rgba(16, 185, 129, 0.05);`;
                        } else if (isSelected) {
                            itemStyle += `border-color: var(--primary-color); background-color: rgba(59, 130, 246, 0.05);`;
                        }
                        
                        if (isDisabled) {
                            itemStyle += `opacity: 0.6; cursor: not-allowed; filter: grayscale(0.5);`;
                        } else {
                            itemStyle += `cursor: pointer;`;
                        }

                        return `
                            <div class="package-item ${isSelected ? 'selected' : ''} ${isCurrentLevel ? 'current' : ''} ${isDisabled ? 'disabled' : ''}" 
                                 ${!isDisabled ? `onclick="selectPackage(${pkg.id})"` : ''} 
                                 style="${itemStyle}">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 style="font-size: 16px; font-weight: 600; margin: 0; color: ${isCurrentLevel ? '#10b981' : 'inherit'};">
                                        ${pkg.name}
                                        ${isCurrentLevel ? '<span style="font-size: 12px; font-weight: 400; margin-left: 8px; padding: 2px 6px; background: #10b981; color: white; border-radius: 4px;">当前等级</span>' : ''}
                                    </h4>
                                    <div style="font-size: 18px; font-weight: 700; color: ${isCurrentLevel ? '#10b981' : 'var(--primary-color)'};">
                                        ${pkg.isFree ? '免费' : '¥' + pkg.price}
                                    </div>
                                </div>
                                <!-- Markdown 描述内容 -->
                                <div class="markdown-content" style="font-size: 14px; color: var(--text-secondary);">
                                    ${typeof marked !== 'undefined' ? marked.parse(pkg.description) : pkg.description.replace(/\n/g, '<br>')}
                                </div>
                                ${isDisabled ? '<div style="font-size: 12px; color: #ef4444; margin-top: 8px;">该套餐等级低于当前等级</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
        
        <!-- 固定底部区域 -->
        <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background-color: var(--bg-color); border-top: 1px solid var(--border-color); padding: 8px 16px; display: flex; align-items: center; z-index: 100;">
            <button class="btn btn-primary w-full" id="subscribeBtn" onclick="subscribePackage()" style="padding: 10px 20px; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3); ${selectedPackage.name === userLevel ? 'background-color: #10b981; border-color: #10b981;' : ''}">
                ${selectedPackage.name === userLevel ? (selectedPackage.name === '免费版' ? '当前等级' : '立即续费') : (levelWeights[selectedPackage.name] > currentUserWeight ? `立即升级 (¥${selectedPackage.price})` : `立即开通 (¥${selectedPackage.price})`)}
            </button>
        </div>
    `;
}

// 选择权益
function selectPackage(packageId) {
    const packageList = document.getElementById('packageList');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const packages = getMembershipPackages();
    const pkg = packages.find(p => p.id === packageId);

    if (!pkg) return;

    // 获取当前用户信息以确定等级权重
    let userLevel = '免费版';
    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        const userInfo = window.wechatLogin.getUserInfo();
        if (userInfo && userInfo.raw && userInfo.raw.dengji) {
            userLevel = userInfo.raw.dengji;
        }
    }

    const levelWeights = {
        '免费版': 1,
        '月卡会员': 2,
        '季卡会员': 3,
        '年卡会员': 4
    };
    const currentUserWeight = levelWeights[userLevel] || 1;
    const pkgWeight = levelWeights[pkg.name] || 0;

    // 更新选择状态 UI
    const packageItems = packageList.querySelectorAll('.package-item');
    packageItems.forEach(item => {
        item.classList.remove('selected');
        // 恢复默认边框和背景，除非是当前等级
        if (!item.classList.contains('current')) {
            item.style.borderColor = 'var(--border-color)';
            item.style.backgroundColor = 'transparent';
        }
    });

    const selectedItem = packageList.querySelector(`[onclick="selectPackage(${packageId})"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        // 如果不是当前等级，则显示选中蓝色样式
        if (!selectedItem.classList.contains('current')) {
            selectedItem.style.borderColor = 'var(--primary-color)';
            selectedItem.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        }
    }

    // 更新按钮显示
    if (pkg.name === userLevel) {
        subscribeBtn.textContent = pkg.name === '免费版' ? '当前等级' : '立即续费';
        subscribeBtn.disabled = pkg.name === '免费版';
        subscribeBtn.style.opacity = '1';
        subscribeBtn.style.backgroundColor = '#10b981';
        subscribeBtn.style.borderColor = '#10b981';
    } else {
        const isUpgrade = pkgWeight > currentUserWeight;
        subscribeBtn.textContent = isUpgrade ? `立即升级 (¥${pkg.price})` : `立即开通 (¥${pkg.price})`;
        subscribeBtn.disabled = false;
        subscribeBtn.style.opacity = '1';
        subscribeBtn.style.backgroundColor = 'var(--primary-color)';
        subscribeBtn.style.borderColor = 'var(--primary-color)';
    }
}

// 订阅权益
function subscribePackage() {
    const selectedItem = document.querySelector('.package-item.selected');
    if (!selectedItem) {
        showToast('请先选择一个权益套餐');
        return;
    }

    // 获取套餐ID
    const packageId = parseInt(selectedItem.getAttribute('onclick').match(/\d+/)[0]);
    const packages = getMembershipPackages();
    const pkg = packages.find(p => p.id === packageId);

    if (pkg.isFree) return;

    showToast(`即将开通${pkg.name}，价格¥${pkg.price}`);
    // 这里可以添加实际的支付逻辑
}

// 返回设置页面
function goBackToSettings() {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 重新渲染设置页面
    renderSettings(container);

    // 确保底部导航栏正确显示
    if (bottomNav) {
        bottomNav.style.display = 'flex';
    }
}

function showMembershipBenefits() {
    renderMembershipPage();
}

// 渲染消耗明细页面
function renderConsumptionDetailsPage() {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // Mock数据 - 资源点消耗明细
    const resourceConsumption = [
        { id: 1, date: '2026-01-10', description: 'AI健康咨询', amount: -5, balance: 125 },
        { id: 2, date: '2026-01-08', description: '药品信息查询', amount: -3, balance: 130 },
        { id: 3, date: '2026-01-05', description: '资源点充值', amount: 100, balance: 133 },
        { id: 4, date: '2026-01-03', description: 'AI健康咨询', amount: -5, balance: 33 },
        { id: 5, date: '2026-01-01', description: '新年福利', amount: 50, balance: 38 }
    ];

    // Mock数据 - 报告生成明细
    const reportGeneration = [
        { id: 1, date: '2026-01-09', patient: '张三', type: '诊断报告', status: '已完成' },
        { id: 2, date: '2026-01-06', patient: '李四', type: '陪诊记录', status: '已完成' },
        { id: 3, date: '2026-01-04', patient: '王五', type: '诊断报告', status: '已完成' },
        { id: 4, date: '2026-01-02', patient: '赵六', type: '健康评估', status: '已完成' }
    ];

    container.innerHTML = `
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goBackToSettings()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">消耗明细</div>
            <div style="width: 72px;"></div> <!-- 占位 -->
        </div>
        
        <!-- Tab切换 -->
        <div class="tab-nav" style="position: sticky; top: 54px; z-index: 99; display: flex; border-bottom: 1px solid var(--border-color); background-color: var(--bg-color);">
            <button class="tab-btn active" onclick="switchConsumptionTab('resources')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">
                资源点
                <div class="tab-indicator" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;"></div>
            </button>
            <button class="tab-btn" onclick="switchConsumptionTab('reports')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">报告生成</button>
        </div>
        
        <div class="p-2">
        
        <!-- 资源点消耗明细 -->
        <div id="resources" class="tab-content active">
            <div class="card mb-2">
                <h3 class="card-title mb-2">资源点消耗</h3>
                
                <div class="p-2">
                    ${resourceConsumption.map(item => `
                        <div class="consumption-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <div style="font-size: 14px; font-weight: 500; margin-bottom: 4px;">${item.description}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${item.date}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 14px; ${item.amount < 0 ? 'color: var(--danger-color);' : 'color: var(--success-color);'}">
                                    ${item.amount > 0 ? '+' : ''}${item.amount}
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">余额: ${item.balance}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- 报告生成明细 -->
        <div id="reports" class="tab-content" style="display: none;">
            <div class="card mb-2">
                <h3 class="card-title mb-2">报告生成记录</h3>
                
                <div class="p-2">
                    ${reportGeneration.map(item => `
                        <div class="report-item" style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="font-size: 14px; font-weight: 500;">${item.type}</div>
                                <div class="badge badge-success">${item.status}</div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 12px; color: var(--text-secondary);">患者: ${item.patient}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${item.date}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        </div>
    `;
}

// 消耗明细tab切换功能
function switchConsumptionTab(tabId) {
    // 更新标签按钮状态
    const tabButtons = document.querySelectorAll('.tab-nav .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        // 移除所有指示器
        const existingIndicator = btn.querySelector('.tab-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    });

    // 获取当前点击的按钮
    const button = event.currentTarget;

    // 更新当前标签按钮状态并添加指示器
    button.classList.add('active');

    // 添加蓝色指示器
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    indicator.style.cssText = 'position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background-color: var(--primary-color); border-radius: 2px;';
    button.appendChild(indicator);

    // 隐藏所有tab内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // 显示当前tab内容
    const currentTabContent = document.getElementById(tabId);
    if (currentTabContent) {
        currentTabContent.classList.add('active');
        currentTabContent.style.display = 'block';
    }
}

function showConsumptionDetails() {
    renderConsumptionDetailsPage();
}

function logout() {
    if (window.wechatLogin && typeof window.wechatLogin.toWxLogout === 'function') {
        window.wechatLogin.toWxLogout();
        return;
    }

    const wx = window.wx;
    if (wx && wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
        wx.miniProgram.navigateTo({ url: '/pages/logout/index' });
        return;
    }
    showToast('请在小程序内打开以退出登录');
}

function exportData() {
    const data = {
        patients: AppState.patients,
        consultations: AppState.consultations,
        reminders: AppState.reminders,
        chatMessages: AppState.chatMessages,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `陪诊助手数据_${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('数据导出成功');
}

function clearData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        localStorage.clear();
        AppState.patients = [];
        AppState.consultations = [];
        AppState.reminders = [];
        AppState.chatMessages = [];
        AppState.saveToStorage();
        renderCurrentPage();
        showToast('数据已清空');
    }
}

// ==================== 工具函数 ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * 将日期字符串格式化为 <input type="date"> 所需的 yyyy-MM-dd 格式
 * @param {string} dateStr 
 * @returns {string}
 */
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    // 如果包含空格，取第一部分 (yyyy-MM-dd)
    if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0];
    }
    // 如果包含 T，取第一部分
    if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
    }
    return dateStr;
}

/**
 * 校验中国手机号码格式
 * @param {string} phone 
 * @returns {boolean}
 */
function validatePhoneNumber(phone) {
    if (!phone) return false;
    // 去掉空格和 +86 前缀
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+86/, '');
    // 校验 11 位中国手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
}

/**
 * 检查登录状态，如果未登录则提示前往登录
 * @param {Function} callback 登录后执行的回调
 * @returns {boolean} 是否已登录
 */
function checkLoginAndProceed(callback) {
    const isLoggedIn = window.wechatLogin && window.wechatLogin.isLoggedIn();
    if (isLoggedIn) {
        if (callback) callback();
        return true;
    }
    showConfirmDialog(
        '您尚未登录，无法进行该操作。是否前往登录页面？',
        () => {
            if (window.wechatLogin && typeof window.wechatLogin.toWxLogin === 'function') {
                window.wechatLogin.toWxLogin();
            } else {
                showToast('登录组件不可用');
            }
        },
        null,
        '去登录',
        '先看看'
    );
    return false;
}

// 默认头像 (SVG Base64 fallback)
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSI4IiByPSI0Ii8+PHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRoLThhNCA0IDAgMCAwLTQgNHYyIi8+PC9zdmc+";

function getTouxiangUrl(touxiang) {
    if (!touxiang) return '';
    if (Array.isArray(touxiang)) {
        return touxiang[0] && touxiang[0].large_thumbnail_full_path ? String(touxiang[0].large_thumbnail_full_path) : '';
    }
    if (typeof touxiang === 'string') {
        const trimmed = touxiang.trim();
        if (!trimmed) return '';
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed[0] && parsed[0].large_thumbnail_full_path ? String(parsed[0].large_thumbnail_full_path) : '';
            }
        } catch (e) { }
    }
    return '';
}

function getMingdaoDebugText() {
    let userInfo = null;

    if (window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function') {
        userInfo = window.wechatLogin.getUserInfo();
    }

    if (!userInfo) {
        try {
            const stored = localStorage.getItem('userInfo');
            if (stored) userInfo = JSON.parse(stored);
        } catch (e) { }
    }

    const raw = userInfo && userInfo.raw ? userInfo.raw : userInfo;
    if (!raw) return '明道云返回数据：暂无（请先登录）';

    try {
        return escapeHtml(`明道云返回数据：\n${JSON.stringify(raw, null, 2)}`);
    } catch (e) {
        return escapeHtml(`明道云返回数据：\n${String(raw)}`);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 获取URL中的hash ID
function getHashId() {
    return window.location.hash ? window.location.hash.substring(1) : '无';
}

/**
 * 加载全局设置
 */
async function loadGlobalSettings() {
    console.log('开始加载全局设置...');
    try {
        if (typeof window.MingDaoYunAPI === 'undefined') {
            console.warn('MingDaoYunAPI 未加载，跳过全局设置加载');
            return;
        }
        const api = new window.MingDaoYunAPI();
        const worksheetId = 'qjsz';
        const rowId = '9e5a5ed8-258b-4f20-a5c0-a1d9b9a97c2f';
        
        const result = await api.getData(rowId, worksheetId);
        if (result && result.success) {
            console.log('全局设置加载成功:', result.data);
            // 这里可以根据需要将设置保存到 AppState 或 localStorage
            AppState.globalSettings = result.data;
        } else {
            console.error('全局设置加载失败:', result ? result.error_msg : '未知错误');
        }
    } catch (error) {
        console.error('加载全局设置异常:', error);
    }
}

// ==================== 应用初始化 ====================
function initApp() {
    AppState.init();
    loadGlobalSettings(); // 加载全局设置
    if (!window.wechatLogin && typeof WechatLogin === 'function') {
        window.wechatLogin = new WechatLogin({
            miniProgramLoginUrl: '/pages/login/index',
            miniProgramLogoutUrl: '/pages/logout/index'
        });
    }
    window.addEventListener('wechatlogin:change', () => {
        console.log('登录状态变化，重新渲染页面');
        // 无论当前在哪个标签页，登录状态改变时都重新渲染，确保 UI 同步
        renderCurrentPage();

        // 登录后获取患者数据
        if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
            const userInfo = window.wechatLogin.getUserInfo();
            const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;

            // 优先使用真实用户的 rowid，如果没有（可能是模拟登录），则使用 openid 或默认调试 ID
            let userId = rawUser && rawUser.rowid ? rawUser.rowid : null;
            if (!userId) {
                userId = (userInfo && userInfo.openid) || (userInfo && userInfo.rowid) || localStorage.getItem('openid') || 'ae75cf2e-0f73-4137-9e99-116d92c45a47';
                console.log('检测到登录状态但未获取到真实 rowid (可能是模拟登录)，使用备选 ID:', userId);
            }

            if (userId && typeof fetchPatientData === 'function') {
                console.log('触发患者数据加载，用户ID:', userId);
                fetchPatientData(userId);
            }
        }
    });

    // 检查初始登录状态（处理 WechatLogin 初始化时已经完成的登录/恢复）
    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        console.log('初始状态已登录，手动触发数据加载');
        const userInfo = window.wechatLogin.getUserInfo();
        const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
        let userId = rawUser && rawUser.rowid ? rawUser.rowid : null;
        if (!userId) {
            userId = (userInfo && userInfo.openid) || (userInfo && userInfo.rowid) || localStorage.getItem('openid') || 'ae75cf2e-0f73-4137-9e99-116d92c45a47';
        }
        if (userId && typeof fetchPatientData === 'function') {
            fetchPatientData(userId);
        }
    }

    // 初始渲染，使用 setTimeout 确保在下一帧执行，避免 DOM 渲染竞争
    setTimeout(() => {
        console.log('执行初始渲染');
        renderCurrentPage();
    }, 0);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
