/**
 * 微信小程序加密数据解密（AES-128-CBC）
 * 用于解密 getPhoneNumber 旧接口返回的 encryptedData
 */
const crypto = require('crypto');

class WXBizDataCrypt {
  constructor(appId, sessionKey) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }

  decryptData(encryptedData, iv) {
    const sessionKey = Buffer.from(this.sessionKey, 'base64');
    const encData = Buffer.from(encryptedData, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');
    let decrypted;
    try {
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuf);
      decipher.setAutoPadding(true);
      decrypted = decipher.update(encData, null, 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (e) {
      throw new Error('解密失败: ' + e.message);
    }
  }
}

module.exports = WXBizDataCrypt;
