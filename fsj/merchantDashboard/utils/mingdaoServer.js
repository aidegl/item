/**
 * 明道云 API - 服务端调用（Node.js，用于宝塔等部署环境）
 * 使用 https 发起请求，不依赖 wx
 */
const https = require('https');

const MINGDAO_URL = 'https://api.mingdao.com/v2/open/worksheet/getFilterRows';

/** 从明道云 getFilterRows 获取数据 */
function mingdaoGetFilterRows(options) {
  const {
    appKey = process.env.MINGDAO_APP_KEY,
    sign = process.env.MINGDAO_SIGN,
    worksheetId,
    filters = [],
    pageSize = 50,
    pageIndex = 1
  } = options;

  if (!appKey || !sign || !worksheetId) {
    return Promise.reject(new Error('缺少 appKey、sign 或 worksheetId'));
  }

  const body = JSON.stringify({
    appKey,
    sign,
    worksheetId,
    viewId: '',
    pageSize,
    pageIndex: pageIndex,
    keyWords: '',
    listType: 0,
    controls: [],
    filters: Array.isArray(filters) ? filters : [],
    sortId: '',
    isAsc: 'false',
    notGetTotal: 'true',
    useControlId: 'false',
    getSystemControl: 'false'
  });

  return new Promise((resolve, reject) => {
    const url = new URL(MINGDAO_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body, 'utf8')
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.success ? { success: true, data: parsed.data } : { success: false, error_msg: parsed.error_msg });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { mingdaoGetFilterRows };
