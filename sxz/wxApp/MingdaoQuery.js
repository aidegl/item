// 明道云API调用组件（微信小程序版本）
class MingDaoYunAPI {
  constructor() {
    // 固定配置（已写死）
    this.appKey = "59c7bdc2cdf74e5e";
    this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/getRowByIdPost";
  }

  /**
   * 核心方法：仅传rowid，filters为数组格式
   * @param {String} rowid - 唯一入参
   * @param {String} worksheetId - 工作表ID
   * @returns {Object} 组件出参 {success: Boolean, data: Object, error_msg: String, error_code: Number}
   */
  getData(rowid, worksheetId) {
    // 打印1：组件接收rowid + 动作名称
    console.log("[小程序明道云] 动作名称：调用明道云getRowByIdPost接口，接收的rowid值：", rowid);
    console.log("[小程序明道云] 接收的worksheetId值：", worksheetId);
    console.log(`[小程序明道云] ${new Date().toLocaleString()} - 执行了getData函数，入参：`, { rowid, worksheetId });

    // 返回Promise以便使用async/await
    return new Promise((resolve, reject) => {
      try {
        // 构造请求体（getRowByIdPost接口专用格式）
        const requestBody = {
          "appKey": this.appKey,
          "sign": this.sign,
          "worksheetId": worksheetId,
          "rowId": rowid,
          "getSystemControl": "false"
        };

        // 打印2：准备调用明道云接口，展示请求体（getRowByIdPost专用格式）
        console.log("[小程序明道云] 准备调用明道云接口，请求体：", requestBody);

        const postRequest = () => {
          return new Promise((postResolve, postReject) => {
            // 使用微信小程序的wx.request API
            wx.request({
              url: this.baseUrl,
              method: 'POST',
              data: requestBody,
              header: {
                'content-type': 'application/json'
              },
              timeout: 5000, // 设置5秒超时
              success: (res) => {
                console.log("[小程序明道云] 请求成功，返回数据：", res);
                // 检查HTTP状态码
                if (res.statusCode === 200) {
                  postResolve(res.data);
                } else {
                  postReject(new Error(`HTTP错误: ${res.statusCode}`));
                }
              },
              fail: (err) => {
                console.error("[小程序明道云] 请求失败：", err);
                postReject(err);
              }
            });
          });
        };

        // 调用明道云接口（网络错误时重试1次）
        postRequest()
          .then(mdResult => {
            // 打印3：明道云接口原始返回结果
            console.log("[小程序明道云] 明道云接口原始返回结果：", mdResult);

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
            console.log("[小程序明道云] 组件出参data：", outputData);
            console.log(`[小程序明道云] ${new Date().toLocaleString()} - 执行了getData函数，返回数据：`, { success, error_code, error_msg });

            // 返回标准化出参
            resolve({
              success: success,
              data: outputData,
              error_msg: error_msg,
              error_code: error_code
            });
          })
          .catch(err => {
            console.error(`[小程序明道云] ${new Date().toLocaleString()} - 调用${this.baseUrl}接口失败，错误信息：`, err);
            // 重试一次
            postRequest()
              .then(mdResult => {
                console.log("[小程序明道云] 重试请求成功，返回数据：", mdResult);
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

                resolve({
                  success: success,
                  data: outputData,
                  error_msg: error_msg,
                  error_code: error_code
                });
              })
              .catch(err2 => {
                console.error(`[小程序明道云] 重试也失败了：`, err2);
                resolve({
                  success: false,
                  data: null,
                  error_msg: `网络错误：${err2.errMsg || err2.message}`,
                  error_code: 99999
                });
              });
          });
      } catch (error) {
        // 打印5：异常日志
        console.error("[小程序明道云] 调用异常：", error.message);
        // 异常时的出参
        resolve({
          success: false,
          data: null,
          error_msg: `解析错误：${error.message}`,
          error_code: 99999
        });
      }
    });
  }
}

// 暴露组件，微信小程序中使用module.exports
module.exports = MingDaoYunAPI;
