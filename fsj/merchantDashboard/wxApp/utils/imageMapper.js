// 图片映射工具
// 将明道云返回的图片数据转换为小程序可用的格式

/**
 * 处理明道云API返回的图片数据
 * @param {Object} apiResponse - 明道云API返回的完整响应
 * @returns {Array} - 格式化后的图片映射数组 [{ rowid, url }]
 */
function processImageData(apiResponse) {
  if (!apiResponse || !apiResponse.data || !apiResponse.data.rows) {
    console.warn('[图片映射] API响应格式不正确');
    return [];
  }

  const rows = apiResponse.data.rows;
  const imageMap = [];

  rows.forEach(row => {
    try {
      const rowid = row.rowid;
      const imgStr = row.img;

      if (!rowid || !imgStr) {
        console.warn('[图片映射] 缺少必要字段:', { rowid, imgStr });
        return;
      }

      const imgArray = JSON.parse(imgStr);

      if (Array.isArray(imgArray) && imgArray.length > 0) {
        const firstImage = imgArray[0];
        const url = firstImage.large_thumbnail_full_path;

        if (url) {
          imageMap.push({
            rowid: rowid,
            url: url
          });
        }
      }
    } catch (error) {
      console.error('[图片映射] 处理图片数据失败:', error, row);
    }
  });

  console.log('[图片映射] 处理完成，共', imageMap.length, '张图片');
  return imageMap;
}

/**
 * 根据rowid获取图片URL
 * @param {Array} imageMap - 图片映射数组
 * @param {String} rowid - 行ID
 * @returns {String} - 图片URL，如果找不到返回空字符串
 */
function getImageUrl(imageMap, rowid) {
  if (!imageMap || !Array.isArray(imageMap)) {
    return '';
  }

  const image = imageMap.find(img => img.rowid === rowid);
  return image ? image.url : '';
}

module.exports = {
  processImageData,
  getImageUrl
};