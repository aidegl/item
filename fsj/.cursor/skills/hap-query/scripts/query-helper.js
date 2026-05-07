/**
 * HAP 查询辅助脚本
 * 提供常用的查询工具函数
 */

/**
 * 构建分页查询参数
 * @param {Object} options 查询选项
 * @returns {Object} 查询参数
 */
function buildQueryParams(options = {}) {
  const {
    worksheet_id,
    pageSize = 50,
    pageIndex = 1,
    fields = [],
    filter = null,
    sorts = [],
    search = '',
    viewId = null,
    includeTotalCount = false,
    includeSystemFields = false,
    responseFormat = 'json'
  } = options;

  const params = {
    worksheet_id,
    pageSize: Math.min(Math.max(1, pageSize), 1000), // 限制在1-1000之间
    pageIndex: Math.max(1, pageIndex),
    ai_description: `查询工作表 ${worksheet_id} 的数据`
  };

  // 可选参数
  if (fields.length > 0) params.fields = fields;
  if (filter) params.filter = filter;
  if (sorts.length > 0) params.sorts = sorts;
  if (search) params.search = search;
  if (viewId) params.viewId = viewId;
  if (includeTotalCount) params.includeTotalCount = includeTotalCount;
  if (includeSystemFields) params.includeSystemFields = includeSystemFields;
  if (responseFormat !== 'json') params.responseFormat = responseFormat;

  return params;
}

/**
 * 构建简单筛选条件
 * @param {string} field 字段名
 * @param {string} operator 操作符
 * @param {any} value 值
 * @returns {Object} 筛选条件
 */
function buildSimpleFilter(field, operator, value) {
  return {
    conjunction: 'and',
    conditions: [
      {
        field,
        operator,
        value
      }
    ]
  };
}

/**
 * 构建多条件筛选
 * @param {Array} conditions 条件数组
 * @param {string} conjunction 连接符，默认为 'and'
 * @returns {Object} 筛选条件
 */
function buildMultiFilter(conditions, conjunction = 'and') {
  return {
    conjunction,
    conditions
  };
}

/**
 * 构建日期范围筛选
 * @param {string} field 日期字段
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {Object} 筛选条件
 */
function buildDateRangeFilter(field, startDate, endDate) {
  return {
    conjunction: 'and',
    conditions: [
      {
        field,
        operator: 'gte',
        value: startDate
      },
      {
        field,
        operator: 'lte',
        value: endDate
      }
    ]
  };
}

/**
 * 构建排序参数
 * @param {string} field 排序字段
 * @param {boolean} isAsc 是否升序
 * @returns {Array} 排序数组
 */
function buildSort(field, isAsc = true) {
  return [
    {
      field,
      isAsc
    }
  ];
}

/**
 * 构建多字段排序
 * @param {Array} sortConfigs 排序配置数组
 * @returns {Array} 排序数组
 */
function buildMultiSort(sortConfigs) {
  return sortConfigs.map(config => ({
    field: config.field,
    isAsc: config.isAsc !== false
  }));
}

/**
 * 构建数据透视查询参数
 * @param {Object} options 透视选项
 * @returns {Object} 透视参数
 */
function buildPivotParams(options = {}) {
  const {
    worksheet_id,
    columns = [],
    rows = [],
    values = [],
    filter = null,
    sorts = [],
    viewId = null,
    includeSummary = false,
    pageSize = 1000,
    pageIndex = 1
  } = options;

  const params = {
    worksheet_id,
    values,
    ai_description: `对工作表 ${worksheet_id} 进行数据透视分析`
  };

  // 可选参数
  if (columns.length > 0) params.columns = columns;
  if (rows.length > 0) params.rows = rows;
  if (filter) params.filter = filter;
  if (sorts.length > 0) params.sorts = sorts;
  if (viewId) params.viewId = viewId;
  if (includeSummary) params.includeSummary = includeSummary;
  if (pageSize) params.pageSize = Math.min(pageSize, 1000);
  if (pageIndex) params.pageIndex = Math.max(1, pageIndex);

  return params;
}

/**
 * 构建计数聚合
 * @param {string} displayName 显示名称
 * @returns {Object} 聚合配置
 */
function buildCountAggregation(displayName = '记录数') {
  return {
    field: 'record_count',
    aggregation: 'COUNT',
    displayName
  };
}

/**
 * 构建数值聚合
 * @param {string} field 字段名
 * @param {string} aggregation 聚合类型
 * @param {string} displayName 显示名称
 * @returns {Object} 聚合配置
 */
function buildValueAggregation(field, aggregation, displayName) {
  return {
    field,
    aggregation,
    displayName: displayName || `${field}_${aggregation.toLowerCase()}`
  };
}

/**
 * 验证查询结果
 * @param {Object} result 查询结果
 * @returns {Object} 验证后的结果
 */
function validateQueryResult(result) {
  if (!result) {
    throw new Error('查询结果为空');
  }

  if (result.error) {
    throw new Error(`查询错误: ${result.error_msg || result.error}`);
  }

  if (result.statusCode && result.statusCode >= 400) {
    throw new Error(`HTTP错误 ${result.statusCode}: ${result.error_msg || '未知错误'}`);
  }

  return result;
}

/**
 * 提取查询数据
 * @param {Object} result 查询结果
 * @returns {Array} 数据数组
 */
function extractData(result) {
  const validated = validateQueryResult(result);

  if (validated.data && validated.data.rows) {
    return validated.data.rows;
  }

  if (Array.isArray(validated.data)) {
    return validated.data;
  }

  if (validated.data) {
    return [validated.data];
  }

  return [];
}

/**
 * 分页获取所有记录
 * @param {Function} queryFn 查询函数
 * @param {Object} baseParams 基础查询参数
 * @param {number} pageSize 每页大小
 * @returns {Promise<Array>} 所有记录
 */
async function getAllRecords(queryFn, baseParams, pageSize = 100) {
  let allRecords = [];
  let pageIndex = 1;
  let hasMore = true;
  let totalCount = 0;

  while (hasMore) {
    const params = {
      ...baseParams,
      pageSize,
      pageIndex,
      includeTotalCount: true
    };

    const result = await queryFn(params);
    const validated = validateQueryResult(result);

    if (validated.data && validated.data.rows) {
      const records = validated.data.rows;
      allRecords = allRecords.concat(records);

      // 更新总数
      if (validated.data.totalCount) {
        totalCount = validated.data.totalCount;
      }

      // 检查是否还有更多记录
      const fetchedCount = pageIndex * pageSize;
      hasMore = fetchedCount < totalCount && records.length === pageSize;
    } else {
      hasMore = false;
    }

    pageIndex++;
  }

  return allRecords;
}

/**
 * 格式化查询结果为表格
 * @param {Array} data 数据数组
 * @param {Array} fields 要显示的字段
 * @returns {string} 表格字符串
 */
function formatAsTable(data, fields = null) {
  if (!data || data.length === 0) {
    return '暂无数据';
  }

  // 确定要显示的字段
  let displayFields = fields;
  if (!displayFields || displayFields.length === 0) {
    // 使用第一条记录的所有字段
    const firstRecord = data[0];
    displayFields = Object.keys(firstRecord).filter(key =>
      !key.startsWith('_') && key !== 'id' && key !== 'rowId'
    );
  }

  // 构建表头
  const headers = displayFields.map(field => {
    // 简单美化字段名
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  });

  // 构建表格行
  const rows = data.map(record => {
    return displayFields.map(field => {
      const value = record[field];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value).substring(0, 50) + '...';
      }
      return String(value);
    });
  });

  // 计算列宽
  const colWidths = headers.map((header, colIndex) => {
    const headerLength = header.length;
    const maxDataLength = Math.max(...rows.map(row => row[colIndex].length));
    return Math.max(headerLength, maxDataLength, 10);
  });

  // 构建表格
  let table = '';

  // 表头
  table += headers.map((header, i) =>
    header.padEnd(colWidths[i])
  ).join(' | ') + '\n';

  // 分隔线
  table += headers.map((_, i) =>
    '-'.repeat(colWidths[i])
  ).join('-|-') + '\n';

  // 数据行
  rows.forEach(row => {
    table += row.map((cell, i) =>
      cell.padEnd(colWidths[i])
    ).join(' | ') + '\n';
  });

  return table;
}

/**
 * 导出为模块
 */
module.exports = {
  buildQueryParams,
  buildSimpleFilter,
  buildMultiFilter,
  buildDateRangeFilter,
  buildSort,
  buildMultiSort,
  buildPivotParams,
  buildCountAggregation,
  buildValueAggregation,
  validateQueryResult,
  extractData,
  getAllRecords,
  formatAsTable
};