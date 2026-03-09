/**
 * 根据 .docs/明道云数据表结构.md 在明道云（孚世界）中创建数据表
 * 使用 .cursor/mcp.json 中 hap-mcp-孚世界 的 HAP-Appkey / HAP-Sign 调用 V3 API
 * 运行: node scripts/create-mingdao-tables.js
 */

const fs = require('fs');
const path = require('path');

const MCP_PATH = path.join(__dirname, '..', '.cursor', 'mcp.json');
const BASE = 'https://api.mingdao.com';

function getCredential() {
  const raw = fs.readFileSync(MCP_PATH, 'utf8');
  const json = JSON.parse(raw);
  const server = json.mcpServers && json.mcpServers['hap-mcp-孚世界'];
  if (!server || !server.url) throw new Error('未找到 hap-mcp-孚世界 配置');
  const u = new URL(server.url);
  const appkey = u.searchParams.get('HAP-Appkey');
  const sign = u.searchParams.get('HAP-Sign');
  if (!appkey || !sign) throw new Error('URL 中缺少 HAP-Appkey 或 HAP-Sign');
  return { appkey, sign };
}

function opts(options) {
  return options.map((v, i) => ({ value: v, index: i + 1 }));
}

// 个人表 + 组织表（不含关联字段，先建基础字段）
const TABLES = [
  {
    name: '个人复盘表',
    alias: 'reviews',
    fields: [
      { name: '复盘唯一标识', alias: 'review_id', type: 'Text', required: true },
      { name: '复盘标题', alias: 'review_title', type: 'Text', isTitle: true, required: true },
      { name: '复盘内容', alias: 'review_content', type: 'Text', required: true },
      { name: '复盘类型', alias: 'review_type', type: 'SingleSelect', options: opts(['项目复盘', '任务复盘', '周复盘', '月复盘', '季度复盘', '年度复盘']), required: true },
      { name: '复盘日期', alias: 'review_date', type: 'Date', subType: '3', required: true },
      { name: '经验总结', alias: 'summary', type: 'Text', required: true },
      { name: '改进措施', alias: 'improvements', type: 'Text', required: true },
      { name: '成果亮点', alias: 'achievements', type: 'Text', required: false },
      { name: '问题分析', alias: 'problems', type: 'Text', required: false },
      { name: '下一步计划', alias: 'next_steps', type: 'Text', required: false },
      { name: '复盘状态', alias: 'review_status', type: 'SingleSelect', options: opts(['草稿', '已完成']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['开发', '总结', '改进']), required: false },
      { name: '附件', alias: 'attachments', type: 'Attachment', required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人规则表',
    alias: 'personal_rules',
    fields: [
      { name: '规则唯一标识', alias: 'rule_id', type: 'Text', required: true },
      { name: '规则标题', alias: 'rule_title', type: 'Text', isTitle: true, required: true },
      { name: '规则详细描述', alias: 'rule_description', type: 'Text', required: true },
      { name: '规则类型', alias: 'rule_type', type: 'SingleSelect', options: opts(['行为规范', '技术规范', '安全规范', '价值观', '道德规范']), required: true },
      { name: '规则分类', alias: 'category', type: 'SingleSelect', options: opts(['全局规则', '场景规则', '个人规则']), required: true },
      { name: '适用范围', alias: 'scope', type: 'Text', required: false },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '规则状态', alias: 'record_status', type: 'SingleSelect', options: opts(['启用', '禁用', '草稿']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '生效日期', alias: 'effective_date', type: 'Date', subType: '3', required: false },
      { name: '失效日期', alias: 'expiry_date', type: 'Date', subType: '3', required: false },
      { name: '版本号', alias: 'version', type: 'Text', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心规则', '安全', '必须遵守']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人计划表',
    alias: 'personal_plans',
    fields: [
      { name: '计划唯一标识', alias: 'plan_id', type: 'Text', required: true },
      { name: '计划标题', alias: 'plan_title', type: 'Text', isTitle: true, required: true },
      { name: '计划详细描述', alias: 'plan_description', type: 'Text', required: true },
      { name: '计划类型', alias: 'plan_type', type: 'SingleSelect', options: opts(['开发计划', '学习计划', '优化计划', '调研计划', '测试计划']), required: true },
      { name: '计划目标', alias: 'goal', type: 'Text', required: true },
      { name: '计划状态', alias: 'record_status', type: 'SingleSelect', options: opts(['草稿', '进行中', '已完成', '已暂停']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '开始日期', alias: 'start_date', type: 'Date', subType: '3', required: true },
      { name: '结束日期', alias: 'end_date', type: 'Date', subType: '3', required: true },
      { name: '进度', alias: 'progress', type: 'Number', precision: 0, required: false },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心计划', '长期', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人知识库表',
    alias: 'personal_knowledge',
    fields: [
      { name: '知识唯一标识', alias: 'knowledge_id', type: 'Text', required: true },
      { name: '知识标题', alias: 'knowledge_title', type: 'Text', isTitle: true, required: true },
      { name: '知识内容', alias: 'knowledge_content', type: 'Text', required: true },
      { name: '知识类型', alias: 'knowledge_type', type: 'SingleSelect', options: opts(['技术知识', '业务知识', '经验知识', '创意知识']), required: true },
      { name: '天干分类', alias: 'tiangan', type: 'SingleSelect', options: opts(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']), required: false },
      { name: '地支分类', alias: 'dizhi', type: 'SingleSelect', options: opts(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']), required: false },
      { name: '五行分类', alias: 'wuxing', type: 'SingleSelect', options: opts(['木', '火', '土', '金', '水']), required: false },
      { name: '阴阳分类', alias: 'yinyang', type: 'SingleSelect', options: opts(['阳', '阴', '中']), required: false },
      { name: '置信度', alias: 'confidence', type: 'Number', precision: 0, required: true },
      { name: '来源', alias: 'source', type: 'Text', required: false },
      { name: '知识状态', alias: 'record_status', type: 'SingleSelect', options: opts(['已验证', '待验证', '已废弃']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心知识', '常用', '重要']), required: false },
      { name: '访问次数', alias: 'access_count', type: 'Number', precision: 0, required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人技能表',
    alias: 'personal_skills',
    fields: [
      { name: '技能唯一标识', alias: 'skill_id', type: 'Text', required: true },
      { name: '技能名称', alias: 'skill_name', type: 'Text', isTitle: true, required: true },
      { name: '技能描述', alias: 'skill_description', type: 'Text', required: false },
      { name: '技能类型', alias: 'skill_type', type: 'SingleSelect', options: opts(['技术技能', '软技能', '工具技能', '业务技能']), required: true },
      { name: '技能等级', alias: 'skill_level', type: 'SingleSelect', options: opts(['初级', '中级', '高级', '专家']), required: true },
      { name: '熟练度', alias: 'proficiency', type: 'Number', precision: 0, required: true },
      { name: '经验值', alias: 'experience_points', type: 'Number', precision: 0, required: true },
      { name: '技能状态', alias: 'record_status', type: 'SingleSelect', options: opts(['学习中', '已掌握', '已精通', '已废弃']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '最后使用时间', alias: 'last_used', type: 'Date', subType: '6', required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心技能', '常用', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人想法表',
    alias: 'personal_ideas',
    fields: [
      { name: '想法唯一标识', alias: 'idea_id', type: 'Text', required: true },
      { name: '想法标题', alias: 'idea_title', type: 'Text', isTitle: true, required: true },
      { name: '想法内容', alias: 'idea_content', type: 'Text', required: true },
      { name: '想法类型', alias: 'idea_type', type: 'SingleSelect', options: opts(['产品创意', '技术方案', '优化建议', '商业模式']), required: true },
      { name: '天干分类', alias: 'tiangan', type: 'SingleSelect', options: opts(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']), required: false },
      { name: '想法状态', alias: 'record_status', type: 'SingleSelect', options: opts(['待评估', '评估中', '已采纳', '已拒绝', '已实现']), required: true },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '评估结果', alias: 'evaluation_result', type: 'Text', required: false },
      { name: '实施日期', alias: 'implemented_date', type: 'Date', subType: '3', required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['创意', '创新', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人策略表',
    alias: 'personal_strategies',
    fields: [
      { name: '策略唯一标识', alias: 'strategy_id', type: 'Text', required: true },
      { name: '策略标题', alias: 'strategy_title', type: 'Text', isTitle: true, required: true },
      { name: '策略内容', alias: 'strategy_content', type: 'Text', required: true },
      { name: '策略类型', alias: 'strategy_type', type: 'SingleSelect', options: opts(['执行策略', '学习策略', '优化策略', '推广策略', '风险策略']), required: true },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '策略状态', alias: 'record_status', type: 'SingleSelect', options: opts(['待执行', '执行中', '已完成', '已暂停']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '截止日期', alias: 'due_date', type: 'Date', subType: '3', required: false },
      { name: '完成率', alias: 'completion_rate', type: 'Number', precision: 0, required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心策略', '重要', '紧急']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人仓库表',
    alias: 'personal_repo',
    fields: [
      { name: '产出唯一标识', alias: 'output_id', type: 'Text', required: true },
      { name: '产出标题', alias: 'output_title', type: 'Text', isTitle: true, required: true },
      { name: '产出内容', alias: 'output_content', type: 'Text', required: true },
      { name: '产出类型', alias: 'output_type', type: 'SingleSelect', options: opts(['代码', '文档', '设计', '方案', '数据', '报告']), required: true },
      { name: '质量评分', alias: 'quality_score', type: 'Number', precision: 1, required: false },
      { name: '产出状态', alias: 'record_status', type: 'SingleSelect', options: opts(['草稿', '已完成', '已审核', '已发布']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '文件链接', alias: 'file_url', type: 'Text', required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心产出', '高质量', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '个人积分表',
    alias: 'personal_points',
    fields: [
      { name: '积分记录唯一标识', alias: 'point_id', type: 'Text', required: true },
      { name: '用户', alias: 'user', type: 'Collaborator', subType: '0', required: true },
      { name: '积分变化', alias: 'points_change', type: 'Number', precision: 0, required: true },
      { name: '总积分', alias: 'total_points', type: 'Number', precision: 0, required: true },
      { name: '积分类型', alias: 'point_type', type: 'SingleSelect', options: opts(['任务奖励', '技能提升', '想法采纳', '产出完成', '惩罚', '其他']), required: true },
      { name: '原因', alias: 'reason', type: 'Text', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['奖励', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '收入明细表',
    alias: 'income_details',
    fields: [
      { name: '财务记录唯一标识', alias: 'finance_id', type: 'Text', required: true },
      { name: '交易类型', alias: 'transaction_type', type: 'SingleSelect', options: opts(['收入', '支出']), required: true },
      { name: '金额', alias: 'amount', type: 'Number', precision: 2, required: true },
      { name: '余额', alias: 'balance', type: 'Number', precision: 2, required: true },
      { name: '分类', alias: 'category', type: 'SingleSelect', options: opts(['开发成本', '运营成本', '收入', '其他']), required: true },
      { name: '描述', alias: 'description', type: 'Text', required: true },
      { name: '状态', alias: 'record_status', type: 'SingleSelect', options: opts(['待审核', '已审核', '已完成']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['重要', '紧急']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  // 组织圈数据表
  {
    name: '制度规则表',
    alias: 'org_rules',
    fields: [
      { name: '规则唯一标识', alias: 'rule_id', type: 'Text', required: true },
      { name: '规则标题', alias: 'rule_title', type: 'Text', isTitle: true, required: true },
      { name: '规则详细描述', alias: 'rule_description', type: 'Text', required: true },
      { name: '规则类型', alias: 'rule_type', type: 'SingleSelect', options: opts(['行为规范', '技术规范', '安全规范', '价值观']), required: true },
      { name: '规则分类', alias: 'category', type: 'SingleSelect', options: opts(['全局规则', '部门规则', '团队规则']), required: true },
      { name: '适用范围', alias: 'scope', type: 'Text', required: false },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '规则状态', alias: 'record_status', type: 'SingleSelect', options: opts(['启用', '禁用', '草稿']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '生效日期', alias: 'effective_date', type: 'Date', subType: '3', required: false },
      { name: '失效日期', alias: 'expiry_date', type: 'Date', subType: '3', required: false },
      { name: '版本号', alias: 'version', type: 'Text', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心规则', '安全', '必须遵守']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '组织规划表',
    alias: 'org_plans',
    fields: [
      { name: '计划唯一标识', alias: 'plan_id', type: 'Text', required: true },
      { name: '计划标题', alias: 'plan_title', type: 'Text', isTitle: true, required: true },
      { name: '计划详细描述', alias: 'plan_description', type: 'Text', required: true },
      { name: '计划类型', alias: 'plan_type', type: 'SingleSelect', options: opts(['年度计划', '季度计划', '月度计划', '专项计划']), required: true },
      { name: '计划目标', alias: 'goal', type: 'Text', required: true },
      { name: '计划状态', alias: 'record_status', type: 'SingleSelect', options: opts(['草稿', '进行中', '已完成', '已暂停']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '开始日期', alias: 'start_date', type: 'Date', subType: '3', required: true },
      { name: '结束日期', alias: 'end_date', type: 'Date', subType: '3', required: true },
      { name: '进度', alias: 'progress', type: 'Number', precision: 0, required: false },
      { name: '优先级', alias: 'priority', type: 'SingleSelect', options: opts(['高', '中', '低']), required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心计划', '长期', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '知识库表',
    alias: 'org_knowledge',
    fields: [
      { name: '知识唯一标识', alias: 'knowledge_id', type: 'Text', required: true },
      { name: '知识标题', alias: 'knowledge_title', type: 'Text', isTitle: true, required: true },
      { name: '知识内容', alias: 'knowledge_content', type: 'Text', required: true },
      { name: '知识类型', alias: 'knowledge_type', type: 'SingleSelect', options: opts(['技术知识', '业务知识', '经验知识', '创意知识']), required: true },
      { name: '天干分类', alias: 'tiangan', type: 'SingleSelect', options: opts(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']), required: false },
      { name: '地支分类', alias: 'dizhi', type: 'SingleSelect', options: opts(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']), required: false },
      { name: '五行分类', alias: 'wuxing', type: 'SingleSelect', options: opts(['木', '火', '土', '金', '水']), required: false },
      { name: '阴阳分类', alias: 'yinyang', type: 'SingleSelect', options: opts(['阳', '阴', '中']), required: false },
      { name: '置信度', alias: 'confidence', type: 'Number', precision: 0, required: true },
      { name: '来源', alias: 'source', type: 'Text', required: false },
      { name: '知识状态', alias: 'record_status', type: 'SingleSelect', options: opts(['已验证', '待验证', '已废弃']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心知识', '常用', '重要']), required: false },
      { name: '访问次数', alias: 'access_count', type: 'Number', precision: 0, required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '技能库表',
    alias: 'org_skills',
    fields: [
      { name: '技能唯一标识', alias: 'skill_id', type: 'Text', required: true },
      { name: '技能名称', alias: 'skill_name', type: 'Text', isTitle: true, required: true },
      { name: '技能描述', alias: 'skill_description', type: 'Text', required: false },
      { name: '技能类型', alias: 'skill_type', type: 'SingleSelect', options: opts(['技术技能', '软技能', '工具技能', '业务技能']), required: true },
      { name: '技能等级', alias: 'skill_level', type: 'SingleSelect', options: opts(['初级', '中级', '高级', '专家']), required: true },
      { name: '熟练度', alias: 'proficiency', type: 'Number', precision: 0, required: true },
      { name: '经验值', alias: 'experience_points', type: 'Number', precision: 0, required: true },
      { name: '技能状态', alias: 'record_status', type: 'SingleSelect', options: opts(['学习中', '已掌握', '已精通', '已废弃']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '最后使用时间', alias: 'last_used', type: 'Date', subType: '6', required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心技能', '常用', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '审核表',
    alias: 'audit',
    fields: [
      { name: '审核唯一标识', alias: 'audit_id', type: 'Text', required: true },
      { name: '审核标题', alias: 'audit_title', type: 'Text', isTitle: true, required: true },
      { name: '审核内容', alias: 'audit_content', type: 'Text', required: true },
      { name: '审核类型', alias: 'audit_type', type: 'SingleSelect', options: opts(['质量审核', '安全审核', '合规审核', '流程审核']), required: true },
      { name: '审核状态', alias: 'record_status', type: 'SingleSelect', options: opts(['待审核', '审核中', '已通过', '已拒绝']), required: true },
      { name: '审核人', alias: 'auditor', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '审核结果', alias: 'audit_result', type: 'Text', required: false },
      { name: '审核评分', alias: 'audit_score', type: 'Number', precision: 1, required: false },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['重要', '核心']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '商品表',
    alias: 'products',
    fields: [
      { name: '商品唯一标识', alias: 'product_id', type: 'Text', required: true },
      { name: '商品名称', alias: 'product_name', type: 'Text', isTitle: true, required: true },
      { name: '商品描述', alias: 'product_description', type: 'Text', required: true },
      { name: '商品类型', alias: 'product_type', type: 'SingleSelect', options: opts(['软件', '服务', '产品', '方案']), required: true },
      { name: '质量评分', alias: 'quality_score', type: 'Number', precision: 1, required: false },
      { name: '商品状态', alias: 'record_status', type: 'SingleSelect', options: opts(['草稿', '已完成', '已审核', '已发布']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '更新时间', alias: 'updated_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['核心产品', '高质量', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '积分表',
    alias: 'org_points',
    fields: [
      { name: '积分记录唯一标识', alias: 'point_id', type: 'Text', required: true },
      { name: '用户', alias: 'user', type: 'Collaborator', subType: '0', required: true },
      { name: '积分变化', alias: 'points_change', type: 'Number', precision: 0, required: true },
      { name: '总积分', alias: 'total_points', type: 'Number', precision: 0, required: true },
      { name: '积分类型', alias: 'point_type', type: 'SingleSelect', options: opts(['任务奖励', '技能提升', '想法采纳', '产出完成', '惩罚', '其他']), required: true },
      { name: '原因', alias: 'reason', type: 'Text', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['奖励', '重要']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
  {
    name: '财务表',
    alias: 'org_finance',
    fields: [
      { name: '财务记录唯一标识', alias: 'finance_id', type: 'Text', required: true },
      { name: '交易类型', alias: 'transaction_type', type: 'SingleSelect', options: opts(['收入', '支出']), required: true },
      { name: '金额', alias: 'amount', type: 'Number', precision: 2, required: true },
      { name: '余额', alias: 'balance', type: 'Number', precision: 2, required: true },
      { name: '分类', alias: 'category', type: 'SingleSelect', options: opts(['开发成本', '运营成本', '收入', '其他']), required: true },
      { name: '描述', alias: 'description', type: 'Text', required: true },
      { name: '状态', alias: 'record_status', type: 'SingleSelect', options: opts(['待审核', '已审核', '已完成']), required: true },
      { name: '创建人', alias: 'creator_id', type: 'Collaborator', subType: '0', required: true },
      { name: '创建时间', alias: 'created_at', type: 'Date', subType: '6', required: true },
      { name: '标签', alias: 'tags', type: 'MultipleSelect', options: opts(['重要', '紧急']), required: false },
      { name: '备注', alias: 'remarks', type: 'Text', required: false },
    ],
  },
];

async function createWorksheet({ appkey, sign }, table) {
  const body = {
    name: table.name,
    alias: table.alias,
    fields: table.fields.map((f) => {
      const field = {
        name: f.name,
        alias: f.alias,
        type: f.type,
        required: f.required !== false,
      };
      if (f.isTitle) field.isTitle = true;
      if (f.subType) field.subType = f.subType;
      if (f.options) field.options = f.options;
      if (f.precision !== undefined) field.precision = f.precision;
      return field;
    }),
  };
  const res = await fetch(`${BASE}/v3/app/worksheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': appkey,
      'HAP-Sign': sign,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(JSON.stringify(data) || res.statusText);
  }
  return data;
}

async function main() {
  console.log('读取 MCP 配置: ', MCP_PATH);
  const cred = getCredential();
  console.log('已获取 HAP 凭证 (Appkey 前8位):', cred.appkey.slice(0, 8) + '...');
  const results = [];
  for (const table of TABLES) {
    try {
      const result = await createWorksheet(cred, table);
      const id = result.worksheetId || result.worksheet_id || result.data?.worksheetId;
      console.log('OK', table.name, table.alias, id || '');
      results.push({ name: table.name, alias: table.alias, id: id || result });
    } catch (e) {
      console.error('FAIL', table.name, table.alias, e.message);
      results.push({ name: table.name, alias: table.alias, error: e.message });
    }
  }
  console.log('\n创建结果汇总:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
