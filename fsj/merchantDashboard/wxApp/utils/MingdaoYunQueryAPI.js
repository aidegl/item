// 明道云API调用组件（修正filters为数组+全量打印日志）
class MingDaoYunQueryAPI {
  constructor() {
    this.appKey = "59c7bdc2cdf74e5e";
    this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/getRowByIdPost";
  }

  async getData(rowid, worksheetId) {
    console.log("[组件日志] 动作名称：调用明道云getRowByIdPost接口，接收的rowid值：", rowid);
    console.log("[组件日志] 接收的worksheetId值：", worksheetId);
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，入参：`, { rowid, worksheetId });
 
    return new Promise((resolve) => {
      try {
        const requestBody = {
          "appKey": this.appKey,
          "sign": this.sign,
          "worksheetId": worksheetId,
          "rowId": rowid,
          "getSystemControl": "false"
        };

        console.log("[组件日志] 准备调用明道云接口，请求体：", requestBody);

        wx.request({
          url: this.baseUrl,
          method: "POST",
          data: requestBody,
          header: {
            "Content-Type": "application/json"
          },
          timeout: 5000,
          success: (res) => {
            const mdResult = res.data || {};
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

            resolve({
              success: success,
              data: outputData,
              error_msg: error_msg,
              error_code: error_code
            });
          },
          fail: (err) => {
            console.error(`[明道云日志] ${new Date().toLocaleString()} - 调用${this.baseUrl}接口失败，错误信息：`, err);
            resolve({
              success: false,
              data: null,
              error_msg: `网络/解析错误：${err.errMsg || "请求失败"}`,
              error_code: 99999
            });
          }
        });
      } catch (error) {
        console.error("[组件日志] 调用异常：", error.message);
        resolve({
          success: false,
          data: null,
          error_msg: `网络/解析错误：${error.message}`,
          error_code: 99999
        });
      }
    });
  }
}

module.exports = MingDaoYunQueryAPI;
