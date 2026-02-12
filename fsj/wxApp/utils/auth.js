const storage = require('./storage');

const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'userInfo';

function setToken(token) {
  return storage.set(TOKEN_KEY, token);
}

function getToken() {
  return storage.get(TOKEN_KEY);
}

function removeToken() {
  return storage.remove(TOKEN_KEY);
}

function setUserInfo(userInfo) {
  return storage.set(USER_INFO_KEY, userInfo);
}

function getUserInfo() {
  return storage.get(USER_INFO_KEY);
}

function removeUserInfo() {
  return storage.remove(USER_INFO_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  removeToken();
  removeUserInfo();
}

module.exports = {
  setToken,
  getToken,
  removeToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
  isLoggedIn,
  logout
};
