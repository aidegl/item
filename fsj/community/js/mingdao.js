/**
 * 明道云API封装 - 社区模块
 */

const MingdaoAPI = {
  // 配置
  config: {
    appKey: '59c7bdc2cdf74e5e',
    sign: 'YTkzMjE4NGE3YThmYTE1Nzc4ODE5YTYxYzg3ZGM0YTZhZGMxZWJkMDU4ZTA0MzIwOWE5NDMzOTQ2MTRhNTk2Ng==',
    baseUrl: 'https://api.mingdao.com/v2/open',
    // 工作表ID（需要在明道云中创建后填入）
    worksheets: {
      posts: '',      // 帖子表
      comments: '',   // 评论表
      likes: ''       // 点赞表
    }
  },

  /**
   * 查询工作表数据
   */
  async queryRows(worksheetId, filters = [], options = {}) {
    const { page = 1, pageSize = 20, sort = [] } = options;

    const requestBody = {
      appKey: this.config.appKey,
      sign: this.config.sign,
      worksheetId: worksheetId,
      filters: filters,
      pageIndex: page,
      pageSize: pageSize,
      sortControls: sort,
      getSystemControl: false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/worksheet/getFilterRows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('[明道云] 查询结果:', result.success ? '成功' : result.error_msg);

      return {
        success: result.success,
        data: result.data?.rows || [],
        total: result.data?.totalRows || 0,
        error_msg: result.error_msg || ''
      };
    } catch (error) {
      console.error('[明道云] 查询异常:', error.message);
      return { success: false, data: [], total: 0, error_msg: error.message };
    }
  },

  /**
   * 根据ID查询单条数据
   */
  async getRowById(worksheetId, rowId) {
    const requestBody = {
      appKey: this.config.appKey,
      sign: this.config.sign,
      worksheetId: worksheetId,
      rowId: rowId,
      getSystemControl: false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/worksheet/getRowByIdPost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      return {
        success: result.success,
        data: result.data || null,
        error_msg: result.error_msg || ''
      };
    } catch (error) {
      console.error('[明道云] 查询异常:', error.message);
      return { success: false, data: null, error_msg: error.message };
    }
  },

  /**
   * 新增数据
   */
  async addRow(worksheetId, controls) {
    const requestBody = {
      appKey: this.config.appKey,
      sign: this.config.sign,
      worksheetId: worksheetId,
      controls: controls,
      triggerWorkflow: true,
      getSystemControl: false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/worksheet/addRow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('[明道云] 新增结果:', result.success ? '成功' : result.error_msg);

      return {
        success: result.success,
        data: result.data || null,
        error_msg: result.error_msg || ''
      };
    } catch (error) {
      console.error('[明道云] 新增异常:', error.message);
      return { success: false, data: null, error_msg: error.message };
    }
  },

  /**
   * 更新数据
   */
  async updateRow(worksheetId, rowId, controls) {
    const requestBody = {
      appKey: this.config.appKey,
      sign: this.config.sign,
      worksheetId: worksheetId,
      rowId: rowId,
      controls: controls,
      triggerWorkflow: true,
      getSystemControl: false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/worksheet/updateRow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      return {
        success: result.success,
        data: result.data || null,
        error_msg: result.error_msg || ''
      };
    } catch (error) {
      console.error('[明道云] 更新异常:', error.message);
      return { success: false, data: null, error_msg: error.message };
    }
  },

  /**
   * 删除数据
   */
  async deleteRow(worksheetId, rowId) {
    const requestBody = {
      appKey: this.config.appKey,
      sign: this.config.sign,
      worksheetId: worksheetId,
      rowId: rowId
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/worksheet/deleteRow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      return {
        success: result.success,
        error_msg: result.error_msg || ''
      };
    } catch (error) {
      console.error('[明道云] 删除异常:', error.message);
      return { success: false, error_msg: error.message };
    }
  }
};

/**
 * 天干地支分类
 */
const Classify = {
  // 天干内容类型
  tianganTypes: {
    '甲': { name: '技术成果', keywords: ['代码', '实现', '技术方案', '开源', '开发'] },
    '乙': { name: '想法创意', keywords: ['建议', '想法', '创意', '新功能', '灵感'] },
    '丙': { name: '企业推广', keywords: ['产品', '活动', '公告', '宣传', '推广'] },
    '丁': { name: '交流求助', keywords: ['求助', '提问', '问题', '帮忙', '请问', '如何', '怎么'] },
    '戊': { name: '资源共享', keywords: ['资源', '工具', '资料', '分享', '推荐'] },
    '己': { name: '心得经验', keywords: ['心得', '经验', '复盘', '总结', '感悟'] },
    '庚': { name: '规则制度', keywords: ['规则', '制度', '规范', '流程', '规定'] },
    '辛': { name: '价值理念', keywords: ['价值', '理念', '观点', '意义'] },
    '壬': { name: '市场数据', keywords: ['数据', '分析', '行业', '趋势', '市场'] },
    '癸': { name: '决策讨论', keywords: ['投票', '决策', '选择', '方案', '决定'] }
  },

  // 地支场景关键词
  dizhiKeywords: {
    '子': ['学习', '教程', '入门', '怎么学', '如何学'],
    '丑': ['目标', '计划', 'OKR', 'KPI', '规划'],
    '寅': ['开发', '代码', '实现', '编程', '技术'],
    '卯': ['头脑风暴', '想法', '创意', '灵感'],
    '辰': ['产品', '功能', '需求', '用户'],
    '巳': ['销售', '转化', '客户', '成交'],
    '午': ['交流', '讨论', '聊天', '沟通'],
    '未': ['认知', '理解', '感悟', '体会'],
    '申': ['规则', '制度', '规范', '流程'],
    '酉': ['价值', '意义', '理念', '价值观'],
    '戌': ['体系', '架构', '系统', '框架'],
    '亥': ['决策', '选择', '方案', '决定']
  },

  /**
   * 对内容进行天干地支分类
   */
  classify(content) {
    const text = content.toLowerCase();

    // 地支分类
    let dizhi = '午';
    let maxScore = 0;
    for (const [dz, keywords] of Object.entries(this.dizhiKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        dizhi = dz;
      }
    }

    // 天干分类
    let tiangan = '丁'; // 默认交流求助
    for (const [tg, info] of Object.entries(this.tianganTypes)) {
      for (const keyword of info.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          tiangan = tg;
          break;
        }
      }
      if (tiangan !== '丁') break;
    }

    return { tiangan, dizhi };
  },

  /**
   * 获取天干颜色
   */
  getTianganColor(tiangan) {
    const colors = {
      '甲': '#ef4444',
      '乙': '#f97316',
      '丙': '#eab308',
      '丁': '#22c55e',
      '戊': '#14b8a6',
      '己': '#06b6d4',
      '庚': '#3b82f6',
      '辛': '#8b5cf6',
      '壬': '#ec4899',
      '癸': '#6366f1'
    };
    return colors[tiangan] || '#6366f1';
  },

  /**
   * 获取天干名称
   */
  getTianganName(tiangan) {
    return this.tianganTypes[tiangan]?.name || '未知';
  }
};

/**
 * 工具函数
 */
const Utils = {
  /**
   * 格式化时间
   */
  formatTime(time) {
    if (!time) return '';
    const date = new Date(time);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
    if (diff < 604800) return Math.floor(diff / 86400) + '天前';

    return date.toLocaleDateString('zh-CN');
  },

  /**
   * 解析JSON字符串
   */
  parseJson(str) {
    try {
      return typeof str === 'string' ? JSON.parse(str) : str;
    } catch {
      return null;
    }
  },

  /**
   * 获取URL参数
   */
  getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * 显示提示
   */
  toast(msg, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 9999;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
};