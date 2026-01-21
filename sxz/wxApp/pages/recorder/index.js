const plugin = requirePlugin('WechatSI');
const manager = plugin.getRecordRecognitionManager();

Page({
    data: {
        isRecording: false,
        seconds: 0,
        timerDisplay: '00:00',
        resultText: '',
        statusText: '未开始录音',
        recordButtonText: '开始录音',
        sttType: 'default' // 识别类型：pre (诊前), post (诊后), default
    },

    onLoad(options) {
        this._timer = null;
        this.isUserStop = false; 
        this.allSegments = []; // 物理存储：所有已完成段落的文字数组
        this.currentSegmentText = ''; // 物理存储：当前正在识别段落的文字
        this.isSegmentActive = false; // 标志：当前段落是否活跃
        
        if (options.type) {
            this.setData({ sttType: options.type });
        }
        
        console.log('--- 录音页面加载 ---, 类型:', this.data.sttType);
        this.initManager();
    },

    onUnload() {
        this.isUserStop = true; 
        this.isSegmentActive = false;
        this.stopTimer();
        try {
            manager.stop();
        } catch (e) {}
    },

    initManager() {
        manager.onStart = (res) => {
            this.isSegmentActive = true;
            console.log('[录音开始] 段落启动');
        };

        manager.onRecognize = (res) => {
            if (!this.isSegmentActive) return;
            const text = res.result || '';
            this.currentSegmentText = text; 
            const fullContent = this.allSegments.join('') + text;
            
            // 打印日志，监控字数，排查是否被截断
            console.log(`[识别中] 当前总字数: ${fullContent.length}`);
            
            this.setData({ 
                resultText: fullContent
            });
        };

        manager.onStop = (res) => {
            if (!this.isSegmentActive) return;
            this.isSegmentActive = false;
            
            console.log('[录音停止] 收到结果');
            const finalShot = res.result || this.currentSegmentText || '';
            
            if (finalShot) {
                this.allSegments.push(finalShot);
            }
            
            this.currentSegmentText = '';
            
            // 4. 同步到 UI
            const finalFullText = this.allSegments.join('');
            console.log(`[段落结束] 当前累计总字数: ${finalFullText.length}`);
            
            this.setData({
                resultText: finalFullText
            });

            if (!this.isUserStop) {
                setTimeout(() => {
                    if (!this.isUserStop) {
                        this.startRecord(true); 
                    }
                }, 300);
            } else {
                this.setData({
                    isRecording: false,
                    statusText: '录音已结束',
                    recordButtonText: '开始录音'
                });
                this.stopTimer();
            }
        };

        manager.onError = (res) => {
            this.isSegmentActive = false;
            console.error('[录音错误]', res);
            
            if (this.currentSegmentText) {
                this.allSegments.push(this.currentSegmentText);
                this.currentSegmentText = '';
                this.setData({
                    resultText: this.allSegments.join('')
                });
            }

            if (!this.isUserStop) {
                setTimeout(() => {
                    if (!this.isUserStop) this.startRecord(true);
                }, 1000);
            } else {
                this.setData({
                    isRecording: false,
                    statusText: '录音出错',
                    recordButtonText: '重新录音'
                });
                this.stopTimer();
            }
        };
    },

    onToggleRecord() {
        if (this.data.isRecording) {
            this.isUserStop = true;
            this.stopRecord();
        } else {
            this.isUserStop = false;
            this.startRecord(false);
        }
    },

    startRecord(isContinuation = false) {
        if (!isContinuation) {
            this.allSegments = []; // 新录音，清空物理变量
            this.currentSegmentText = '';
            this.setData({
                seconds: 0,
                timerDisplay: '00:00',
                resultText: ''
            });
            this.startTimer();
        }

        this.setData({
            isRecording: true,
            statusText: '正在录音...',
            recordButtonText: '停止录音'
        });

        try {
            manager.start({
                duration: 59000, 
                lang: 'zh_CN'
            });
        } catch (e) {
            console.error('[启动失败]', e);
            if (!isContinuation) {
                this.setData({ isRecording: false, statusText: '启动失败' });
                this.stopTimer();
            } else {
                setTimeout(() => {
                    if (!this.isUserStop) this.startRecord(true);
                }, 1000);
            }
        }
    },

    stopRecord() {
        console.log('停止录音操作');
        try {
            manager.stop();
        } catch (e) {
            console.error('停止录音异常:', e.message);
        }
    },

    startTimer() {
        this.stopTimer();
        this._timer = setInterval(() => {
            const next = this.data.seconds + 1;
            this.setData({
                seconds: next,
                timerDisplay: this.formatSeconds(next)
            });
        }, 1000);
    },

    stopTimer() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }
    },

    formatSeconds(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        const mm = m < 10 ? '0' + m : '' + m;
        const ss = s < 10 ? '0' + s : '' + s;
        return mm + ':' + ss;
    },

    onAIIdentify() {
        console.log('--- [步骤1] 准备传回识别数据 ---');
        const content = this.data.resultText;
        
        if (!content) {
            wx.showToast({ title: '没有识别到内容', icon: 'none' });
            return;
        }

        // [用户要求] 点击智能识别时给个提示，显示识别结果
        const typeLabel = this.data.sttType === 'pre' ? '诊前' : (this.data.sttType === 'post' ? '诊后' : '通用');
        wx.showModal({
            title: `识别结果确认 [${typeLabel}]`,
            content: content,
            confirmText: '确认传回',
            success: (res) => {
                if (res.confirm) {
                    console.log('用户确认传回数据, 类型:', this.data.sttType);
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2];
                    
                    if (prevPage) {
                        console.log('[步骤2] 找到上一页，设置 aiContent 和 sttType');
                        prevPage.setData({
                            aiContent: content,
                            sttType: this.data.sttType
                        });
                        
                        wx.navigateBack({
                            delta: 1,
                            success: () => console.log('[步骤4] 返回成功')
                        });
                    }
                }
            }
        });
    }
});

