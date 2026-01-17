const plugin = requirePlugin('WechatSI');
const manager = plugin.getRecordRecognitionManager();

Page({
    data: {
        isRecording: false,
        seconds: 0,
        timerDisplay: '00:00',
        resultText: '',
        statusText: '未开始录音',
        recordButtonText: '开始录音'
    },

    onLoad() {
        this._timer = null;
        this.isUserStop = false; 
        this.allSegments = []; // 物理存储：所有已完成段落的文字数组
        this.currentSegmentText = ''; // 物理存储：当前正在识别段落的文字
        this.isSegmentActive = false; // 标志：当前段落是否活跃
        console.log('--- 录音页面加载 ---');
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
        // 准备要传递的数据
        const content = this.data.resultText;
        // 获取当前页面栈
        const pages = getCurrentPages();
        // 获取上一页面实例
        const prevPage = pages[pages.length - 2];
        
        if (prevPage) {
            // 设置上一页面的data
            prevPage.setData({
                aiContent: content
            });
            // 返回上一页面
            wx.navigateBack({
                delta: 1
            });
        } else {
            // 如果没有上一页面，直接返回
            wx.navigateBack({
                delta: 1
            });
        }
    }
});

