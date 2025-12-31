// 明道云API调用组件（更新数据）
class MingDaoYunUpdateAPI {
  constructor() {
    // 固定配置（已写死）
    this.appKey = "59c7bdc2cdf74e5e";
    this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/editRow";
  }

  /**
   * 核心方法：更新工作表中的数据
   * @param {String} rowid - 行ID
   * @param {String} worksheetId - 工作表ID
   * @param {Array} controls - 更新字段数组，每个对象包含controlId和value
   * @returns {Object} 组件出参 {success: Boolean, data: Object, error_msg: String, error_code: Number}
   */
  async getData(rowid, worksheetId, controls) {
    console.log("[组件日志] 动作名称：调用明道云editRow接口，接收的rowid值：", rowid);
    console.log("[组件日志] 接收的worksheetId值：", worksheetId);
    console.log("[组件日志] 接收的controls值：", controls);
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，入参：`, { rowid, worksheetId, controls });
 
    try {
      // 构造请求体（editRow接口专用格式）
      const requestBody = {
        "appKey": this.appKey,
        "sign": this.sign,
        "worksheetId": worksheetId,
        "rowId": rowid,
        "triggerWorkflow": true,
        "controls": controls,
        "getSystemControl": "false"
      };

      console.log("[组件日志] 准备调用明道云接口，请求体：", requestBody);

      const postOnce = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          const mdResult = await response.json();
          return mdResult;
        } finally {
          clearTimeout(timeoutId);
        }
      };

      // 调用明道云接口（网络错误时重试1次）
      let mdResult;
      try {
        mdResult = await postOnce();
      } catch (e) {
        console.error(`[明道云日志] ${new Date().toLocaleString()} - 调用${this.baseUrl}接口失败，错误信息：`, e);
        mdResult = await postOnce();
      }

      // 打印3：明道云接口原始返回结果
      console.log("[组件日志] 明道云接口原始返回结果：", mdResult);

      // 构造组件出参data
      let outputData = null;
      let success = false;
      let error_msg = "";
      let error_code = 0;

      if (mdResult.success) {
        outputData = mdResult.data; // 组件出参data = 明道云返回的data
        success = true;
        error_code = mdResult.error_code || 1;
      } else {
        error_msg = mdResult.error_msg || "明道云接口调用失败";
        error_code = mdResult.error_code || 10101;
      }

      // 打印4：组件出参data
      console.log("[组件日志] 组件出参data：", outputData);
      console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，返回数据：`, { success, error_code, error_msg });

      // 返回标准化出参
      return {
        success: success,
        data: outputData,
        error_msg: error_msg,
        error_code: error_code
      };
    } catch (error) {
      // 打印5：异常日志
      console.error("[组件日志] 调用异常：", error.message);
      // 异常时的出参
      return {
        success: false,
        data: null,
        error_msg: `网络/解析错误：${error.message}`,
        error_code: 99999
      };
    }
  }
}

// 暴露组件到全局
window.MingDaoYunUpdateAPI = MingDaoYunUpdateAPI;
