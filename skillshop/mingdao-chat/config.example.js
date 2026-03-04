// ============ 明道云配置 ============
// ⚠️ 安装后必须修改以下配置！

const CONFIG = {
  // 明道云 API 凭证
  // 获取方式：明道云 → 应用设置 → 集成 → API → 创建密钥
  appkey: '你的 AppKey',  // ⚠️ 替换为你的
  sign: '你的 Sign',      // ⚠️ 替换为你的
  
  // 明道云工作表 ID
  // 获取方式：打开工作表，查看 URL 或字段设置
  dialogWorksheet: '对话工作表 ID',    // ⚠️ 替换为你的
  messageWorksheet: '消息工作表 ID',   // ⚠️ 替换为你的
  
  // 字段 ID（必须与你的明道云工作表一致）
  // 获取方式：字段设置 → 查看字段详情
  fields: {
    dialog: {
      neirong: '内容字段 ID',           // ⚠️ 替换为你的
      faqiren: '发起人工 ID',          // ⚠️ 替换为你的
      jieshouren: '接收人字段 ID',     // ⚠️ 替换为你的
      leixing: '类型字段 ID',           // ⚠️ 替换为你的
      riqi: '日期字段 ID'               // ⚠️ 替换为你的
    },
    message: {
      neirong: '内容字段 ID',           // ⚠️ 替换为你的
      duihua: '对话字段 ID',            // ⚠️ 替换为你的
      yonghu: '用户字段 ID',            // ⚠️ 替换为你的
      riqi: '日期字段 ID'               // ⚠️ 替换为你的
    }
  }
};

// ============ 用户映射 ============
// 将用户名映射到明道云用户 RowID
// 获取方式：明道云 → 用户管理 → 查看用户详情 → 复制 RowID

const USERS = {
  xiaozong: '小粽的 RowID',     // ⚠️ 替换为你的 AI 助手 RowID
  feng: '风的 RowID',          // ⚠️ 替换为你的用户 RowID
  master: '主人的 RowID'        // ⚠️ 替换为你的用户 RowID
};

// ============ 会话目录 ============
// OpenClaw 会话文件存储位置
// 通常不需要修改，除非你的 OpenClaw 安装路径不同

const SESSIONS_DIR = '/home/admin/.openclaw/agents/main/sessions';
// ⚠️ 如果路径不同，请修改为你的实际路径

module.exports = { CONFIG, USERS, SESSIONS_DIR };
