// Coze工作流API调用模块
class CozeWorkflow {
    constructor() {
        this.apiUrl = 'https://api.coze.cn/v1/workflow/run';
        this.ocrWorkflowId = '7593545627851014196'; // OCR工作流ID
        this.sttWorkflowId = '7596225551557001225'; // 语音识别工作流ID
        this.reportWorkflowId = '7603173498043252799'; // 报告生成工作流ID
        this.aiHelperWorkflowId = '7603176766723227655'; // AI助手工作流ID
        this.bearerToken = 'pat_KNA17LR4GzTvkBciLlSs0nfW5jDavQMQ0uXO0GpOWNIX0Z3q7lZJ0fe3xwitGtl3'; // Coze API密钥
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.bearerToken = apiKey;
    }

    // 调用AI助手工作流
    async runAIHelper(inputText) {
        return this.executeWorkflow(this.aiHelperWorkflowId, inputText, 'AI助手');
    }

    // 调用报告生成工作流
    async runReportGeneration(data, reportType) {
        const inputData = {
            report_type: reportType, // 'pre' or 'post'
            ...data
        };
        // 将JSON对象转换为字符串作为输入，或者直接传对象（取决于工作流定义）
        // 假设工作流接受 JSON 字符串
        return this.executeWorkflow(this.reportWorkflowId, JSON.stringify(inputData, null, 2), reportType === 'pre' ? '诊前报告生成' : '诊后报告生成');
    }

    // 调用语音识别提取工作流
    async runSTT(inputText) {
        const now = new Date();
        const currentDateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        const contextEnhancedInput = `当前日期是：${currentDateStr}。请基于该日期和常识，准确识别并提取以下语音内容中的日期、医院、科室等信息：\n${inputText}`;
        return this.executeWorkflow(this.sttWorkflowId, contextEnhancedInput, '语音提取');
    }

    // 调用OCR工作流
    async runOCR(imageUrl) {
        const now = new Date();
        const currentDateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        // OCR 可能直接接收 URL，但如果是工作流，我们尝试在 executeWorkflow 中处理
        return this.executeWorkflow(this.ocrWorkflowId, imageUrl, 'OCR提取', currentDateStr);
    }

    // 通用执行方法
    async executeWorkflow(workflowId, input, typeName, currentDate = null) {
        try {
            this.log(`开始调用${typeName}工作流`, { input: typeof input === 'string' ? input.substring(0, 50) + '...' : '[Object]' });

            const parameters = {
                input: input
            };

            // 如果提供了当前日期，添加到参数中，以防工作流节点支持该参数
            if (currentDate) {
                parameters.current_date = currentDate;
            }

            const requestBody = {
                workflow_id: workflowId,
                parameters: parameters
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
                    // 如果解析失败，说明返回的可能直接是文本/Markdown内容，直接使用
                    this.log('数据非JSON格式，使用原始字符串', { dataString: typeof dataString === 'string' ? dataString.substring(0, 50) + '...' : dataString });
                    parsedData = dataString;
                }

                const outputData = {
                    token_count: tokenCount,
                    data: parsedData
                };

                this.log(`${typeName}调用成功 - 输出数据`, outputData);

                return {
                    success: true,
                    data: outputData
                };
            } else {
                this.error(`${typeName}调用失败`, result);
                return {
                    success: false,
                    error: result
                };
            }
        } catch (e) {
            this.error(`${typeName}API调用异常`, e);
            return {
                success: false,
                error: e.message
            };
        }
    }

    // 为了兼容性保留 runWorkflow，默认指向语音识别
    async runWorkflow(inputText) {
        return this.runSTT(inputText);
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