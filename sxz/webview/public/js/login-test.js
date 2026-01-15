const isLoginTestPage = !!document.getElementById('login-status');
const isMainIndexPage = !!document.querySelector('#page-me .user-name');

function resolveUrl(relativePath) {
  return new URL(relativePath, document.baseURI).toString();
}

const defaultAvatar = isLoginTestPage ? resolveUrl('../assets/img/me0.png') : resolveUrl('./assets/img/me0.png');

const login = new WechatLogin({
  miniProgramLoginUrl: '/pages/login/index',
  miniProgramLogoutUrl: '/pages/login/index',
  defaultAvatar
});

let lastLoggedOpenid = null;

function updateLoginTestUI() {
  const statusEl = document.getElementById('login-status');
  const nameEl = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  const loginBtn = document.getElementById('btn-login');
  const logoutBtn = document.getElementById('btn-logout');
  if (!statusEl || !nameEl || !avatarEl) return;

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

function updateMainIndexMeUI() {
  const avatarEl = document.querySelector('#page-me .user-avatar');
  const nameEl = document.querySelector('#page-me .user-name');
  if (!avatarEl || !nameEl) return;

  if (!login.isLoggedIn()) {
    nameEl.textContent = '未登录';
    avatarEl.src = resolveUrl('./assets/img/me0.png');
    return;
  }

  const userInfo = login.getUserInfo();
  nameEl.textContent = (userInfo && userInfo.name) ? userInfo.name : '用户';
  avatarEl.src = (userInfo && userInfo.avatar) ? userInfo.avatar : resolveUrl('./assets/img/me0.png');
}

function updateUI() {
  if (isLoginTestPage) updateLoginTestUI();
  if (isMainIndexPage) updateMainIndexMeUI();

  if (login.isLoggedIn()) {
    const openid = login.getOpenid();
    if (openid && openid !== lastLoggedOpenid) {
      lastLoggedOpenid = openid;
      const userInfo = login.getUserInfo();
      console.log('[Login] getUserInfo()', {
        openid,
        name: userInfo && userInfo.name,
        avatar: userInfo && userInfo.avatar
      });
      console.log('[Mingdao] row', userInfo && userInfo.raw);
    }
  } else if (lastLoggedOpenid) {
    lastLoggedOpenid = null;
  }
}

async function testLogin() {
  const testOpenid = "oJZJz1xpX5ftzwXZhP31nKYIGeYM";
  const success = await login.loginWithOpenid(testOpenid);
  if (success) {
    alert('测试登录成功');
  } else {
    alert('测试登录失败');
  }
  updateUI();
}

function init() {
  console.log('[H5] init location.href:', location.href);

  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) btnLogin.addEventListener('click', () => login.toWxLogin());

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => login.toWxLogout());

  const btnDebug = document.getElementById('btn-debug');
  if (btnDebug) btnDebug.addEventListener('click', () => login.debug());

  const btnTestLogin = document.getElementById('btn-test-login');
  if (btnTestLogin) btnTestLogin.addEventListener('click', () => testLogin());

  const menuSettings = document.getElementById('menu-settings');
  if (menuSettings) {
    menuSettings.addEventListener('click', () => login.toWxLogin());
  }

  const originalLoginWithOpenid = login.loginWithOpenid.bind(login);
  login.loginWithOpenid = async function (openid) {
    const ok = await originalLoginWithOpenid(openid);
    updateUI();

    if (ok) {
      const userInfo = login.getUserInfo();
      console.log('[Login] getUserInfo()', {
        openid: login.getOpenid(),
        name: userInfo && userInfo.name,
        avatar: userInfo && userInfo.avatar
      });
      console.log('[Mingdao] row', userInfo && userInfo.raw);
    } else {
      console.warn('[Login] loginWithOpenid failed', { openid });
    }

    return ok;
  };

  const originalLogout = login.logout.bind(login);
  login.logout = function () {
    originalLogout();
    updateUI();
    console.log('[Login] logout');
  };

  updateUI();
  window.addEventListener('hashchange', updateUI);
  setInterval(updateUI, 800);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
