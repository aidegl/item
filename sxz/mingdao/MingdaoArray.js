// 明道云API调用组件（批量查询数据）
class MingDaoYunArrayAPI {
  constructor() {
    this.appKey = "59c7bdc2cdf74e5e";
    this.sign = "YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==";
    this.baseUrl = "https://api.mingdao.com/v2/open/worksheet/getFilterRows";
  }

  async getData(params) {
    const {
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
    
    // 确保filters始终是JSON格式字符串
    const filtersJson = typeof filters === "string" ? filters : JSON.stringify(filters);

    try {
      const requestBody = {
        "appKey": this.appKey,
        "sign": this.sign,
        "worksheetId": worksheetId,
        "viewId": viewId,
        "pageSize": pageSize,
        "pageIndex": pageIndex,
        "keyWords": keyWords,
        "listType": listType,
        "controls": typeof controls === "string" ? controls : JSON.stringify(controls),
        "filters": JSON.parse(filtersJson),
        "sortId": sortId,
        "isAsc": isAsc,
        "notGetTotal": notGetTotal,
        "useControlId": useControlId,
        "getSystemControl": getSystemControl
      };

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

      let mdResult;
      try {
        mdResult = await postOnce();
      } catch (e) {
        console.error(`[明道云日志] ${new Date().toLocaleString()} - 调用${this.baseUrl}接口失败，错误信息：`, e);
        mdResult = await postOnce();
      }

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

window.MingDaoYunArrayAPI = MingDaoYunArrayAPI;
