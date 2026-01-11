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
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px;">
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

        <div class="ai-chat-content" style="padding: 0 16px;">
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

        if (actualContentHeight > availableHeight) {
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
    // 只在页面首次加载或数据为空时获取API数据，避免无限循环
    if (AppState.patients.length === 0 && !isFetchingPatients) {
        fetchPatientData('ae75cf2e-0f73-4137-9e99-116d92c45a47');
    }

    container.innerHTML = `
        <!-- 固定顶部标题、新增按钮和搜索框 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <!-- 标题和新增按钮 -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div style="font-size: 20px; font-weight: 600;">患者库</div>
                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">共 ${AppState.patients.length} 位患者</div>
                </div>
                <button class="btn btn-primary" onclick="goToAddPatient()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; font-size: 16px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center;">
                    新增
                </button>
            </div>
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
        </div>
        
        <div class="p-2" id="patients-list-container">
            ${renderPatientItems()}
        </div>
    `;
}

function renderEmptyPatients() {
    return `
        <div class="empty-state">
            <div class="empty-icon">👥</div>
            <p class="empty-text">还没有患者信息</p>
            <button class="btn btn-primary" onclick="goToAddPatient()">添加第一位患者</button>
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
                <button class="btn btn-primary" onclick="clearPatientSearch()">清除搜索</button>
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
    AppState.currentView = 'add';
    renderCurrentPage();
}

function goToPatientDetail(patientId) {
    AppState.currentPatientId = patientId;
    AppState.currentView = 'detail';
    renderCurrentPage();
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
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px; display: flex; align-items: center; justify-content: space-between;">
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
                        <input type="text" name="name" class="input" required placeholder="请输入患者姓名" value="${name}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">年龄 *</label>
                        <input type="number" name="age" class="input" required placeholder="请输入年龄" value="${age}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">性别 *</label>
                        <div class="flex gap-2">
                            <label class="radio-label">
                                <input type="radio" name="gender" value="男" required ${genderMale}> 男
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="gender" value="女" required ${genderFemale}> 女
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">联系电话 *</label>
                        <input type="tel" name="phone" class="input" required placeholder="请输入联系电话" value="${phone}" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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
    console.log('handleAddPatient函数被调用');
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // 构造患者数据对象
    const patientData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        phone: formData.get('phone'),
        medicalHistory: formData.get('medicalHistory') || '无',
        allergies: formData.get('allergies') || '无'
    };

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
        { "controlId": "name", "value": patientData.name },
        { "controlId": "age", "value": patientData.age },
        { "controlId": "gender", "value": patientData.gender },
        { "controlId": "phone", "value": patientData.phone },
        { "controlId": "pastMedicalHistory", "value": patientData.medicalHistory },
        { "controlId": "allergy_history", "value": patientData.allergies },
        { "controlId": "del", "value": 0 } // 设置为未删除状态
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
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

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

        // 构造明道云API请求体
        const apiControls = [
            { "controlId": "name", "value": updatedPatient.name },
            { "controlId": "age", "value": updatedPatient.age },
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
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px; display: flex; align-items: center; justify-content: space-between;">
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
                                <div style="width: 4px; height: 46px; border-radius: 3px; background-color: ${c.status === 'completed' ? '#10b981' : '#f59e0b'}; flex-shrink: 0;"></div>
                                <div>
                                    <div style="font-weight: 500;">${c.hospital} - ${c.department}</div>
                                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                        ${formatDate(c.date)}
                                    </div>
                                </div>
                            </div>
                            <span class="badge ${c.status === 'completed' ? 'badge-success' : 'badge-primary'}">
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
    AppState.currentPatientId = patientId;
    AppState.currentView = 'consultation';
    AppState.currentConsultationId = null;
    renderCurrentPage();
}

function editPatient(patientId) {
    AppState.currentPatientId = patientId;
    AppState.currentView = 'edit';
    renderCurrentPage();
}

function viewConsultation(consultationId) {
    showToast('查看陪诊记录功能开发中...');
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

    if (!patient) {
        backToPatientList();
        return;
    }

    container.innerHTML = `
        <!-- 返回按钮和保存按钮 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goToPatientDetail('${patient.id}')" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">创建陪诊记录</div>
            <div style="width: 72px; display: flex; justify-content: flex-end;">
                <button type="submit" form="consultationForm" class="btn btn-primary" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; font-size: 16px; font-weight: 500; display: inline-flex; align-items: center; justify-content: center;">
                    保存
                </button>
            </div>
        </div>
        
        <!-- 标签页导航 -->
        <div class="tab-nav" style="position: sticky; top: 60px; z-index: 99; display: flex; border-bottom: 1px solid var(--border-color); background-color: var(--bg-color);">
            <button class="tab-btn active" onclick="switchConsultationTab('pre')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">诊前</button>
            <button class="tab-btn" onclick="switchConsultationTab('post')" style="flex: 1; padding: 4px 12px 12px 12px; border: none; background: none; font-weight: 500; position: relative;">诊后</button>
        </div>
        
        <div class="p-2">
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
                        <label class="form-label">就诊日期 *</label>
                        <input type="date" name="date" class="input" required style="height: 40px; resize: none;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医院 *</label>
                        <input type="text" name="hospital" class="input" required placeholder="请输入医院名称" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">科室</label>
                        <input type="text" name="department" class="input" placeholder="请输入就诊科室" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医生</label>
                        <input type="text" name="doctor" class="input" placeholder="请输入医生姓名" style="height: 40px; resize: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    </div>
                </div>
                
                <div class="card mb-2">
                    <h3 class="card-title mb-2">症状描述</h3>
                    
                    <div class="form-group">
                        <label class="form-label">就诊核心诉求 *</label>
                        <textarea name="coreAppeal" class="textarea" required placeholder="示例：确诊反复头痛原因、复查甲状腺结节大小、咨询用药副作用缓解方案等"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">起病时间</label>
                        <input type="date" name="onsetDate" class="input" placeholder="年/月/日" style="height: 40px; resize: none;">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">持续时间/发作频率</label>
                        <textarea name="duration" class="textarea" placeholder="请描述症状的持续时间或发作频率"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">伴随症状</label>
                        <textarea name="associatedSymptoms" class="textarea" placeholder="示例：头痛伴恶心呕吐、咳嗽伴咳痰发热、腹痛伴腹泻等，无则填'无'"></textarea>
                    </div>
                </div>
                
                <div class="card mb-2">
                    <h3 class="card-title mb-2">患者核心疑问</h3>
                    
                    <div id="questions-container">
                        <div class="form-group question-item" data-question-index="1">
                            <div class="mb-2">
                                <h4 class="question-title">问题1</h4>
                            </div>
                            <div class="mb-3">
                                <textarea name="patientQuestions[]" class="textarea w-full" placeholder="请输入患者的核心疑问" rows="2"></textarea>
                            </div>
                            <div>
                                <label class="form-label text-sm mb-1">医生解答</label>
                                <textarea name="doctorAnswers[]" class="textarea w-full" placeholder="请输入医生的解答..."></textarea>
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
                        <h3 class="card-title mb-2">诊断结果</h3>
                        
                        <div class="form-group">
                            <label class="form-label">医生诊断</label>
                            <textarea name="diagnosis" class="textarea" placeholder="请输入医生的诊断结果..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">用药建议</label>
                            <textarea name="medication" class="textarea" placeholder="请输入医生开具的药物及用法..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">医嘱</label>
                            <textarea name="advice" class="textarea" placeholder="请输入医生的其他建议..."></textarea>
                        </div>
                    </div>
                </div>
        
        </form>
        </div>
    `;

    // 设置默认日期为今天
    document.querySelector('input[name="date"]').value = new Date().toISOString().split('T')[0];

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

function handleConsultationSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // 获取患者核心疑问和医生解答
    const patientQuestions = [];
    const doctorAnswers = [];

    const questionInputs = form.querySelectorAll('input[name="patientQuestions[]"]');
    questionInputs.forEach(input => {
        const value = input.value.trim();
        patientQuestions.push(value || '');
    });

    const answerTextareas = form.querySelectorAll('textarea[name="doctorAnswers[]"]');
    answerTextareas.forEach(textarea => {
        const value = textarea.value.trim();
        doctorAnswers.push(value || '');
    });

    const consultation = {
        id: Date.now().toString(),
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
        medication: formData.get('medication') || '未记录',
        advice: formData.get('advice') || '未记录',
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    AppState.consultations.unshift(consultation);
    AppState.saveToStorage();

    showToast('陪诊记录已保存');

    setTimeout(() => {
        goToPatientDetail(AppState.currentPatientId);
    }, 1000);
}

// ==================== 确认对话框 ====================
function showConfirmDialog(message, onConfirm, onCancel) {
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
    dialogTitle.textContent = '确认操作';

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

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-outline';
    cancelButton.onclick = hideConfirmDialog;
    cancelButton.textContent = '取消';

    const confirmButton = document.createElement('button');
    confirmButton.type = 'button';
    confirmButton.className = 'btn btn-primary';
    confirmButton.onclick = handleConfirm;
    confirmButton.textContent = '确认';

    dialogButtons.appendChild(cancelButton);
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
            <textarea name="patientQuestions[]" class="textarea w-full" placeholder="请输入患者的核心疑问" rows="2"></textarea>
        </div>
        <div>
            <label class="form-label text-sm mb-1">医生解答</label>
            <textarea name="doctorAnswers[]" class="textarea w-full" placeholder="请输入医生的解答..."></textarea>
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

// ==================== 备忘录页面 ====================
function renderRecordsList(container) {
    const today = new Date();
    const upcomingReminders = AppState.reminders
        .filter(r => !r.completed && new Date(r.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = `
        <!-- 固定顶部标题 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px;">
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
                    <span class="membership-badge">免费版</span>
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
                ${userInfo ? '' : `<button class="btn btn-secondary btn-lg w-full mb-2" onclick="mockLogin()">模拟登录 (调试用)</button>`}
                ${userInfo ?
            `<button class="btn btn-outline btn-lg btn-danger-outline w-full" onclick="logout()">退出登录</button>` :
            `<button class="btn btn-primary btn-lg w-full" onclick="goToLogin()">立即登录</button>`
        }
            </div>
            
            <div class="card">
                <h3 class="card-title mb-2">关于</h3>
                <div style="color: var(--text-secondary); line-height: 1.8;">
                    <p>版本：1.0.9</p>
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

    // 调用明道云的getFilterRows接口获取患者数据
    fetch('https://api.mingdao.com/v2/open/worksheet/getFilterRows', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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

                // 将患者数据保存到应用状态
                AppState.patients = patientList.map(patient => ({
                    id: patient.rowid || patient.rowId, // 同时支持小写和驼峰命名的rowid
                    name: patient.name || '未知姓名',
                    age: patient.age || 0,
                    gender: patient.gender || '未知',
                    phone: patient.phone || '未知电话',
                    pastMedicalHistory: patient.pastMedicalHistory || '无',
                    allergy_history: patient.allergy_history || '无',
                    medicalHistory: patient.pastMedicalHistory || '无', // 保持向后兼容
                    allergies: patient.allergy_history || '无', // 保持向后兼容
                    createdAt: new Date().toISOString()
                }));

                AppState.saveToStorage();
                console.log('患者数据已保存到应用状态');
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

    // 调用明道云的getRowByIdPost接口获取用户信息（参考MingdaoQuery.js）
    fetch('https://api.mingdao.com/v2/open/worksheet/getRowByIdPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
                    raw: data.data // 保存原始数据
                };

                window.wechatLogin.getUserInfo = function () {
                    return userInfo;
                };

                showToast('登录成功！');

                // 调试信息：打印用户ID
                console.log('登录成功，用户ID:', data.data.rowid);

                // 重新渲染设置页面
                renderSettings(document.getElementById('main-content'));

                // 确保fetchPatientData函数存在
                if (typeof fetchPatientData === 'function') {
                    console.log('调用fetchPatientData函数');
                    fetchPatientData(data.data.rowid);
                } else {
                    console.error('fetchPatientData函数不存在');
                }
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
                raw: {
                    mingcheng: '调试用户',
                    touxiang: '',
                    escortCode: '0940f8f5-23c9-4111-9265-f2dec3eaeba4',
                    rowid: '0940f8f5-23c9-4111-9265-f2dec3eaeba4'
                }
            };

            if (!window.wechatLogin) {
                window.wechatLogin = {};
            }

            window.wechatLogin.getUserInfo = function () {
                return mockUserInfo;
            };

            renderSettings(document.getElementById('main-content'));
        })
        .finally(() => {
            console.log('=== 模拟登录完成 ===');
        });
}

// ==================== 会员与订单功能 ====================
function showMyOrders() {
    showToast('我的订单功能开发中...');
}

// 会员套餐数据（模拟）
const membershipPackages = [
    {
        id: 1,
        name: '基础套餐',
        price: 99,
        period: '1个月',
        benefits: ['10次AI咨询', '基础陪诊记录', '药品信息查询']
    },
    {
        id: 2,
        name: '高级套餐',
        price: 258,
        period: '3个月',
        benefits: ['30次AI咨询', '高级陪诊记录', '药品信息查询', '健康提醒']
    },
    {
        id: 3,
        name: '尊享套餐',
        price: 598,
        period: '6个月',
        benefits: ['60次AI咨询', '高级陪诊记录', '药品信息查询', '健康提醒', '优先客服']
    },
    {
        id: 4,
        name: '终身套餐',
        price: 1998,
        period: '终身',
        benefits: ['无限次AI咨询', '高级陪诊记录', '药品信息查询', '健康提醒', '优先客服', '专属顾问']
    }
];

// 渲染会员权益页面
function renderMembershipPage() {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // 初始选择第一个套餐
    const selectedPackage = membershipPackages[0];

    container.innerHTML = `
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px; display: flex; align-items: center; justify-content: space-between;">
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
        
        <div class="p-2" style="padding-bottom: 80px;"> <!-- 添加底部空间，避免内容被固定区域遮挡 -->
            <div class="card mb-2">
                <h3 class="card-title mb-2">选择权益</h3>
                
                <div class="package-list" id="packageList">
                    ${membershipPackages.map(pkg => `
                        <div class="package-item ${pkg.id === selectedPackage.id ? 'selected' : ''}" onclick="selectPackage(${pkg.id})" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; ${pkg.id === selectedPackage.id ? 'border-color: var(--primary-color); background-color: rgba(59, 130, 246, 0.05);' : ''}">
                            <div class="flex justify-between items-center mb-2">
                                <h4 style="font-size: 16px; font-weight: 600; margin: 0;">${pkg.name}</h4>
                                <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">¥${pkg.price}</div>
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">${pkg.period}</div>
                            <ul style="margin: 0; padding-left: 16px;">
                                ${pkg.benefits.map(benefit => `<li style="font-size: 14px; margin-bottom: 4px;">${benefit}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- 固定底部区域 -->
        <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background-color: var(--bg-color); border-top: 1px solid var(--border-color); padding: 8px 16px; display: flex; align-items: center; z-index: 100;">
            <button class="btn btn-primary w-full" id="subscribeBtn" onclick="subscribePackage()" style="padding: 10px 20px; font-size: 18px; font-weight: 600; text-align: center; border-radius: 8px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                立即开通 (¥${selectedPackage.price})
            </button>
        </div>
    `;
}

// 选择权益
function selectPackage(packageId) {
    const packageList = document.getElementById('packageList');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const pkg = membershipPackages.find(p => p.id === packageId);

    if (!pkg) return;

    // 更新选择状态
    const packageItems = packageList.querySelectorAll('.package-item');
    packageItems.forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = 'var(--border-color)';
        item.style.backgroundColor = 'transparent';
    });

    const selectedItem = packageList.querySelector(`[onclick="selectPackage(${packageId})"]`);
    selectedItem.classList.add('selected');
    selectedItem.style.borderColor = 'var(--primary-color)';
    selectedItem.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';

    // 更新按钮价格
    subscribeBtn.textContent = `立即开通 (¥${pkg.price})`;
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
    const pkg = membershipPackages.find(p => p.id === packageId);

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
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 16px 16px 16px 16px; display: flex; align-items: center; justify-content: space-between;">
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
        <div class="tab-nav" style="position: sticky; top: 60px; z-index: 99; display: flex; border-bottom: 1px solid var(--border-color); background-color: var(--bg-color);">
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
        <div id="reports" class="tab-content">
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
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        // 移除所有指示器
        const existingIndicator = btn.querySelector('.tab-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
    });

    // 获取当前点击的按钮
    const button = event.target;

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
    });

    // 显示当前tab内容
    const currentTabContent = document.getElementById(tabId);
    currentTabContent.classList.add('active');
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

// ==================== 应用初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    if (!window.wechatLogin && typeof WechatLogin === 'function') {
        window.wechatLogin = new WechatLogin({
            miniProgramLoginUrl: '/pages/login/index',
            miniProgramLogoutUrl: '/pages/logout/index'
        });
    }
    window.addEventListener('wechatlogin:change', () => {
        if (AppState.currentTab === 'settings') renderCurrentPage();

        // 真实登录后获取患者数据
        if (window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function') {
            const userInfo = window.wechatLogin.getUserInfo();
            const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
            const userId = rawUser && rawUser.rowid ? rawUser.rowid : null;

            if (userId && typeof fetchPatientData === 'function') {
                console.log('真实登录成功，用户ID:', userId);
                fetchPatientData(userId);
            }
        }
    });
    renderCurrentPage();
});
