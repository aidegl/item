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
        logs: []
    },

    onLoad() {
        this._timer = null;
        this.isUserStop = false; // 是否为用户手动停止
        this.fullText = ''; // 累积的识别文本
        this.addLog('页面加载');
        this.initManager();
    },

    onUnload() {
        this.isUserStop = true; // 页面卸载时视为停止
        this.stopTimer();
        try {
            manager.stop();
        } catch (e) {}
    },

    initManager() {
        manager.onRecognize = (res) => {
            const currentText = res.result || '';
            // 显示累积文本 + 当前正在识别的文本
            this.setData({ 
                resultText: this.fullText + currentText 
            });
        };

        manager.onStop = (res) => {
            const currentText = res.result || '';
            if (currentText) {
                this.fullText += currentText; // 录音段落结束，将结果累加到全文
                this.setData({ resultText: this.fullText });
            }
            
            this.addLog('录音段落结束' + (this.isUserStop ? ' (用户停止)' : ' (自动续录)'));

            if (!this.isUserStop) {
                // 如果不是用户手动停止（如 60 秒超时），则自动开启下一段录音
                this.addLog('正在自动续录...');
                this.startRecord(true); 
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
            const msg = res && res.msg ? res.msg : '未知错误';
            this.addLog('错误: ' + msg);

            // 如果是某些特定的错误（如超时或环境干扰），且用户没点停止，尝试自动恢复
            if (!this.isUserStop) {
                this.addLog('尝试自动恢复录音...');
                setTimeout(() => {
                    this.startRecord(true);
                }, 500);
                return;
            }

            this.setData({
                isRecording: false,
                statusText: '录音出错',
                recordButtonText: '开始录音'
            });
            this.stopTimer();
            wx.showToast({ title: '识别出错', icon: 'none' });
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
            // 全新开始录音
            this.fullText = '';
            this.setData({
                seconds: 0,
                timerDisplay: '00:00',
                resultText: ''
            });
            this.startTimer();
            this.addLog('开始新录音');
        } else {
            this.addLog('开始续录段落');
        }

        this.setData({
            isRecording: true,
            statusText: '正在录音',
            recordButtonText: '停止录音'
        });

        try {
            manager.start({
                duration: 60000, // 设置最大时长 60 秒
                lang: 'zh_CN'
            });
        } catch (e) {
            this.addLog('启动录音异常: ' + e.message);
            if (!isContinuation) {
                this.setData({
                    isRecording: false,
                    statusText: '启动失败',
                    recordButtonText: '开始录音'
                });
                this.stopTimer();
                wx.showToast({ title: '录音失败', icon: 'none' });
            }
        }
    },

    stopRecord() {
        this.addLog('停止录音');
        try {
            manager.stop();
        } catch (e) {
            this.addLog('停止录音异常: ' + e.message);
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

    addLog(message) {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        const time = h + ':' + m + ':' + s;
        const logs = this.data.logs.slice();
        logs.unshift({ time, message });
        this.setData({ logs });
    }
});

