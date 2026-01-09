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
        <div class="page-header">
            <h1 class="page-title">AI 陪诊助手</h1>
            <p class="page-subtitle">随时为您解答陪诊相关问题</p>
        </div>
        
        <div class="p-2 ai-chat-content">
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
        window.scrollTo(0, document.body.scrollHeight);
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
    
    return AppState.chatMessages.map(msg => `
        <div class="chat-message ${msg.role}">
            <div class="message-avatar">
                ${msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                <div class="message-text">${msg.content}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        </div>
    `).join('');
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

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    AppState.aiQuickQuestionsHidden = true;

    // 添加用户消息
    AppState.chatMessages.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });
    
    input.value = '';
    renderCurrentPage();
    
    // 模拟AI回复
    setTimeout(() => {
        const aiResponse = getAIResponse(message);
        AppState.chatMessages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        });
        AppState.saveToStorage();
        renderCurrentPage();
    }, 1000);
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
                    开始陪诊
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
                    <h1 class="page-title">陪诊流程</h1>
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
                        <label class="form-label">科室 *</label>
                        <input type="text" name="department" class="input" required placeholder="请输入就诊科室">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">医生</label>
                        <input type="text" name="doctor" class="input" placeholder="请输入医生姓名">
                    </div>
                </div>
                
                <div class="card mb-2">
                    <h3 class="card-title mb-2">症状描述</h3>
                    
                    <div class="form-group">
                        <label class="form-label">主要症状 *</label>
                        <textarea name="symptoms" class="textarea" required placeholder="请描述患者的主要症状..."></textarea>
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
}

function handleConsultationSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const consultation = {
        id: Date.now().toString(),
        patientId: AppState.currentPatientId,
        date: formData.get('date'),
        hospital: formData.get('hospital'),
        department: formData.get('department'),
        doctor: formData.get('doctor') || '未记录',
        symptoms: formData.get('symptoms'),
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

// ==================== 备忘录页面 ====================
function renderRecordsList(container) {
    const today = new Date();
    const upcomingReminders = AppState.reminders
        .filter(r => !r.completed && new Date(r.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    container.innerHTML = `
        <div class="page-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="page-title">备忘录</h1>
                    <p class="page-subtitle">${upcomingReminders.length} 个待办事项</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="addReminder()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    添加提醒
                </button>
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

function addReminder() {
    const title = prompt('请输入提醒标题：');
    if (!title) return;
    
    const date = prompt('请输入日期（格式：YYYY-MM-DD）：', new Date().toISOString().split('T')[0]);
    if (!date) return;
    
    const time = prompt('请输入时间（格式：HH:MM）：', '09:00');
    if (!time) return;
    
    const newReminder = {
        id: Date.now().toString(),
        title,
        date,
        time,
        type: 'task',
        completed: false
    };
    
    AppState.reminders.push(newReminder);
    AppState.saveToStorage();
    renderCurrentPage();
    showToast('提醒添加成功');
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
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">设置</h1>
        </div>
        
        <div class="p-2">
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
            
            <div class="card">
                <h3 class="card-title mb-2">关于</h3>
                <div style="color: var(--text-secondary); line-height: 1.8;">
                    <p>版本：1.0.0</p>
                    <p>陪诊助手 - 专业的陪诊服务工具</p>
                    <p style="margin-top: 12px;">© 2026 陪诊助手</p>
                </div>
            </div>
        </div>
    `;
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
    renderCurrentPage();
});
