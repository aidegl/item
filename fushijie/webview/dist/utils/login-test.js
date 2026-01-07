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
let globalCssText = '';

function ensureGlobalStyle(cssText) {
  const id = 'global-style';
  const head = document.head || document.getElementsByTagName('head')[0];
  if (!head) return;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('style');
    el.id = id;
    head.appendChild(el);
  }
  if (el.textContent !== cssText) el.textContent = cssText;
}

function pickCssText(row) {
  if (!row || typeof row !== 'object') return '';
  const keys = ['css', 'style', 'globalCss', 'globalStyle', 'yangshi', '样式', '主题', 'theme', 'cssText'];
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  for (const k of Object.keys(row)) {
    const v = row[k];
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) continue;
      if (s.includes('{') && s.includes('}') && (s.includes('.') || s.includes('#') || s.includes(':root'))) return s;
    }
  }
  return '';
}

function handleMiniProgramMessage(data) {
  const action = data && data.action;
  if (action !== 'globalConfig') return;
  const payload = data && data.payload;
  const row = payload && payload.row;
  console.log('[GlobalConfig] received:', payload);
  const cssText = pickCssText(row);
  if (cssText && cssText !== globalCssText) {
    globalCssText = cssText;
    ensureGlobalStyle(cssText);
  }
}

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

  try {
    const params = (function () {
      const out = {};
      const qs = (location.search || '').replace(/^\?/, '');
      if (!qs) return out;
      qs.split('&').forEach(function (kv) {
        if (!kv) return;
        const idx = kv.indexOf('=');
        const k = idx >= 0 ? kv.slice(0, idx) : kv;
        const v = idx >= 0 ? kv.slice(idx + 1) : '';
        const key = decodeURIComponent(k || '');
        if (!key) return;
        out[key] = decodeURIComponent(v || '');
      });
      return out;
    })();
    const rowId = params.item;
    const worksheetId = params.worksheetId || params.sheet || 'qjsz';
    if (rowId && window.MingDaoYunAPI) {
      console.log('[H5] url config fetch:', { rowId, worksheetId });
      const api = new window.MingDaoYunAPI();
      api.getData(rowId, worksheetId).then(function (res) {
        console.log('[H5] url config response:', res);
        if (res && res.success) {
          handleMiniProgramMessage({
            action: 'globalConfig',
            payload: { rowId: rowId, worksheetId: worksheetId, row: res.data }
          });
        } else {
          handleMiniProgramMessage({
            action: 'globalConfig',
            payload: { rowId: rowId, worksheetId: worksheetId, error: 'mingdao_failed', response: res || null }
          });
        }
      }).catch(function (err) {
        console.error('[H5] url config exception:', err);
        handleMiniProgramMessage({
          action: 'globalConfig',
          payload: { rowId: rowId, worksheetId: worksheetId, error: 'request_exception', message: String(err && (err.message || err.errMsg) || err) }
        });
      });
    } else {
      console.log('[H5] url config skipped:', { hasRowId: !!rowId, hasMingDaoYunAPI: !!window.MingDaoYunAPI });
    }
  } catch (e) {
    console.error('[H5] url config init exception:', e);
  }

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

  window.addEventListener('message', (e) => {
    const payload = e && e.data;
    console.log('[H5] message event:', payload);
    if (!payload) return;
    if (payload && payload.action) {
      handleMiniProgramMessage(payload);
      return;
    }
    if (payload && payload.data && payload.data.action) {
      handleMiniProgramMessage(payload.data);
      return;
    }
    if (Array.isArray(payload) && payload.length > 0) {
      const last = payload[payload.length - 1];
      if (last && last.action) handleMiniProgramMessage(last);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
