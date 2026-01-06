// 初始化登录模块
const login = new WechatLogin({
  miniProgramLoginUrl: '/pages/login/index',
  miniProgramLogoutUrl: '/pages/login/index',
  defaultAvatar: '../assets/img/me0.png'
});

// 更新UI显示
function updateUI() {
  // DOM选择器，通过元素ID获取对应的DOM对象，获取后可操作元素的属性（如textContent、src、style）。
  const statusEl = document.getElementById('login-status');
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  const loginBtn = document.getElementById('btn-login');
  const logoutBtn = document.getElementById('btn-logout');

  if (login.isLoggedIn()) {
    const userInfo = login.getUserInfo();
    statusEl.textContent = '已登录';
    nameEl.textContent = userInfo ? userInfo.name : '未知用户';
    if (userInfo && userInfo.avatar) {
      avatarEl.src = userInfo.avatar;
      avatarEl.style.display = 'inline-block';
    } else {
      avatarEl.style.display = 'none';
    }
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    statusEl.textContent = '未登录';
    nameEl.textContent = '-';
    avatarEl.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// 测试登录函数（用于开发测试）
async function testLogin() {
  // 使用测试openid
  const testOpenid = "oJZJz1xpX5ftzwXZhP31nKYIGeYM";
  const success = await login.loginWithOpenid(testOpenid);
  if (success) {
    alert('测试登录成功');
  } else {
    alert('测试登录失败');
  }
  updateUI();
}

// 绑定事件监听器
document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', () => login.toWxLogin());
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => login.toWxLogout());
  }

  const btnDebug = document.getElementById('btn-debug');
  if (btnDebug) {
    btnDebug.addEventListener('click', () => login.debug());
  }

  const btnTestLogin = document.getElementById('btn-test-login');
  if (btnTestLogin) {
    btnTestLogin.addEventListener('click', () => testLogin());
  }

  // 监听登录状态变化
  setInterval(() => {
    updateUI();
  }, 1000);
});
