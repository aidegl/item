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

    document.body.classList.toggle('ai-tab', AppState.currentTab === 'ai');

    switch (AppState.currentTab) {
        case 'ai':
            renderAIAssistant(content);
            break;
        case 'patients':
            if (AppState.currentView === 'main') {
                renderPatientList(content);
            } else if (AppState.currentView === 'add') {
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
            <button class="upload-btn" onclick="document.getElementById('imageUploadInput').click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <input type="text" id="chatInput" class="input" placeholder="输入您的问题..." onkeypress="handleChatKeyPress(event)">
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
    if (event.key === 'Enter') {
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
            // 添加空的 AI 消息占位
            AppState.chatMessages.push({
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString()
            });
            // 渲染页面，显示空气泡
            renderCurrentPage();
        },

        onStreamingUpdate: (content) => {
            // 更新最后一条消息的内容
            const msgs = AppState.chatMessages;
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
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
        // 降级处理
        setTimeout(() => {
            const aiResponse = "抱歉，智能体服务暂时无法连接。";
            AppState.chatMessages.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            });
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
function renderPatientList(container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="page-title">患者库</h1>
                    <p class="page-subtitle">共 ${AppState.patients.length} 位患者</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="goToAddPatient()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加患者
                </button>
            </div>
        </div>
        
        <div class="p-2">
            ${AppState.patients.length === 0 ? renderEmptyPatients() : renderPatientItems()}
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

function renderPatientItems() {
    return AppState.patients.map(patient => `
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
    container.innerHTML = `
        <div class="page-header">
            <div class="flex items-center gap-2">
                <button class="btn btn-icon btn-outline" onclick="backToPatientList()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <h1 class="page-title">添加患者</h1>
            </div>
        </div>
        
        <div class="p-2">
            <form id="addPatientForm" onsubmit="handleAddPatient(event)">
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">姓名 *</label>
                        <input type="text" name="name" class="input" required placeholder="请输入患者姓名">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">年龄 *</label>
                        <input type="number" name="age" class="input" required placeholder="请输入年龄">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">性别 *</label>
                        <div class="flex gap-2">
                            <label class="radio-label">
                                <input type="radio" name="gender" value="男" required> 男
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="gender" value="女" required> 女
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">联系电话 *</label>
                        <input type="tel" name="phone" class="input" required placeholder="请输入联系电话">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">既往病史</label>
                        <textarea name="medicalHistory" class="textarea" placeholder="请输入既往病史，如高血压、糖尿病等"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">过敏史</label>
                        <textarea name="allergies" class="textarea" placeholder="请输入过敏史，如青霉素过敏等"></textarea>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary w-full mt-2">保存患者信息</button>
            </form>
        </div>
    `;
}

function handleAddPatient(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const newPatient = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        phone: formData.get('phone'),
        medicalHistory: formData.get('medicalHistory') || '无',
        allergies: formData.get('allergies') || '无',
        createdAt: new Date().toISOString()
    };

    AppState.patients.unshift(newPatient);
    AppState.saveToStorage();

    showToast('患者添加成功');
    backToPatientList();
}

function backToPatientList() {
    AppState.currentView = 'main';
    AppState.currentPatientId = null;
    renderCurrentPage();
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
        <div class="page-header">
            <div class="flex items-center gap-2">
                <button class="btn btn-icon btn-outline" onclick="backToPatientList()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <h1 class="page-title">${patient.name}</h1>
            </div>
        </div>
        
        <div class="p-2">
            <!-- 患者基本信息 -->
            <div class="card mb-2">
                <h3 class="card-title mb-2">基本信息</h3>
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
                        <span>${patient.medicalHistory}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">过敏：</span>
                        <span>${patient.allergies}</span>
                    </div>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="card mb-2">
                <button class="btn btn-primary w-full mb-1" onclick="startConsultation('${patient.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加陪诊记录
                </button>
                <button class="btn btn-outline w-full" onclick="editPatient('${patient.id}')">
                    编辑信息
                </button>
            </div>
            
            <!-- 陪诊记录 -->
            <div class="card">
                <h3 class="card-title mb-2">陪诊记录 (${patientConsultations.length})</h3>
                ${patientConsultations.length === 0 ? `
                    <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                        暂无陪诊记录
                    </p>
                ` : patientConsultations.map(c => `
                    <div class="list-item" onclick="viewConsultation('${c.id}')">
                        <div class="flex justify-between items-center">
                            <div>
                                <div style="font-weight: 500;">${c.hospital} - ${c.department}</div>
                                <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                    ${formatDate(c.date)}
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
    AppState.currentPatientId = patientId;
    AppState.currentView = 'consultation';
    AppState.currentConsultationId = null;
    renderCurrentPage();
}

function editPatient(patientId) {
    showToast('编辑功能开发中...');
}

function viewConsultation(consultationId) {
    showToast('查看陪诊记录功能开发中...');
}

// ==================== 陪诊流程页面 ====================
function renderConsultationFlow(container) {
    const patient = AppState.patients.find(p => p.id === AppState.currentPatientId);

    if (!patient) {
        backToPatientList();
        return;
    }

    container.innerHTML = `
        <div class="page-header">
            <div class="flex items-center gap-2">
                <button class="btn btn-icon btn-outline" onclick="goToPatientDetail('${patient.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <div>
                    <h1 class="page-title">添加陪诊记录</h1>
                    <p class="page-subtitle">${patient.name}</p>
                </div>
            </div>
        </div>
        
        <div class="p-2">
            <form id="consultationForm" onsubmit="handleConsultationSubmit(event)">
                <div class="card mb-2">
                    <h3 class="card-title mb-2">就诊信息</h3>
                    
                    <div class="form-group">
                        <label class="form-label">就诊日期 *</label>
                        <input type="date" name="date" class="input" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医院 *</label>
                        <input type="text" name="hospital" class="input" required placeholder="请输入医院名称">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">科室</label>
                        <input type="text" name="department" class="input" placeholder="请输入就诊科室">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医生</label>
                        <input type="text" name="doctor" class="input" placeholder="请输入医生姓名">
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
                        <input type="date" name="onsetDate" class="input" placeholder="年/月/日">
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
                
                <button type="submit" class="btn btn-primary w-full">保存并生成报告</button>
            </form>
        </div>
    `;

    // 设置默认日期为今天
    document.querySelector('input[name="date"]').value = new Date().toISOString().split('T')[0];
    
    // 检查问题输入框数量，确保按钮状态正确
    checkQuestionCount();
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
        status: 'completed',
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
        <div class="page-header">
            <div>
                <h1 class="page-title">备忘录</h1>
                <p class="page-subtitle">${upcomingReminders.length} 个待办事项</p>
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
                    <div class="user-nickname">${escapeHtml(userNickname)}</div>
                    <div class="user-info-bottom">
                        <span class="user-welcome">欢迎回来</span>
                        <span class="user-id">ID: ${escapeHtml(userId)}</span>
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
                
                <div class="list-item" onclick="showToast('功能开发中...')">
                    <div class="flex justify-between items-center">
                        <span>通知设置</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
                
                <div class="list-item" onclick="showToast('功能开发中...')">
                    <div class="flex justify-between items-center">
                        <span>隐私设置</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="card mb-2">
                <h3 class="card-title mb-2">数据管理</h3>
                
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
                ${userInfo ?
            `<button class="btn btn-outline btn-lg btn-danger-outline w-full" onclick="logout()">退出登录</button>` :
            `<button class="btn btn-primary btn-lg w-full" onclick="goToLogin()">立即登录</button>`
        }
            </div>
            
            <div class="card">
                <h3 class="card-title mb-2">关于</h3>
                <div style="color: var(--text-secondary); line-height: 1.8;">
                    <p>版本：1.0.8</p>
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
    });
    renderCurrentPage();
});
