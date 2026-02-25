// 明道云API调用组件（批量查询数据）
class MingDaoYunArrayAPI {
  constructor() {
    this.appKey = "b37a969f03b3cf0b";
    this.sign = "MTNjNDYyZDIxMGM4NGU4NDlhNmMxMzZkMWE5YzZkNTM5ZWQ3YmJkZmM4ZWYzZGE1YzY1NGFhODUyMGQxZTdhNg==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/getFilterRows";
  }

  async getData(params) {
    const {
      appKey,
      sign,
      worksheetId,
      viewId = "",
      pageSize = 50,
      pageIndex = 1,
      keyWords = "",
      listType = 0,
      controls = "",
      filters = [],
      sortId = "",
      isAsc = "false",
      notGetTotal = "false",
      useControlId = "false",
      getSystemControl = "false"
    } = params;

    console.log("[组件日志] 动作名称：调用明道云getFilterRows接口，接收的worksheetId值：", worksheetId);
    console.log("[组件日志] 接收的filters值：", filters);
    console.log(`[执行日志] ${new Date().toLocaleString()} - 执行了getData函数，入参：`, { worksheetId, filters, pageSize, pageIndex });

    const filtersJson = typeof filters === "string" ? filters : JSON.stringify(filters);

    return new Promise((resolve) => {
      try {
        const requestBody = {
          "appKey": appKey || this.appKey,
          "sign": sign || this.sign,
          "worksheetId": worksheetId,
          "viewId": viewId,
          "pageSize": pageSize,
          "pageIndex": pageIndex,
          "keyWords": keyWords,
          "listType": listType,
          "controls": Array.isArray(controls) ? controls : (typeof controls === "string" && (controls.startsWith('[') || controls === "") ? (controls === "" ? [] : JSON.parse(controls)) : []),
          "filters": JSON.parse(filtersJson),
          "sortId": sortId,
          "isAsc": isAsc,
          "notGetTotal": notGetTotal,
          "useControlId": useControlId,
          "getSystemControl": getSystemControl
        };

        console.log("[组件日志] 准备调用明道云接口，请求体：", requestBody);

        wx.request({
          url: this.baseUrl,
          method: 'POST',
          data: requestBody,
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            console.log("[组件日志] 明道云接口原始返回结果：", res.data);

            let outputData = null;
            let success = false;
            let error_msg = "";
            let error_code = 0;

            if (res.data.success) {
              outputData = res.data.data;
              success = true;
              error_code = res.data.error_code || 1;
            } else {
              error_msg = res.data.error_msg || "明道云接口调用失败";
              error_code = res.data.error_code || 10101;
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
              error_msg: `网络/解析错误：${err.errMsg}`,
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

module.exports = MingDaoYunArrayAPI;
