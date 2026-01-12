// Coze工作流API调用模块
class CozeWorkflow {
    constructor() {
        this.apiUrl = 'https://api.coze.cn/v1/workflow/run';
        this.workflowId = '7593545627851014196';
        this.bearerToken = 'pat_6oqCg3euNcoDO3MdQ4xUaiuXGljmWSEMBVzkYExjO9XXv8f4u0PLA4B2Pb9foQgb'; // Coze API密钥
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

            const headers = {
                'Authorization': `Bearer ${this.bearerToken}`,
                'Content-Type': 'application/json'
            };
            this.log('API请求头', headers);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            const ct = response.headers.get('content-type') || '';
            const isJson = ct.includes('application/json');
            const result = isJson ? await response.json() : await response.text();

            if (response.ok) {
                // 提取需要的数据
                const { usage, data: dataString } = result;
                const tokenCount = usage?.token_count;

                // 解析data字符串为JSON
                let parsedData = null;
                try {
                    parsedData = JSON.parse(dataString);
                } catch (e) {
                    this.error('数据解析失败', e);
                }

                // 只打印需要的字段
                const outputData = {
                    token_count: tokenCount,
                    data: parsedData
                };

                this.log('调用成功 - 输出数据', outputData);

                return {
                    success: true,
                    data: outputData
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

    // 日志记录（简化版本，确保能显示）
    log(message, data = {}) {
        const time = new Date().toLocaleTimeString();
        const logMsg = `[Coze工作流] ${time} - ${message}`;

        // 控制台打印
        console.log(logMsg, data);

        // 页面日志显示 - 简化版本
        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.borderBottom = '1px dashed #333';
            line.style.color = '#4facfe';

            let dataStr = '';
            try {
                if (data) {
                    dataStr = typeof data === 'object' ?
                        JSON.stringify(data, null, 2) :
                        String(data);
                }
            } catch (e) {
                dataStr = '[数据解析错误]';
            }

            // 创建文本节点，避免XSS问题
            line.textContent = `${logMsg} ${dataStr}`;

            // 添加到日志容器的末尾
            logEl.appendChild(line);

            // 自动滚动到底部
            logEl.scrollTop = logEl.scrollHeight;
        }
    }

    // 错误记录（简化版本，确保能显示）
    error(message, data = {}) {
        const time = new Date().toLocaleTimeString();
        const logMsg = `[Coze工作流] ${time} - ${message}`;

        // 控制台打印错误
        console.error(logMsg, data);

        // 页面日志显示 - 简化版本
        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.borderBottom = '1px dashed #333';
            line.style.color = '#ff6b6b'; // 红色错误提示

            let dataStr = '';
            try {
                if (data) {
                    dataStr = typeof data === 'object' ?
                        JSON.stringify(data, null, 2) :
                        String(data);
                }
            } catch (e) {
                dataStr = '[数据解析错误]';
            }

            // 创建文本节点，避免XSS问题
            line.textContent = `${logMsg} ${dataStr}`;

            // 添加到日志容器的末尾
            logEl.appendChild(line);

            // 自动滚动到底部
            logEl.scrollTop = logEl.scrollHeight;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CozeWorkflow;
}

// 全局实例
window.cozeWorkflow = new CozeWorkflow();