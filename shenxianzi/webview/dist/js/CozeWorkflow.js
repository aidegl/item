// Coze工作流API调用模块
class CozeWorkflow {
    constructor() {
        this.apiUrl = 'https://api.coze.cn/v1/workflow/run';
        this.workflowId = '7592462671246802954';
        this.bearerToken = ''; // 请在此处填写您的Coze API密钥
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.bearerToken = apiKey;
    }

    // 设置工作流ID
    setWorkflowId(workflowId) {
        this.workflowId = workflowId;
    }

    // 调用Coze工作流API
    async runWorkflow(imageUrl) {
        try {
            this.log('开始调用API', { imageUrl });

            // 先打印请求体，即使API密钥未设置
            const requestBody = {
                workflow_id: this.workflowId,
                parameters: {
                    input: imageUrl
                }
            };
            this.log('API请求体', requestBody);

            if (!this.bearerToken) {
                throw new Error('Coze API密钥未设置');
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.bearerToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const ct = response.headers.get('content-type') || '';
            const isJson = ct.includes('application/json');
            const result = isJson ? await response.json() : await response.text();

            if (response.ok) {
                this.log('调用成功', result);
                return {
                    success: true,
                    data: result
                };
            } else {
                this.error('调用失败', result);
                return {
                    success: false,
                    error: result
                };
            }
        } catch (e) {
            this.error('API调用异常', e);
            return {
                success: false,
                error: e.message
            };
        }
    }

    // 日志记录（与主页面保持一致的格式）
    log(message, data = {}) {
        const time = new Date().toLocaleTimeString();
        console.log(`[Coze工作流] ${time} - ${message}`, data);

        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.borderBottom = '1px dashed #333';

            let detailStr = '';
            try {
                if (data) detailStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
            } catch (e) { detailStr = '[对象循环引用]'; }

            line.innerHTML = `<span style="color:#888">[${time}]</span> <span style="color:#4facfe">[Coze工作流]</span> ${message} <span style="color:#aaa">${detailStr}</span>`;
            const anchor = logEl.children.length > 1 ? logEl.children[1] : null;
            logEl.insertBefore(line, anchor);
        }
    }

    // 错误记录（与主页面保持一致的格式）
    error(message, data = {}) {
        const time = new Date().toLocaleTimeString();
        console.error(`[Coze工作流] ${time} - ${message}`, data);

        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.color = '#ff6b6b';
            line.style.borderBottom = '1px dashed #333';

            let detailStr = '';
            try {
                if (data) detailStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
            } catch (e) { detailStr = '[Error Object]'; }

            line.innerHTML = `<span style="color:#888">[${time}]</span> <span style="color:#ff6b6b">[Coze工作流]</span> ${message} <span>${detailStr}</span>`;
            const anchor = logEl.children.length > 1 ? logEl.children[1] : null;
            logEl.insertBefore(line, anchor);
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CozeWorkflow;
}

// 全局实例
window.cozeWorkflow = new CozeWorkflow();