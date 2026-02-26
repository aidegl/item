const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const Jimp = require('jimp');
const { registerComponent, getComponent } = require('./components/componentRegistry');

const app = express();
const PORT = process.env.PORT || 3001;

const MINIPROGRAM_VERSION = '1.2.3';

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

const TEMP_DIR = path.join(__dirname, 'temp');
const OUTPUT_DIR = path.join(__dirname, 'output');
const WECHAT_CREDENTIALS_FILE = path.join(__dirname, 'wechat-credentials.json');
const MAX_ZIP_FILES = 10;
const ZIP_EXPIRE_HOURS = 24;

/** 根据 merchantId 获取商家小程序配置（appId、appSecret）*/
async function getMerchantWechatConfig(merchantId) {
  if (!merchantId) return null;

  const appKey = process.env.MINGDAO_APP_KEY;
  const sign = process.env.MINGDAO_SIGN;
  const worksheetId = process.env.MINGDAO_MERCHANT_WORKSHEET_ID || 'shangjia';
  const merchantIdField = process.env.MINGDAO_MERCHANT_ID_FIELD || 'mRowid';
  const appIdField = process.env.MINGDAO_APPID_FIELD || 'appId';
  const appSecretField = process.env.MINGDAO_APPSECRET_FIELD || 'appSecret';

  if (appKey && sign) {
    try {
      const { mingdaoGetFilterRows } = require('./utils/mingdaoServer');
      const result = await mingdaoGetFilterRows({
        appKey,
        sign,
        worksheetId,
        filters: [{ controlId: merchantIdField, dataType: 2, spliceType: 1, filterType: 2, value: merchantId }],
        pageSize: 1,
        pageIndex: 1
      });
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const row = result.data.rows[0];
        const appId = row[appIdField] || row.appId || row.appid;
        const appSecret = row[appSecretField] || row.appSecret || row.appsecret;
        if (appId && appSecret) return { appId: String(appId).trim(), appSecret: String(appSecret).trim() };
      }
    } catch (e) {
      console.error('从明道云读取商家配置失败:', e);
    }
  }

  try {
    if (!fs.existsSync(WECHAT_CREDENTIALS_FILE)) return null;
    const raw = fs.readFileSync(WECHAT_CREDENTIALS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data[merchantId] && data[merchantId].appId && data[merchantId].appSecret ? data[merchantId] : null;
  } catch (e) {
    console.error('读取本地商家配置失败:', e);
    return null;
  }
}

/** 保存商家小程序配置 */
function saveMerchantWechatConfig(merchantId, appId, appSecret) {
  if (!merchantId || !appId || !appSecret) return false;
  try {
    let data = {};
    if (fs.existsSync(WECHAT_CREDENTIALS_FILE)) {
      data = JSON.parse(fs.readFileSync(WECHAT_CREDENTIALS_FILE, 'utf-8'));
    }
    data[merchantId] = { appId, appSecret };
    fs.writeFileSync(WECHAT_CREDENTIALS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('保存商家配置失败:', e);
    return false;
  }
}

[TEMP_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function cleanupOldFiles() {
  try {
    const files = fs.readdirSync(OUTPUT_DIR).filter(file => file.endsWith('.zip'));

    if (files.length > MAX_ZIP_FILES) {
      files.sort((a, b) => {
        const statA = fs.statSync(path.join(OUTPUT_DIR, a));
        const statB = fs.statSync(path.join(OUTPUT_DIR, b));
        return statA.mtime - statB.mtime;
      });

      const filesToDelete = files.slice(0, files.length - MAX_ZIP_FILES);
      filesToDelete.forEach(file => {
        const filePath = path.join(OUTPUT_DIR, file);
        fs.unlinkSync(filePath);
        console.log(`删除旧文件: ${file}`);
      });
    }

    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = fs.statSync(filePath);
      const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

      if (ageHours > ZIP_EXPIRE_HOURS) {
        fs.unlinkSync(filePath);
        console.log(`删除过期文件: ${file}`);
      }
    });
  } catch (error) {
    console.error('清理文件失败:', error);
  }
}

setInterval(cleanupOldFiles, 60 * 60 * 1000);
cleanupOldFiles();

async function copyBaseFramework(outputDir) {
  const baseDir = path.join(__dirname, 'wxApp');
  const filesToCopy = [
    'app.js',
    'app.wxss',
    'sitemap.json',
    'project.config.json',
    'utils',
    'components',
    'images'
  ];

  for (const item of filesToCopy) {
    const src = path.join(baseDir, item);
    const dest = path.join(outputDir, item);

    if (fs.existsSync(src)) {
      if (fs.statSync(src).isDirectory()) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        fs.copyFileSync(src, dest);
      }
      console.log(`复制: ${item}`);
    }
  }
}

async function loadComponentData(page, merchantId, outputDir) {
  try {
    console.log('开始加载组件数据...');
    console.log('页面组件列表:', JSON.stringify(page.components, null, 2));
    const imagesDir = path.join(outputDir, 'images');

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    for (const component of page.components || []) {
      console.log(`\n处理组件: ${component.componentName}`);
      const comp = getComponent(component.componentName);
      console.log(`组件对象:`, comp ? '找到' : '未找到');

      if (comp) {
        console.log(`组件有loadData方法:`, !!comp.loadData);
      }

      if (comp && comp.loadData) {
        console.log(`开始加载 ${component.componentName} 数据...`);
        const data = await comp.loadData(merchantId, outputDir);
        console.log(`${component.componentName} 数据加载完成:`, JSON.stringify(data, null, 2));
        component.componentItems = data;
      } else {
        console.log(`${component.componentName} 没有loadData方法或组件未找到，使用默认数据`);
      }
    }
    console.log('\n组件数据加载完成');
    console.log('最终组件数据:', JSON.stringify(page.components, null, 2));
  } catch (error) {
    console.error('加载组件数据失败:', error);
  }
}

function generateAppJs(merchantId, outputDir, config) {
  const sourceAppJsPath = path.join(__dirname, 'wxApp', 'app.js');
  let appJsContent = fs.readFileSync(sourceAppJsPath, 'utf-8');

  if (merchantId) {
    appJsContent = appJsContent.replace(
      /merchantId: '\{商家ID\}'/g,
      `merchantId: '${merchantId}'`
    );
  }

  const gc = config && config.globalConfig || {};
  const baseUrl = process.env.SERVER_PUBLIC_URL || 'https://100000whys.cn';
  const base = baseUrl.replace(/\/$/, '');
  let loginApiUrl = gc.loginApiUrl || '';
  if (!loginApiUrl && gc.wechatAppId && gc.wechatAppSecret) {
    loginApiUrl = base + '/api/wechat/login';
  }
  if (!loginApiUrl) loginApiUrl = base + '/api/core/api/login';
  const phoneLoginApiUrl = gc.phoneLoginApiUrl || base + '/api/core/api/phone-login';
  const loginBlock = `
  console.log('小程序版本: ${MINIPROGRAM_VERSION}');
  try {
    var savedOpenId = wx.getStorageSync('openId');
    if (savedOpenId) {
      this.globalData.openId = savedOpenId;
      console.log('从缓存恢复 openId:', typeof savedOpenId === 'string' ? savedOpenId.substring(0, 8) + '...' : savedOpenId);
    } else {
      setTimeout(function() { this.doLogin(); }.bind(this), 100);
    }
  } catch (e) {
    console.warn('启动时获取 openId 异常（游客模式可能受限）:', e);
    setTimeout(function() { this.doLogin(); }.bind(this), 100);
  }
`;

  const doLoginBlock = loginApiUrl ? `
  doLogin() {
    try {
      wx.login({
        success: (res) => {
          if (!res.code) {
            console.warn('wx.login 未返回 code（游客模式/模拟器可能返回模拟数据）');
            return;
          }
          wx.request({
            url: '${loginApiUrl.replace(/'/g, "\\'")}',
            method: 'POST',
            data: { code: res.code, merchantId: this.globalData.merchantId || '' },
            header: { 'Content-Type': 'application/json' },
            success: (reqRes) => {
              try {
                const openId = (reqRes.data && (reqRes.data.openId || reqRes.data.openid)) || (reqRes.data && reqRes.data.data && (reqRes.data.data.openId || reqRes.data.data.openid));
                if (openId) {
                  this.globalData.openId = openId;
                  wx.setStorageSync('openId', openId);
                  console.log('登录成功, openId:', openId.substring(0, 8) + '...');
                } else {
                  console.warn('登录接口未返回 openId');
                }
              } catch (e) { console.warn('解析登录返回异常:', e); }
            },
            fail: (err) => {
              console.warn('登录请求失败（游客模式/模拟器可能受限）:', err.errMsg || err);
            }
          });
        },
        fail: (err) => {
          console.warn('wx.login 失败（游客模式可能受限）:', err.errMsg || err);
        }
      });
    } catch (e) {
      console.warn('doLogin 异常:', e);
    }
  },
` : `
  doLogin() {
    wx.login({
      success: (res) => {
        console.log('wx.login 结果, code:', res.code, '(需配置 globalConfig.loginApiUrl 将 code 换取 openId)');
      }
    });
  },
`;

  appJsContent = appJsContent.replace(
    /console\.log\('小程序启动'\);/g,
    `console.log('小程序启动');${loginBlock}`
  );

  appJsContent = appJsContent.replace(
    /onHide\(\) \{\s*console\.log\('小程序隐藏'\);\s*\},\s*/s,
    `onHide() {\n    console.log('小程序隐藏');\n  },\n${doLoginBlock}\n\n  `
  );

  appJsContent = appJsContent.replace(
    /openId: ''\s*\}/s,
    `openId: '',
    loginApiUrl: '${loginApiUrl.replace(/'/g, "\\'")}',
    phoneLoginApiUrl: '${phoneLoginApiUrl.replace(/'/g, "\\'")}'
  }`
  );

  fs.writeFileSync(path.join(outputDir, 'app.js'), appJsContent);
  console.log('生成app.js, 商家ID:', merchantId || '');
}

/** 生成登录页面（手机号一键登录、验证码登录、底部协议） */
function generateLoginPage(outputDir, config, themeColor) {
  const loginDir = path.join(outputDir, 'pages', 'login');
  fs.mkdirSync(loginDir, { recursive: true });

  const tc = (themeColor && themeColor !== '{主题色}') ? themeColor : '#0557e1';
  const baseUrl = process.env.SERVER_PUBLIC_URL || 'https://100000whys.cn';
  const phoneLoginApiUrl = baseUrl.replace(/\/$/, '') + '/api/core/api/phone-login';
  const loginApiUrl = baseUrl.replace(/\/$/, '') + '/api/core/api/login';
  const userAgreementUrl = (config && config.globalConfig && config.globalConfig.userAgreementUrl) || '';
  const privacyPolicyUrl = (config && config.globalConfig && config.globalConfig.privacyPolicyUrl) || '';

  const wxml = `<view class="login-page">
  <view class="login-header">
    <text class="login-title">登录</text>
    <text class="login-desc">欢迎使用，请选择登录方式</text>
  </view>

  <view class="login-methods">
    <button class="btn-onekey" open-type="getPhoneNumber" bindgetphonenumber="onGetPhoneNumber" style="background-color: {{themeColor}};">
      手机号一键登录
    </button>

    <view class="divider">
      <text class="divider-line"></text>
      <text class="divider-text">或</text>
      <text class="divider-line"></text>
    </view>

    <button class="btn-verify" bindtap="onGoVerifyLogin" style="border-color: {{themeColor}}; color: {{themeColor}};">
      手机验证码登录
    </button>
  </view>

  <view class="login-footer">
    <text class="agreement-text">我已阅读</text>
    <text class="agreement-link" bindtap="onAgreementTap" data-url="{{userAgreementUrl}}">《用户服务协议》</text>
    <text class="agreement-text">、</text>
    <text class="agreement-link" bindtap="onAgreementTap" data-url="{{privacyPolicyUrl}}">《隐私政策》</text>
  </view>
</view>`;

  const wxss = `.login-page {
  min-height: 100vh;
  padding: 60rpx 48rpx 80rpx;
  background: linear-gradient(180deg, #f8f9fc 0%, #fff 40%);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-header {
  margin-bottom: 80rpx;
  text-align: center;
}
.login-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}
.login-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
}
.login-methods {
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.btn-onekey {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  margin-bottom: 24rpx;
}
.btn-onekey::after { border: none; }
.divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 40rpx 0 32rpx;
}
.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e5e5e5;
}
.divider-text {
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #999;
}
.btn-verify {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  background: transparent;
  border: 2rpx solid;
}
.btn-verify::after { border: none; }
.login-footer {
  position: fixed;
  bottom: 60rpx;
  left: 48rpx;
  right: 48rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
.agreement-link {
  color: #0557e1;
  text-decoration: underline;
}`;

  const js = `Page({
  data: {
    themeColor: '${tc}',
    userAgreementUrl: '${userAgreementUrl}',
    privacyPolicyUrl: '${privacyPolicyUrl}',
    phoneLoginApiUrl: '${phoneLoginApiUrl.replace(/'/g, "\\'")}',
    loginApiUrl: '${loginApiUrl.replace(/'/g, "\\'")}'
  },

  onGoVerifyLogin() {
    wx.navigateTo({ url: '/pages/login-verify/index' });
  },

  onGetPhoneNumber(e) {
    console.log('[登录] getPhoneNumber 回调:', e.detail);
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '需要授权手机号才能登录', icon: 'none' });
      return;
    }
    const { code, encryptedData, iv } = e.detail;
    const app = getApp();
    const url = this.data.phoneLoginApiUrl || (app.globalData && app.globalData.phoneLoginApiUrl) || (app.globalData && app.globalData.loginApiUrl) || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置「登录接口URL」或「手机号登录接口」', icon: 'none', duration: 2500 });
      return;
    }
    const merchantId = app.globalData.merchantId || '';
    console.log('[登录] 请求URL:', url, 'merchantId:', merchantId);
    wx.showLoading({ title: '登录中...' });
    wx.login({
      success: (loginRes) => {
        const loginCode = loginRes.code || '';
        if (!loginCode) {
          wx.hideLoading();
          wx.showToast({ title: '获取登录凭证失败，请重试', icon: 'none' });
          return;
        }
        const postData = { code: code || '', encryptedData: encryptedData || '', iv: iv || '', loginCode, merchantId };
        console.log('[登录] 请求 merchantId:', merchantId);
        wx.request({
          url: url,
          method: 'POST',
          data: postData,
          header: { 'Content-Type': 'application/json' },
          success: (res) => {
            console.log('[登录] 响应 status:', res.statusCode, 'data:', JSON.stringify(res.data));
            const openId = (res.data && res.data.openId) || (res.data && res.data.openid) || (res.data && res.data.data && res.data.data.openId);
            if (openId) {
              wx.hideLoading();
              app.globalData.openId = openId;
              wx.setStorageSync('openId', openId);
              wx.showToast({ title: '登录成功', icon: 'success' });
              setTimeout(() => wx.navigateBack(), 500);
              return;
            }
            if (res.statusCode === 404 || res.statusCode >= 500) {
              console.log('[登录] phone-login 失败，尝试 login 接口');
              const loginUrl = this.data.loginApiUrl || (app.globalData && app.globalData.loginApiUrl) || url.replace(/phone-login/g, 'login');
              wx.request({
                url: loginUrl,
                method: 'POST',
                data: { code: loginCode, merchantId, merchant_id: merchantId },
                header: { 'Content-Type': 'application/json' },
                success: (r2) => {
                  wx.hideLoading();
                  const oid = (r2.data && r2.data.openId) || (r2.data && r2.data.openid);
                  if (oid) {
                    app.globalData.openId = oid;
                    wx.setStorageSync('openId', oid);
                    wx.showToast({ title: '登录成功', icon: 'success' });
                    setTimeout(() => wx.navigateBack(), 500);
                  } else {
                    wx.showToast({ title: (r2.data && r2.data.message) || '登录失败', icon: 'none' });
                  }
                },
                fail: () => { wx.hideLoading(); wx.showToast({ title: '登录服务不可用', icon: 'none' }); }
              });
              return;
            }
            wx.hideLoading();
            wx.showToast({ title: (res.data && res.data.msg) || (res.data && res.data.message) || '登录失败', icon: 'none' });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('[登录] 请求失败:', err);
            wx.showToast({ title: (err.errMsg || '网络错误') + (err.statusCode ? ' ' + err.statusCode : ''), icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
      }
    });
  },

  onAgreementTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent(url) });
    else wx.showToast({ title: '协议链接未配置', icon: 'none' });
  }
});`;

  const json = `{
  "navigationBarTitleText": "登录",
  "usingComponents": {}
}`;

  fs.writeFileSync(path.join(loginDir, 'index.wxml'), wxml);
  fs.writeFileSync(path.join(loginDir, 'index.wxss'), wxss);
  fs.writeFileSync(path.join(loginDir, 'index.js'), js);
  fs.writeFileSync(path.join(loginDir, 'index.json'), json);
  console.log('生成登录页面');
}

/** 生成验证码登录页面（手机号、验证码输入） */
function generateLoginVerifyPage(outputDir, config, themeColor) {
  const loginVerifyDir = path.join(outputDir, 'pages', 'login-verify');
  fs.mkdirSync(loginVerifyDir, { recursive: true });

  const tc = (themeColor && themeColor !== '{主题色}') ? themeColor : '#0557e1';
  const baseUrl = process.env.SERVER_PUBLIC_URL || 'https://100000whys.cn';
  const phoneLoginApiUrl = baseUrl.replace(/\/$/, '') + '/api/core/api/phone-login';
  const loginApiUrl = baseUrl.replace(/\/$/, '') + '/api/core/api/login';

  const wxml = `<view class="verify-page">
  <view class="verify-header">
    <text class="verify-title">验证码登录</text>
    <text class="verify-desc">请输入手机号并获取验证码</text>
  </view>

  <view class="verify-form">
    <view class="input-row">
      <input class="input-phone" type="number" placeholder="请输入手机号" maxlength="11" value="{{phone}}" bindinput="onPhoneInput" />
    </view>
    <view class="input-row row-code">
      <input class="input-code" type="number" placeholder="请输入验证码" maxlength="6" value="{{code}}" bindinput="onCodeInput" />
      <button class="btn-getcode {{countdown > 0 ? 'disabled' : ''}}" disabled="{{countdown > 0}}" bindtap="onGetCode">
        {{countdown > 0 ? countdown + 's后重试' : '获取验证码'}}
      </button>
    </view>
    <button class="btn-login" bindtap="onVerifyLogin" style="background-color: {{themeColor}};">登录</button>
  </view>
</view>`;

  const wxss = `.verify-page {
  min-height: 100vh;
  padding: 60rpx 48rpx;
  background: #fff;
  box-sizing: border-box;
}
.verify-header {
  margin-bottom: 64rpx;
}
.verify-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}
.verify-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
}
.verify-form .input-row {
  margin-bottom: 32rpx;
}
.verify-form .input-row input {
  width: 100%;
  height: 96rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  background: #f5f6f8;
  border-radius: 12rpx;
  box-sizing: border-box;
}
.row-code {
  display: flex;
  gap: 20rpx;
}
.row-code .input-code { flex: 1; }
.btn-getcode {
  width: 200rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 26rpx;
  color: #0557e1;
  background: #e8f0fe;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.btn-getcode.disabled {
  color: #999;
  background: #e5e5e5;
}
.btn-getcode::after { border: none; }
.btn-login {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  border: none;
  margin-top: 48rpx;
}
.btn-login::after { border: none; }`;

  const js = `Page({
  data: {
    themeColor: '${tc}',
    phone: '',
    code: '',
    countdown: 0,
    phoneLoginApiUrl: '${phoneLoginApiUrl.replace(/'/g, "\\'")}',
    loginApiUrl: '${loginApiUrl.replace(/'/g, "\\'")}'
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },

  onGetCode() {
    const phone = this.data.phone;
    if (!/^1[3-9]\\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    const app = getApp();
    const url = this.data.phoneLoginApiUrl || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置登录接口', icon: 'none' });
      return;
    }
    wx.request({
      url: url + '/sendCode',
      method: 'POST',
      data: { phone, merchantId: app.globalData.merchantId || '' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.data && (res.data.success || res.data.code === 0)) {
          this.startCountdown();
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '发送失败', icon: 'none' });
        }
      }
    });
  },

  startCountdown() {
    let c = 60;
    this.setData({ countdown: c });
    const t = setInterval(() => {
      c--;
      this.setData({ countdown: c });
      if (c <= 0) clearInterval(t);
    }, 1000);
  },

  onVerifyLogin() {
    const { phone, code } = this.data;
    if (!/^1[3-9]\\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!code || code.length < 4) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    const app = getApp();
    const url = this.data.loginApiUrl || '';
    if (!url) {
      wx.showToast({ title: '请在商家后台「全局设置」中配置登录接口', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中...' });
    wx.request({
      url: url + '/verify',
      method: 'POST',
      data: { phone, code, merchantId: app.globalData.merchantId || '' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        const openId = (res.data && (res.data.openId || res.data.openid)) || (res.data && res.data.data && (res.data.data.openId || res.data.data.openid));
        if (openId) {
          const app = getApp();
          app.globalData.openId = openId;
          wx.setStorageSync('openId', openId);
          wx.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => wx.navigateBack({ delta: 2 }), 500);
        } else {
          wx.showToast({ title: (res.data && res.data.msg) || '验证码错误', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  }
});`;

  const json = `{
  "navigationBarTitleText": "验证码登录",
  "usingComponents": {}
}`;

  fs.writeFileSync(path.join(loginVerifyDir, 'index.wxml'), wxml);
  fs.writeFileSync(path.join(loginVerifyDir, 'index.wxss'), wxss);
  fs.writeFileSync(path.join(loginVerifyDir, 'index.js'), js);
  fs.writeFileSync(path.join(loginVerifyDir, 'index.json'), json);
  console.log('生成验证码登录页面');
}

/** 生成 webview 页面（用于展示协议等外链） */
function generateWebviewPage(outputDir) {
  const wvDir = path.join(outputDir, 'pages', 'webview');
  fs.mkdirSync(wvDir, { recursive: true });
  fs.writeFileSync(path.join(wvDir, 'index.wxml'), '<web-view wx:if="{{url}}" src="{{url}}"></web-view>');
  fs.writeFileSync(path.join(wvDir, 'index.wxss'), '');
  fs.writeFileSync(path.join(wvDir, 'index.js'), `Page({
  data: { url: '' },
  onLoad(o) {
    const url = o.url ? decodeURIComponent(o.url) : '';
    this.setData({ url });
  }
});`);
  fs.writeFileSync(path.join(wvDir, 'index.json'), '{"navigationBarTitleText":"","usingComponents":{}}');
  console.log('生成webview页面');
}

async function generatePage(page, outputDir, merchantId, themeColor) {
  try {
    console.log('========== 开始生成页面 ==========');
    console.log('页面信息:', JSON.stringify(page, null, 2));

    if (page.components) {
      page.components.forEach((comp, idx) => {
        if (comp.componentName === '内容列表') {
          console.log(`组件[${idx}] 内容列表的属性:`, JSON.stringify(comp.properties, null, 2));
        }
      });
    }

    const pageDir = path.join(outputDir, 'pages', page.pageId);
    console.log(`创建页面目录: ${pageDir}`);
    fs.mkdirSync(pageDir, { recursive: true });

    console.log(`跳过组件数据加载（小程序端自行加载）`);

    console.log(`生成JS文件...`);
    const jsContent = generatePageJS(page, merchantId, themeColor || '#0557e1');
    fs.writeFileSync(path.join(pageDir, 'index.js'), jsContent);
    console.log(`JS文件生成成功`);

    console.log(`生成WXML文件...`);
    const wxmlContent = generatePageWXML(page, themeColor || '#0557e1');
    fs.writeFileSync(path.join(pageDir, 'index.wxml'), wxmlContent);
    console.log(`WXML文件生成成功`);

    console.log(`生成WXSS文件...`);
    const wxssContent = generatePageWXSS(page, themeColor || '#0557e1');
    fs.writeFileSync(path.join(pageDir, 'index.wxss'), wxssContent);
    console.log(`WXSS文件生成成功`);

    console.log(`生成JSON文件...`);
    const jsonContent = generatePageJSON(page);
    fs.writeFileSync(path.join(pageDir, 'index.json'), jsonContent);
    console.log(`JSON文件生成成功`);

    console.log(`生成页面: ${page.pageName}`);
  } catch (error) {
    console.error(`生成页面失败: ${page.pageName}`, error);
    throw error;
  }
}

function getComponentDataKey(component) {
  const name = component.componentName;
  const mapping = {
    '轮播图': 'carouselImages',
    '功能列表': 'functionList',
    '图片': 'singleImage',
    '文本': 'textContent',
    '商品网格': 'productGrid',
    '商品列表': 'productList',
    '公告': 'noticeList',
    '标签页面': 'tabsData',
    '内容列表': 'contentList'
  };

  if (mapping[name]) {
    return mapping[name];
  }

  const rawId = component.componentId || '';
  const safeId = rawId.replace(/[^a-zA-Z0-9_]/g, '');
  return safeId ? `component_${safeId}` : 'componentData';
}

function generatePageJS(page, merchantId) {
  const components = page.components || [];
  const myPage = isMyPage(page);

  const userInfoDataBlock = myPage ? `  userInfo: {
    avatar: '',
    nickname: '用户昵称',
    userId: '--'
  },
  showLoginPrompt: true,
` : '';

  const componentsData = components.map(comp => {
    const dataKey = getComponentDataKey(comp);
    let dataFields = `  ${dataKey}: [],`;

    if (comp.componentName === '内容列表' && comp.properties && comp.properties.enableTabs) {
      const tabs = comp.properties.tabs || [];
      const tabsConfig = tabs.length > 0
        ? JSON.stringify([{ label: '全部', field: '', value: '' }, ...tabs])
        : '[]';
      const tabThemeColor = comp.properties.tabThemeColor || '#667eea';
      dataFields += `
  contentTabs: ${tabsConfig},
  tabThemeColor: '${tabThemeColor}',
  currentTabIndex: 0,
  currentTabField: '',
  currentTabValue: ''`;
    }

    return dataFields;
  }).join('\n');

  const loadDataCalls = components.map(comp => {
    return `    this.load${comp.componentName}Data();`;
  }).join('\n');

  const loadMethods = components.map(comp => {
    let worksheetId = '';
    let dataMapping = '';
    let filtersConfig = '[]';

    if (comp.componentName === '轮播图') {
      worksheetId = 'lunbotu';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let url = '';
        if (row.url) {
          url = row.url;
        } else if (row.fengmian) {
          try {
            const imgArray = JSON.parse(row.fengmian);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              const firstImg = imgArray[0];
              url = firstImg.large_thumbnail_full_path || firstImg.url || firstImg.large_thumbnail_path || firstImg.path;
            }
          } catch (e) {
            console.error('解析fengmian字段失败:', e);
          }
        }
        return { url };
      }).filter(item => item.url)`;
    } else if (comp.componentName === '功能列表') {
      worksheetId = 'gongneng';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let iconUrl = '';
        try {
          const iconArray = JSON.parse(row.icon);
          if (Array.isArray(iconArray) && iconArray.length > 0) {
            iconUrl = iconArray[0].large_thumbnail_full_path || iconArray[0].url || iconArray[0].thumbnail_full_path;
          }
        } catch (e) {
          console.error('解析icon字段失败:', e);
        }
        return { icon: iconUrl, name: row.mingcheng };
      });`;
    } else if (comp.componentName === '内容列表') {
      worksheetId = 'neirong';
      filtersConfig = `[
              {
                'controlId': 'mRowid',
                'dataType': 2,
                'spliceType': 1,
                'filterType': 24,
                'value': mRowid
              }
            ]`;
      dataMapping = `result.data.rows.map(row => {
        let fengmianUrl = '';
        try {
          if (row.fengmian) {
            const imgArray = JSON.parse(row.fengmian);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              fengmianUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
            }
          }
        } catch (e) {
          console.error('解析fengmian字段失败:', e);
        }
        let zztxUrl = '';
        try {
          if (row.zztx) {
            const imgArray = JSON.parse(row.zztx);
            if (Array.isArray(imgArray) && imgArray.length > 0) {
              zztxUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
            }
          }
        } catch (e) {
          console.error('解析zztx字段失败:', e);
        }
        return {
          rowid: row.rowid,
          mingcheng: row.mingcheng || '',
          miaoshu: row.miaoshu || '',
          fengmian: fengmianUrl,
          biaoqian: (function() {
            try {
              if (row.biaoqian) {
                const arr = JSON.parse(row.biaoqian);
                if (Array.isArray(arr)) {
                  return arr.map(item => item.name || item).filter(v => v);
                }
              }
            } catch (e) {
              console.error('解析biaoqian失败:', e);
            }
            return row.biaoqian ? [row.biaoqian] : [];
          })(),
          jiage: row.jiage || '',
          zztx: zztxUrl,
          zznc: row.zznc || '',
          ctime: row.ctime || '',
          ctimeFormatted: (function() {
            if (!row.ctime) return '';
            const now = new Date();
            const date = new Date(row.ctime.replace(' ', 'T'));
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) return '刚刚';
            if (diffMins < 60) return diffMins + '分钟前';
            if (diffHours < 24) return diffHours + '小时前';
            if (diffDays === 1 || (diffHours >= 24 && diffHours < 48)) return '昨天';
            if (diffDays < 7) return diffDays + '天前';
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const h = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            if (y === now.getFullYear()) {
              return m + '-' + d + ' ' + h + ':' + min;
            }
            return y + '-' + m + '-' + d;
          })(),
          dianzan: row.dianzan || '',
          pinglun: row.pinglun || '',
          shoucang: row.shoucang || '',
          yueduliang: row.yueduliang || ''
        };
      })`;
    } else {
      worksheetId = '';
      dataMapping = 'result.data.rows';
    }

    const dataKey = getComponentDataKey(comp);
    return `
  async load${comp.componentName}Data() {
    try {
      console.log('开始加载${comp.componentName}数据...');
      const app = getApp();
      const mRowid = app && app.globalData && app.globalData.mRowid ? app.globalData.mRowid : '${merchantId || ''}';
      
      const data = await this.call${comp.componentName}API(mRowid);
      console.log('${comp.componentName}数据加载成功:', data);
      this.setData({ ${dataKey}: data });
    } catch (error) {
      console.error('${comp.componentName}数据加载失败:', error);
    }
  },

  async call${comp.componentName}API(mRowid) {
    const api = require('../../utils/MingdaoYunArrayAPI');
    const apiInstance = new api();
    
    const result = await apiInstance.getData({
      worksheetId: '${worksheetId}',
      filters: ${filtersConfig},
      pageSize: 50,
      pageIndex: 1
    });
    
    if (result.success && result.data && result.data.rows) {
      return ${dataMapping};
    }
    return [];
  },`;
  }).join('\n');

  const loadUserInfoMethod = myPage ? `
  goLogin() {
    if (!this.data.showLoginPrompt) return;
    wx.navigateTo({ url: '/pages/login/index' });
  },

  async loadUserInfo() {
    try {
      const app = getApp();
      const openId = app && app.globalData && app.globalData.openId ? app.globalData.openId : '';
      if (!openId) {
        this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
        return;
      }
      this.setData({ showLoginPrompt: false });
      const MingDaoYunArrayAPI = require('../../utils/MingdaoYunArrayAPI');
      const api = new MingDaoYunArrayAPI();
      const result = await api.getData({
        worksheetId: 'yonghu',
        filters: [{ controlId: 'openId', dataType: 2, spliceType: 1, filterType: 2, value: openId }],
        pageSize: 1,
        pageIndex: 1
      });
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const row = result.data.rows[0];
        console.log('用户信息(明道云yonghu表):', row);
        const nickname = (row.nicheng || row.nickname || row['昵称'] || '用户昵称') + '';
        let avatar = '';
        try {
          const avatarField = row.touxiang || row.avatar || row['头像'];
          if (typeof avatarField === 'string' && avatarField) {
            const arr = JSON.parse(avatarField);
            if (Array.isArray(arr) && arr.length > 0) {
              const first = arr[0];
              avatar = first.large_thumbnail_full_path || first.url || first.large_thumbnail_path || first.path || '';
            }
          }
        } catch (e) {}
        const userId = (row.yonghuId || row.userId || row.rowid || '--') + '';
        this.setData({
          showLoginPrompt: false,
          userInfo: { avatar: avatar || '', nickname: nickname || '用户昵称', userId: userId || '--' }
        });
      } else {
        this.setData({ showLoginPrompt: false, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
    }
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.openId = '';
          wx.removeStorageSync('openId');
          this.setData({ showLoginPrompt: true, userInfo: { avatar: '', nickname: '用户昵称', userId: '--' } });
          wx.showToast({ title: '已退出', icon: 'success' });
          app.doLogin && app.doLogin();
        }
      }
    });
  },
` : '';

  return `Page({
  data: {
${userInfoDataBlock}${componentsData}
  },

  async onLoad(options) {
    console.log('${page.pageName}页面加载', options);
    const app = getApp();
    const appMerchantId = app && app.globalData && app.globalData.merchantId ? app.globalData.merchantId : '${merchantId || ''}';
    console.log('商家ID:', appMerchantId);
    console.log('小程序版本: ${MINIPROGRAM_VERSION}');
    
    await this.initShangjiaRowid(appMerchantId);
${myPage ? '    this.loadUserInfo();\n' : ''}
    console.log('=== 开始加载组件数据 ===');
${loadDataCalls}
    console.log('=== 组件数据加载结束 ===');
${components.filter(c => c.componentName === '内容列表' && c.properties && c.properties.enableTabs).length > 0 ? `
    this.initContentTabs();` : ''}
  },

${components.filter(c => c.componentName === '内容列表' && c.properties && c.properties.enableTabs).map(c => {
    const dataKey = getComponentDataKey(c);
    return `  initContentTabs() {
    const enableTabs = ${c.properties?.enableTabs || false};
    const tabs = ${JSON.stringify(c.properties?.tabs || [])};
    if (enableTabs && tabs.length > 0) {
      this.setData({
        contentTabs: [{ label: '全部', field: '', value: '' }, ...tabs]
      });
    }
  },

  onContentTabTap(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      currentTabIndex: index,
      currentTabField: field,
      currentTabValue: value
    });
    
    this.loadContentListByTab(field, value);
  },

  async loadContentListByTab(field, value) {
    if (!field || !value) {
      this.load${c.componentName}Data();
      return;
    }
    
    try {
      const app = getApp();
      const mRowid = app && app.globalData && app.globalData.mRowid ? app.globalData.mRowid : '${merchantId || ''}';
      const api = require('../../utils/MingdaoYunArrayAPI');
      const apiInstance = new api();
      
      const filters = [
        {
          'controlId': 'mRowid',
          'dataType': 2,
          'spliceType': 1,
          'filterType': 24,
          'value': mRowid
        },
        {
          'controlId': field,
          'dataType': 2,
          'spliceType': 1,
          'filterType': 2,
          'value': value
        }
      ];
      
      const result = await apiInstance.getData({
        worksheetId: 'neirong',
        filters: filters,
        pageSize: 50,
        pageIndex: 1
      });
      
      if (result.success && result.data && result.data.rows) {
        const ${dataKey} = result.data.rows.map(row => {
          let fengmianUrl = '';
          try {
            if (row.fengmian) {
              const imgArray = JSON.parse(row.fengmian);
              if (Array.isArray(imgArray) && imgArray.length > 0) {
                fengmianUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
              }
            }
          } catch (e) {
            console.error('解析fengmian字段失败:', e);
          }
          let zztxUrl = '';
          try {
            if (row.zztx) {
              const imgArray = JSON.parse(row.zztx);
              if (Array.isArray(imgArray) && imgArray.length > 0) {
                zztxUrl = imgArray[0].large_thumbnail_full_path || imgArray[0].url || imgArray[0].thumbnail_full_path;
              }
            }
          } catch (e) {
            console.error('解析zztx字段失败:', e);
          }
          return {
            rowid: row.rowid,
            mingcheng: row.mingcheng || '',
            miaoshu: row.miaoshu || '',
            fengmian: fengmianUrl,
            biaoqian: (function() {
              try {
                if (row.biaoqian) {
                  const arr = JSON.parse(row.biaoqian);
                  if (Array.isArray(arr)) {
                    return arr.map(item => item.name || item).filter(v => v);
                  }
                }
              } catch (e) {
                console.error('解析biaoqian失败:', e);
              }
              return row.biaoqian ? [row.biaoqian] : [];
            })(),
            jiage: row.jiage || '',
            zztx: zztxUrl,
            zznc: row.zznc || '',
            ctime: row.ctime || '',
            ctimeFormatted: (function() {
              if (!row.ctime) return '';
              const now = new Date();
              const date = new Date(row.ctime.replace(' ', 'T'));
              const diffMs = now - date;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              if (diffMins < 1) return '刚刚';
              if (diffMins < 60) return diffMins + '分钟前';
              if (diffHours < 24) return diffHours + '小时前';
              if (diffDays === 1 || (diffHours >= 24 && diffHours < 48)) return '昨天';
              if (diffDays < 7) return diffDays + '天前';
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              const h = String(date.getHours()).padStart(2, '0');
              const min = String(date.getMinutes()).padStart(2, '0');
              if (y === now.getFullYear()) {
                return m + '-' + d + ' ' + h + ':' + min;
              }
              return y + '-' + m + '-' + d;
            })(),
            dianzan: row.dianzan || '',
            pinglun: row.pinglun || '',
            shoucang: row.shoucang || '',
            yueduliang: row.yueduliang || ''
          };
        });
        
        this.setData({ ${dataKey} });
        console.log('标签页筛选后的数据:', ${dataKey});
      }
    } catch (error) {
      console.error('加载标签页数据失败:', error);
    }
  },`;
  }).join('\n\n')}

  async initShangjiaRowid(mRowid) {
    try {
      const app = getApp();
      const api = require('../../utils/MingdaoYunArrayAPI');
      const apiInstance = new api();
      
      const filters = [
        {
          'controlId': 'mRowid',
          'dataType': 2,
          'spliceType': 1,
          'filterType': 2,
          'value': mRowid
        }
      ];
      
      const result = await apiInstance.getData({
        worksheetId: 'shangjia',
        filters: filters,
        pageSize: 1,
        pageIndex: 1
      });
      
      console.log('=== 查询shangjia表返回结果 ===');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.rows && result.data.rows.length > 0) {
        const shangjiaRowid = result.data.rows[0].rowid;
        console.log('商家rowid:', shangjiaRowid);
        app.globalData.mRowid = shangjiaRowid;
      } else {
        console.log('未找到对应的商家记录');
      }
    } catch (error) {
      console.error('查询shangjia表失败:', error);
    }
  },

  onReady() {
    console.log('页面渲染完成');
  },

  onShow() {
    console.log('页面显示');
${myPage ? '    this.loadUserInfo();' : ''}
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  },
${loadUserInfoMethod}${loadMethods}
});`;
}

function isMyPage(page) {
  if (!page) return false;
  if (page.pageType === 'my') return true;
  const name = (page.pageName || '').trim();
  return name === '我的' || name.includes('我的');
}

/** 解析用户信息栏背景色（支持 {主题色}） */
function resolveUserBarBackground(page, themeColor) {
  const val = page?.userInfoBarBackground || '{主题色}';
  return val === '{主题色}' ? (themeColor || '#0557e1') : val;
}

/** 生成「我的」页面顶部固定用户信息栏 WXML（必须显示，不可拖拽） */
function generateMyPageUserBarWXML(page, themeColor) {
  const bg = resolveUserBarBackground(page, themeColor);
  return `<view class="my-page-user-bar" style="background-color: ${bg};">
  <view class="user-avatar">
    <image wx:if="{{!showLoginPrompt && userInfo.avatar}}" src="{{userInfo.avatar}}" mode="aspectFill" class="avatar-img" />
    <text wx:else class="avatar-placeholder">👤</text>
  </view>
  <view class="user-info {{showLoginPrompt ? 'tap-login' : ''}}" bindtap="goLogin">
    <text wx:if="{{showLoginPrompt}}" class="user-login-prompt">点击登录</text>
    <block wx:else>
      <text class="user-nickname">{{userInfo.nickname}}</text>
      <text class="user-id">ID: {{userInfo.userId}}</text>
    </block>
  </view>
  <button wx:if="{{!showLoginPrompt}}" class="logout-btn" bindtap="onLogout">退出登录</button>
</view>`;
}

function generatePageWXML(page, themeColor) {
  const componentsHTML = (page.components || []).map(comp => {
    return generateComponentHTML(comp);
  }).join('\n');

  const userBarBlock = isMyPage(page) ? '\n' + generateMyPageUserBarWXML(page, themeColor) + '\n' : '';
  return `<view class="page">${userBarBlock}
${componentsHTML}
</view>`;
}

function generateComponentHTML(component) {
  const comp = getComponent(component.componentName);
  if (comp && comp.generateHTML) {
    const componentWithKey = { ...component, dataKey: getComponentDataKey(component) };

    if (component.componentName === '内容列表') {
      console.log('生成内容列表WXML，componentWithKey.properties:', JSON.stringify(componentWithKey.properties, null, 2));
      console.log('enableTabs值:', componentWithKey.properties?.enableTabs);
      console.log('tabs值:', JSON.stringify(componentWithKey.properties?.tabs));
    }

    return comp.generateHTML(componentWithKey);
  }
  return `  <view class="component">${component.componentName}</view>`;
}

/** 生成「我的」页面顶部用户信息栏 WXSS（背景色由 WXML 内联 style 覆盖） */
function generateMyPageUserBarWXSS() {
  return `.my-page-user-bar {
  color: #fff;
  /* background 由 WXML 内联 style 设置，此处为兜底 */
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  border-radius: 0 0 24rpx 24rpx;
  margin-bottom: 24rpx;
}
.my-page-user-bar .user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.my-page-user-bar .avatar-img {
  width: 100%;
  height: 100%;
}
.my-page-user-bar .avatar-placeholder {
  font-size: 48rpx;
}
.my-page-user-bar .user-info {
  flex: 1;
  min-width: 0;
}
.my-page-user-bar .user-nickname {
  font-size: 32rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.my-page-user-bar .user-id {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.my-page-user-bar .user-login-prompt {
  font-size: 32rpx;
  font-weight: 600;
  opacity: 0.95;
  text-decoration: underline;
}
.my-page-user-bar .tap-login {
  cursor: pointer;
}
.my-page-user-bar .logout-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #fff;
  background: rgba(255,255,255,0.25);
  border: 1rpx solid rgba(255,255,255,0.5);
  border-radius: 8rpx;
  margin-left: auto;
  flex-shrink: 0;
}`;
}

function generatePageWXSS(page, themeColor) {
  const componentsCSS = (page.components || []).map(comp => {
    const component = getComponent(comp.componentName);
    return component && component.generateCSS ? component.generateCSS() : '';
  }).filter(css => css).join('\n\n');

  const userBarCSS = isMyPage(page) ? generateMyPageUserBarWXSS() + '\n\n' : '';
  return `.page {
  min-height: 100vh;
  background: #f5f5f5;
}

${userBarCSS}${componentsCSS}`;
}

function generatePageJSON(page) {
  return `{
  "navigationBarTitleText": "${page.pageName}",
  "usingComponents": {}
}`;
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`图片下载成功: ${filepath}`);
          resolve();
        });
      } else {
        console.error(`图片下载失败: ${url}, 状态码: ${response.statusCode}`);
        reject(new Error(`图片下载失败: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`图片下载错误: ${url}`, err);
      reject(err);
    });
  });
}

async function downloadTabBarIcons(config, outputDir) {
  const imagesDir = path.join(outputDir, 'images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('创建images目录');
  }

  const iconPromises = [];

  const themeColorRaw = config.globalConfig && config.globalConfig.themeColor ? config.globalConfig.themeColor : '#667eea';
  const themeColor = normalizeColorForAppJson(themeColorRaw) || '#667eea';

  const tabBarConfig = config.tabBarConfig || {};
  const unselectedColorResolved = resolveThemeColor(tabBarConfig.unselectedColor || '#999999', themeColor);
  const unselectedColor = normalizeColorForAppJson(unselectedColorResolved) || '#999999';

  const selectedColorResolved = resolveThemeColor(tabBarConfig.selectedColor, themeColor);
  let selectedColor = normalizeColorForAppJson(selectedColorResolved);
  if (!selectedColor) {
    selectedColor = themeColor || '#667eea';
  }

  const tabBarList = tabBarConfig.list || [];

  for (const tab of tabBarList) {
    if (tab.selectedIconRowid && config.userImages) {
      const selectedImage = config.userImages.find(img => img.rowid === tab.selectedIconRowid);
      if (selectedImage && selectedImage.url) {
        const filename = `${tab.selectedIconRowid}.png`;
        const filepath = path.join(imagesDir, filename);
        iconPromises.push(
          downloadImage(selectedImage.url, filepath)
            .then(async () => {
              try {
                const image = await Jimp.read(filepath);
                image.color([{ apply: 'mix', params: [selectedColor, 100] }]);
                await image.writeAsync(filepath);
                console.log(`选中图标已叠加颜色 ${selectedColor}: ${filepath}`);
              } catch (err) {
                console.error('选中图标叠加颜色失败:', filepath, selectedColor, err);
              }
            })
        );
        tab.selectedIcon = filename;
      }
    }

    if (tab.unselectedIconRowid && config.userImages) {
      const unselectedImage = config.userImages.find(img => img.rowid === tab.unselectedIconRowid);
      if (unselectedImage && unselectedImage.url) {
        const filename = `${tab.unselectedIconRowid}.png`;
        const filepath = path.join(imagesDir, filename);
        iconPromises.push(
          downloadImage(unselectedImage.url, filepath)
            .then(async () => {
              try {
                const image = await Jimp.read(filepath);
                image.color([{ apply: 'mix', params: [unselectedColor, 100] }]);
                await image.writeAsync(filepath);
                console.log(`未选中图标已叠加颜色 ${unselectedColor}: ${filepath}`);
              } catch (err) {
                console.error('未选中图标叠加颜色失败:', filepath, unselectedColor, err);
              }
            })
        );
        tab.unselectedIcon = filename;
      }
    }
  }

  await Promise.all(iconPromises);
  console.log('所有图标下载完成');
}

function resolveThemeColor(value, themeColor) {
  if (!value) {
    return value;
  }
  if (value === '{主题色}') {
    return themeColor || value;
  }
  return value;
}

function normalizeColorForAppJson(color) {
  if (!color || typeof color !== 'string') {
    return color;
  }
  let c = color.trim();
  if (/^#([0-9a-fA-F]{8})$/.test(c)) {
    c = '#' + c.slice(1, 7);
  } else if (/^#([0-9a-fA-F]{3})$/.test(c)) {
    const r = c[1];
    const g = c[2];
    const b = c[3];
    c = `#${r}${r}${g}${g}${b}${b}`;
  }
  return c;
}

async function generateAppJson(config, outputDir) {
  const themeColorRaw = config.globalConfig && config.globalConfig.themeColor ? config.globalConfig.themeColor : '#667eea';
  const themeColor = normalizeColorForAppJson(themeColorRaw) || '#667eea';

  const globalConfig = config.globalConfig || {};
  const navigationBar = globalConfig.navigationBar || {};

  const navBackgroundColorRaw = resolveThemeColor(navigationBar.backgroundColor, themeColor);
  const navBackgroundColor = normalizeColorForAppJson(navBackgroundColorRaw) || '#ffffff';

  const navTextColorRaw = resolveThemeColor(navigationBar.textColor, themeColor);
  const navTextColor = normalizeColorForAppJson(navTextColorRaw) || '#181818';

  const navigationBarTextStyle = navTextColor && navTextColor.toLowerCase() === '#ffffff' ? 'white' : 'black';

  const appJson = {
    pages: [
      ...config.pages.map(p => `pages/${p.pageId}/index`),
      'pages/login/index',
      'pages/login-verify/index',
      'pages/webview/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: navBackgroundColor,
      navigationBarTitleText: '小程序',
      navigationBarTextStyle: navigationBarTextStyle
    },
    sitemapLocation: 'sitemap.json'
  };

  const tabBarConfig = config.tabBarConfig || {};
  const tabBarList = tabBarConfig.list || [];

  if (tabBarList.length > 0) {
    const tabBarBackgroundColorResolved = resolveThemeColor(tabBarConfig.backgroundColor || '#ffffff', themeColor);
    const tabBarBackgroundColor = normalizeColorForAppJson(tabBarBackgroundColorResolved) || '#ffffff';

    const unselectedColorResolved = resolveThemeColor(tabBarConfig.unselectedColor || '#999999', themeColor);
    const unselectedColor = normalizeColorForAppJson(unselectedColorResolved) || '#999999';

    const selectedColorResolved = resolveThemeColor(tabBarConfig.selectedColor, themeColor);
    let selectedColor = normalizeColorForAppJson(selectedColorResolved);
    if (!selectedColor) {
      selectedColor = themeColor || '#667eea';
    }

    appJson.tabBar = {
      color: unselectedColor,
      selectedColor: selectedColor,
      backgroundColor: tabBarBackgroundColor,
      borderStyle: 'white',
      list: tabBarList.map(tab => ({
        pagePath: `pages/${tab.pageId}/index`,
        text: tab.name,
        iconPath: `images/${tab.unselectedIcon}`,
        selectedIconPath: `images/${tab.selectedIcon}`
      }))
    };
    console.log('生成tabBar配置');
  }

  fs.writeFileSync(path.join(outputDir, 'app.json'), JSON.stringify(appJson, null, 2));
  console.log('生成app.json，内容如下:');
  console.log(JSON.stringify(appJson, null, 2));
}

async function createZip(sourceDir, zipPath) {
  return new Promise((resolve, reject) => {
    console.log(`开始创建ZIP: ${sourceDir} -> ${zipPath}`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      const fileSize = archive.pointer();
      console.log(`ZIP文件已创建: ${zipPath} (${fileSize} bytes)`);

      if (fileSize < 1000) {
        console.error('警告: ZIP文件大小异常小，可能创建失败');
      }
      resolve();
    });

    archive.on('error', (err) => {
      console.error('ZIP创建错误:', err);
      reject(err);
    });

    archive.on('warning', (err) => {
      console.warn('ZIP创建警告:', err);
    });

    archive.pipe(output);
    console.log(`开始添加目录: ${sourceDir}`);
    archive.directory(sourceDir, false);
    console.log(`目录添加完成，开始finalize`);
    archive.finalize();
    console.log(`finalize完成`);
  });
}

function cleanup(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`清理目录: ${dir}`);
  }
}

app.post('/api/generate-miniprogram', async (req, res) => {
  try {
    console.log('收到生成请求:', new Date().toISOString());
    const config = req.body;
    console.log('tabBarConfig.list长度:', config.tabBarConfig?.list?.length || 0);
    console.log('pages长度:', config.pages?.length || 0);

    // 规范化 pages：确保「我的」页有 pageType，便于生成用户信息栏
    if (config.pages && Array.isArray(config.pages)) {
      config.pages = config.pages.map(p => {
        const pageType = p.pageType || (isMyPage({ pageName: p.pageName }) ? 'my' : 'home');
        return { ...p, pageType };
      });
      config.pages.forEach(p => {
        console.log('页面:', p.pageName, 'pageType:', p.pageType, '是否我的页:', isMyPage(p));
      });
    }

    const merchantId = config.merchantId || '';
    const themeColor = config.globalConfig?.themeColor || '#0557e1';
    console.log('商家ID:', merchantId);

    const gc = config.globalConfig || {};
    if (merchantId && gc.wechatAppId && gc.wechatAppSecret) {
      saveMerchantWechatConfig(merchantId, gc.wechatAppId, gc.wechatAppSecret);
      console.log('已保存商家微信配置');
    }

    const timestamp = Date.now();
    const uniqueDir = path.join(OUTPUT_DIR, `miniprogram_${timestamp}`);
    fs.mkdirSync(uniqueDir, { recursive: true });

    console.log('1. 复制基础框架代码...');
    await copyBaseFramework(uniqueDir);

    console.log('1.5. 生成app.js...');
    generateAppJs(merchantId, uniqueDir, config);

    console.log('2. 生成页面代码...');
    for (const page of config.pages) {
      await generatePage(page, uniqueDir, merchantId, themeColor);
    }

    console.log('2.3. 生成登录页、验证码登录页与webview页...');
    generateLoginPage(uniqueDir, config, themeColor);
    generateLoginVerifyPage(uniqueDir, config, themeColor);
    generateWebviewPage(uniqueDir);

    console.log('2.5. 下载tabBar图标...');
    if (config.tabBarConfig && config.tabBarConfig.list && config.tabBarConfig.list.length > 0) {
      await downloadTabBarIcons(config, uniqueDir);
    }

    console.log('3. 生成app.json...');
    await generateAppJson(config, uniqueDir);

    console.log('4. 创建ZIP文件...');
    const zipPath = path.join(OUTPUT_DIR, `miniprogram_${timestamp}.zip`);
    await createZip(uniqueDir, zipPath);

    console.log('5. 清理临时文件...');
    cleanup(uniqueDir);

    const downloadUrl = `/download/miniprogram_${timestamp}.zip`;
    res.json({
      success: true,
      message: '小程序代码生成成功',
      downloadUrl: downloadUrl,
      timestamp: timestamp
    });

  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({
      success: false,
      message: '生成失败: ' + error.message
    });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, 'miniprogram.zip', (err) => {
      if (!err) {
        console.log(`文件下载: ${filename}`);
      }
    });
  } else {
    res.status(404).json({
      success: false,
      message: '文件不存在'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/** 保存商家小程序配置（AppID、AppSecret） */
app.post('/api/merchant/wechat-config', (req, res) => {
  try {
    const { merchantId, appId, appSecret } = req.body || {};
    if (!merchantId || !appId || !appSecret) {
      return res.status(400).json({ success: false, message: '缺少 merchantId、appId 或 appSecret' });
    }
    if (saveMerchantWechatConfig(merchantId, appId.trim(), appSecret.trim())) {
      res.json({ success: true, message: '配置已保存' });
    } else {
      res.status(500).json({ success: false, message: '保存失败' });
    }
  } catch (e) {
    console.error('/api/merchant/wechat-config 错误:', e);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

/** 转发到 wxApp 登录服务（当有请求经 3001 转发时，转发到 3003 wxApp） */
const WXAPP_URL = process.env.WXAPP_SERVICE_URL || 'http://127.0.0.1:3003';
function proxyToWxApp(path, req, res, bodyOverride) {
  const body = bodyOverride !== undefined ? bodyOverride : (req.body || {});
  const bodyStr = JSON.stringify(body);
  const url = new URL(path, WXAPP_URL);
  const client = url.protocol === 'https:' ? https : http;
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: req.method,
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr, 'utf8') }
  };
  const proxyReq = client.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => { data += chunk; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode || 200).send(data || '');
    });
  });
  proxyReq.on('error', (err) => {
    console.error('[proxy] 转发到 wxApp 失败:', err.message);
    res.status(502).json({ success: false, message: '登录服务暂不可用，请检查 wxApp 进程是否运行' });
  });
  proxyReq.write(bodyStr);
  proxyReq.end();
}
/** 转发时注入商家微信配置（从明道云或 wechat-credentials.json 获取），解决 wxApp 与打包小程序 AppID 不一致问题 */
async function proxyWithMerchantConfig(path, req, res) {
  const body = req.body ? { ...req.body } : {};
  const mchId = body.merchantId || body.merchant_id;
  if (mchId) {
    const cfg = await getMerchantWechatConfig(mchId);
    if (cfg?.appId && cfg?.appSecret) {
      body.appId = cfg.appId;
      body.appSecret = cfg.appSecret;
      console.log('[proxy] 已注入商家配置 appId:', cfg.appId, 'merchantId:', mchId);
    }
  }
  proxyToWxApp(path, req, res, body);
}

app.post('/api/core/api/login', (req, res) => proxyWithMerchantConfig('/api/core/api/login', req, res));
app.post('/api/core/api/phone-login', (req, res) => proxyWithMerchantConfig('/api/core/api/phone-login', req, res));
app.post('/api/login', (req, res) => proxyWithMerchantConfig('/api/login', req, res));
app.post('/api/phone-login', (req, res) => proxyWithMerchantConfig('/api/phone-login', req, res));

/** 微信 code 换取 openId（jscode2session） */
app.post('/api/wechat/login', async (req, res) => {
  const { code, merchantId } = req.body || {};
  if (!code) {
    return res.status(400).json({ success: false, message: '缺少 code' });
  }
  if (!merchantId) {
    return res.status(400).json({ success: false, message: '缺少 merchantId' });
  }
  const cfg = await getMerchantWechatConfig(merchantId);
  if (!cfg) {
    return res.status(400).json({
      success: false,
      message: '未找到该商家的微信配置，请在商家后台配置 AppID 和 AppSecret'
    });
  }
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(cfg.appId)}&secret=${encodeURIComponent(cfg.appSecret)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
  https.get(url, (wxRes) => {
    let body = '';
    wxRes.on('data', chunk => { body += chunk; });
    wxRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.errcode) {
          return res.json({
            success: false,
            message: data.errmsg || '微信接口错误',
            errcode: data.errcode
          });
        }
        res.json({
          success: true,
          openId: data.openid,
          sessionKey: data.session_key
        });
      } catch (e) {
        res.status(500).json({ success: false, message: '解析微信返回失败' });
      }
    });
  }).on('error', err => {
    console.error('请求微信接口失败:', err);
    res.status(500).json({ success: false, message: '网络错误' });
  });
});

registerComponent('轮播图', require('./components/carousel'));
registerComponent('功能列表', require('./components/function-list'));
registerComponent('图片', require('./components/image'));
registerComponent('文本', require('./components/text'));
registerComponent('商品网格', require('./components/product-grid'));
registerComponent('公告', require('./components/notice'));
registerComponent('标签页面', require('./components/tabs'));
registerComponent('内容列表', require('./components/content-list'));

console.log('组件注册完成');

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
