module.exports = {
    /**
     * 密码加密
     * @param {String} password
     * @param {Object} clientInfo
     * @param {Object} passwordSecret
     * @return {{version, passwordHash}}
     */
    encryptPassword: function ({password, clientInfo, passwordSecret}) {
        return {
            passwordHash: password,
            version: passwordSecret.version
        }
    },
    /**
     * 密码验证
     * @param {String} password
     * @param {Object} userRecord
     * @param {Object} clientInfo
     * @param {Object} passwordSecret
     * @return {boolean}
     */
    verifyPassword: function ({password, userRecord, clientInfo, passwordSecret}) {
        return password === userRecord.password
    }
}
