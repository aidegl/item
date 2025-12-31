const app = {
    state: {
        currentSection: 'dashboard',
        isCalling: false,
        currentPatient: null,
        visitType: null,
        preDiagData: null
    },

    init: function() {
        console.log('App initialized');
        // Initial setup if needed
    },

    navigateTo: function(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
        // Show target section
        document.getElementById(sectionId).classList.add('active');
        
        // Update header
        const backBtn = document.getElementById('backBtn');
        const pageTitle = document.getElementById('pageTitle');
        
        if (sectionId === 'dashboard') {
            backBtn.style.display = 'none';
            pageTitle.textContent = '任务中心';
        } else {
            backBtn.style.display = 'block';
            backBtn.onclick = () => app.navigateTo('dashboard');
            
            // Set specific titles
            if(sectionId === 'pre-diagnosis') pageTitle.textContent = '诊前沟通';
            if(sectionId === 'visit-record') pageTitle.textContent = '就诊登记';
            if(sectionId === 'report-gen') {
                pageTitle.textContent = '报告生成';
                app.loadReportData(); // Auto-fill data when entering report page
            }
        }
        
        this.state.currentSection = sectionId;
    },

    // Module 1: Call & AI
    toggleCallState: function() {
        const btn = document.getElementById('startCallBtn');
        const indicator = document.getElementById('recordingIndicator');
        const teleprompter = document.getElementById('teleprompter');
        
        if (!this.state.isCalling) {
            // Start Call
            this.state.isCalling = true;
            btn.textContent = '🔴 挂断电话';
            btn.classList.add('btn-secondary');
            indicator.style.display = 'block';
            teleprompter.style.display = 'block';
            
            // Simulate timer
            let seconds = 0;
            this.callTimer = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                indicator.innerText = `● 正在录音... (${mins}:${secs})`;
            }, 1000);
            
        } else {
            // End Call manually (same as endCall function)
            this.endCall();
        }
    },

    endCall: function() {
        if (!this.state.isCalling) return;
        
        clearInterval(this.callTimer);
        this.state.isCalling = false;
        
        const btn = document.getElementById('startCallBtn');
        const indicator = document.getElementById('recordingIndicator');
        const teleprompter = document.getElementById('teleprompter');
        const aiResult = document.getElementById('aiResult');
        
        btn.textContent = '📞 开始通话';
        btn.classList.remove('btn-secondary');
        indicator.style.display = 'none';
        teleprompter.style.display = 'none';
        
        // Show AI loading simulation
        alert('通话结束，正在上传录音并进行AI分析...');
        setTimeout(() => {
            aiResult.style.display = 'block';
            // Fill with mock data
            document.getElementById('symptom').value = MOCK_AI_TRANSCRIPT.symptom;
            document.getElementById('startTime').value = MOCK_AI_TRANSCRIPT.startTime;
            document.getElementById('coreQuestion').value = MOCK_AI_TRANSCRIPT.coreQuestion;
        }, 1000);
    },

    savePreDiag: function() {
        // Save to state
        this.state.preDiagData = {
            symptom: document.getElementById('symptom').value,
            startTime: document.getElementById('startTime').value,
            coreQuestion: document.getElementById('coreQuestion').value
        };
        alert('就诊需求书已保存！');
        this.navigateTo('dashboard');
    },

    // Module 2: Visit Record
    loadPatientData: function() {
        const select = document.getElementById('patientSelect');
        const val = select.value;
        const infoDiv = document.getElementById('patientInfo');
        
        if (val && MOCK_PATIENTS[val]) {
            const p = MOCK_PATIENTS[val];
            this.state.currentPatient = p;
            
            infoDiv.style.display = 'block';
            document.getElementById('pName').value = p.name + ` (${p.gender}, ${p.age}岁)`;
            document.getElementById('pAllergy').value = p.allergy;
        } else {
            infoDiv.style.display = 'none';
            this.state.currentPatient = null;
        }
    },

    selectVisitType: function(el, type) {
        // Clear others
        document.querySelectorAll('.tag').forEach(t => t.classList.remove('selected'));
        // Select this
        el.classList.add('selected');
        this.state.visitType = type;
    },

    saveVisitRecord: function() {
        if (!this.state.currentPatient) {
            alert('请选择患者');
            return;
        }
        if (!this.state.visitType) {
            alert('请选择就诊类型');
            return;
        }
        alert('就诊信息登记成功！');
        this.navigateTo('dashboard');
    },

    // Module 3: Report
    loadReportData: function() {
        const reportRequestInput = document.getElementById('reportRequest');
        
        if (this.state.preDiagData) {
            reportRequestInput.value = `${this.state.preDiagData.coreQuestion} (症状: ${this.state.preDiagData.symptom})`;
        } else {
            reportRequestInput.value = "暂无诊前数据";
        }
    },

    simulateOCR: function() {
        alert('正在进行OCR识别...');
        setTimeout(() => {
            document.getElementById('ocrResult').style.display = 'block';
            document.getElementById('ocrDiagnosis').value = MOCK_OCR_RESULT.diagnosis;
            document.getElementById('ocrAdvice').value = MOCK_OCR_RESULT.advice;
        }, 1500);
    }
};

// Initialize
window.onload = function() {
    app.init();
};
