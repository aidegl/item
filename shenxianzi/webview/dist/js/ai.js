// AI页面交互逻辑
document.addEventListener('DOMContentLoaded', () => {
  initVersion();
  // 初始化页面
  initAIPage();
});

const VERSION_CONFIG = {
  currentVersion: 'v0.0.13',
  releaseInfo: {
    date: '2026-01-09',
    author: '开发团队',
    description: 'WebView 入口切换为 ai.html'
  }
};

function initVersion() {
  const versionBadge = document.getElementById('version-badge');
  if (versionBadge) {
    versionBadge.textContent = VERSION_CONFIG.currentVersion;
    versionBadge.title = `发布时间：${VERSION_CONFIG.releaseInfo.date}`;
  }
  console.log(`🚀 版本信息：${VERSION_CONFIG.currentVersion}`);
  console.log(`📅 发布时间：${VERSION_CONFIG.releaseInfo.date}`);
  console.log(`👥 发布者：${VERSION_CONFIG.releaseInfo.author}`);
  console.log(`📝 描述：${VERSION_CONFIG.releaseInfo.description}`);
}

function initAIPage() {
  // 添加功能项点击事件
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach(item => {
    item.addEventListener('click', () => {
      // 移除其他项的活跃状态
      featureItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });
      // 添加当前项的活跃状态
      item.classList.add('active');
      
      // 模拟功能点击效果
      setTimeout(() => {
        item.classList.remove('active');
      }, 200);
    });
  });
  
  // 添加页面加载动画
  const page = document.querySelector('.ai-page');
  if (page) {
    page.style.opacity = '0';
    page.style.transition = 'opacity 0.3s ease';
    
    // 延迟执行以确保动画可见
    setTimeout(() => {
      page.style.opacity = '1';
    }, 100);
  }
  
  // 初始化AI助手功能
  initAIAssistant();
}

function initAIAssistant() {
  // 这里可以添加AI助手的初始化逻辑
  // 例如：连接AI服务、加载历史对话等
  console.log('AI智能助手已初始化');
}

// 工具函数
function showLoading(element) {
  if (element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
  }
}

function hideLoading(element) {
  if (element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
  }
}
