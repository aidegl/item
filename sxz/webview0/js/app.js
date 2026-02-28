// 全局实例
window.cozeWorkflow = new CozeWorkflow();
window.cozeChatAPI = new CozeChatAPI({
    botId: '7593641609586819106',
    userId: '111',
    messagesContainer: null,
    inputElement: '#chatInput',
    sendButton: '#send-btn',
    onMessageSent: (content) => {
        AppState.chatMessages.push({
            role: 'user',
            content: content,
            timestamp: new Date().toISOString()
        });
        AppState.saveToStorage();
        renderCurrentPage();
    },
    onStreamingStart: () => {
        AppState.chatMessages.push({
            role: 'assistant',
            content: '正在思考中...',
            timestamp: new Date().toISOString()
        });
        renderCurrentPage();
    },
    onStreamingUpdate: (content) => {
        const messages = AppState.chatMessages;
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant') {
                lastMsg.content = content;
                // 只更新最后一条消息的DOM，避免重新渲染整个页面
                updateLastAssistantMessage(content);
            }
        }
    },
    onStreamingEnd: () => {
        AppState.saveToStorage();
    }
});

// ==================== 应用状态管理 ====================
console.log('app.js 正在加载...');

// 全局暴露跳转函数
window.testPayment = function () {
    console.log('--- 支付测试开始 (Global) ---');
    try {
        const wx = window.wx;
        const targetUrl = '/pages/payment/index?type=test_payment&amount=0.01&timestamp=' + Date.now();

        if (typeof showToast === 'function') showToast('跳转中...');

        if (wx && wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
            wx.miniProgram.navigateTo({
                url: targetUrl,
                success: () => console.log('跳转指令发送成功'),
                fail: (err) => alert('跳转失败: ' + JSON.stringify(err))
            });
        } else {
            alert('环境不支持：请在微信小程序内打开，或等待 SDK 加载完毕');
        }
    } catch (e) {
        alert('发生异常: ' + e.message);
    }
};

// 语音转文字测试函数
window.testSpeechToText = function (type = 'default') {
    // 如果传入的是 default，尝试从当前 Tab 状态推断
    if (type === 'default' && AppState.currentConsultationTab) {
        type = AppState.currentConsultationTab;
        console.log(`[智能推断] 未指定类型，根据当前 Tab 推断为: ${type}`);
    }

    console.log(`--- 语音转文字测试 (${type}) (v1.0.20) ---`);

    // 检查是否已经登录
    const loginResult = checkLoginAndProceed();
    console.log('登录检查结果:', loginResult);

    if (!loginResult) {
        return;
    }

    // 优先尝试在小程序环境中直接跳转到原生录音页面
    try {
        const wx = window.wx;
        console.log('检测微信 SDK:', !!wx, !!(wx && wx.miniProgram));

        // [调试日志] 记录录音前的类型判断
        console.log(`🔍 [录音前检查] 准备启动录音，当前判断类型为: 【${type === 'pre' ? '诊前' : (type === 'post' ? '诊后' : '通用/默认')}】 (代码: ${type})`);

        if (wx && wx.miniProgram && typeof wx.miniProgram.navigateTo === 'function') {
            const targetUrl = `/pages/recorder/index?from=webview&type=${type}&timestamp=` + Date.now();
            console.log('准备跳转小程序原生页面:', targetUrl);

            wx.miniProgram.navigateTo({
                url: targetUrl,
                success: function () {
                    console.log('小程序跳转指令发送成功');
                },
                fail: function (err) {
                    console.error('小程序跳转失败:', err);
                    if (typeof showToast === 'function') showToast('跳转失败，请重试');
                }
            });
            // 已经交给小程序原生页面处理，这里不再在 WebView 内部启动录音 UI
            return;
        } else {
            console.log('当前环境不是小程序或 SDK 未就绪');
        }
    } catch (e) {
        console.error('跳转过程发生异常:', e);
    }

    // 检查是否已经在录音（仅用于 WebView 内部模拟录音 UI）
    if (window.isRecordingSTT) {
        stopRecordingUI();
        return;
    }

    startRecordingUI();
};

// --- 语音识别 UI 相关 ---
window.isRecordingSTT = false;
let recordingOverlay = null;

function startRecordingUI() {
    window.isRecordingSTT = true;

    // 移除之前的 WebView 模拟 UI，改用小程序原生 UI 触发
    // 但为了开发环境兼容性，如果不在小程序环境，保留模拟 UI
    const wx = window.wx;
    const isMiniProgram = wx && wx.miniProgram;

    if (!isMiniProgram) {
        // 非小程序环境，保留模拟 UI
        if (!recordingOverlay) {
            recordingOverlay = document.createElement('div');
            recordingOverlay.id = 'recording-overlay';
            recordingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
                transition: all 0.3s ease;
            `;

            recordingOverlay.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 24px; display: flex; flex-direction: column; align-items: center; width: 280px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div class="audio-waves" style="display: flex; align-items: center; gap: 4px; height: 60px; margin-bottom: 20px;">
                        <div class="wave-bar" style="width: 4px; height: 20px; background: #8b5cf6; border-radius: 2px; animation: wave 1s ease-in-out infinite;"></div>
                        <div class="wave-bar" style="width: 4px; height: 40px; background: #a78bfa; border-radius: 2px; animation: wave 1s ease-in-out infinite 0.1s;"></div>
                        <div class="wave-bar" style="width: 4px; height: 30px; background: #c4b5fd; border-radius: 2px; animation: wave 1s ease-in-out infinite 0.2s;"></div>
                        <div class="wave-bar" style="width: 4px; height: 50px; background: #8b5cf6; border-radius: 2px; animation: wave 1s ease-in-out infinite 0.3s;"></div>
                        <div class="wave-bar" style="width: 4px; height: 25px; background: #a78bfa; border-radius: 2px; animation: wave 1s ease-in-out infinite 0.4s;"></div>
                        <div class="wave-bar" style="width: 4px; height: 45px; background: #c4b5fd; border-radius: 2px; animation: wave 1s ease-in-out infinite 0.5s;"></div>
                    </div>
                    <div style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">正在录音...</div>
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">请说出您想转换的文字</div>
                    <button onclick="stopRecordingUI()" style="background: #ef4444; color: white; border: none; padding: 12px 30px; border-radius: 50px; font-size: 15px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px;">
                            <rect x="6" y="6" width="12" height="12"></rect>
                        </svg>
                        停止录音
                    </button>
                </div>
                <style>
                    @keyframes wave {
                        0%, 100% { height: 20px; opacity: 0.5; }
                        50% { height: 50px; opacity: 1; }
                    }
                </style>
            `;
            document.body.appendChild(recordingOverlay);
        } else {
            recordingOverlay.style.display = 'flex';
        }
    }

    // 调用小程序录音逻辑
    callMiniProgramSTT('start');
}

function stopRecordingUI() {
    window.isRecordingSTT = false;
    if (recordingOverlay) {
        recordingOverlay.style.display = 'none';
    }

    // 调用小程序停止录音逻辑
    callMiniProgramSTT('stop');
}

function callMiniProgramSTT(action) {
    const wx = window.wx;
    if (wx && wx.miniProgram && typeof wx.miniProgram.postMessage === 'function') {
        // 仅使用 postMessage 发送指令，不跳转页面，避免 WebView 重新加载
        wx.miniProgram.postMessage({
            data: {
                type: 'STT_ACTION',
                action: action,
                timestamp: Date.now()
            }
        });
        console.log('STT 指令通过 postMessage 发送成功:', action);
    } else {
        console.warn('当前环境不支持小程序 STT 接口');
        if (action === 'start') {
            setTimeout(() => {
                console.log('模拟识别中...');
                setTimeout(() => {
                    stopRecordingUI();
                    console.log('识别结果：这是一段模拟的语音转文字内容');
                }, 2000);
            }, 1000);
        }
    }
}

const AppState = {
    currentTab: 'ai',
    currentView: 'main',
    currentConsultationTab: 'pre', // 新增：记录当前就诊流程 Tab (pre/post)
    currentPatientId: null,
    currentConsultationId: null,
    onboardingStep: 1,
    patients: [],
    consultations: [],
    allUserConsultations: null, // 所有用户的陪诊记录（用于备忘录），初始为 null 表示未加载
    reminders: [],
    chatMessages: [],
    globalSettings: null,
    aiQuickQuestionsHidden: false,
    patientSearchTerm: '',

    // 加载全局设置
    async loadGlobalSettings() {
        console.log('[GlobalSettings] 开始加载全局设置...');
        try {
            if (typeof window.MingDaoYunAPI === 'undefined') {
                console.warn('[GlobalSettings] MingDaoYunAPI 未加载，跳过全局设置加载');
                return;
            }
            const api = new window.MingDaoYunAPI();
            const worksheetId = 'qjsz';
            const rowId = '9e5a5ed8-258b-4f20-a5c0-a1d9b9a97c2f';

            const result = await api.getData(rowId, worksheetId);
            if (result && result.success) {
                console.log('[GlobalSettings] 加载成功:', result.data);
                this.globalSettings = result.data;
            } else {
                console.error('[GlobalSettings] 加载失败:', result);
            }
        } catch (error) {
            console.error('[GlobalSettings] 加载异常:', error);
        }
    },

    init() {
        console.log('WebView 初始化, 当前 URL:', window.location.href);
        console.log('当前 Hash:', window.location.hash);
        this.loadFromStorage();
        this.chatMessages = [];
        this.saveToStorage();
        this.checkOnboarding();
        // 初始化时加载全局设置
        this.loadGlobalSettings();
        initDevMode(); // 初始化开发模式
        this.initHashChangeListener(); // 初始化 Hash 监听

        // 初始加载也检查一次 Hash (防止 redirectTo 时 hashchange 不触发)
        this.handleHashData(window.location.hash);
    },

    initHashChangeListener() {
        console.log('[步骤10] WebView 内部：启动 Hash 监听');
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            console.log('[步骤11] WebView 内部：监听到 Hash 变化, 新 Hash:', hash);
            this.handleHashData(hash);
        });

        // 兼容性处理：每 500ms 检查一次 hash，防止某些环境 hashchange 不触发
        setInterval(() => {
            const currentHash = window.location.hash;
            if (currentHash && currentHash.includes('stt_result=')) {
                if (!this._lastProcessedHash || this._lastProcessedHash !== currentHash) {
                    console.log('[步骤11-心跳] WebView 内部：主动检测到 Hash 数据');
                    this.handleHashData(currentHash);
                    this._lastProcessedHash = currentHash;
                }
            }
        }, 500);
    },

    handleHashData(hash) {
        if (!hash) return;
        console.log('[步骤12] WebView 内部：开始解析数据, Hash:', hash.substring(0, 50) + '...');

        // 处理 STT 结果
        if (hash.includes('stt_result=')) {
            // 使用更健壮的解析方式
            const hashClean = hash.startsWith('#') ? hash.substring(1) : hash;
            const params = new URLSearchParams(hashClean);

            const resultText = params.get('stt_result');
            let sttType = params.get('stt_type');

            // 尝试从原始 hash 字符串中正则表达式提取作为兜底
            if (!sttType) {
                const match = hash.match(/stt_type=([^&]*)/);
                if (match) sttType = decodeURIComponent(match[1]);
            }

            sttType = sttType || 'default';

            // 额外清理 sttType，防止包含多余空格或引号
            sttType = sttType.trim().replace(/['"]/g, '');

            // [强校验] 只有 'pre' 和 'post' 是合法值。如果是 'default' 或其他值，强制使用当前 Tab 状态
            // 用户明确要求：没有“通用”这个说法，必须是诊前或诊后，以当前选中的 Tab 为准
            if (sttType !== 'pre' && sttType !== 'post') {
                console.warn(`[类型修正] 接收到的类型 '${sttType}' 不合法或为通用，正在根据当前 Tab 状态修正...`);
                if (this.currentConsultationTab) {
                    sttType = this.currentConsultationTab;
                    console.log(`[类型修正] 已修正为: ${sttType} (来源于 UI Tab 选中状态)`);
                } else {
                    sttType = 'pre'; // 极端兜底
                    console.log(`[类型修正] 无 Tab 状态，兜底修正为: ${sttType}`);
                }
            }

            if (resultText && this._lastProcessedHash !== hash) {
                // [调试日志] 详细打印返回结果的类型判断
                console.group('🔍 [录音后检查] 收到识别结果');
                console.log(`原始 Hash: ${hash}`);
                console.log(`解析到的文本长度: ${resultText.length}`);
                console.log(`解析到的类型 (stt_type): ${sttType}`);
                console.log(`最终判断类型: 【${sttType === 'pre' ? '诊前' : (sttType === 'post' ? '诊后' : '通用/默认')}】`);
                console.groupEnd();

                console.log(`✅ [WebView 核心日志] 收到识别结果。类型: ${sttType}, 长度: ${resultText.length}`);
                console.log('[步骤13] WebView 内部：成功解析识别文本');
                console.log(`🏥 [关键节点状态] 识别文本解析成功，当前业务类型为：${sttType === 'pre' ? '诊前 (Pre-Consultation)' : (sttType === 'post' ? '诊后 (Post-Consultation)' : '通用 (General)')}`);

                // 关闭录音 UI 并显示结果
                stopRecordingUI();

                // 调用 Coze 工作流处理识别结果
                if (window.cozeWorkflow) {
                    console.log(`[步骤14] WebView 内部：准备调用 Coze STT 工作流 (类型: ${sttType})`);
                    showLoading('AI 正在智能识别并提取信息，请稍候 (约 5-8 秒)...');
                    window.cozeWorkflow.runSTT(resultText).then((response) => {
                        console.log('[步骤15] WebView 内部：Coze STT 处理返回成功');
                        hideLoading();
                        if (response.success && response.data && response.data.data) {
                            // 传入 sttType 供弹窗过滤字段
                            showVerificationPopup(response.data.data, resultText, sttType);
                        } else {
                            console.error('Coze 提取失败:', response);
                            showToast('AI 提取失败，请手动填写');
                        }
                    }).catch(err => {
                        console.error('[步骤15] WebView 内部：Coze 调用异常', err);
                        hideLoading();
                        showToast('AI 提取异常');
                    });
                } else {
                    console.error('[步骤14] 失败：window.cozeWorkflow 未初始化');
                }

                // 清理 Hash，防止心跳重复触发
                this._lastProcessedHash = hash;
                window.history.replaceState(null, null, window.location.pathname + window.location.search);
                console.log('[步骤16] WebView 内部：Hash 已清理');
            }
        }
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
                    const result = await window.cozeWorkflow.runOCR(fileUrl);
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

            // 开发环境 CORS 错误降级处理 (更加宽容的判断)
            const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError';

            if (isLocal && isNetworkError) {
                console.warn('检测到本地开发环境 CORS/网络 错误，使用模拟上传数据');

                const loadingMsgIndex = AppState.chatMessages.findIndex(msg => msg.id === loadingId);
                if (loadingMsgIndex !== -1) {
                    // 移除 loading 消息
                    AppState.chatMessages.splice(loadingMsgIndex, 1);

                    const mockUrl = "https://via.placeholder.com/300x400?text=Mock+Image";

                    // 模拟用户发送图片
                    AppState.chatMessages.push({
                        role: 'user',
                        type: 'image',
                        content: mockUrl,
                        timestamp: new Date().toISOString()
                    });

                    // 模拟系统提示
                    AppState.chatMessages.push({
                        role: 'system',
                        content: `(开发环境模拟) 文件上传成功！\n临时链接: ${mockUrl}`,
                        timestamp: new Date().toISOString()
                    });

                    // 模拟助手回复
                    AppState.chatMessages.push({
                        role: 'assistant',
                        content: '已收到您的文件链接 (模拟)。目前仅支持链接接收，后续将升级深度分析功能。',
                        timestamp: new Date().toISOString()
                    });
                }
                renderCurrentPage();
                return;
            }

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

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    AppState.aiQuickQuestionsHidden = true;
    input.value = '';

    if (window.cozeChatAPI) {
        window.cozeChatAPI.sendMessage(message).catch(err => {
            console.error('Coze Chat API Error:', err);
            AppState.chatMessages.push({
                role: 'assistant',
                content: '发生错误: ' + err.message,
                timestamp: new Date().toISOString()
            });
            AppState.saveToStorage();
            renderCurrentPage();
        });
    } else {
        AppState.chatMessages.push({
            role: 'assistant',
            content: '错误: CozeChatAPI 未初始化',
            timestamp: new Date().toISOString()
        });
        renderCurrentPage();
    }
}

function updateLastAssistantMessage(content) {
    const messages = document.querySelectorAll('.chat-message.assistant');
    const lastMessage = messages[messages.length - 1];

    if (lastMessage) {
        const messageText = lastMessage.querySelector('.message-text');
        if (messageText) {
            try {
                if (typeof marked !== 'undefined' && marked.parse) {
                    messageText.innerHTML = marked.parse(content);
                } else {
                    messageText.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
                }
            } catch (e) {
                console.error('Markdown 渲染失败:', e);
                messageText.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
            }
        }
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

// ==================== 下拉刷新组件 ====================
class PullToRefresh {
    constructor(container, onRefresh) {
        this.container = container;
        this.onRefresh = onRefresh;
        this.startY = 0;
        this.currentY = 0;
        this.isDragging = false;
        this.isRefreshing = false;
        this.threshold = 60; // 触发刷新的阈值
        this.maxPull = 100; // 最大下拉距离

        this.init();
    }

    init() {
        // 创建下拉刷新提示元素
        this.refreshIndicator = document.createElement('div');
        this.refreshIndicator.className = 'ptr-indicator';
        this.refreshIndicator.style.cssText = `
            height: 0;
            overflow: hidden;
            text-align: center;
            font-size: 14px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: height 0.2s;
            width: 100%;
        `;
        this.refreshIndicator.innerHTML = '下拉刷新...';

        // 插入到容器最前面
        if (this.container.firstChild) {
            this.container.insertBefore(this.refreshIndicator, this.container.firstChild);
        } else {
            this.container.appendChild(this.refreshIndicator);
        }

        // 绑定事件
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleTouchStart(e) {
        // 只有当页面滚动到顶部时才触发
        const scrollTop = this.container.scrollTop || window.scrollY;
        if (scrollTop > 0) return;

        this.startY = e.touches[0].clientY;
        // 只有在顶部向下拉时才触发
        this.isDragging = true;
    }

    handleTouchMove(e) {
        if (!this.isDragging || this.isRefreshing) return;

        const scrollTop = this.container.scrollTop || window.scrollY;
        if (scrollTop > 0) {
            this.isDragging = false;
            return;
        }

        this.currentY = e.touches[0].clientY;
        const diff = this.currentY - this.startY;

        if (diff > 0) {
            // 阻止默认滚动行为
            if (e.cancelable) e.preventDefault();

            // 增加阻尼效果
            const move = Math.min(diff * 0.5, this.maxPull);
            this.refreshIndicator.style.height = `${move}px`;

            if (move >= this.threshold) {
                this.refreshIndicator.innerHTML = '释放刷新...';
            } else {
                this.refreshIndicator.innerHTML = '下拉刷新...';
            }
        }
    }

    async handleTouchEnd(e) {
        if (!this.isDragging || this.isRefreshing) return;

        this.isDragging = false;
        const diff = this.currentY - this.startY;

        if (diff * 0.5 >= this.threshold) {
            this.isRefreshing = true;
            this.refreshIndicator.style.height = '40px';
            this.refreshIndicator.innerHTML = '正在刷新...';

            try {
                await this.onRefresh();
            } catch (err) {
                console.error('Refresh failed:', err);
                showToast('刷新失败');
            } finally {
                // 注意：如果 refresh 导致页面重绘，这里的 finally 可能不会按预期执行（因为 DOM 被销毁）
                // 但如果是在当前 DOM 上更新，这里是必要的
                if (document.body.contains(this.refreshIndicator)) {
                    this.isRefreshing = false;
                    this.refreshIndicator.style.height = '0';
                    setTimeout(() => {
                        if (this.refreshIndicator) this.refreshIndicator.innerHTML = '下拉刷新...';
                    }, 200);
                }
            }
        } else {
            this.refreshIndicator.style.height = '0';
        }

        this.startY = 0;
        this.currentY = 0;
    }
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
                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                        ${isLoggedIn ? `共 ${AppState.patients.length} 位患者` : '请先登录'}
                    </div>
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

    // 初始化下拉刷新
    const listContainer = document.getElementById('patients-list-container');
    if (listContainer && isLoggedIn) {
        new PullToRefresh(listContainer, async () => {
            let openid = '';
            if (window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function') {
                const userInfo = window.wechatLogin.getUserInfo();
                openid = userInfo?.openid || '';
            }
            if (!openid) {
                openid = localStorage.getItem('openid') || '';
            }

            if (openid) {
                // 这里调用 fetchPatientData，它会更新数据并重新渲染页面
                // 由于 renderCurrentPage 会重绘 DOM，导致 PullToRefresh 实例销毁
                // 这是符合预期的
                await fetchPatientData(openid);
            }
        });
    }
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

// 解析明道云图片原图字段
function parseMingDaoOriginalPic(value) {
    if (!value) return '';
    // 如果已经是http链接
    if (typeof value === 'string' && value.startsWith('http')) {
        // 如果是明道云链接，尝试去除参数获取原图
        if (value.includes('mingdaoyun.cn')) {
            return value.split('?')[0];
        }
        // 其他链接（如Coze带签名链接）直接返回，保留参数
        return value;
    }
    try {
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                if (parsed.length > 0) {
                    // 优先使用 original_file_full_path
                    return parsed[0].original_file_full_path || parsed[0].file_path || '';
                }
                return ''; // 空数组返回空字符串
            }
        }
    } catch (e) {
        console.warn('Failed to parse MingDao original pic:', e);
    }
    // 如果不是JSON格式且不以http开头，但值不为空，可能是旧数据或异常数据
    // 此时如果不确定是图片URL，最好返回空，或者原样返回（视情况而定）
    // 这里为了避免显示空框，如果看起来像JSON但解析失败或为空，上面已经处理
    // 如果是普通字符串且不含http，可能无效
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        return '';
    }
    return value;
}

// 解析明道云图片字段
function parseMingDaoPic(value) {
    if (!value) return '';
    if (typeof value === 'string' && value.startsWith('http')) return value;
    try {
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                if (parsed.length > 0) {
                    // 优先使用 large_thumbnail_full_path，其次 file_path
                    return parsed[0].large_thumbnail_full_path || parsed[0].file_path || parsed[0].thumbnail_path || '';
                }
                return ''; // 空数组返回空字符串
            }
        }
    } catch (e) {
        console.warn('Failed to parse MingDao pic:', e);
    }
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        return '';
    }
    return value;
}

async function loadConsultations(patientId) {
    console.log('开始加载陪诊记录, patientId:', patientId);
    try {
        if (typeof window.MingDaoYunArrayAPI === 'undefined') {
            console.error('MingDaoYunArrayAPI未加载');
            return;
        }

        const queryParams = {
            appKey: '59c7bdc2cdf74e5e',
            sign: 'YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==',
            worksheetId: 'pzfwjl',
            viewId: '',
            pageSize: 50,
            pageIndex: 1,
            keyWords: '',
            listType: 0,
            controls: [],
            sortId: 'ctime',
            isAsc: 'false',
            notGetTotal: 'false',
            useControlId: 'false',
            getSystemControl: 'true',
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
                zqbg: parseMingDaoPic(row.zqbg), // 诊前报告
                zhbg: parseMingDaoPic(row.zhbg), // 诊后报告
                shouzhen: (function (val) {
                    if (val == '1' || val == 1) return 1;
                    if (Array.isArray(val) && val[0] == '1') return 1;
                    if (typeof val === 'string' && val.includes('1')) return 1; // 处理可能出现的 "[\"1\"]" 格式
                    return 0;
                })(row.shouzhen),
                fuid: row.fuid,
                zhuangtai: row.zhuangtai, // 增加状态字段
                txhz: row.txhz, // 提醒状态字段: 0=待提醒, 1=已提醒
                status: (function () {
                    // 1. 如果信息完整，自动判定为已完成
                    if (row.specialNote && row.specialNote !== '未记录' && row.specialNote !== '') {
                        return 'completed';
                    }
                    // 2. 如果手动设置了已提醒，返回已提醒
                    if (row.zhuangtai === '已提醒' || row.txhz === '1' || row.txhz === 1) {
                        return 'reminded';
                    }
                    // 3. 默认为待提醒（或原有的 pending）
                    return 'pending';
                })(),
                createdAt: row.ctime
            };
        });
        AppState.saveToStorage();
        console.log('映射后的陪诊记录:', AppState.consultations);
    } catch (error) {
        console.error('加载陪诊记录失败:', error);
    }
}

async function loadAllUserConsultations() {
    const isLoggedIn = window.wechatLogin && window.wechatLogin.isLoggedIn();
    if (!isLoggedIn) {
        console.log('用户未登录，不加载备忘录数据');
        AppState.allUserConsultations = [];
        return;
    }

    console.log('开始加载所有用户陪诊记录 (用于备忘录)');
    try {
        if (typeof window.MingDaoYunArrayAPI === 'undefined') {
            console.error('MingDaoYunArrayAPI未加载');
            return;
        }

        // 获取当前用户ID
        // 获取当前登录用户关联的患者列表
        let patientIds = [];
        const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function' ? window.wechatLogin.getUserInfo() : null;
        if (userInfo && userInfo.raw && userInfo.raw.relatedPatient) {
            try {
                // 如果 relatedPatient 是字符串，先解析
                const related = typeof userInfo.raw.relatedPatient === 'string'
                    ? JSON.parse(userInfo.raw.relatedPatient)
                    : userInfo.raw.relatedPatient;

                if (Array.isArray(related)) {
                    patientIds = related.map(p => p.sid).filter(sid => sid);
                }
            } catch (e) {
                console.error('解析关联患者数据失败:', e);
            }
        }

        console.log('加载备忘录数据, 关联患者ID列表:', patientIds);

        if (patientIds.length === 0) {
            console.warn('未获取到关联患者列表，无法加载备忘录数据');
            AppState.allUserConsultations = [];
            return;
        }

        const queryParams = {
            appKey: '59c7bdc2cdf74e5e',
            sign: 'YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==',
            worksheetId: 'pzfwjl',
            viewId: '',
            pageSize: 100,
            pageIndex: 1,
            keyWords: '',
            listType: 0,
            controls: [],
            sortId: 'ctime',
            isAsc: 'false',
            notGetTotal: 'false',
            useControlId: 'false',
            getSystemControl: 'true',
            filters: [
                {
                    "controlId": "patientId",
                    "dataType": 2,
                    "spliceType": 1,
                    "filterType": 24,
                    "values": patientIds // 使用 values 进行多选查询
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

        console.log('加载备忘录请求体 (pzfwjl):', JSON.stringify(queryParams, null, 2));

        const api = new window.MingDaoYunArrayAPI();
        const result = await api.getData(queryParams);

        if (result.success && result.data && Array.isArray(result.data.rows)) {
            console.log(`成功加载 ${result.data.rows.length} 条记录`);
            AppState.allUserConsultations = result.data.rows.map(row => {
                // 同样需要处理关联字段
                let pId = row.patientId;
                if (typeof pId === 'string' && pId.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(pId);
                        pId = parsed[0]?.sid || pId;
                    } catch (e) { }
                } else if (Array.isArray(pId)) {
                    pId = pId[0]?.sid || pId;
                }

                // 获取患者名称
                let pName = '未知患者';
                if (row.patientId_name) {
                    pName = row.patientId_name;
                } else if (typeof row.patientId === 'string' && row.patientId.startsWith('[')) {
                    try {
                        const parsed = JSON.parse(row.patientId);
                        pName = parsed[0]?.name || '未知患者';
                    } catch (e) { }
                } else if (Array.isArray(row.patientId)) {
                    pName = row.patientId[0]?.name || '未知患者';
                }

                return {
                    id: row.rowid || row.rowId,
                    patientId: pId,
                    patientName: pName,
                    date: row.appointmentTime,
                    hospital: row.medicalOrgName,
                    department: row.departmentName,
                    doctor: row.doctorName,
                    followupDate: row.hxfcap,
                    zhuangtai: row.zhuangtai,
                    txhz: row.txhz,
                    specialNote: row.specialNote,
                    zqbg: parseMingDaoPic(row.zqbg),
                    zhbg: parseMingDaoPic(row.zhbg),
                    status: (function () {
                        if (row.zhuangtai === '已完成' || (row.specialNote && row.specialNote !== '未记录' && row.specialNote !== '')) {
                            return 'completed';
                        }
                        if (row.zhuangtai === '已提醒' || row.txhz === '1' || row.txhz === 1) {
                            return 'reminded';
                        }
                        return 'pending';
                    })()
                };
            });
            console.log('加载到备忘录数据成功:', AppState.allUserConsultations.length, '条');
        } else {
            console.warn('加载备忘录数据未返回预期格式:', result);
            AppState.allUserConsultations = []; // 即使失败也设为空数组，避免循环调用
        }
    } catch (error) {
        console.error('加载备忘录数据异常:', error);
        AppState.allUserConsultations = []; // 异常也设为空数组
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
        userRowId = rawUser.rowid || rawUser.rowId || userInfo.id;
    }

    console.log('当前登录用户rowid:', userRowId);

    const ownerId = 'ae75cf2e-0f73-4137-9e99-116d92c45a47';

    const apiControls = [
        { controlId: 'name', value: patientData.name },
        { controlId: 'gender', value: patientData.gender, valueType: '' },
        { controlId: 'phone', value: patientData.phone },
        { controlId: 'pastMedicalHistory', value: patientData.medicalHistory },
        { controlId: 'escortRecords', value: '' },
        { controlId: 'age', value: String(patientData.age) },
        { controlId: 'yonghu', value: userRowId },
        { controlId: 'del', value: '0' },
        { controlId: 'allergy_history', value: patientData.allergies },
        { controlId: '_owner', value: ownerId }
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
                    <div class="list-item" onclick="viewConsultation('${c.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px;">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                            <div style="width: 4px; height: 46px; border-radius: 3px; background-color: ${c.status === 'completed' ? 'var(--success-color)' : (c.status === 'reminded' ? 'var(--primary-color)' : 'var(--warning-color)')}; flex-shrink: 0;"></div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${c.hospital}${c.department ? ` - ${c.department}` : ''}${c.doctor ? ` - ${c.doctor}` : ''}
                                </div>
                                <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                    ${formatDate(c.date)}
                                </div>
                            </div>
                        </div>
                        <!-- Status indicator removed as per user request -->
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // 初始化下拉刷新
    const listContainer = document.getElementById('orders-list-container');
    if (listContainer) {
        new PullToRefresh(listContainer, async () => {
            if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
                await new Promise(resolve => setTimeout(resolve, 800)); // 模拟刷新
                renderCurrentPage();
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    }
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
    let consultation = AppState.consultations.find(c => c.id === consultationId);

    // 如果在当前患者记录中没找到，在所有记录中找（针对从备忘录进入的情况）
    if (!consultation) {
        consultation = AppState.allUserConsultations.find(c => c.id === consultationId);
        if (consultation) {
            // 将其加入到当前记录列表中，以便详情页可以访问
            AppState.consultations = [consultation];
        }
    }

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
    // 更新全局状态
    AppState.currentConsultationTab = tabName;
    console.log(`[Tab切换] 切换到: ${tabName === 'pre' ? '诊前' : '诊后'}`);

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
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // 添加文件选择事件处理
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        showToast('正在上传并识别图片...');

        // 构造 FormData
        const formData = new FormData();
        formData.append('file', file);

        // 上传到临时存储
        fetch('https://100000whys.cn/api/tmp.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                const fileUrl = data.url || data.link;
                if (!fileUrl) throw new Error('上传失败');

                if (window.cozeWorkflow) {
                    showToast('AI 正在提取信息...', 5000);
                    return window.cozeWorkflow.runOCR(fileUrl);
                } else {
                    throw new Error('OCR服务未就绪');
                }
            })
            .then(response => {
                if (response && response.success && response.data && response.data.data) {
                    // 显示核对弹窗 (OCR 主要用于诊后检查报告)
                    showVerificationPopup(response.data.data, 'OCR识别结果', 'post');
                } else if (response) {
                    showToast('AI 提取失败，请手动填写');
                }
            })
            .catch(error => {
                console.error('OCR failed:', error);

                // 开发环境 CORS 错误降级处理 (更加宽容的判断)
                const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                const isNetworkError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError';

                if (isLocal && isNetworkError) {
                    console.warn('检测到本地开发环境 CORS/网络 错误，使用模拟数据进行测试');
                    showToast('开发环境: 使用模拟OCR数据', 2000);

                    setTimeout(() => {
                        const mockData = {
                            hospital: "测试医院",
                            department: "内科",
                            doctor: "测试医生",
                            diagnosis: "模拟诊断结果：上呼吸道感染",
                            checkResult: "模拟检查结果：各项指标正常",
                            advice: "模拟医嘱：多喝水，注意休息"
                        };
                        if (typeof showVerificationPopup === 'function') {
                            showVerificationPopup(mockData, 'OCR识别结果(模拟)', 'post');
                        } else {
                            console.error('showVerificationPopup not found');
                            showToast('模拟数据准备就绪，但弹窗组件未找到');
                        }
                    }, 1000);
                    return;
                }

                showToast('识别失败: ' + error.message);
            });
    });

    // 触发文件选择
    document.body.appendChild(fileInput);
    fileInput.click();

    // 清理
    setTimeout(() => {
        if (fileInput.parentNode) {
            document.body.removeChild(fileInput);
        }
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
                <input type="hidden" name="zqbg" id="zqbg_input" value="${isEditMode ? (consultation.zqbg || '') : ''}">
                <div class="card mb-2">
                    <h3 class="card-title mb-2">语音记录</h3>
                    <div class="upload-voice-section" style="padding: 16px;">
                        <button type="button" class="upload-btn" onclick="testSpeechToText('pre')" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; font-size: 14px; font-weight: 400; width: 100%;">
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
                                    <input type="radio" name="hasFirstRecord" value="1" ${isEditMode && consultation.fuid ? 'checked' : ''} onchange="handleHasFirstRecordChange(this)" style="width: 14px; height: 14px;">
                                    <span style="font-size: 13px; color: var(--text-primary);">是</span>
                                </label>
                                <label class="radio-item" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                    <input type="radio" name="hasFirstRecord" value="0" ${isEditMode && !consultation.fuid ? 'checked' : ''} onchange="handleHasFirstRecordChange(this)" style="width: 14px; height: 14px;">
                                    <span style="font-size: 13px; color: var(--text-primary);">否</span>
                                </label>
                            </div>
                        </div>

                        <div id="first-record-selector" style="display: ${isEditMode && consultation.fuid ? 'block' : 'none'}; margin-top: 16px; border-top: 1px solid rgba(59, 130, 246, 0.1); pt-12;">
                            <label class="form-label" style="font-size: 13px; color: var(--text-secondary); margin-top: 12px;">请选择该复诊的首次陪诊记录 *</label>
                            <select name="fuid" class="input" onchange="handleFirstRecordSelect(this)" style="height: 38px; margin-top: 6px; font-size: 13px; background-color: white;">
                                <option value="">-- 请选择记录 --</option>
                                ${AppState.consultations
            .filter(c => c.patientId === AppState.currentPatientId && (c.shouzhen == 1 || c.shouzhen == '1') && c.id !== (isEditMode ? consultation.id : ''))
            .map(c => `
                                        <option value="${c.id}" ${isEditMode && consultation.fuid === c.id ? 'selected' : ''}>
                                            ${formatDate(c.date)} - ${c.hospital}${c.department ? ` - ${c.department}` : ''}${c.doctor ? ` - ${c.doctor}` : ''}
                                        </option>
                                    `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">就诊日期 *</label>
                        <input type="datetime-local" name="date" class="input" style="height: 40px; resize: none;" value="${isEditMode ? formatDateTimeForInput(consultation.date) : formatDateTimeForInput(new Date())}">
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
                
                ${isEditMode ? `
                <div class="card mb-2">
                    <h3 class="card-title mb-2">诊前报告</h3>
                    <div id="pre-report-status" style="display: none; padding: 20px; text-align: center; color: var(--primary-color);">
                        <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--primary-color); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px; vertical-align: middle;"></div>
                        <span style="vertical-align: middle;">正在生成诊前报告...</span>
                    </div>
                    <div id="pre-report-preview" style="display: ${isEditMode && parseMingDaoOriginalPic(consultation.zqbg) ? 'block' : 'none'}; margin-top: 12px; text-align: center;">
                        <div class="report-file-item" data-original="${isEditMode ? parseMingDaoOriginalPic(consultation.zqbg) : ''}" onclick="previewReportImage(this.dataset.original)" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background-color: #f8f9fa; border: 1px dashed #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 48px; height: 48px; color: #3b82f6; margin-bottom: 12px;">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                                <path d="M10 9H8"></path>
                            </svg>
                            <div style="font-size: 14px; color: #4b5563; font-weight: 500;">点击查看诊前报告图片</div>
                            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">高清原图</div>
                        </div>
                        <div style="margin-top: 12px;">
                            <button type="button" class="btn btn-outline w-full" onclick="copyReportScript('pre')" style="border-radius: 8px; font-size: 14px; padding: 8px; border-color: var(--primary-color); color: var(--primary-color);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: text-bottom;">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                复制话术给患者
                            </button>
                        </div>
                    </div>
                </div>

                    <div style="margin-bottom: 12px;">
                        ${consultation.zqbg ? `
                            <button type="button" class="btn btn-primary w-full" onclick="generatePreReport('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500; background-color: #3b82f6; color: white;">
                                重新生成
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary w-full" id="btn-generate-pre" onclick="generatePreReport('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500; background-color: #3b82f6; color: white;">
                                生成诊前报告
                            </button>
                        `}
                    </div>
                ` : ''}

                ${isEditMode ? `
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    <button type="button" class="btn btn-danger w-full" onclick="handleConsultationDelete('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500;">
                        删除陪诊记录
                    </button>
                </div>
                ` : ''}
                </div>
                
                <!-- 诊后内容 -->
                <div id="post-tab" class="tab-content hidden">
                    <input type="hidden" name="zhbg" id="zhbg_input" value="${isEditMode ? (consultation.zhbg || '') : ''}">
                    <div class="card mb-2">
                        <h3 class="card-title mb-2">辅助功能</h3>
                        <div class="upload-buttons-section" style="padding: 8px 0; display: flex; gap: 8px;">
                            <button type="button" class="upload-btn" onclick="testSpeechToText('post')" style="display: flex; align-items: center; padding: 8px 16px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; flex: 1; font-size: 14px; font-weight: 400; gap: 0;">
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
                            <button type="button" class="ocr-btn" onclick="ocrRecognition()" style="display: flex; align-items: center; padding: 8px 16px; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); cursor: pointer; flex: 1; font-size: 14px; font-weight: 400;">
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
                            <label class="form-label">复诊日期</label>
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
                    <div class="card mb-2">
                        <h3 class="card-title mb-2">诊后报告</h3>
                        <div id="post-report-status" style="display: none; padding: 20px; text-align: center; color: var(--primary-color);">
                            <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid var(--primary-color); border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px; vertical-align: middle;"></div>
                            <span style="vertical-align: middle;">正在生成诊后报告...</span>
                        </div>
                        <div id="post-report-preview" style="display: ${isEditMode && parseMingDaoOriginalPic(consultation.zhbg) ? 'block' : 'none'}; margin-top: 12px; text-align: center;">
                            <div class="report-file-item" data-original="${isEditMode ? parseMingDaoOriginalPic(consultation.zhbg) : ''}" onclick="previewReportImage(this.dataset.original)" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background-color: #f8f9fa; border: 1px dashed #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 48px; height: 48px; color: #3b82f6; margin-bottom: 12px;">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <path d="M16 13H8"></path>
                                    <path d="M16 17H8"></path>
                                    <path d="M10 9H8"></path>
                                </svg>
                                <div style="font-size: 14px; color: #4b5563; font-weight: 500;">点击查看诊后报告图片</div>
                                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">高清原图</div>
                            </div>
                            <div style="margin-top: 12px;">
                                <button type="button" class="btn btn-outline w-full" onclick="copyReportScript('post')" style="border-radius: 8px; font-size: 14px; padding: 8px; border-color: var(--primary-color); color: var(--primary-color);">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: text-bottom;">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    复制话术给患者
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 12px;">
                        ${consultation.zhbg ? `
                            <button type="button" class="btn btn-primary w-full" onclick="generatePostReport('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500; background-color: #3b82f6; color: white;">
                                重新生成
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary w-full" onclick="generatePostReport('${consultation.id}')" style="height: 44px; border-radius: 12px; font-size: 16px; font-weight: 500; background-color: #3b82f6; color: white;">
                                生成诊后报告
                            </button>
                        `}
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
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

    let fuid = null;
    if (shouzhen === '0') {
        const hasFirstRecord = formData.get('hasFirstRecord');
        if (!hasFirstRecord) {
            showConfirmDialog('请确认系统是否记录了首次陪诊记录！', null, null, '去填写', '');
            return;
        }
        if (hasFirstRecord === '1') {
            fuid = formData.get('fuid');
            if (!fuid) {
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

    // 获取当前登录用户的rowid
    let userRowId = null;
    const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function' ? window.wechatLogin.getUserInfo() : null;
    if (userInfo) {
        const rawUser = userInfo.raw || userInfo;
        userRowId = rawUser.rowid || rawUser.rowId || userInfo.id;
    }
    if (!userRowId) {
        userRowId = localStorage.getItem('openid') || 'ae75cf2e-0f73-4137-9e99-116d92c45a47';
    }

    // 获取患者信息（用于创建/更新患者信息表和陪诊记录）
    let patientName = '';
    let patientPhone = '';
    let finalPatientId = AppState.currentPatientId;

    if (AppState.currentPatientId) {
        const patient = AppState.patients.find(p => p.id === AppState.currentPatientId);
        if (patient) {
            patientName = patient.name || '';
            patientPhone = patient.phone || '';
        }
    }

    // 如果患者信息不完整，尝试从表单获取（兼容直接创建陪诊记录的情况）
    if (!patientName || !patientPhone) {
        // 注意：陪诊记录表单中可能没有name和phone字段，这里只是作为兜底
        console.warn('患者信息不完整，尝试从其他来源获取');
    }

    // 确保患者信息表中存在该患者（通过name和phone匹配）
    if (patientName && patientPhone && !isEditMode) {
        try {
            // 检查患者信息表中是否已存在该患者
            if (typeof window.MingDaoYunArrayAPI === 'undefined') {
                console.warn('MingDaoYunArrayAPI组件未加载，跳过患者信息检查');
            } else {
                const checkApi = new window.MingDaoYunArrayAPI();
                const checkResult = await checkApi.getData({
                    worksheetId: 'hzxxgl',
                    pageSize: 1,
                    pageIndex: 1,
                    filters: [
                        {
                            "controlId": "name",
                            "dataType": 2,
                            "spliceType": 1,
                            "filterType": 2, // 等于
                            "value": patientName
                        },
                        {
                            "controlId": "phone",
                            "dataType": 2,
                            "spliceType": 1,
                            "filterType": 2, // 等于
                            "value": patientPhone
                        },
                        {
                            "controlId": "del",
                            "dataType": 2,
                            "spliceType": 1,
                            "filterType": 2,
                            "value": 0
                        }
                    ]
                });

                if (checkResult.success && checkResult.data && checkResult.data.rows && checkResult.data.rows.length > 0) {
                    // 患者已存在，使用已有的患者ID
                    const existingPatient = checkResult.data.rows[0];
                    finalPatientId = existingPatient.rowid || existingPatient.rowId || existingPatient.id;
                    console.log('患者信息表中已存在该患者，使用已有ID:', finalPatientId);
                } else {
                    // 患者不存在，创建新患者记录
                    if (typeof window.MingDaoYunAddAPI === 'undefined') {
                        console.warn('MingDaoYunAddAPI组件未加载，无法创建患者记录');
                    } else {
                        const patient = AppState.patients.find(p => p.id === AppState.currentPatientId);
                        if (patient) {
                            const addApi = new window.MingDaoYunAddAPI();
                            const ownerId = 'ae75cf2e-0f73-4137-9e99-116d92c45a47';
                            const patientControls = [
                                { controlId: 'name', value: patient.name },
                                { controlId: 'gender', value: patient.gender, valueType: '' },
                                { controlId: 'phone', value: patient.phone },
                                { controlId: 'pastMedicalHistory', value: patient.medicalHistory || '无' },
                                { controlId: 'escortRecords', value: '' },
                                { controlId: 'age', value: String(patient.age) },
                                { controlId: 'yonghu', value: userRowId },
                                { controlId: 'del', value: '0' },
                                { controlId: 'allergy_history', value: patient.allergies || '无' },
                                { controlId: '_owner', value: ownerId }
                            ];

                            const addResult = await addApi.getData('hzxxgl', patientControls);
                            if (addResult.success) {
                                const newPatientId = typeof addResult.data === 'string' ? addResult.data : (addResult.data?.rowid || addResult.data?.rowId);
                                finalPatientId = newPatientId;
                                console.log('患者信息表中已创建新患者，ID:', finalPatientId);

                                // 更新本地患者列表
                                const newPatient = {
                                    id: String(newPatientId),
                                    ...patient
                                };
                                const existingIndex = AppState.patients.findIndex(p => p.id === AppState.currentPatientId);
                                if (existingIndex !== -1) {
                                    AppState.patients[existingIndex] = newPatient;
                                } else {
                                    AppState.patients.unshift(newPatient);
                                }
                                AppState.currentPatientId = String(newPatientId);
                                AppState.saveToStorage();
                            } else {
                                console.error('创建患者记录失败:', addResult.error_msg);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('检查/创建患者信息异常:', error);
            // 继续执行，不阻塞陪诊记录的创建
        }
    }

    // 确定陪诊状态 (zhuangtai)
    let zhuangtai = formData.get('zhuangtai') || '待提醒';
    const diagnosis = formData.get('diagnosis');
    if (diagnosis && diagnosis.trim() !== '' && diagnosis !== '未记录') {
        zhuangtai = '已完成';
    }

    // 构造基础字段数据
    const baseControls = [
        { "id": "appointmentTime", "controlId": "appointmentTime", "value": formData.get('date') },
        { "id": "medicalOrgName", "controlId": "medicalOrgName", "value": formData.get('hospital') },
        { "id": "departmentName", "controlId": "departmentName", "value": formData.get('department') || '' },
        { "id": "doctorName", "controlId": "doctorName", "value": formData.get('doctor') || '' },
        { "id": "serviceTitle", "controlId": "serviceTitle", "value": formData.get('coreAppeal') },
        { "id": "actualStartDate", "controlId": "actualStartDate", "value": formData.get('onsetDate') },
        { "id": "cxfzsj_pl", "controlId": "cxfzsj_pl", "value": formData.get('duration') },
        { "id": "bszz", "controlId": "bszz", "value": formData.get('associatedSymptoms') || '' },
        { "id": "wentiyi", "controlId": "wentiyi", "value": patientQuestions[0] || '' },
        { "id": "wentier", "controlId": "wentier", "value": patientQuestions[1] || '' },
        { "id": "wentisan", "controlId": "wentisan", "value": patientQuestions[2] || '' },
        { "id": "specialNote", "controlId": "specialNote", "value": formData.get('diagnosis') || '' },
        { "id": "zhjy", "controlId": "zhjy", "value": formData.get('examSummary') || '' },
        { "id": "nextAction", "controlId": "nextAction", "value": formData.get('advice') || '' },
        { "id": "yyzd", "controlId": "yyzd", "value": JSON.stringify(medicationList) },
        { "id": "zjbz", "controlId": "zjbz", "value": formData.get('lifestyleAdvice') || '' },
        { "id": "hxfcap", "controlId": "hxfcap", "value": formData.get('followupDate') || '' },
        { "id": "wtyjd", "controlId": "wtyjd", "value": doctorAnswers[0] || '' },
        { "id": "wtejd", "controlId": "wtejd", "value": doctorAnswers[1] || '' },
        { "id": "wtsjd", "controlId": "wtsjd", "value": doctorAnswers[2] || '' },
        { "id": "pzszhtx", "controlId": "pzszhtx", "value": formData.get('nurseReminder') || '' },
        { "id": "shouzhen", "controlId": "shouzhen", "value": shouzhen === '1' ? 1 : 0 },
        { "id": "fuid", "controlId": "fuid", "value": fuid || '' },
        { "id": "patientId", "controlId": "patientId", "value": finalPatientId },
        { "id": "name", "controlId": "name", "value": patientName }, // 患者姓名：与患者信息表保持一致
        { "id": "phone", "controlId": "phone", "value": patientPhone }, // 患者电话：与患者信息表保持一致
        { "id": "yonghu", "controlId": "yonghu", "value": userRowId },
        { "id": "pzsgl", "controlId": "pzsgl", "value": userRowId }, // 陪诊师关联：设置为用户的rowid，用于关联查询
        { "id": "yonghu_rowid", "controlId": "yonghu_rowid", "value": userRowId }, // 用户rowid：填登录用户的rowid
        { "id": "zhuangtai", "controlId": "zhuangtai", "value": zhuangtai },
        { "id": "zqbg", "controlId": "zqbg", "value": formData.get('zqbg') || '' },
        { "id": "zhbg", "controlId": "zhbg", "value": formData.get('zhbg') || '' },
        { "id": "del", "controlId": "del", "value": "0" }
    ];

    try {
        let result;
        const worksheetId = 'pzfwjl';

        if (isEditMode) {
            if (typeof window.MingDaoYunUpdateAPI === 'undefined') {
                showToast('更新API组件未加载，请刷新页面');
                return;
            }
            const api = new window.MingDaoYunUpdateAPI();
            // 更新和新增接口均统一使用 controlId
            const updateControls = baseControls.map(c => ({ controlId: c.controlId, value: c.value }));
            result = await api.getData(AppState.currentConsultationId, worksheetId, updateControls);
        } else {
            if (typeof window.MingDaoYunAddAPI === 'undefined') {
                showToast('新增API组件未加载，请刷新页面');
                return;
            }
            const api = new window.MingDaoYunAddAPI();
            // 更新和新增接口均统一使用 controlId
            const addControls = baseControls.map(c => ({ controlId: c.controlId, value: c.value }));
            result = await api.getData(worksheetId, addControls);
        }

        if (result.success) {
            const rowId = isEditMode ? AppState.currentConsultationId : (typeof result.data === 'string' ? result.data : (result.data?.rowid || result.data?.rowId));

            const consultation = {
                id: String(rowId),
                patientId: finalPatientId,
                date: formData.get('date'),
                hospital: formData.get('hospital'),
                department: formData.get('department') || '',
                doctor: formData.get('doctor') || '',
                coreAppeal: formData.get('coreAppeal'),
                onsetDate: formData.get('onsetDate'),
                duration: formData.get('duration'),
                associatedSymptoms: formData.get('associatedSymptoms') || '',
                patientQuestions: patientQuestions,
                doctorAnswers: doctorAnswers,
                diagnosis: formData.get('diagnosis') || '',
                examSummary: formData.get('examSummary') || '',
                lifestyleAdvice: formData.get('lifestyleAdvice') || '',
                followupDate: formData.get('followupDate') || '',
                nurseReminder: formData.get('nurseReminder') || '',
                medication: JSON.stringify(medicationList),
                advice: formData.get('advice') || '',
                shouzhen: parseInt(shouzhen),
                fuid: fuid,
                zqbg: formData.get('zqbg') || '',
                zhbg: formData.get('zhbg') || '',
                status: (formData.get('diagnosis') && formData.get('diagnosis') !== '') ? 'completed' : 'pending',
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

            // 刷新备忘录数据
            loadAllUserConsultations();

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

            // 刷新备忘录数据
            loadAllUserConsultations();

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
        const select = document.querySelector('select[name="fuid"]');
        if (select) select.value = '';

        const now = new Date();
        if (dateInput) {
            dateInput.value = formatDateTimeForInput(now);
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
        const select = document.querySelector('select[name="fuid"]');
        if (select) select.value = '';
    }
}

function handleFirstRecordSelect(select) {
    const selectedId = select.value;
    if (!selectedId) return;

    // 查找选中的陪诊记录
    const record = AppState.consultations.find(c => c.id === selectedId);
    if (!record) return;

    // 填充字段
    const hospitalInput = document.querySelector('input[name="hospital"]');
    const departmentInput = document.querySelector('input[name="department"]');
    const doctorInput = document.querySelector('input[name="doctor"]');

    let updated = false;

    if (hospitalInput && record.hospital) {
        hospitalInput.value = record.hospital;
        updated = true;
    }
    if (departmentInput && record.department) {
        departmentInput.value = record.department;
        updated = true;
    }
    if (doctorInput && record.doctor) {
        doctorInput.value = record.doctor;
        updated = true;
    }

    if (updated) {
        showToast('已自动导入首次陪诊记录信息');
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

function hideConfirmDialog(fromConfirm = false) {
    const dialog = document.getElementById('confirm-dialog');
    if (dialog) {
        dialog.remove();
    }

    // 调用取消回调（仅当不是从确认按钮点击时）
    if (!fromConfirm && window.confirmCallbacks?.onCancel) {
        window.confirmCallbacks.onCancel();
    }

    // 清理回调
    window.confirmCallbacks = null;
}

function handleConfirm() {
    // 保存回调，防止在 hideConfirmDialog 中被清理
    const onConfirm = window.confirmCallbacks?.onConfirm;

    hideConfirmDialog(true);

    // 调用确认回调
    if (onConfirm) {
        onConfirm();
    }
}

// ==================== AI 提取结果核对弹窗 ====================
function showVerificationPopup(aiData, originalText, sttType = 'default') {
    console.log(`--- [AI 弹窗核对] (类型: ${sttType}) ---`);
    console.log('aiData:', aiData);

    // 如果 aiData 是字符串，尝试解析（防御性处理）
    let data = aiData;
    if (typeof aiData === 'string') {
        console.log('检测到 aiData 是字符串，尝试解析...');
        try {
            // 尝试直接解析
            data = JSON.parse(aiData);
        } catch (e) {
            console.warn('初次解析失败，尝试提取 JSON 部分...');
            // 尝试提取字符串中的 JSON 部分 (处理 Coze 可能返回的 Markdown 代码块或前后文字)
            const jsonMatch = aiData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    data = JSON.parse(jsonMatch[0]);
                    console.log('成功从字符串中提取并解析 JSON');
                } catch (e2) {
                    console.error('从提取部分解析 JSON 仍然失败:', e2);
                }
            }
        }
    }

    // [深度修复] 如果解析后的 data 仍然包含字符串形式的 output/data 字段，递归解析
    if (data && typeof data.data === 'string') {
        try {
            console.log('检测到嵌套的 data 字符串，正在二次解析...');
            data = JSON.parse(data.data);
        } catch (e) {
            console.warn('二次解析嵌套 data 失败');
        }
    } else if (data && typeof data.output === 'string') {
        try {
            console.log('检测到嵌套的 output 字符串，正在二次解析...');
            data = JSON.parse(data.output);
        } catch (e) {
            console.warn('二次解析嵌套 output 失败');
        }
    }

    // [关键修复] 有些工作流会把结果包装在 output 或 result 字段中
    if (data && !data.hospital && !data['就诊医院']) {
        if (data.output) {
            console.log('检测到数据嵌套在 output 字段中');
            data = data.output;
        } else if (data.result) {
            console.log('检测到数据嵌套在 result 字段中');
            data = data.result;
        }
    }

    console.log('最终用于填充的数据对象:', data);

    // 根据 sttType 定义字段列表
    let fields = [];
    const allFields = [
        { label: '就诊医院', key: 'hospital', type: 'text', category: 'pre' },
        { label: '就诊科室', key: 'department', type: 'text', category: 'pre' },
        { label: '接诊医生', key: 'doctor', type: 'text', category: 'pre' },
        { label: '就诊日期', key: 'date', type: 'date', category: 'pre' },
        { label: '就诊核心诉求', key: 'coreAppeal', type: 'textarea', category: 'pre' },
        { label: '起病时间', key: 'onsetDate', type: 'date', category: 'pre' },
        { label: '持续时间/频率', key: 'duration', type: 'textarea', category: 'pre' },
        { label: '伴随症状', key: 'associatedSymptoms', type: 'textarea', category: 'pre' },
        { label: '医生诊断', key: 'diagnosis', type: 'textarea', category: 'post' },
        { label: '检查结果摘要', key: 'examSummary', type: 'textarea', category: 'post' },
        { label: '医嘱检查项目', key: 'advice', type: 'textarea', category: 'post' },
        { label: '生活方式调整', key: 'lifestyleAdvice', type: 'textarea', category: 'post' },
        { label: '后续复查安排', key: 'followupDate', type: 'date', category: 'post' },
        { label: '陪诊师诊后提醒', key: 'nurseReminder', type: 'textarea', category: 'post' }
    ];

    console.log(`[弹窗初始化] 识别类型(sttType): ${sttType}`);

    if (sttType === 'pre') {
        fields = allFields.filter(f => f.category === 'pre');
        console.log(`[字段过滤] 识别为诊前，筛选出 ${fields.length} 个字段:`, fields.map(f => f.label));
    } else if (sttType === 'post') {
        fields = allFields.filter(f => f.category === 'post');
        console.log(`[字段过滤] 识别为诊后，筛选出 ${fields.length} 个字段:`, fields.map(f => f.label));
    } else {
        fields = allFields;
        console.log(`[字段过滤] 识别为通用/默认，显示全部 ${fields.length} 个字段`);
    }

    // 创建弹窗容器
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 20px;
    `;

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
        background: var(--card-bg);
        border-radius: 16px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        overflow: hidden;
    `;

    // 头部区域 (固定)
    const header = document.createElement('div');
    header.style.cssText = 'padding: 24px 24px 16px 24px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;';

    // 标题
    const title = document.createElement('h2');
    title.style.cssText = 'margin-bottom: 8px; font-size: 18px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;';
    title.textContent = 'AI 信息提取核对';

    // 增加类型标识，方便用户识别 (v1.0.18)
    const typeBadge = document.createElement('span');
    typeBadge.style.cssText = 'font-size: 12px; padding: 2px 8px; border-radius: 4px; color: white; font-weight: normal;';
    if (sttType === 'pre') {
        typeBadge.textContent = '诊前';
        typeBadge.style.backgroundColor = '#3b82f6'; // 蓝色
    } else if (sttType === 'post') {
        typeBadge.textContent = '诊后';
        typeBadge.style.backgroundColor = '#10b981'; // 绿色
    } else {
        typeBadge.textContent = '通用';
        typeBadge.style.backgroundColor = '#6b7280'; // 灰色
    }
    title.appendChild(typeBadge);

    header.appendChild(title);

    const subTitle = document.createElement('p');
    subTitle.textContent = '输入框保留原信息，下方显示 AI 识别结果。点击「同意」采纳 AI 结果，点击「拒绝」保持原信息';
    subTitle.style.cssText = 'margin-bottom: 0; font-size: 13px; color: var(--text-secondary);';
    header.appendChild(subTitle);

    content.appendChild(header);

    // 中间滚动区域
    const scrollBody = document.createElement('div');
    scrollBody.style.cssText = 'flex: 1; overflow-y: auto; padding: 24px;';

    // 表单区域
    const form = document.createElement('div');
    form.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

    const inputElements = {};

    // 从主表单获取原始值的辅助函数
    function getOriginalValue(key) {
        const form = document.getElementById('consultationForm');
        if (!form) return '';
        if (key === 'date') {
            const el = form.querySelector('input[name="date"]');
            if (!el || !el.value) return '';
            return el.value.substring(0, 10);
        }
        const el = form.querySelector(`[name="${key}"]`);
        return el ? (el.value || '') : '';
    }

    // 从 AI 数据中提取字段值的辅助函数
    function getAIValue(field) {
        let val = '';
        const dataKeys = Object.keys(data);
        if (data[field.key] !== undefined && data[field.key] !== null && data[field.key] !== '') {
            val = String(data[field.key]).trim();
        } else if (data[field.label] !== undefined && data[field.label] !== null && data[field.label] !== '') {
            val = String(data[field.label]).trim();
        } else {
            const variants = {
                'hospital': ['medicalOrgName', 'hospital_name', 'visit_hospital', '医院', 'medicalOrg'],
                'department': ['departmentName', 'department_name', 'visit_department', '科室'],
                'doctor': ['doctorName', 'doctor_name', 'attending_doctor', '医生'],
                'date': ['appointmentTime', 'visit_date', 'visitDate', '日期'],
                'coreAppeal': ['serviceTitle', 'appeal', 'main_complaint', '诉求', 'complaint', '主诉', '现病史'],
                'onsetDate': ['actualStartDate', 'onset_time', 'start_date', 'onsetTime'],
                'duration': ['cxfzsj_pl', 'frequency', 'duration_time', 'duration'],
                'associatedSymptoms': ['bszz', 'symptoms', 'other_symptoms', 'accompanying_symptoms'],
                'diagnosis': ['zhjy', 'doctor_diagnosis', 'result', 'diagnosis', '初步诊断', '诊断', '诊断意见'],
                'examSummary': ['zjbz', 'exam_results', 'lab_results', 'summary', '体格检查', '检验检查', '辅助检查', '检查', '查体'],
                'advice': ['yyzysx', 'doctor_advice', 'medication', 'advice', 'treatmentMeasures', '治疗措施', '处理意见', '处理', '建议'],
                'lifestyleAdvice': ['lifestyle', 'notes', 'lifestyle_advice', '生活建议', '注意事项'],
                'followupDate': ['hxfcap', 'recheck_date', 'next_visit', 'followup'],
                'nurseReminder': ['pzszhtx', 'reminder', 'tips', 'nurse_reminder', '提醒']
            };
            const possibleKeys = variants[field.key] || [];
            for (const k of possibleKeys) {
                if (data[k] !== undefined && data[k] !== null && data[k] !== '') {
                    val = String(data[k]).trim();
                    break;
                }
            }
            if (!val) {
                const searchKey = field.key.toLowerCase();
                const searchLabel = field.label.toLowerCase();
                for (const actualKey of dataKeys) {
                    const lowerActualKey = actualKey.toLowerCase();
                    if ((lowerActualKey.includes(searchKey) || lowerActualKey.includes(searchLabel) || searchKey.includes(lowerActualKey)) &&
                        data[actualKey] && typeof data[actualKey] === 'string') {
                        val = String(data[actualKey]).trim();
                        break;
                    }
                }
            }
        }
        return val;
    }

    fields.forEach(field => {
        const group = document.createElement('div');
        group.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--text-secondary);';
        group.appendChild(label);

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 2;
            input.style.cssText = 'padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; resize: vertical; background: var(--input-bg); color: var(--text-primary);';
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.style.cssText = 'padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--input-bg); color: var(--text-primary);';
        }

        const originalVal = getOriginalValue(field.key);
        const aiVal = getAIValue(field);

        input.value = originalVal;
        inputElements[field.key] = input;
        group.appendChild(input);

        // 若有 AI 识别结果，在输入框下方展示并提供同意/拒绝按钮
        if (aiVal) {
            const suggestionBlock = document.createElement('div');
            suggestionBlock.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding: 10px; background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px;';
            const aiLabel = document.createElement('div');
            aiLabel.style.cssText = 'font-size: 12px; color: var(--text-secondary);';
            aiLabel.textContent = 'AI 识别：';
            const aiText = document.createElement('div');
            aiText.style.cssText = 'font-size: 14px; color: var(--text-primary);';
            aiText.textContent = aiVal;
            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display: flex; gap: 8px;';
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = '同意';
            acceptBtn.className = 'btn btn-primary';
            acceptBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; flex: 1;';
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = '拒绝';
            rejectBtn.className = 'btn btn-outline';
            rejectBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; flex: 1;';

            acceptBtn.onclick = () => {
                let valToApply = aiVal;
                if (field.type === 'date' && valToApply) {
                    valToApply = String(valToApply).replace(/\//g, '-').substring(0, 10);
                }
                input.value = valToApply;
                suggestionBlock.remove();
            };
            rejectBtn.onclick = () => {
                suggestionBlock.remove();
            };

            btnRow.appendChild(acceptBtn);
            btnRow.appendChild(rejectBtn);
            suggestionBlock.appendChild(aiLabel);
            suggestionBlock.appendChild(aiText);
            suggestionBlock.appendChild(btnRow);
            group.appendChild(suggestionBlock);
        }

        console.log(`[填充验证] 字段: ${field.label} | 原值: "${originalVal}" | AI值: "${aiVal}"`);
        form.appendChild(group);
    });

    // 特殊处理患者疑问 (仅在诊前或默认情况下显示)
    if (sttType === 'pre' || sttType === 'default') {
        let questionsVal = data.patientQuestions || data.questions || data['患者核心疑问'] || data['疑问'] || [];

        // [增加匹配] 匹配 wentiyi, wentier, wentisan 这种格式
        if (Array.isArray(questionsVal) && questionsVal.length === 0) {
            if (data.wentiyi) questionsVal.push(data.wentiyi);
            if (data.wentier) questionsVal.push(data.wentier);
            if (data.wentisan) questionsVal.push(data.wentisan);
        }

        // 如果是字符串，转为数组
        if (typeof questionsVal === 'string' && questionsVal.trim()) {
            questionsVal = questionsVal.split(/[\n,，]/).filter(q => q.trim());
        }

        const aiQuestionsStr = Array.isArray(questionsVal) && questionsVal.length > 0 ? questionsVal.join('\n') : '';

        // 获取原始问题（从 questions-container）
        let originalQuestionsStr = '';
        const questionsContainer = document.getElementById('questions-container');
        if (questionsContainer) {
            const tas = questionsContainer.querySelectorAll('textarea[name="patientQuestions[]"]');
            originalQuestionsStr = Array.from(tas).map(ta => ta.value).filter(v => v.trim()).join('\n');
        }

        const group = document.createElement('div');
        group.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
        const label = document.createElement('label');
        label.textContent = '患者核心疑问';
        label.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--text-secondary);';
        group.appendChild(label);

        const questionsTextarea = document.createElement('textarea');
        questionsTextarea.rows = 3;
        questionsTextarea.placeholder = '每行一个问题';
        questionsTextarea.style.cssText = 'padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background: var(--input-bg); color: var(--text-primary);';
        questionsTextarea.value = originalQuestionsStr;
        inputElements['patientQuestions'] = questionsTextarea;

        group.appendChild(questionsTextarea);

        if (aiQuestionsStr) {
            const suggestionBlock = document.createElement('div');
            suggestionBlock.style.cssText = 'display: flex; flex-direction: column; gap: 8px; padding: 10px; background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px;';
            const aiLabel = document.createElement('div');
            aiLabel.style.cssText = 'font-size: 12px; color: var(--text-secondary);';
            aiLabel.textContent = 'AI 识别：';
            const aiText = document.createElement('div');
            aiText.style.cssText = 'font-size: 14px; color: var(--text-primary); white-space: pre-wrap;';
            aiText.textContent = aiQuestionsStr;
            const btnRow = document.createElement('div');
            btnRow.style.cssText = 'display: flex; gap: 8px;';
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = '同意';
            acceptBtn.className = 'btn btn-primary';
            acceptBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; flex: 1;';
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = '拒绝';
            rejectBtn.className = 'btn btn-outline';
            rejectBtn.style.cssText = 'padding: 6px 16px; font-size: 13px; flex: 1;';

            acceptBtn.onclick = () => {
                questionsTextarea.value = aiQuestionsStr;
                suggestionBlock.remove();
            };
            rejectBtn.onclick = () => suggestionBlock.remove();

            btnRow.appendChild(acceptBtn);
            btnRow.appendChild(rejectBtn);
            suggestionBlock.appendChild(aiLabel);
            suggestionBlock.appendChild(aiText);
            suggestionBlock.appendChild(btnRow);
            group.appendChild(suggestionBlock);
        }

        form.appendChild(group);
    }

    scrollBody.appendChild(form);
    content.appendChild(scrollBody);

    // 底部按钮 (固定)
    const footer = document.createElement('div');
    footer.style.cssText = 'padding: 16px 24px 24px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: center; gap: 12px; flex-shrink: 0; background: var(--card-bg);';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.style.flex = '1';
    cancelBtn.onclick = () => document.body.removeChild(modal);

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '信息填入';
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.style.flex = '1';
    confirmBtn.onclick = () => {
        const verifiedData = {};
        for (const key in inputElements) {
            if (key === 'patientQuestions') {
                verifiedData[key] = inputElements[key].value.split('\n').filter(q => q.trim() !== '');
            } else {
                verifiedData[key] = inputElements[key].value;
            }
        }
        // 传递 sttType 给 fillConsultationForm，以便只填充对应类别的字段
        fillConsultationForm(verifiedData, sttType);
        document.body.removeChild(modal);
        showToast('信息已填入表单');
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    content.appendChild(footer);

    modal.appendChild(content);
    document.body.appendChild(modal);
}

function fillConsultationForm(data, sttType = 'default') {
    // 确保有表单存在
    const form = document.getElementById('consultationForm');
    if (!form) {
        showToast('未找到陪诊记录表单');
        return;
    }

    // 定义字段分类
    const preFields = ['hospital', 'department', 'doctor', 'date', 'coreAppeal', 'onsetDate', 'duration', 'associatedSymptoms', 'patientQuestions'];
    const postFields = ['diagnosis', 'examSummary', 'advice', 'lifestyleAdvice', 'followupDate', 'nurseReminder'];

    // 根据 sttType 过滤要填充的字段
    let allowedFields = [];
    if (sttType === 'pre') {
        allowedFields = preFields;
        console.log('[填充表单] 识别类型为诊前，只填充诊前相关字段');
    } else if (sttType === 'post') {
        allowedFields = postFields;
        console.log('[填充表单] 识别类型为诊后，只填充诊后相关字段');
    } else {
        // 默认情况：填充所有字段
        allowedFields = [...preFields, ...postFields];
        console.log('[填充表单] 识别类型为通用/默认，填充所有字段');
    }

    // 填充基本字段（只填充允许的字段）
    for (const key in data) {
        if (key === 'patientQuestions') continue;

        // 检查字段是否在允许列表中
        if (allowedFields.includes(key)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && data[key]) {
                input.value = data[key];
                input.dispatchEvent(new Event('input', { bubbles: true }));
                console.log(`[填充表单] 已填充字段: ${key} = ${data[key]}`);
            }
        } else {
            console.log(`[填充表单] 跳过字段: ${key} (不在 ${sttType} 类型的允许列表中)`);
        }
    }

    // 特殊处理问题
    if (data.patientQuestions && Array.isArray(data.patientQuestions)) {
        const questionsContainer = document.getElementById('questions-container');
        if (questionsContainer) {
            // 先清空现有问题（只保留第一个）
            const items = questionsContainer.querySelectorAll('.question-item');
            for (let i = 1; i < items.length; i++) {
                items[i].remove();
            }

            data.patientQuestions.forEach((q, index) => {
                if (index === 0) {
                    const firstTa = questionsContainer.querySelector('textarea[name="patientQuestions[]"]');
                    if (firstTa) firstTa.value = q;
                } else if (index < 3) { // 最多3个
                    addQuestion();
                    const tas = questionsContainer.querySelectorAll('textarea[name="patientQuestions[]"]');
                    if (tas[index]) tas[index].value = q;
                }
            });

            // 同步到诊后
            if (typeof syncQuestionsToAnswers === 'function') {
                syncQuestionsToAnswers();
            }
        }
    }
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
let isFetchingMemoData = false;

async function renderRecordsList(container) {
    console.log('渲染备忘录列表, isLoggedIn:', window.wechatLogin && window.wechatLogin.isLoggedIn());
    const isLoggedIn = window.wechatLogin && window.wechatLogin.isLoggedIn();

    if (isLoggedIn && !isFetchingMemoData && AppState.allUserConsultations === null) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: var(--text-secondary);">
                <div class="loading-spinner mb-3"></div>
                <div>正在加载备忘录数据...</div>
            </div>
        `;
        isFetchingMemoData = true;
        await loadAllUserConsultations();
        isFetchingMemoData = false;
        // 加载完成后再次调用自身进行渲染
        return renderRecordsList(container);
    }

    // 将陪诊记录转换为提醒事项（数据裂变：一条记录裂变为就诊提醒和复查提醒）
    const allReminders = [];
    const consultations = AppState.allUserConsultations || [];

    // 辅助函数：安全解析日期为时间戳
    const getTimestamp = (dateStr) => {
        if (!dateStr) return NaN;
        // 尝试处理 "YYYY-MM-DD" 在某些环境下可能的问题（虽然现代浏览器通常支持）
        // 如果是 iOS Webview，建议将 - 替换为 /
        const safeDateStr = typeof dateStr === 'string' ? dateStr.replace(/-/g, '/') : dateStr;
        const ts = new Date(safeDateStr).getTime();
        return ts;
    };

    consultations.forEach(c => {
        // 1. 就诊日期提醒（按就诊日期）
        if (c.date) {
            allReminders.push({
                id: c.id + '_apt',
                consultationId: c.id,
                title: `陪诊: ${c.patientName}`,
                content: `${c.hospital}${c.department ? ' - ' + c.department : ''}`,
                date: c.date, // 显示用的日期字符串
                sortDate: getTimestamp(c.date), // 排序用的统一时间戳
                type: 'appointment',
                status: c.status,
                zhuangtai: c.zhuangtai,
                txhz: c.txhz
            });
        }
        // 2. 后续复查提醒（按复查日期）
        if (c.followupDate) {
            allReminders.push({
                id: c.id + '_fup',
                consultationId: c.id,
                title: `复查提醒: ${c.patientName}`,
                content: `建议复查日期`,
                date: c.followupDate, // 显示用的日期字符串
                sortDate: getTimestamp(c.followupDate), // 排序用的统一时间戳
                type: 'followup',
                status: c.status,
                zhuangtai: c.zhuangtai,
                txhz: c.txhz
            });
        }
    });

    // 排序：使用统一的 sortDate 字段进行正序排列
    allReminders.sort((a, b) => {
        const timeA = a.sortDate;
        const timeB = b.sortDate;

        // 处理无效日期：放在最后
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;

        return timeA - timeB;
    });

    // --- 调试日志：打印排序后的合并表 ---
    console.group('备忘录排序调试');
    console.log('合并后的提醒事项列表（已排序）:');
    if (allReminders.length > 0) {
        // 构建简化的表格数据用于打印
        const tableData = allReminders.map((r, index) => ({
            '序号': index + 1,
            '标题': r.title,
            '类型': r.type === 'appointment' ? '陪诊' : '复查',
            '原始日期字符串': r.date,
            '排序时间戳': r.sortDate,
            '格式化后日期': new Date(r.sortDate).toLocaleString()
        }));
        console.table(tableData);
    } else {
        console.log('列表为空');
    }
    console.groupEnd();
    // ------------------------------------

    console.log('转换后提醒事项总数:', allReminders.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // 过滤掉已过期的记录（日期小于今天）
    const validReminders = allReminders.filter(r => {
        // 如果日期无效，保留（或者根据需求处理）
        if (isNaN(r.sortDate)) return true;
        // 只保留今天及以后的记录
        return r.sortDate >= todayTimestamp;
    });

    // 判定是否为已提醒：zhuangtai为'已提醒' 或 txhz为'1'或1
    const isReminded = (r) => r.zhuangtai === '已提醒' || r.txhz === '1' || r.txhz === 1;

    // 待处理：未完成 且 未提醒
    const upcomingReminders = validReminders.filter(r => r.status !== 'completed' && !isReminded(r));
    // 已处理：已完成 或 已提醒
    const completedReminders = validReminders.filter(r => r.status === 'completed' || isReminded(r));

    console.log('待处理:', upcomingReminders.length, '已完成/已处理:', completedReminders.length);

    container.innerHTML = `
        <!-- 固定顶部标题 -->
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div style="font-size: 20px; font-weight: 600;">备忘录</div>
                    <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                        ${isLoggedIn ? `${upcomingReminders.length} 个待办事项` : '请先登录'}
                    </div>
                </div>
                ${isLoggedIn ? `
                <button class="btn btn-icon btn-outline" onclick="refreshMemoData()" title="刷新">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                </button>
                ` : ''}
            </div>
        </div>
        
        <div class="p-2" id="records-list-container">
            ${isLoggedIn ? `
                <!-- 待处理提醒 -->
                <div class="card mb-2">
                    <h3 class="card-title mb-2">待处理</h3>
                    ${upcomingReminders.length === 0 ? `
                        <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                            暂无待办事项
                        </p>
                    ` : upcomingReminders.map(r => `
                        <div class="list-item" style="padding: 12px; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="viewConsultation('${r.consultationId}')">
                            <div class="flex items-center gap-3">
                                <div style="width: 4px; height: 48px; border-radius: 2px; background-color: var(--warning-color); flex-shrink: 0;"></div>
                                <div class="flex-1 flex justify-between items-center">
                                    <div class="flex-1 min-w-0">
                                        <div style="font-weight: 600; font-size: 15px; color: var(--text-primary); display: block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.title}</div>
                                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${r.content}
                                        </div>
                                        <div style="font-size: 12px; color: var(--primary-color); margin-top: 2px; font-weight: 500;">
                                            📅 ${formatDate(r.date)}
                                        </div>
                                    </div>
                                    
                                    <div style="margin-left: 12px; flex-shrink: 0; align-self: stretch; display: flex; align-items: center;" onclick="event.stopPropagation()">
                                        <select 
                                            class="badge badge-warning"
                                            onchange="updateMemoStatus('${r.consultationId}', this.value)"
                                            style="appearance: none; -webkit-appearance: none; padding: 4px 24px 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; border: none; font-weight: 500; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 8px center; background-size: 10px auto;"
                                        >
                                            <option value="待提醒" selected>待提醒</option>
                                            <option value="已提醒">已提醒</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- 已完成/已处理 -->
                ${completedReminders.length > 0 ? `
                <div class="card">
                    <h3 class="card-title mb-2">已处理 (${completedReminders.length})</h3>
                    ${completedReminders.map(r => {
        const isDone = r.status === 'completed'; // 真正完成
        const isRemind = !isDone && isReminded(r); // 仅已提醒
        const badgeClass = isDone ? 'badge-success' : 'badge-primary';
        const badgeText = isDone ? '已完成' : '已提醒';
        const barColor = isDone ? 'var(--success-color)' : 'var(--primary-color)';
        return `
                        <div class="list-item" style="padding: 12px; border-bottom: 1px solid var(--border-color); opacity: 0.7; cursor: pointer;" onclick="viewConsultation('${r.consultationId}')">
                            <div class="flex items-center gap-3">
                                <div style="width: 4px; height: 48px; border-radius: 2px; background-color: ${barColor}; flex-shrink: 0;"></div>
                                <div class="flex-1 flex justify-between items-center">
                                    <div class="flex-1 min-w-0">
                                        <div style="font-weight: 500; font-size: 15px; color: var(--text-secondary); text-decoration: line-through; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.title}</div>
                                        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${r.content}
                                        </div>
                                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                                            📅 ${formatDate(r.date)}
                                        </div>
                                    </div>
                                    <div style="margin-left: 12px; flex-shrink: 0; align-self: stretch; display: flex; align-items: center;">
                                        <span class="badge ${badgeClass}">${badgeText}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
    }).join('')}
                </div>
                ` : ''}
            ` : `
                <div class="empty-state" style="padding: 40px 20px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">请先登录以查看备忘录数据</p>
                    <button class="btn btn-primary" onclick="window.wechatLogin.toWxLogin()" style="width: 120px; display: inline-flex; align-items: center; justify-content: center;">前往登录</button>
                </div>
            `}
        </div>
    `;

    // 初始化下拉刷新
    const listContainer = document.getElementById('records-list-container');
    if (listContainer && isLoggedIn) {
        new PullToRefresh(listContainer, async () => {
            await loadAllUserConsultations();
        });
    }
}

async function refreshMemoData() {
    isFetchingMemoData = true;
    showToast('正在刷新...');
    await loadAllUserConsultations();
    isFetchingMemoData = false;
    renderCurrentPage();
}

async function updateMemoStatus(consultationId, newStatus) {
    try {
        if (typeof window.MingDaoYunUpdateAPI === 'undefined') {
            showToast('API组件未加载');
            return;
        }

        // 映射 txhz 值: 待提醒 -> '0', 已提醒 -> '1'
        const txhzValue = newStatus === '已提醒' ? '1' : '0';

        const api = new window.MingDaoYunUpdateAPI();
        const result = await api.getData(consultationId, 'pzfwjl', [
            { controlId: 'zhuangtai', value: newStatus },
            { controlId: 'txhz', value: txhzValue }
        ]);

        if (result.success) {
            showToast(`已设为${newStatus}`);
            // 更新本地数据
            const updateLocal = (list) => {
                if (!list) return;
                const item = list.find(c => c.id === consultationId);
                if (item) {
                    item.zhuangtai = newStatus;
                    item.txhz = txhzValue;
                    // 只有当不是“已完成”时才根据 zhuangtai 更新 status
                    if (!(item.specialNote && item.specialNote !== '未记录' && item.specialNote !== '')) {
                        item.status = newStatus === '已提醒' ? 'reminded' : 'upcoming';
                    }
                }
            };

            updateLocal(AppState.allUserConsultations);
            updateLocal(AppState.consultations);

            renderCurrentPage();
        } else {
            showToast('更新失败: ' + result.error_msg);
        }
    } catch (error) {
        console.error('更新状态异常:', error);
        showToast('网络异常');
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
    const expiryDate = userInfo && rawUser && rawUser.hydqsj ? rawUser.hydqsj : '';
    let daysLeft = 0;
    if (expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry - today;
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    const isVip = userLevel === '会员' || userLevel.includes('会员');
    console.log('设置页用户信息:', { userLevel, expiryDate, isVip, daysLeft });

    container.innerHTML = `
        <div class="p-2">
            <div class="card mb-2 user-info-card">
                <div class="user-avatar-wrapper" onclick="handleAvatarClick()" style="cursor: pointer; position: relative;">
                    <img src="${escapeHtml(userAvatar)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23ccc%22><circle cx=%2212%22 cy=%228%22 r=%224%22/><path d=%22M12 14c-4.4 0-8 2-8 5v1h16v-1c0-3-3.6-5-8-5z%22/></svg>'" alt="头像">
                    <div class="avatar-edit-overlay">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: white;">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                    <input type="file" id="avatar-upload-input" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;" accept="image/*" onchange="handleAvatarUpload(this)" onclick="event.stopPropagation(); if(!window.canSelectAvatar()) { event.preventDefault(); goToLogin(); }">
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
                
                <div class="list-item" onclick="showUserAgreement()">
                    <div class="flex justify-between items-center">
                        <span>登录用户协议</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; color: var(--text-secondary);">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>

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

            </div>
            
            <div class="card">
                <h3 class="card-title mb-2">关于</h3>
                <div style="color: var(--text-secondary); line-height: 1.8;">
                    <p>版本：1.0.20 (全链路刷新已启用)</p>
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

// 检查是否可以进行头像选择
window.canSelectAvatar = function () {
    return window.wechatLogin && window.wechatLogin.isLoggedIn();
};

// 处理头像点击事件
window.handleAvatarClick = function () {
    console.log('[Avatar] 容器点击触发');
    // 注意：现在 input 已经覆盖了容器，通常直接点到 input 上了。
    // 如果点到了容器边缘，手动触发一次
    const input = document.getElementById('avatar-upload-input');
    if (input) {
        input.click();
    }
};

// 处理头像上传
window.handleAvatarUpload = async function (input) {
    console.log('[Avatar] 文件选择变更', input.files);
    const file = input.files[0];
    if (!file) {
        console.log('[Avatar] 未选择文件');
        return;
    }

    // 简单校验文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }

    // 简单校验文件大小 (例如 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过 5MB');
        return;
    }

    showToast('正在上传头像...');

    try {
        // 构造 FormData
        const formData = new FormData();
        formData.append('file', file);

        console.log('[Avatar] 开始上传文件到 tmp.php');
        // 调用上传接口获取临时 URL
        const response = await fetch('https://100000whys.cn/api/tmp.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('[Avatar] 上传接口返回:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        const fileUrl = data.url || data.link;
        if (!fileUrl) {
            throw new Error('未获取到图片链接');
        }

        console.log('[Avatar] 头像上传成功，URL:', fileUrl);

        // 更新明道云头像字段
        await updateAvatar(fileUrl);

    } catch (error) {
        console.error('[Avatar] 头像上传失败:', error);
        showToast('头像上传失败: ' + error.message);
    } finally {
        // 清空 input，允许重复选择同一张图
        input.value = '';
    }
};

// 更新头像到明道云
async function updateAvatar(imageUrl) {
    try {
        const userInfo = window.wechatLogin && typeof window.wechatLogin.getUserInfo === 'function'
            ? window.wechatLogin.getUserInfo()
            : null;

        if (!userInfo || !userInfo.id) {
            showToast('获取用户信息失败');
            return;
        }

        const rowid = userInfo.id;
        const worksheetId = 'yonghu'; // 用户表的工作表ID

        // 构造更新字段 (touxiang 是图片/链接字段)
        const controls = [
            {
                "controlId": "touxiang",
                "value": imageUrl
            }
        ];

        console.log('更新头像请求参数:', { rowid, worksheetId, controls });

        // 调用明道云更新API
        const api = new window.MingDaoYunUpdateAPI();
        const result = await api.getData(rowid, worksheetId, controls);

        if (result.success) {
            showToast('头像更新成功');
            // 刷新用户信息并重绘页面
            if (window.wechatLogin && typeof window.wechatLogin.refreshUserInfo === 'function') {
                await window.wechatLogin.refreshUserInfo();
                const container = document.getElementById('main-content');
                if (container) renderSettings(container);
            }
        } else {
            showToast(result.error_msg || '头像更新失败');
        }
    } catch (error) {
        console.error('更新头像异常:', error);
        showToast('头像更新失败，请重试');
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
        const rowid = userInfo.id || (rawUser && (rawUser.rowid || rawUser.rowId || rawUser.id));
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
    return fetch('https://api.mingdao.com/v2/open/worksheet/getFilterRows', {
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

// 辅助函数：收集表单数据
function collectFormData(form, fields) {
    const data = {};
    const formData = new FormData(form);

    fields.forEach(field => {
        if (field.type === 'array') {
            // 处理数组类型（如 dynamic inputs）
            const values = [];
            const elements = form.querySelectorAll(`[name="${field.name}"]`);
            elements.forEach(el => values.push(el.value));
            data[field.key || field.name] = values;
        } else if (field.type === 'complex_array') {
            // 处理复杂对象数组（如用药记录）
            data[field.key] = field.handler(form);
        } else {
            // 处理普通字段
            data[field.key || field.name] = formData.get(field.name) || '';
        }
    });
    return data;
}

// 生成诊前报告
function generatePreReport(consultationId) {
    console.log('生成诊前报告:', consultationId);
    showToast('正在生成诊前报告...');

    const form = document.getElementById('consultationForm');
    if (!form) {
        console.error('未找到表单元素');
        return;
    }

    const preFields = [
        { name: 'shouzhen', key: '是否初诊' },
        { name: 'hasFirstRecord', key: '是否有首次记录' },
        { name: 'fuid', key: '首次记录ID' },
        { name: 'date', key: '就诊日期' },
        { name: 'hospital', key: '医院' },
        { name: 'department', key: '科室' },
        { name: 'doctor', key: '医生' },
        { name: 'coreAppeal', key: '就诊核心诉求' },
        { name: 'onsetDate', key: '起病时间' },
        { name: 'duration', key: '持续时间/发作频率' },
        { name: 'associatedSymptoms', key: '伴随症状' },
        { name: 'patientQuestions[]', key: '患者核心疑问', type: 'array' }
    ];

    const reportData = collectFormData(form, preFields);

    // 添加患者信息
    let patient = AppState.patients.find(p => p.id === AppState.currentPatientId);

    // 增强：如果当前患者ID未设置，尝试从咨询记录关联查找
    if (!patient && consultationId) {
        const consultation = AppState.consultations.find(c => c.id === consultationId) ||
            (AppState.allUserConsultations || []).find(c => c.id === consultationId);
        if (consultation && consultation.patientId) {
            patient = AppState.patients.find(p => p.id === consultation.patientId);
        }
    }

    if (patient) {
        reportData.patient_info = {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone || '无',
            medical_history: patient.medicalHistory || patient.pastMedicalHistory || '无',
            allergies: patient.allergies || patient.allergy_history || '无'
        };
    }

    console.log('诊前报告数据:', JSON.stringify(reportData, null, 2));

    // 调用Coze工作流
    if (window.cozeWorkflow) {
        // showLoading('正在生成诊前报告...'); // Use inline status instead
        const statusDiv = document.getElementById('pre-report-status');
        const generateBtn = document.getElementById('btn-generate-pre');

        if (statusDiv) statusDiv.style.display = 'block';
        if (generateBtn) generateBtn.style.display = 'none';

        window.cozeWorkflow.runReportGeneration(reportData, 'pre').then(result => {
            // hideLoading();
            if (statusDiv) statusDiv.style.display = 'none';

            if (result.success && result.data && result.data.data) {
                console.log('诊前报告生成成功:', result.data.data);
                showToast('诊前报告生成成功');

                const imgUrl = result.data.data.img;
                if (imgUrl) {
                    // Update hidden input
                    const zqbgInput = document.getElementById('zqbg_input');
                    if (zqbgInput) {
                        zqbgInput.value = imgUrl;
                        zqbgInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Update preview
                    const previewDiv = document.getElementById('pre-report-preview');
                    if (previewDiv) {
                        previewDiv.style.display = 'block';
                        const fileItem = previewDiv.querySelector('.report-file-item');
                        if (fileItem) {
                            fileItem.dataset.original = imgUrl;
                            fileItem.setAttribute('data-original', imgUrl);
                            // Ensure onclick handler uses the new URL immediately
                            // Remove any existing event listeners by cloning (optional, but cleaner if using addEventListener)
                            // But here we use onclick property which overrides.
                            fileItem.onclick = function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Previewing new generated image:', imgUrl);
                                previewReportImage(imgUrl);
                            };
                        }
                    }
                }

                // 展示报告内容
                // showReportModal('诊前报告', result.data.data.output || JSON.stringify(result.data.data), imgUrl);
            } else {
                showToast('生成报告失败');
            }
        });
    } else {
        showToast('Coze组件未加载');
    }
}

// 生成诊后报告
function generatePostReport(consultationId) {
    console.log('生成诊后报告:', consultationId);
    showToast('正在生成诊后报告...');

    const form = document.getElementById('consultationForm');
    if (!form) {
        console.error('未找到表单元素');
        return;
    }

    const postFields = [
        { name: 'diagnosis', key: '医生诊断' },
        { name: 'examSummary', key: '检查结果摘要' },
        { name: 'advice', key: '医嘱检查项目' },
        {
            key: '用药指导',
            type: 'complex_array',
            handler: (form) => {
                const meds = [];
                const rows = form.querySelectorAll('.medication-row');
                rows.forEach(row => {
                    meds.push({
                        name: row.querySelector('input[name="med_name[]"]')?.value || '',
                        dosage: row.querySelector('input[name="med_dosage[]"]')?.value || '',
                        frequency: row.querySelector('input[name="med_frequency[]"]')?.value || '',
                        duration: row.querySelector('input[name="med_duration[]"]')?.value || ''
                    });
                });
                return meds;
            }
        },
        { name: 'lifestyleAdvice', key: '生活方式调整' },
        { name: 'followupDate', key: '复诊日期' },
        { name: 'doctorAnswers[]', key: '医生解答', type: 'array' },
        { name: 'nurseReminder', key: '陪诊师诊后提醒' }
    ];

    const reportData = collectFormData(form, postFields);

    // 添加患者信息
    let patient = AppState.patients.find(p => p.id === AppState.currentPatientId);

    // 增强：如果当前患者ID未设置，尝试从咨询记录关联查找
    if (!patient && consultationId) {
        const consultation = AppState.consultations.find(c => c.id === consultationId) ||
            (AppState.allUserConsultations || []).find(c => c.id === consultationId);
        if (consultation && consultation.patientId) {
            patient = AppState.patients.find(p => p.id === consultation.patientId);
        }
    }

    if (patient) {
        reportData.patient_info = {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone || '无',
            medical_history: patient.medicalHistory || patient.pastMedicalHistory || '无',
            allergies: patient.allergies || patient.allergy_history || '无'
        };
    }

    console.log('诊后报告数据:', JSON.stringify(reportData, null, 2));

    // 调用Coze工作流
    if (window.cozeWorkflow) {
        showLoading('正在生成诊后报告...');
        window.cozeWorkflow.runReportGeneration(reportData, 'post').then(result => {
            hideLoading();
            if (result.success && result.data && result.data.data) {
                console.log('诊后报告生成成功:', result.data.data);
                showToast('诊后报告生成成功');

                const imgUrl = result.data.data.img;
                if (imgUrl) {
                    // Update hidden input
                    const zhbgInput = document.getElementById('zhbg_input');
                    if (zhbgInput) {
                        zhbgInput.value = imgUrl;
                        zhbgInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Update preview
                    const previewDiv = document.getElementById('post-report-preview');
                    if (previewDiv) {
                        previewDiv.style.display = 'block';
                        const fileItem = previewDiv.querySelector('.report-file-item');
                        if (fileItem) {
                            fileItem.dataset.original = imgUrl;
                            fileItem.setAttribute('data-original', imgUrl);
                            // Ensure onclick handler uses the new URL immediately
                            fileItem.onclick = function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Previewing new generated image:', imgUrl);
                                previewReportImage(imgUrl);
                            };
                        }
                    }
                }

                // 展示报告内容
                // showReportModal('诊后报告', result.data.data.output || JSON.stringify(result.data.data), imgUrl);
            } else {
                showToast('生成报告失败');
            }
        });
    } else {
        showToast('Coze组件未加载');
    }
}

/*
// 展示报告弹窗
function showReportModal(title, content, imgUrl) {
    // Deprecated
}
*/

// 下载图片函数
function downloadImage(url, filename = 'report.png') {
    if (!url) return;

    // 检测微信环境
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

    // 微信环境下，提示长按保存
    if (isWeChat) {
        showToast('请长按图片保存到相册', 3000);
        return;
    }

    // 创建loading提示
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:12px 24px;border-radius:8px;z-index:20000;font-size:14px;';
    toast.textContent = '正在下载...';
    document.body.appendChild(toast);

    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

            toast.textContent = '下载成功';
            setTimeout(() => {
                if (toast.parentNode) document.body.removeChild(toast);
            }, 1500);
        })
        .catch(err => {
            console.error('Download failed:', err);
            toast.textContent = '下载失败，尝试打开链接...';
            setTimeout(() => {
                if (toast.parentNode) document.body.removeChild(toast);
                window.open(url, '_blank');
            }, 1500);
        });
}

// 预览报告图片（带缓存清理的高清原图）
function previewReportImage(url) {
    if (!url) return;

    let finalUrl = url;

    // 1. 针对明道Yun图片：添加时间戳防缓存
    if (url.includes('mingdaoyun.cn')) {
        const timestamp = new Date().getTime();
        if (finalUrl.includes('?')) {
            finalUrl = `${finalUrl}&t=${timestamp}`;
        } else {
            finalUrl = `${finalUrl}?t=${timestamp}`;
        }
    }
    // 2. 针对其他图片（如Coze生成的临时带签名链接）：保留原参数，不添加额外参数以免破坏签名
    else {
        // Coze链接通常带有签名参数，去除会导致403，添加额外参数也可能导致签名验证失败
        // 直接使用原链接
        finalUrl = url;
    }

    console.log('Previewing Report Image:', finalUrl);
    previewImage(finalUrl);
}

// 图片预览功能
function previewImage(src) {
    if (!src) return;

    // 创建全屏遮罩
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;flex-direction:column;justify-content:center;align-items:center;cursor:zoom-out;animation:fadeIn 0.2s ease-out;';
    modal.onclick = (e) => {
        if (e.target === modal || e.target.tagName === 'IMG') {
            document.body.removeChild(modal);
        }
    };

    // 图片
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width:100%;max-height:85vh;object-fit:contain;transition:transform 0.3s;cursor:zoom-out;';

    // 下载按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'margin-top:20px;display:flex;gap:16px;z-index:10001;';

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.style.cssText = 'padding:10px 24px;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);border-radius:24px;cursor:pointer;backdrop-filter:blur(4px);';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => document.body.removeChild(modal);

    btnContainer.appendChild(closeBtn);

    // 添加长按保存提示
    const tip = document.createElement('div');
    tip.style.cssText = 'color:rgba(255,255,255,0.7);font-size:13px;margin-top:12px;text-align:center;';
    tip.textContent = '长按图片可保存到相册';

    modal.appendChild(img);
    modal.appendChild(btnContainer);
    if (/MicroMessenger/i.test(navigator.userAgent)) {
        modal.appendChild(tip);
    }
    document.body.appendChild(modal);
}

// 复制到剪贴板辅助函数
function copyToClipboard(btn) {
    const content = decodeURIComponent(btn.getAttribute('data-content'));
    navigator.clipboard.writeText(content).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '已复制!';
        setTimeout(() => btn.textContent = originalText, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败');
    });
}

// 复制报告话术
window.copyReportScript = function (type) {
    console.log('[copyReportScript] 尝试复制话术, 类型:', type);

    if (!AppState.globalSettings) {
        console.warn('[copyReportScript] 全局设置未加载');
        showToast('配置加载中，请稍后...');
        AppState.loadGlobalSettings();
        return;
    }

    let content = '';
    if (type === 'pre') {
        content = AppState.globalSettings.zqbg;
    } else if (type === 'post') {
        content = AppState.globalSettings.zhbg;
    }

    if (!content) {
        console.warn('[copyReportScript] 对应话术为空, type:', type);
        showToast('未配置相关话术');
        return;
    }

    navigator.clipboard.writeText(content).then(() => {
        showToast('话术已复制');
    }).catch(err => {
        console.error('[copyReportScript] 复制失败:', err);
        showToast('复制失败，请重试');
    });
};

// ==================== 会员与订单功能 ====================
function showMyOrders() {
    renderMyOrdersPage();
}

// 渲染我的订单页面
async function renderMyOrdersPage(refresh = false) {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // 获取真实数据 - 我的订单
    let myOrders = [];

    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        const userInfo = window.wechatLogin.getUserInfo();
        const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
        const userId = rawUser && rawUser.rowid ? rawUser.rowid : null;

        if (userId && window.fetchUserRecords) {
            try {
                const allRecords = await window.fetchUserRecords(userId);

                // 筛选订单记录: 
                // 1. 会员充值 (hycz == '1' 或 true)
                // 2. 资源点充值 (jine > 0)
                const orderRecords = allRecords.filter(r => {
                    const isMemberRecharge = r.hycz === '1' || r.hycz === true || r.hycz === 'true';
                    const isResourceRecharge = (parseFloat(r.jine) > 0);
                    return isMemberRecharge || isResourceRecharge;
                });

                myOrders = orderRecords.map(r => {
                    const isMember = r.hycz === '1' || r.hycz === true || r.hycz === 'true';
                    const name = r.mingcheng || (isMember ? '会员充值' : `充值 ${r.token || 0} 资源点`);
                    return {
                        id: r.rowid ? r.rowid.substring(0, 8).toUpperCase() : 'UNKNOWN',
                        date: r.ctime ? formatDateTimeForInput(r.ctime).replace('T', ' ') : '',
                        name: name,
                        price: r.jine || 0,
                        status: '已完成',
                        statusClass: 'success',
                        type: isMember ? 'membership' : 'resource'
                    };
                });

            } catch (e) {
                console.error('获取订单记录失败:', e);
                showToast('获取数据失败');
            }
        }
    }

    // 如果没有数据，显示空状态或保留少量Mock数据用于演示（可选）
    if (myOrders.length === 0 && !window.wechatLogin?.isLoggedIn()) {
        // Mock数据 - 我的订单 (仅显示已完成记录) - 仅未登录时显示
        myOrders = [
            { id: 'ORD20260112001', date: '2026-01-12 10:30', name: '高级套餐 (3个月)', price: 258, status: '已支付', statusClass: 'success', type: 'membership' },
            { id: 'ORD20260105002', date: '2026-01-05 15:45', name: '资源点充值 (100点)', price: 99, status: '已支付', statusClass: 'success', type: 'resource' }
        ];
    }

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
        
        <div class="p-2" id="orders-list-container">
            <!-- 全部订单 -->
            <div id="all-orders" class="tab-content active">
                ${myOrders.map(order => `
                    <div class="card mb-2">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">订单号: ${order.id}</div>
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

    // 初始化下拉刷新
    const listContainer = document.getElementById('orders-list-container');
    if (listContainer) {
        new PullToRefresh(listContainer, async () => {
            if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
                await renderMyOrdersPage(true); // true for refresh
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    }
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
    console.log('开始渲染会员权益页面...');
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    if (!container) {
        console.error('未找到 main-content 容器');
        return;
    }

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    const packages = getMembershipPackages();

    // 获取当前用户的会员等级 (保留用于显示，不再限制逻辑)
    let userLevel = '免费版';
    let expiryDate = '';
    let daysLeft = 0;
    let syzyd = '0'; // 剩余资源点
    let ljxhzyd = '0'; // 累计消耗资源点

    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        const userInfo = window.wechatLogin.getUserInfo();
        if (userInfo && userInfo.raw) {
            userLevel = userInfo.raw.dengji || '免费版';
            expiryDate = userInfo.raw.hydqsj || '';
            syzyd = userInfo.raw.syzyd || '0';
            ljxhzyd = userInfo.raw.ljxhzyd || '0';

            if (expiryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expiry = new Date(expiryDate);
                expiry.setHours(0, 0, 0, 0);
                const diffTime = expiry - today;
                daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            console.log('会员权益页用户信息:', { userLevel, expiryDate, daysLeft, syzyd, ljxhzyd });
        }
    }
    const isVip = userLevel === '会员' || userLevel.includes('会员');

    // 默认选中第一个套餐 (非免费版)
    let selectedPackage = packages.find(pkg => !pkg.isFree) || packages[0];

    // 获取全局设置中的资源剩余量
    const globalSettings = AppState.globalSettings || {};
    const monthlyRemaining = globalSettings.dy_sy || '103444';
    const fixedRemaining = globalSettings.gd_sy || '109289';

    try {
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
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                    <path d="M2 17l10 5 10-5"></path>
                                    <path d="M2 12l10 5 10-5"></path>
                                </svg>
                                剩余资源点
                            </div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">${syzyd}<span style="font-size: 12px; font-weight: 400; margin-left: 2px; color: var(--text-secondary);">点</span></div>
                        </div>
                        <div style="width: 1px; background-color: rgba(59, 130, 246, 0.1);"></div>
                        <div style="flex: 1; padding-left: 12px;">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                累计消耗
                            </div>
                            <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">${ljxhzyd}<span style="font-size: 12px; font-weight: 400; margin-left: 2px; color: var(--text-secondary);">点</span></div>
                        </div>
                    </div>

                    ${(isVip && expiryDate) ? `
                    <div style="margin-top: -12px; margin-bottom: 20px; padding: 12px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2); display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.05);">
                        <div style="background: #f59e0b; border-radius: 8px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="width: 18px; height: 18px;">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">尊享会员有效期</div>
                            <div style="font-size: 15px; color: #78350f; font-weight: 700;">${expiryDate}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: #92400e; margin-bottom: 2px;">剩余天数</div>
                            <div style="font-size: 15px; color: #f59e0b; font-weight: 700;">
                                ${daysLeft > 0 ? `${daysLeft}<span style="font-size: 12px; font-weight: 500; margin-left: 2px;">天</span>` : (daysLeft === 0 ? '今天到期' : '已过期')}
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <h3 class="card-title mb-2">选择权益</h3>
                    
                    <div class="package-list" id="packageList">
                        ${packages.map(pkg => {
            const isSelected = pkg.id === selectedPackage.id;

            let itemStyle = `border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 12px; position: relative; transition: all 0.2s; cursor: pointer;`;
            if (isSelected) {
                itemStyle += `border-color: var(--primary-color); background-color: rgba(59, 130, 246, 0.05);`;
            }

            let descriptionHtml = pkg.description;
            try {
                if (typeof marked !== 'undefined' && marked.parse) {
                    descriptionHtml = marked.parse(pkg.description);
                } else {
                    descriptionHtml = pkg.description.replace(/\n/g, '<br>');
                }
            } catch (e) {
                console.warn('Markdown 解析失败:', e);
                descriptionHtml = pkg.description.replace(/\n/g, '<br>');
            }

            return `
                                <div class="package-item ${isSelected ? 'selected' : ''}" 
                                     onclick="selectPackage(${pkg.id})" 
                                     style="${itemStyle}">
                                    <div class="flex justify-between items-center mb-2">
                                        <h4 style="font-size: 16px; font-weight: 600; margin: 0;">
                                            ${pkg.name}
                                        </h4>
                                        <div style="font-size: 18px; font-weight: 700; color: var(--primary-color);">
                                            ${pkg.isFree ? '免费' : '¥' + pkg.price}
                                        </div>
                                    </div>
                                    <!-- Markdown 描述内容 -->
                                    <div class="markdown-content" style="font-size: 14px; color: var(--text-secondary);">
                                        ${descriptionHtml}
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
            
            <!-- 固定底部区域 -->
            <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background-color: var(--bg-color); border-top: 1px solid var(--border-color); padding: 8px 16px; display: flex; align-items: center; z-index: 100;">
                <button class="btn btn-primary w-full" id="subscribeBtn" onclick="subscribePackage()" style="padding: 10px 20px; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                    ${selectedPackage.isFree ? '当前等级' : `立即开通 (¥${selectedPackage.price})`}
                </button>
            </div>
        `;
        console.log('会员权益页面渲染完成');
    } catch (error) {
        console.error('渲染会员权益页面出错:', error);
        showToast('页面加载失败，请重试');
    }
}

// 选择权益
function selectPackage(packageId) {
    const packageList = document.getElementById('packageList');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const packages = getMembershipPackages();
    const pkg = packages.find(p => p.id === packageId);

    if (!pkg) return;

    // 更新选择状态 UI
    const packageItems = packageList.querySelectorAll('.package-item');
    packageItems.forEach(item => {
        item.classList.remove('selected');
        item.style.borderColor = 'var(--border-color)';
        item.style.backgroundColor = 'transparent';
    });

    const selectedItem = packageList.querySelector(`[onclick="selectPackage(${packageId})"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedItem.style.borderColor = 'var(--primary-color)';
        selectedItem.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    }

    // 更新按钮显示
    if (pkg.isFree) {
        subscribeBtn.textContent = '当前等级';
        subscribeBtn.disabled = true;
        subscribeBtn.style.opacity = '0.6';
    } else {
        subscribeBtn.textContent = `立即开通 (¥${pkg.price})`;
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

    if (!pkg || pkg.isFree) return;

    // 检查登录状态
    const isLoggedIn = window.wechatLogin && window.wechatLogin.isLoggedIn();

    if (!isLoggedIn) {
        showToast('请先登录');
        setTimeout(() => {
            if (window.wx && window.wx.miniProgram) {
                window.wx.miniProgram.navigateTo({
                    url: '/pages/login/index'
                });
            }
        }, 1000);
        return;
    }

    // 已登录，跳转到小程序支付页面
    if (window.wx && window.wx.miniProgram) {
        window.wx.miniProgram.navigateTo({
            url: `/pages/payment/index?amount=${pkg.price}&description=${encodeURIComponent('购买' + pkg.name)}`
        });
    } else {
        showToast(`当前环境不支持支付：即将开通${pkg.name}，价格¥${pkg.price}`);
    }
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

// 显示用户协议页面
function showUserAgreement() {
    renderUserAgreementPage();
}

// 渲染用户协议页面
function renderUserAgreementPage() {
    console.log('开始渲染用户协议页面...');
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    if (!container) {
        console.error('未找到 main-content 容器');
        return;
    }

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // 获取协议内容
    let content = '暂无协议内容';
    if (AppState.globalSettings && AppState.globalSettings.dlyhxy) {
        content = AppState.globalSettings.dlyhxy;
    }

    // 解析 Markdown
    let htmlContent = content;
    if (typeof marked !== 'undefined' && typeof marked.parse === 'function') {
        try {
            htmlContent = marked.parse(content);
        } catch (e) {
            console.error('Markdown 解析失败:', e);
            htmlContent = `<pre>${escapeHtml(content)}</pre>`;
        }
    } else {
        htmlContent = `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(content)}</pre>`;
    }

    // 注入 Markdown 样式
    const markdownStyle = `
        <style>
            .markdown-body h1 { font-size: 1.5em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.4; }
            .markdown-body h2 { font-size: 1.3em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.4; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
            .markdown-body h3 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.5em; line-height: 1.4; }
            .markdown-body p { margin-bottom: 1em; line-height: 1.6; }
            .markdown-body ul, .markdown-body ol { padding-left: 1.5em; margin-bottom: 1em; }
            .markdown-body ul { list-style-type: disc; }
            .markdown-body ol { list-style-type: decimal; }
            .markdown-body li { margin-bottom: 0.25em; }
            .markdown-body blockquote { border-left: 4px solid var(--border-color); padding-left: 1em; color: var(--text-secondary); margin: 0 0 1em 0; }
            .markdown-body code { background-color: rgba(0,0,0,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
            .markdown-body pre { background-color: rgba(0,0,0,0.05); padding: 1em; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
            .markdown-body pre code { background-color: transparent; padding: 0; }
            .markdown-body strong { font-weight: 600; }
            .markdown-body a { color: var(--primary-color); text-decoration: none; }
            .markdown-body hr { height: 1px; background-color: var(--border-color); border: none; margin: 1.5em 0; }
            .markdown-body table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
            .markdown-body th, .markdown-body td { border: 1px solid var(--border-color); padding: 8px; text-align: left; }
            .markdown-body th { background-color: rgba(0,0,0,0.02); font-weight: 600; }
        </style>
    `;

    container.innerHTML = `
        ${markdownStyle}
        <div class="ai-header" style="position: sticky; top: 0; z-index: 100; background-color: var(--bg-color); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center;">
                <button class="btn btn-icon btn-outline" onclick="goBackToSettings()" style="width: 72px; height: 30px; padding: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
            </div>
            <div style="font-size: 16px; font-weight: 500; text-align: center;">登录用户协议</div>
            <div style="width: 72px;"></div>
        </div>
        
        <div style="padding: 20px; background-color: var(--card-bg); min-height: calc(100vh - 55px);">
            <div class="markdown-body" style="line-height: 1.6; color: var(--text-primary);">
                ${htmlContent}
            </div>
        </div>
    `;

    // 滚动到顶部
    window.scrollTo(0, 0);
}

function showMembershipBenefits() {
    renderMembershipPage();
}

// 渲染消耗明细页面
async function renderConsumptionDetailsPage(refresh = false) {
    const container = document.getElementById('main-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // 隐藏底部导航栏，因为这是二级页面
    if (bottomNav) {
        bottomNav.style.display = 'none';
    }

    // 获取真实数据
    let resourceConsumption = [];
    let reportGeneration = [];
    let currentTotalBalance = 0;

    if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
        const userInfo = window.wechatLogin.getUserInfo();
        const rawUser = userInfo && userInfo.raw ? userInfo.raw : null;
        const userId = rawUser && rawUser.rowid ? rawUser.rowid : null;

        if (userId) {
            try {
                // 1. 获取最新用户信息以得到当前剩余资源点
                if (typeof window.MingDaoYunAPI !== 'undefined') {
                    const userApi = new window.MingDaoYunAPI();
                    const userResult = await userApi.getData({
                        worksheetId: 'peizhenshi',
                        rowId: userId
                    });
                    if (userResult && userResult.data) {
                        currentTotalBalance = parseFloat(userResult.data.syzyd) || 0;
                    } else if (rawUser) {
                        currentTotalBalance = parseFloat(rawUser.syzyd) || 0;
                    }
                }

                // 2. 获取用户记录
                if (window.fetchUserRecords) {
                    const allRecords = await window.fetchUserRecords(userId);

                    // 过滤出资源点相关记录并按时间倒序排列
                    const tokenRecords = allRecords
                        .filter(r => r.token && parseFloat(r.token) !== 0)
                        .sort((a, b) => new Date(b.ctime) - new Date(a.ctime));

                    // 计算历史余额
                    // 逻辑：当前记录的余额 = 上一条记录的余额 - 上一条记录的变动金额
                    // 但这里是倒序，所以：
                    // 最新一条记录(i=0)的余额 = 当前总余额
                    // 下一条记录(i=1)的余额 = 上一条记录(i=0)的余额 - 上一条记录(i=0)的变动金额

                    let runningBalance = currentTotalBalance;

                    resourceConsumption = tokenRecords.map((r, index) => {
                        const amount = parseFloat(r.token);
                        const recordBalance = runningBalance;

                        // 为下一次迭代（更早的记录）准备余额
                        // 如果当前记录是 +10，那么发生前的余额就是 runningBalance - 10
                        runningBalance = runningBalance - amount;

                        return {
                            id: r.rowid,
                            date: r.ctime ? formatDateTimeForInput(r.ctime).replace('T', ' ') : '',
                            description: r.xhmx || r.mingcheng || '资源点变动',
                            amount: amount,
                            balance: recordBalance
                        };
                    });

                    // 3. 报告生成明细 (名称或详情包含"报告")
                    reportGeneration = allRecords
                        .filter(r => (r.mingcheng && r.mingcheng.includes('报告')) || (r.xhmx && r.xhmx.includes('报告')))
                        .map(r => ({
                            id: r.rowid,
                            date: r.ctime ? formatDateTimeForInput(r.ctime).replace('T', ' ') : '',
                            patient: r.mingcheng || '未知', // 暂时使用名称代替患者
                            type: r.mingcheng || '诊后报告',
                            status: '已完成'
                        }));
                }
            } catch (e) {
                console.error('获取消耗明细失败:', e);
                showToast('获取数据失败');
            }
        }
    }

    // 如果没有数据且未登录，显示Mock数据
    if (resourceConsumption.length === 0 && reportGeneration.length === 0 && !window.wechatLogin?.isLoggedIn()) {
        // Mock数据 - 资源点消耗明细
        resourceConsumption = [
            { id: 1, date: '2026-01-10', description: 'AI健康咨询', amount: -5, balance: 125 },
            { id: 2, date: '2026-01-08', description: '药品信息查询', amount: -3, balance: 130 },
            { id: 3, date: '2026-01-05', description: '资源点充值', amount: 100, balance: 133 },
            { id: 4, date: '2026-01-03', description: 'AI健康咨询', amount: -5, balance: 33 },
            { id: 5, date: '2026-01-01', description: '新年福利', amount: 50, balance: 38 }
        ];

        // Mock数据 - 报告生成明细
        reportGeneration = [
            { id: 1, date: '2026-01-09', patient: '张三', type: '诊断报告', status: '已完成' },
            { id: 2, date: '2026-01-06', patient: '李四', type: '陪诊记录', status: '已完成' },
            { id: 3, date: '2026-01-04', patient: '王五', type: '诊断报告', status: '已完成' },
            { id: 4, date: '2026-01-02', patient: '赵六', type: '健康评估', status: '已完成' }
        ];
    }

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
        
        <div class="p-2" id="consumption-list-container">
        
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
                                ${item.balance !== null ? `<div style="font-size: 12px; color: var(--text-secondary);">余额: ${item.balance}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${resourceConsumption.length === 0 ? '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无记录</div>' : ''}
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
                                <div style="font-size: 12px; color: var(--text-secondary);">详情: ${item.patient}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${item.date}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${reportGeneration.length === 0 ? '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无记录</div>' : ''}
                </div>
            </div>
        </div>
        </div>
    `;

    // 初始化下拉刷新
    const listContainer = document.getElementById('consumption-list-container');
    if (listContainer) {
        new PullToRefresh(listContainer, async () => {
            if (window.wechatLogin && window.wechatLogin.isLoggedIn()) {
                await renderConsumptionDetailsPage(true); // 刷新数据
            } else {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    }
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

function formatDateTimeForInput(dateValue) {
    if (!dateValue) return '';
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const pad = n => n.toString().padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const mi = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${mi}`;
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
    // 临时绕过登录检查，直接返回true，用于测试语音识别功能
    if (callback) callback();
    return true;

    /* 注释掉原有的登录检查逻辑
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
    */
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

let globalLoadingOverlay = null;

/**
 * 显示全局加载遮罩
 * @param {string} message 提示文字
 */
function showLoading(message = '请稍候...') {
    if (!globalLoadingOverlay) {
        globalLoadingOverlay = document.createElement('div');
        globalLoadingOverlay.className = 'loading-overlay';
        globalLoadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        document.body.appendChild(globalLoadingOverlay);
    } else {
        const textEl = globalLoadingOverlay.querySelector('.loading-text');
        if (textEl) textEl.textContent = message;
    }

    // 强制重绘
    globalLoadingOverlay.offsetHeight;
    globalLoadingOverlay.classList.add('show');
}

/**
 * 隐藏全局加载遮罩
 */
function hideLoading() {
    if (globalLoadingOverlay) {
        globalLoadingOverlay.classList.remove('show');
    }
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

    // 异步渲染补救方案：强制初始渲染使用 setTimeout(0)
    // 将其推入下一个事件循环，确保此时所有的 DOM 节点都已经渲染完毕且可用
    setTimeout(() => {
        console.log('[强制刷新] 执行强制初始渲染');
        renderCurrentPage();
        // 初始化开发模式
        if (typeof initDevMode === 'function') {
            initDevMode();
        }
    }, 0);
}

// 页面初始化状态校验 (Initialization Fallback)
// 在单页应用中，脚本加载和 DOM 就绪的顺序可能因网络抖动而不确定
// 通过状态检测确保初始化逻辑（尤其是首屏渲染）必定触发
if (document.readyState === 'loading') {
    // 如果 DOM 还在加载中，监听 DOMContentLoaded 事件
    document.addEventListener('DOMContentLoaded', function () {
        console.log('[强制刷新] DOM 加载完成，执行初始化');
        initApp();
    });
} else {
    // 如果 DOM 已经加载完成，立即执行初始化
    console.log('[强制刷新] DOM 已就绪，立即执行初始化');
    initApp();
}

// ==================== 开发模式管理 ====================
let devModeActive = false; // 默认关闭，由父窗口控制

function initDevMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === '1';

    if (isDev) {
        console.log('--- 开发模式已就绪 (等待激活) ---');
        // 添加全局样式
        const style = document.createElement('style');
        style.textContent = `
            /* 开发模式激活时的全局提示 */
            .dev-mode-active::before {
                content: '开发编辑模式已开启 - 点击元素选择类名';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                text-align: center;
                font-size: 12px;
                padding: 4px 0;
                z-index: 20000;
                pointer-events: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .dev-mode-active {
                cursor: crosshair !important;
            }
            .dev-mode-active * {
                cursor: crosshair !important;
            }
            /* 选中效果 */
            .dev-mode-active .dev-mode-selected {
                outline: 2px solid #3b82f6 !important;
                outline-offset: -2px !important;
                position: relative;
                transition: outline 0.2s;
            }
            .dev-mode-active .dev-mode-selected::after {
                content: attr(data-dev-class);
                position: absolute;
                top: 0;
                right: 0;
                background: #3b82f6;
                color: white;
                font-size: 10px;
                padding: 2px 4px;
                z-index: 10000;
                pointer-events: none;
                border-bottom-left-radius: 4px;
                line-height: 1;
                font-weight: bold;
                box-shadow: -1px 1px 4px rgba(0,0,0,0.2);
            }
            /* 隐藏滚动条，模拟手机体验 */
            ::-webkit-scrollbar {
                display: none;
            }
            * {
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE/Edge */
            }
        `;
        document.head.appendChild(style);

        // 监听来自父窗口的状态切换消息
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'toggle-dev-mode') {
                devModeActive = event.data.active;
                console.log(`[DevMode] 状态切换: ${devModeActive ? '开启' : '关闭'}`);
                if (devModeActive) {
                    document.body.classList.add('dev-mode-active');
                } else {
                    document.body.classList.remove('dev-mode-active');
                    // 关闭时清除选中样式
                    document.querySelectorAll('.dev-mode-selected').forEach(el => {
                        el.classList.remove('dev-mode-selected');
                        el.removeAttribute('data-dev-class');
                    });
                }
            }
        });

        // 初始检查 URL 或 Hash 中的 class
        const checkInitialClass = () => {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const targetClass = hashParams.get('class');

            if (targetClass) {
                const element = document.querySelector(`.${targetClass}`);
                if (element) {
                    element.classList.add('dev-mode-selected');
                    element.setAttribute('data-dev-class', targetClass);
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };

        setTimeout(checkInitialClass, 500);

        window.addEventListener('hashchange', () => {
            if (!devModeActive) return;
            document.querySelectorAll('.dev-mode-selected').forEach(el => {
                el.classList.remove('dev-mode-selected');
                el.removeAttribute('data-dev-class');
            });
            checkInitialClass();
        });

        // 监听全局点击事件 (使用捕获阶段以优先处理)
        document.addEventListener('click', (e) => {
            // 如果不是开发模式，不拦截点击，允许正常交互
            if (!devModeActive) return;

            let target = e.target;
            while (target && target !== document.body) {
                if (target.className && typeof target.className === 'string') {
                    const classes = target.className.split(/\s+/).filter(c =>
                        c &&
                        c !== 'dev-mode-selected' &&
                        c !== 'selected' &&
                        c !== 'active' &&
                        c !== 'hidden'
                    );

                    if (classes.length > 0) {
                        const className = classes[0];
                        e.preventDefault();
                        e.stopPropagation();

                        updateUrlClass(className);

                        document.querySelectorAll('.dev-mode-selected').forEach(el => {
                            el.classList.remove('dev-mode-selected');
                            el.removeAttribute('data-dev-class');
                        });
                        target.classList.add('dev-mode-selected');
                        target.setAttribute('data-dev-class', className);

                        break;
                    }
                }
                target = target.parentElement;
            }
        }, true);
    }
}

function updateUrlClass(className) {
    // 根据用户要求：如果 class 值变化会导致页面刷新就用 hash 值
    // 我们直接更新 hash，这样既能保存状态又不会导致 iframe 重新加载
    const hash = window.location.hash;
    const newHash = `#class=${className}`;

    if (hash !== newHash) {
        window.location.hash = newHash;

        // 通知父窗口 (如果是 iframe 嵌入)
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'dev-class-selected',
                className: className,
                hash: newHash
            }, '*');
        }
    }
}
