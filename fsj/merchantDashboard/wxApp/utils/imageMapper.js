// 图片映射工具
// 将明道云返回的图片数据转换为小程序可用的格式

/**
 * 处理明道云API返回的图片数据
 * @param {Object} apiResponse - 明道云API返回的完整响应
 * @returns {Array} - 格式化后的图片映射数组 [{ rowid, url }]
 */
function processImageData(apiResponse) {
  console.log('[图片映射] 开始处理图片数据');
  console.log('[图片映射] API响应:', JSON.stringify(apiResponse, null, 2));
  
  if (!apiResponse || !apiResponse.data || !apiResponse.data.rows) {
    console.warn('[图片映射] API响应格式不正确');
    return [];
  }

  const rows = apiResponse.data.rows;
  console.log('[图片映射] 找到', rows.length, '条数据记录');
  
  const imageMap = [];

  rows.forEach((row, index) => {
    try {
      console.log('[图片映射] 处理第', index + 1, '条记录');
      
      const rowid = row.rowid;
      const imgStr = row.img;

      console.log('[图片映射] rowid:', rowid);
      console.log('[图片映射] img字段:', imgStr);

      if (!rowid || !imgStr) {
        console.warn('[图片映射] 缺少必要字段:', { rowid, imgStr });
        return;
      }

      const imgArray = JSON.parse(imgStr);
      console.log('[图片映射] 解析后的img数组:', imgArray);

      if (Array.isArray(imgArray) && imgArray.length > 0) {
        const firstImage = imgArray[0];
        const url = firstImage.large_thumbnail_full_path;

        console.log('[图片映射] 第一个图片对象:', firstImage);
        console.log('[图片映射] 图片URL:', url);

        if (url) {
          imageMap.push({
            rowid: rowid,
            url: url
          });
          console.log('[图片映射] ✓ 成功添加图片映射:', { rowid, url });
        } else {
          console.warn('[图片映射] 图片URL为空');
        }
      } else {
        console.warn('[图片映射] img数组为空或格式不正确');
      }
    } catch (error) {
      console.error('[图片映射] 处理图片数据失败:', error, row);
    }
  });

  console.log('[图片映射] 处理完成，共', imageMap.length, '张图片');
  console.log('[图片映射] 图片映射数组:', JSON.stringify(imageMap, null, 2));
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