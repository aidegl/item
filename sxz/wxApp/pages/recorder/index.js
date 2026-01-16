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
        this.addLog('页面加载');
        this.initManager();
    },

    onUnload() {
        this.stopTimer();
        try {
            manager.stop();
        } catch (e) {}
    },

    initManager() {
        manager.onRecognize = (res) => {
            const text = res.result || '';
            if (text) {
                this.setData({ resultText: text });
                this.addLog('识别中: ' + text);
            }
        };

        manager.onStop = (res) => {
            const text = res.result || '';
            this.setData({
                isRecording: false,
                statusText: '录音已结束',
                recordButtonText: '开始录音'
            });
            this.stopTimer();
            if (text) {
                this.setData({ resultText: text });
                this.addLog('识别完成: ' + text);
            } else {
                this.addLog('识别结束，未获取到文本结果');
            }
        };

        manager.onError = (res) => {
            this.setData({
                isRecording: false,
                statusText: '录音出错',
                recordButtonText: '开始录音'
            });
            this.stopTimer();
            const msg = res && res.msg ? res.msg : '未知错误';
            this.addLog('错误: ' + msg);
            wx.showToast({ title: '识别出错', icon: 'none' });
        };
    },

    onToggleRecord() {
        if (this.data.isRecording) {
            this.stopRecord();
        } else {
            this.startRecord();
        }
    },

    startRecord() {
        this.setData({
            isRecording: true,
            seconds: 0,
            timerDisplay: '00:00',
            statusText: '正在录音',
            recordButtonText: '停止录音',
            resultText: ''
        });
        this.addLog('开始录音');
        this.startTimer();
        try {
            manager.start({
                duration: 30000,
                lang: 'zh_CN'
            });
        } catch (e) {
            this.setData({
                isRecording: false,
                statusText: '启动录音失败',
                recordButtonText: '开始录音'
            });
            this.stopTimer();
            this.addLog('启动录音异常: ' + e.message);
            wx.showToast({ title: '录音失败', icon: 'none' });
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

