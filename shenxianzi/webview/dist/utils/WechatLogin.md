# 微信小程序Webview登录模块

这是一个可复用的登录模块，用于在小程序嵌套Webview的场景下实现登录功能。

## 功能特性

- 支持微信小程序环境下的登录流程
- 通过URL Hash参数传递openid
- 与明道云API集成，查询用户数据
- 状态管理（登录状态、用户信息、openid）
- 本地存储登录状态
- 小程序与Webview通信机制
- 错误处理和兼容性处理

## 使用方法

### 1. 引入必要的资源

```html
<!-- 微信JSSDK -->
<script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>

<!-- 明道云API组件 -->
<script src="path/to/MingdaoQuery.js"></script>
<script src="path/to/MingdaoAdd.js"></script>
<script src="path/to/MingdaoUpdate.js"></script>
<script src="path/to/MingdaoArray.js"></script>

<!-- 登录模块 -->
<script src="path/to/WechatLogin.js"></script>
```

### 2. 初始化登录模块

```javascript
const login = new WechatLogin({
  miniProgramLoginUrl: '/pages/login/index',           // 小程序登录页面路径
  miniProgramLogoutUrl: '/pages/logout/index',         // 小程序退出登录页面路径
  mingdaoAppKey: 'your-app-key',                      // 明道云AppKey
  mingdaoSign: 'your-sign',                           // 明道云签名
  mingdaoWorksheetId: 'yonghu',                       // 明道云用户表ID
  mingdaoApiUrl: 'https://api.mingdao.com/v2/open/worksheet/getRowByIdPost', // API地址
  openidField: 'openId',                              // 明道云中存储openid的字段名
  defaultAvatar: './assets/default-avatar.png'        // 默认头像路径
});
```

### 3. 使用登录功能

```javascript
// 跳转到小程序登录页面
login.toWxLogin();

// 跳转到小程序退出登录页面
login.toWxLogout();

// 使用openid直接登录（通常由URL Hash参数触发）
// login.loginWithOpenid('openid-string');

// 检查是否已登录
if (login.isLoggedIn()) {
  console.log('已登录');
  const userInfo = login.getUserInfo();
  console.log('用户信息:', userInfo);
  const openid = login.getOpenid();
  console.log('OpenID:', openid);
}

// 获取调试信息
login.debug();
```

## API 接口

### 构造函数选项

- `miniProgramLoginUrl`: 小程序登录页面路径，默认为 `/pages/login/index`
- `miniProgramLogoutUrl`: 小程序退出登录页面路径，默认为 `/pages/logout/index`
- `mingdaoAppKey`: 明道云AppKey
- `mingdaoSign`: 明道云签名
- `mingdaoWorksheetId`: 明道云用户表ID，默认为 `yonghu`
- `mingdaoApiUrl`: 明道云API地址，默认为官方地址
- `openidField`: 明道云中存储openid的字段名，默认为 `openId`
- `defaultAvatar`: 默认头像路径

### 方法

- `toWxLogin()`: 跳转到小程序登录页面
- `toWxLogout()`: 跳转到小程序退出登录页面
- `loginWithOpenid(openid)`: 使用openid登录
- `handleAuthLogic()`: 处理认证逻辑（自动调用）
- `isLoggedIn()`: 检查是否已登录
- `getUserInfo()`: 获取用户信息
- `getOpenid()`: 获取openid
- `logout()`: 退出登录
- `debug()`: 输出调试信息

### 状态检查

- `isInMiniProgram()`: 检查是否在微信小程序环境中

## 工作流程

1. 页面加载时自动检查URL Hash参数中的openid
2. 如果有openid参数，使用该openid登录
3. 如果没有openid参数，检查本地存储的登录状态
4. 提供跳转到小程序登录页面的方法
5. 小程序登录成功后，通过URL Hash参数传递openid
6. 使用openid查询明道云中的用户数据
7. 更新登录状态和UI

## 注意事项

- 需要在微信小程序环境中使用
- 需要正确配置微信JSSDK
- 需要正确配置明道云API组件
- 小程序需要正确传递openid参数到Webview页面