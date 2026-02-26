// 明道云记录表 API（小程序端调用）
// 用于记录用户行为：登录、观看、评论、点赞、下单等
class MingdaoYunRecordAPI {
    constructor() {
        // 固定配置（已写死）
        this.appKey = "59c7bdc2cdf74e5e";
        this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
        this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/addRow";
    }

    /**
     * 添加记录到 jilubiao 表
     * @param {Object} data - 记录数据
     * @param {String} data.openId - 用户 openId
     * @param {String} data.leixing - 记录类型（小程序登录、观看、评论、点赞、下单等）
     * @param {String} data.dlfs - 登录方式（微信授权登录、手机一键登录、手机验证码）
     * @param {String} data.yonghu - 用户 rowid（可选）
     * @param {String} data.neirong - 内容 rowid（可选，用于观看、评论、点赞等）
     * @param {String} data.tupian - 图片链接（可选）
     * @returns {Object} {success: Boolean, data: Object, error_msg: String, error_code: Number}
     */
    async addRecord(data) {
        console.log("[记录表] 添加记录，数据:", data);

        const controls = [];

        if (data.yonghu) {
            controls.push({
                controlId: 'yonghu',
                value: data.yonghu
            });
        }

        if (data.leixing) {
            controls.push({
                controlId: 'leixing',
                value: data.leixing
            });
        }

        if (data.dlfs) {
            controls.push({
                controlId: 'dlfs',
                value: data.dlfs
            });
        }

        if (data.openId) {
            controls.push({
                controlId: 'openId',
                value: data.openId
            });
        }

        if (data.neirong) {
            controls.push({
                controlId: 'neirong',
                value: data.neirong
            });
        }

        if (data.tupian) {
            controls.push({
                controlId: 'tupian',
                value: data.tupian,
                editType: 0,
                valueType: 1
            });
        }

        try {
            const requestBody = {
                "appKey": this.appKey,
                "sign": this.sign,
                "worksheetId": "jilubiao",
                "triggerWorkflow": true,
                "controls": controls,
                "getSystemControl": "false"
            };

            console.log("[记录表] 准备调用明道云接口，请求体:", requestBody);

            const postOnce = async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                try {
                    const headers = {
                        "Content-Type": "application/json"
                    };

                    const response = await fetch(this.baseUrl, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(requestBody),
                        signal: controller.signal
                    });
                    const mdResult = await response.json();
                    return mdResult;
                } finally {
                    clearTimeout(timeoutId);
                }
            };

            let mdResult;
            try {
                mdResult = await postOnce();
            } catch (e) {
                console.error(`[记录表] 调用${this.baseUrl}接口失败，错误信息：`, e);
                mdResult = await postOnce();
            }

            console.log("[记录表] 明道云接口返回结果:", mdResult);

            let outputData = null;
            let success = false;
            let error_msg = "";
            let error_code = 0;

            if (mdResult.success) {
                outputData = mdResult.data;
                success = true;
                error_code = mdResult.error_code || 1;
            } else {
                error_msg = mdResult.error_msg || "明道云接口调用失败";
                error_code = mdResult.error_code || 10101;
            }

            console.log("[记录表] 返回数据:", { success, error_code, error_msg });

            return {
                success: success,
                data: outputData,
                error_msg: error_msg,
                error_code: error_code
            };
        } catch (error) {
            console.error("[记录表] 调用异常:", error.message);
            return {
                success: false,
                data: null,
                error_msg: `网络/解析错误：${error.message}`,
                error_code: 99999
            };
        }
    }
}

module.exports = MingdaoYunRecordAPI;
