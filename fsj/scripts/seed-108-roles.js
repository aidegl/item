/**
 * 将 108 将写入虚拟角色表：星宿→昵称，角色名→职业，其余以 md 写在描述
 * 会先获取应用内工作表列表及该表最新字段结构（含你改过的别名）
 * 运行: node scripts/seed-108-roles.js
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

async function api(cred, method, pathname, body) {
  const url = pathname.startsWith('http') ? pathname : `${BASE}${pathname}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'HAP-Appkey': cred.appkey,
      'HAP-Sign': cred.sign,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// 108 将数据：序号, 星宿, 角色名, 分工, 优势(可选), 对应 Skill
const ROLES_108 = [
  [1, '天魁星', '总指挥', '项目总控、任务分配、进度把控', '全局视野、决策力强、资源调配', 'project-manager'],
  [2, '天机星', '架构师', '系统架构设计、技术选型、方案规划', '技术前瞻、架构经验丰富、风险预判', 'system-architect'],
  [3, '天罡星', '技术负责人', '技术决策、代码规范、团队指导', '技术全面、决策果断、领导力强', 'tech-lead'],
  [4, '天勇星', '后端开发', '服务端开发、API设计、数据库设计', '逻辑严密、性能优化、安全意识', 'backend-developer'],
  [5, '天雄星', '前端开发', '前端页面、交互实现、用户体验', '视觉敏感、交互流畅、兼容性好', 'frontend-developer'],
  [6, '天猛星', '全栈开发', '前后端贯通、快速迭代、独立交付', '效率高、适应性强、全链路打通', 'fullstack-developer'],
  [7, '天威星', '数据库专家', '数据库设计、SQL优化、数据迁移', '数据敏感、性能调优、备份恢复', 'database-expert'],
  [8, '天英星', 'API设计师', '接口设计、文档编写、版本管理', '规范清晰、易用性好、向后兼容', 'api-designer'],
  [9, '天贵星', '产品经理', '需求分析、原型设计、优先级排序', '用户视角、商业敏感、需求把控', 'product-manager'],
  [10, '天富星', '业务逻辑', '业务规则实现、流程编排、状态管理', '业务理解深、逻辑清晰、边界完整', 'business-logic'],
  [11, '天满星', '代码审查', '代码评审、规范检查、质量把控', '细节敏锐、标准严格、改进建议', 'code-reviewer'],
  [12, '天孤星', '安全专家', '安全审计、漏洞修复、权限设计', '风险意识强、攻防经验、合规性', 'security-expert'],
  [13, '天伤星', '测试专家', '测试策略、用例设计、自动化测试', '覆盖全面、边界敏感、回归高效', 'qa-engineer'],
  [14, '天立星', 'DevOps', 'CI/CD、部署自动化、环境管理', '流程顺畅、稳定可靠、故障恢复', 'devops-engineer'],
  [15, '天捷星', '性能优化', '性能分析、瓶颈定位、调优方案', '响应快、资源省、体验好', 'performance-optimizer'],
  [16, '天暗星', '算法专家', '算法设计、模型训练、智能推荐', '数学功底强、创新性高、效果显著', 'algorithm-engineer'],
  [17, '天佑星', 'UI/UX设计师', '界面设计、交互设计、视觉规范', '美感强、用户友好、一致性高', 'ui-ux-designer'],
  [18, '天空星', '云服务专家', '云架构、容器化、微服务部署', '弹性扩展、成本优化、高可用', 'cloud-architect'],
  [19, '天速星', '快速原型', '原型快速搭建、交互验证、MVP交付', '速度快、反馈快、迭代快', 'rapid-prototyper'],
  [20, '天异星', '移动开发', '小程序、App、H5开发', '多端适配、体验流畅、原生能力', 'mobile-developer'],
  [21, '天杀星', 'Bug猎手', '缺陷定位、问题复现、修复验证', '敏锐直觉、穷尽场景、根因分析', 'bug-hunter'],
  [22, '天微星', '前端框架', '组件库、设计系统、工程化', '可复用、可维护、标准化', 'frontend-architect'],
  [23, '天究星', '后端框架', '服务框架、中间件、微服务', '高并发、高可用、可扩展', 'backend-architect'],
  [24, '天退星', '技术债务', '代码重构、架构优化、遗留系统改造', '渐进式、风险可控、持续改进', 'tech-debt-manager'],
  [25, '天寿星', '运维监控', '系统监控、告警响应、故障排查', '7x24、快速响应、预防为主', 'ops-monitor'],
  [26, '天剑星', '代码重构', '代码整洁、设计模式、架构改进', '可读性高、可维护性强', 'code-refactor'],
  [27, '天平星', '测试平衡', '测试覆盖率、质量平衡、风险控制', '全面性、优先级、性价比', 'test-balancer'],
  [28, '天罪星', '代码质量', '静态分析、规范执行、代码气味', '标准化、可量化、持续改进', 'code-quality'],
  [29, '天损星', '性能损耗', '资源消耗分析、成本优化、效率提升', '资源省、成本低、效率高', 'cost-optimizer'],
  [30, '天败星', '缺陷修复', 'Bug修复、问题解决、回归验证', '解决快、彻底、无副作用', 'bug-fixer'],
  [31, '天牢星', '版本管理', 'Git管理、分支策略、发布流程', '版本清晰、可追溯、协作顺畅', 'version-control'],
  [32, '天慧星', '技术文档', '文档撰写、知识沉淀、教程编写', '清晰易懂、结构完整、持续更新', 'tech-writer'],
  [33, '天暴星', '压力测试', '负载测试、容量规划、稳定性验证', '极限测试、瓶颈发现、容灾验证', 'stress-tester'],
  [34, '天哭星', '错误处理', '异常捕获、错误日志、故障恢复', '全覆盖、可追踪、快速定位', 'error-handler'],
  [35, '天巧星', '创意设计', '创意策划、视觉创新、品牌设计', '创意新颖、视觉冲击、品牌统一', 'creative-designer'],
  [36, '天满星', '内容策划', '内容规划、选题策划、传播策略', '热点敏感、用户洞察、传播力强', 'content-strategist'],
  // 72地煞星（按正确顺序）
  [37, '地魁星', '技术支持总管', '技术支持统筹、问题分级、资源调配', null, 'tech-support-lead'],
  [38, '地煞星', '前端调试', '前端问题定位、兼容性修复', null, 'frontend-debugger'],
  [39, '地勇星', '后端调试', '后端问题定位、日志分析', null, 'backend-debugger'],
  [40, '地杰星', '数据迁移', '数据清洗、迁移脚本、数据校验', null, 'data-migrator'],
  [41, '地雄星', '接口调试', 'API测试、Mock数据、联调支持', null, 'api-debugger'],
  [42, '地威星', '脚本开发', '自动化脚本、批处理、工具开发', null, 'script-developer'],
  [43, '地英星', '单元测试', '单元测试编写、覆盖率提升', null, 'unit-tester'],
  [44, '地奇8星', '集成测试', '集成测试、端到端测试', null, 'integration-tester'],
  [45, '地猛星', '性能监控', 'APM、性能指标、告警配置', null, 'performance-monitor'],
  [46, '地文星', '日志分析', '日志采集、分析、可视化', null, 'log-analyst'],
  [47, '地正星', '配置管理', '配置中心、环境变量、密钥管理', null, 'config-manager'],
  [48, '地辟星', '容器运维', 'Docker、K8s、镜像管理', null, 'container-ops'],
  [49, '地阖星', '网络调试', '网络问题排查、代理配置、DNS', null, 'network-debugger'],
  [50, '地强星', '存储管理', '对象存储、CDN、文件系统', null, 'storage-manager'],
  [51, '地暗星', '加密解密', '数据加密、证书管理、安全通信', null, 'crypto-engineer'],
  [52, '地辅星', '中间件运维', 'Redis、MQ、ES运维', null, 'middleware-ops'],
  [53, '地会星', '第三方集成', '支付、短信、地图等第三方接入', null, 'integration-specialist'],
  [54, '地佐星', '代码生成', '代码模板、脚手架、低代码', null, 'code-generator'],
  [55, '地佑星', '依赖管理', 'npm、pip、maven等包管理', null, 'dependency-manager'],
  [56, '地灵星', '文档自动化', 'API文档自动生成、注释解析', null, 'doc-automator'],
  [57, '地兽星', '安全扫描', '漏洞扫描、渗透测试、安全加固', null, 'security-scanner'],
  [58, '地微星', '代码格式化', 'Prettier、ESLint、代码风格统一', null, 'code-formatter'],
  [59, '地慧星', '知识图谱', '技术知识库、FAQ、问题归档', null, 'knowledge-base'],
  [60, '地暴星', '压测执行', '压测脚本执行、报告生成', null, 'load-tester'],
  [61, '地然星', '抖音运营主管', '抖音账号统筹、策略制定、数据分析', null, 'douyin-ops-lead'],
  [62, '地猖星', '短视频策划', '选题策划、脚本撰写、分镜设计', null, 'video-planner'],
  [63, '地狂星', '热点追踪', '热点监测、趋势分析、快速响应', null, 'trend-tracker'],
  [64, '地飞星', '视频剪辑', '剪映/PR剪辑、特效、字幕', null, 'video-editor'],
  [65, '地走星', '封面设计', '视频封面、缩略图、视觉优化', null, 'thumbnail-designer'],
  [66, '地巧星', '标题优化', '标题撰写、关键词优化、吸引点击', null, 'title-optimizer'],
  [67, '地明星', '评论互动', '评论回复、粉丝互动、舆情管理', null, 'comment-manager'],
  [68, '地进星', '私域运营', '粉丝群、私聊转化、社群管理', null, 'private-traffic'],
  [69, '地退星', '直播策划', '直播脚本、商品选品、直播节奏', null, 'live-planner'],
  [70, '地满星', '直播场控', '直播后台、商品上架、互动引导', null, 'live-operator'],
  [71, '地遂星', '抖音投放', 'DOU+、信息流广告、ROI优化', null, 'douyin-ads'],
  [72, '地周星', '商品橱窗', '商品上架、佣金管理、选品优化', null, 'product-showcase'],
  [73, '地隐星', '竞品分析', '竞品监控、对标账号、策略借鉴', null, 'competitor-analyst'],
  [74, '地异星', '用户画像', '粉丝画像、兴趣标签、精准推送', null, 'user-profiling'],
  [75, '地理星', '账号安全', '账号保护、违规预防、申诉处理', null, 'account-security'],
  [76, '地俊星', '跨平台分发', '视频号、快手、B站多平台发布', null, 'cross-platform'],
  [77, '地乐星', '内容矩阵', '多账号矩阵、内容复用、差异化运营', null, 'content-matrix'],
  [78, '地捷星', '数据复盘', '视频数据、直播数据、定期复盘', null, 'data-reviewer'],
  [79, '地速星', '短链管理', '抖音短链、外链跳转、转化追踪', null, 'link-manager'],
  [80, '地镇星', '话题运营', '话题创建、挑战赛、话题参与', null, 'topic-operator'],
  [81, '地稽星', '音乐运营', '热门音乐、BGM选择、音乐卡点', null, 'music-operator'],
  [82, '地魔星', '合集管理', '合集创建、内容归类、系列化', null, 'collection-manager'],
  [83, '地妖星', '发布排期', '发布时间、频率规划、节奏把控', null, 'publish-scheduler'],
  [84, '地幽星', '流量变现', '广告接单、带货佣金、变现策略', null, 'monetization'],
  [85, '地伏星', '数据采集', '爬虫、数据抓取、API采集', null, 'data-collector'],
  [86, '地僻星', '数据清洗', '数据去重、格式转换、异常处理', null, 'data-cleaner'],
  [87, '地空星', '数据统计', '统计分析、报表生成、指标计算', null, 'data-analyst'],
  [88, '地孤星', '数据可视化', '图表设计、仪表盘、数据大屏', null, 'data-visualizer'],
  [89, '地全星', 'A/B测试', '实验设计、效果对比、决策支持', null, 'ab-tester'],
  [90, '地短星', '用户分析', '用户行为、留存分析、漏斗分析', null, 'user-analyst'],
  [91, '地角星', '内容分析', '内容效果、爆款分析、内容优化', null, 'content-analyst'],
  [92, '地囚星', '转化分析', '转化漏斗、ROI分析、效果归因', null, 'conversion-analyst'],
  [93, '地藏星', '趋势预测', '趋势预判、增长预测、策略建议', null, 'trend-predictor'],
  [94, '地平星', '报表自动化', '定时报表、邮件推送、告警通知', null, 'report-automator'],
  [95, '地损星', '数据API', '数据接口、实时查询、数据服务', null, 'data-api'],
  [96, '地奴星', '数据安全', '数据脱敏、权限控制、合规管理', null, 'data-security'],
  [97, '地察星', '任务调度', '定时任务、队列管理、执行监控', null, 'task-scheduler'],
  [98, '地恶星', '资源管理', '服务器资源、预算管理、成本控制', null, 'resource-manager'],
  [99, '地丑星', '流程优化', '工作流优化、效率提升、自动化', null, 'process-optimizer'],
  [100, '地数星', '工具集成', '开发工具、效率工具、插件管理', null, 'tool-integrator'],
  [101, '地阴星', '培训赋能', '技术分享、新人培训、知识传递', null, 'trainer'],
  [102, '地刑星', '会议管理', '会议组织、纪要记录、跟进落实', null, 'meeting-manager'],
  [103, '地壮星', '档案管理', '文档归档、版本记录、知识沉淀', null, 'archivist'],
  [104, '地劣星', '需求收集', '需求反馈、用户调研、需求池管理', null, 'requirement-collector'],
  [105, '地健星', '创意收集', '创意收集、点子整理、创意筛选', null, 'idea-collector'],
  [106, '地耗星', '风险预警', '风险识别、预警通知、应急预案', null, 'risk-monitor'],
  [107, '地贼星', '质量保障', '质量标准、流程规范、持续改进', null, 'quality-assurance'],
  [108, '地狗星', '知识管理', '知识库维护、经验沉淀、最佳实践', null, 'knowledge-manager'],
];

function buildDescription(row) {
  const [seq, _star, roleName, work, advantage, skill] = row;
  const parts = ['## 分工\n\n' + work];
  if (advantage) parts.push('## 优势\n\n' + advantage);
  parts.push('## 对应 Skill\n\n`' + skill + '`');
  return parts.join('\n\n');
}

function findFieldByAliasOrName(fields, ...candidates) {
  const normalized = (s) => (s || '').toLowerCase().replace(/\s/g, '');
  for (const c of candidates) {
    const n = normalized(c);
    const f = fields.find(
      (x) =>
        normalized(x.alias) === n ||
        normalized(x.name) === n ||
        (x.alias && x.alias.toLowerCase() === c) ||
        (x.name && x.name === c)
    );
    if (f) return f;
  }
  return null;
}

async function main() {
  const cred = getCredential();
  let worksheetId = process.argv[2];

  // 1. 若未传入 worksheetId，则调用「获取工作表列表」查找虚拟角色表
  if (!worksheetId) {
    const listRes = await api(cred, 'POST', '/v3/app/worksheets/list', { responseFormat: 'json' });
    if (!listRes.ok || !Array.isArray(listRes.data.data)) {
      console.error('获取工作表列表失败:', listRes.data);
      console.error('请手动传入虚拟角色表 worksheetId，例如: node scripts/seed-108-roles.js <worksheetId>');
      process.exit(1);
    }
    const list = listRes.data.data;
    const virtualSheet = list.find(
      (w) =>
        (w.name && (w.name.includes('虚拟角色') || w.name.includes('分身'))) ||
        (w.remark && (String(w.remark).includes('虚拟') || String(w.remark).includes('分身')))
    );
    worksheetId = virtualSheet?.id;
    if (!worksheetId) {
      console.error('未找到虚拟角色表。当前工作表:', list.map((w) => ({ id: w.id, name: w.name })));
      console.error('请手动传入虚拟角色表 worksheetId，例如: node scripts/seed-108-roles.js <worksheetId>');
      process.exit(1);
    }
    console.log('虚拟角色表:', virtualSheet.name, worksheetId);
  } else {
    console.log('使用传入的 worksheetId:', worksheetId);
  }

  // 2. 获取该表最新字段结构（含改过的别名）
  const structRes = await api(cred, 'GET', `/v3/app/worksheets/${worksheetId}`);
  if (!structRes.ok || !structRes.data.data) {
    console.error('获取表结构失败:', structRes.data);
    process.exit(1);
  }
  const raw = structRes.data.data;
  const rawFields = raw.fields || raw.controls || [];
  const fields = rawFields.map((f) => ({ id: f.id || f.controlId, alias: f.alias || f.controlAlias, name: f.name || f.controlName, isTitle: f.isTitle }));
  const sysIds = new Set(['rowid', 'ownerid', 'caid', 'ctime', 'utime', 'uaid', 'wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfcotime', 'wfdtime', 'wfftime', 'wfstatus']);
  const customFields = fields.filter((f) => f.id && !sysIds.has(String(f.id).toLowerCase()));

  const nickField = findFieldByAliasOrName(customFields, '昵称', 'nickname', '星宿', 'name');
  const jobField = findFieldByAliasOrName(customFields, '职业', 'occupation', '角色名');
  const descField = findFieldByAliasOrName(customFields, '描述', 'description', 'remarks', '备注');
  const titleField = customFields.find((f) => f.isTitle) || nickField || customFields[0];

  const nickId = nickField?.alias || nickField?.id;
  const jobId = jobField?.alias || jobField?.id;
  const descId = descField?.alias || descField?.id;
  const titleId = titleField?.alias || titleField?.id;

  if (!nickId || !jobId) {
    console.error('表中未找到 昵称 或 职业 字段。当前自定义字段别名:', customFields.map((f) => ({ name: f.name, alias: f.alias })));
    process.exit(1);
  }
  console.log('字段映射: 昵称=', nickId, ', 职业=', jobId, ', 描述=', descId || '(无)');

  // 3. 构建 108 条记录：星宿→昵称，角色名→职业，描述=md
  const rows = ROLES_108.map((row) => {
    const [, star, roleName, work, advantage, skill] = row;
    const description = buildDescription(row);
    const fields = [
      { id: nickId, value: star },
      { id: jobId, value: roleName },
    ];
    if (titleId && titleId !== nickId) fields.push({ id: titleId, value: roleName });
    if (descId) fields.push({ id: descId, value: description });
    return { fields };
  });

  // 4. 分批写入（每批 20 条，避免单次过大）
  const BATCH = 20;
  let created = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await api(cred, 'POST', `/v3/app/worksheets/${worksheetId}/rows/batch`, { rows: batch });
    if (!res.ok) {
      console.error('批量写入失败:', res.data);
      process.exit(1);
    }
    created += batch.length;
    console.log('已写入', created, '/', rows.length);
  }
  console.log('完成。108 将已写入虚拟角色表。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
