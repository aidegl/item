// 明道云API调用组件（更新数据）
class MingDaoYunUpdateAPI {
  constructor() {
    this.appKey = "59c7bdc2cdf74e5e";
    this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/editRow";
  }

  async getData(rowid, worksheetId, controls) {
    console.log("[组件日志] 动作名称：调用明道云editRow接口，接收的rowid值：", rowid);
    console.log("[组件日志] 接收的worksheetId值：", worksheetId);
    console.log("[组件日志] 接收的controls值：", controls);
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，入参：`, { rowid, worksheetId, controls });
 
    try {
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
          const headers = {
            "Content-Type": "application/json"
          };
          console.log("[组件日志] 准备发起请求，请求头：", headers);

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
        console.error(`[明道云日志] ${new Date().toLocaleString()} - 调用${this.baseUrl}接口失败，错误信息：`, e);
        mdResult = await postOnce();
      }

      console.log("[组件日志] 明道云接口原始返回结果：", mdResult);

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

      console.log("[组件日志] 组件出参data：", outputData);
      console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，返回数据：`, { success, error_code, error_msg });

      return {
        success: success,
        data: outputData,
        error_msg: error_msg,
        error_code: error_code
      };
    } catch (error) {
      console.error("[组件日志] 调用异常：", error.message);
      return {
        success: false,
        data: null,
        error_msg: `网络/解析错误：${error.message}`,
        error_code: 99999
      };
    }
  }
}

module.exports = MingDaoYunUpdateAPI;
