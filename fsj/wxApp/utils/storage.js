const STORAGE_PREFIX = 'wxapp_';

function set(key, value) {
  try {
    wx.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('存储失败:', e);
    return false;
  }
}

function get(key) {
  try {
    const value = wx.getStorageSync(STORAGE_PREFIX + key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('读取失败:', e);
    return null;
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(STORAGE_PREFIX + key);
    return true;
  } catch (e) {
    console.error('删除失败:', e);
    return false;
  }
}

function clear() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('清空失败:', e);
    return false;
  }
}

module.exports = {
  set,
  get,
  remove,
  clear
};
