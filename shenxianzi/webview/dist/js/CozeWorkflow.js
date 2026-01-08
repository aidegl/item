// Coze工作流API调用模块
class CozeWorkflow {
    constructor() {
        this.apiUrl = 'https://api.coze.cn/v1/workflow/run';
        this.workflowId = '7592462671246802954';
        this.bearerToken = 'pat_aSwaHdpGjZkBvWAuvs3MSs1Tn4PfMjD41W2WoVfGpcW4diQ7rdvduHvAfSOJob9C'; // Coze API密钥
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
                this.log('API响应结果', result);

                // 提取需要的数据
                const { usage, data: outerData } = result;
                const tokenCount = usage?.token_count;

                // 提取内部data字段并解析为JSON
                let parsedData = null;
                try {
                    if (!outerData) {
                        this.error('外部data字段不存在', { outerData });
                    } else if (typeof outerData === 'string') {
                        // 如果outerData是字符串，直接解析
                        this.log('外部data字段是字符串，直接解析', { outerData });
                        parsedData = JSON.parse(outerData);
                    } else if (outerData.data) {
                        // 如果outerData是对象，提取内部data字段
                        const innerData = outerData.data;
                        if (innerData) {
                            if (typeof innerData === 'string') {
                                this.log('解析内部data字符串', { innerData });
                                parsedData = JSON.parse(innerData);
                            } else {
                                this.log('内部data是对象，直接使用', { innerData });
                                parsedData = innerData;
                            }
                        }
                    } else {
                        // 如果outerData是对象但没有data字段，直接使用
                        this.log('外部data字段是对象且没有内部data字段，直接使用', { outerData });
                        parsedData = outerData;
                    }
                } catch (e) {
                    this.error('数据解析失败', e, { result });
                }

                // 只打印需要的字段（使用用户要求的格式）
                const outputData = {
                    token: tokenCount,
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
    log(message, ...dataArgs) {
        const time = new Date().toLocaleTimeString();
        const logMsg = `[Coze工作流] ${time} - ${message}`;

        // 控制台打印
        console.log(logMsg, ...dataArgs);

        // 页面日志显示 - 简化版本
        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.borderBottom = '1px dashed #333';
            line.style.color = '#4facfe';

            let dataStr = '';
            try {
                if (dataArgs.length > 0) {
                    // 合并所有数据参数
                    const combinedData = dataArgs.length === 1 ? dataArgs[0] : dataArgs;
                    dataStr = typeof combinedData === 'object' ?
                        JSON.stringify(combinedData, null, 2) :
                        String(combinedData);
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
    error(message, ...dataArgs) {
        const time = new Date().toLocaleTimeString();
        const logMsg = `[Coze工作流] ${time} - ${message}`;

        // 控制台打印错误
        console.error(logMsg, ...dataArgs);

        // 页面日志显示 - 简化版本
        const logEl = document.getElementById('app-logs');
        if (logEl) {
            const line = document.createElement('div');
            line.style.marginBottom = '4px';
            line.style.borderBottom = '1px dashed #333';
            line.style.color = '#ff6b6b'; // 红色错误提示

            let dataStr = '';
            try {
                if (dataArgs.length > 0) {
                    // 合并所有数据参数
                    const combinedData = dataArgs.length === 1 ? dataArgs[0] : dataArgs;
                    dataStr = typeof combinedData === 'object' ?
                        JSON.stringify(combinedData, null, 2) :
                        String(combinedData);
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