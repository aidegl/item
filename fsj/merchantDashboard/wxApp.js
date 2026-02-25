const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const WxPay = require('wechatpay-node-v3');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 原有硬编码配置（兜底，防止MySQL读取失败）
const DEFAULT_CONFIG = {
    appid: 'wx6b073663f74b0976',
    secret: 'b6c07e1db47f459ef99d767706627c58',
    mchid: '1737334395',
    apiv3Key: 'shenxianzipzaiSHENXIANZI20260105',
    publicKey: "-----BEGIN CERTIFICATE-----\nMIIEKzCCAxOgAwIBAgIUd9pXw37Nf79a+w+QNJKD0NmiNcUwDQYJKoZIhvcNAQEL\nBQAwXjELMAkGA1UEBhMCQ04xEzARBgNVBAoTClRlbnBheS5jb20xHTAbBgNVBAsT\nFFRlbnBheS5jb20gQ0EgQ2VudGVyMRswGQYDVQQDExJUZW5wYXkuY29tIFJvb3QK\nQ0EwHhcNMjYwMTA1MDQyMTQ0WhcNMzEwMTA0MDQyMTQ0WjCBhDETMBEGA1UEAwwK\nMTczNzMzNDM5NTEbMBkGA1UECgwS5b6u5L+h5ZWG5oi357O757ufMTAwLgYDVQQL\nDCfkuIrmtbfmsojku5nlrZHnlJ/niannp5HmioDmnInpmZDlhazlj7gxCzAJBgNV\nBAYTAkNOMREwDwYDVQQHDAhTaGVuWmhlbjCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAL7TDrHl/hG1D+buSb0pSeVJ40Kv+HoG4tNNWtdyR5yM9aKspg2J\nVmakyIUD6w8SlPwvjzhL6v86nu5zQJeGQyVT+DkcuSPXn6OOx/XEYhQmwJT7g9LB\n/P1lz1hF00JxE0o61XYBVnfb7q+F30Bx11uq7ncszOJsPHrtd5IVDdcfInSfUJSP\nsRo7KpfYqpf31s28hhmTJCz6+eTGIIVK7smZh2qiyEwlvu+w3Vq2RmaumuKG7I17\nGhd6k/OY65fkZYUE0bU1pxAHB3HEbwaFznnC+49JKJ0BZDs006Brz/lpcl+iTp6c\nCfgNxMGXw3Fye6sMWAWE7HoKZvOVbCIdo5UCAwEAAaOBuTCBtjAJBgNVHRMEAjAA\nMAsGA1UdDwQEAwID+DCBmwYDVR0fBIGTMIGQMIGNoIGKoIGHhoGEaHR0cDovL2V2\nY2EuaXRydXMuY29tLmNuL3B1YmxpYy9pdHJ1c2NybD9DQT0xQkQ0MjIwRTUwREJD\nMDRCMDZBRDM5NzU0OTg0NkMwMUMzRThFQkQyJnNnPUhBQ0M0NzFCNjU0MjJFMTJC\nMjdBOUQzM0E4N0FEMUNERjU5MjZFMTQwMzcxMA0GCSqGSIb3DQEBCwUAA4IBAQCW\ntgfiQo1lAdvWsEd3kJ4pdrVPfBup5nqnJyKWgXJmbFB8r14/4I9tkUyoEchG1ij7\nNDLnep1ayX5xrpxkkGVweab0GA2BjHvYA35KVZoJwF91WB/50K7nPNNX88eTamC3\nIJpxt+t84JD8tLOOaxqdcNw9qhXHeTG+jmTMFOt+PSp/LY6aDD5KsnXzvpWofsa0\nGshFSGF1ks435Nd6K4xWWhKM5cbeMp/AZc8I/7oVz5euh5hVOpTYBbp+aLW8yYDG\nVpXl4B1Wk3x2Pg9+hg+gNZfmNtlnYYImDO4OphkSQMo/dL+o50OYa1PLbWdZtbdR\nAA0tRVBqOewko+FUhIoZ\n-----END CERTIFICATE-----",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+0w6x5f4RtQ/m\n7km9KUnlSeNCr/h6BuLTTVrXckecjPWirKYNiVZmpMiFA+sPEpT8L484S+r/Op7u\nc0CXhkMlU/g5HLkj15+jjsf1xGIUJsCU+4PSwfz9Zc9YRdNCcRNKOtV2AVZ32+6v\nhd9Acddbqu53LMzibDx67XeSFQ3XHyJ0n1CUj7EaOyqX2KqX99bNvIYZkyQs+vnk\nxiCFSu7JmYdqoshMJb7vsN1atkZmrprihuyNexoXepPzmOuX5GWFBNG1NacQBwdx\nxG8Ghc55wvuPSSidAWQ7NNOga8/5aXJfok6enAn4DcTBl8NxcnurDFgFhOx6Cmbz\nlWwiHaOVAgMBAAECggEAEUN02+FLx/xScPjz0NowZj72AW18FEYVNTqVUlJzahVS\nj6IA786R831K6sW8+UMcGWiQE27C1s5N3JKusEakQndDSJ9xnG2AcsKTEofuu5X5\n7ECI34NPSPlx9bFzeFpUfW2vLBrY4MUT5es9lE34RsHDCyMRchaKrjBXle6zrtdp\nOHlD4zhoBkCaCgscXERIbp3NC7BIeZWSIAxh+y3Cbn6mz7WFcXbunu0l60W34DXg\nyG4k+89lPTNNkIptqEwmfBsQAEroUzYP3xX4cK3+hGmd42+neWazMzdmOUwl4vUV\n1dbdlGGyQ1hdomZiMYoZXxXNUJum3Lh0ablFe1/bwQKBgQDlgnbw9yjOvuwlsY2Q\nr5U36m/jr+VKNoN972gPLlsM74KEUj+1bkAu5EyRRQxI92JiSgq17/zUpxouqdvY\n1luj4hWXoLnhR+Lx4PBa0SDOqst8sR5Im+JWGl9WxYx1HpmkV/nxBn+ZUeTrZLC9\nBLHGyu5oNLmjuFpZGY1Bj31E5QKBgQDU2YaHOx3yWN0aohwFKox5BoWvxteY205Z\nN4lqsWfClJIDCVjKdWQGs+F5yqMTPhX9g++Q5srdvmsSF2/c9/I/qSvuEnVE70lM\nvYYp8Se4w4TYlq9kFQ/UqZg+LJd0zMe9Usyz+11O4ePlNCRa1yE2W2y3+CFcK6HB\nrb7Mdfwo8QKBgQCEMkq6b1L1CynQaF4HaeuEYqgCOQ3UWmQRBPYmUGgnoknGV+3U\nXmXf3KZxwpjZ6oyj2swikdJK1tmQ6Uv1sTrlwdL4HJ8UsSh6dDtdxDmmcOB2uTqd\nThTnzZb+zxkhWPfcnsQb3cdfk7lNERlwNqUDwV3jbgND12tLCRnBGppoNQKBgHnA\ntCNGvaqTCmbhtAWAgTn5cR9LLqhRSk/eZMyTDjdPpPX3ssKcw8rRunhgYUfwi8Oo\nZLEOU5zj/3spzOMpMXkY2/gittHnzpYHE2eKep5FuQfrqgglxBhxqpRmDXzSZq71\nXgLWFlm4/RNu8BzGUkk1osrZNLv0eWLAcBOkqckBAoGAOiFV72PLVCOnAps3zQme\n/zJFxLbc8CUCrnZMppdrZb47P3PTLEjUiK1tbeXVbujgElvTuBB4H2KiGV3sYGZI\neF4yQpvGTz2t2hEkFQaUrxoJo9tOVKvVx1ofsdL8MPt8Moq5PBhM2oBA9uKlSCG7\nRJlLk/AbnLjVJTBZ0Bl8YHw=\n-----END PRIVATE KEY-----"
};

// MySQL配置（已填入密码 jm2dpXZzXLsM44hs）
const MYSQL_CONFIG = {
    host: '8.155.148.75',
    port: 3306,
    user: 'merchant_platform',
    password: 'jm2dpXZzXLsM44hs',
    database: 'merchant_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
const pool = mysql.createPool(MYSQL_CONFIG);

// 读取商家配置函数
async function getMerchantConfig(merchantId) {
    try {
        const [rows] = await pool.execute(
            'SELECT appid, secret, mchid, apiv3Key, publicKey, privateKey FROM merchant_wx_config WHERE merchant_id = ?',
            [merchantId]
        );
        if (rows.length === 0) return DEFAULT_CONFIG;
        const config = rows[0];
        return {
            appid: config.appid || DEFAULT_CONFIG.appid,
            secret: config.secret || DEFAULT_CONFIG.secret,
            mchid: config.mchid || DEFAULT_CONFIG.mchid,
            apiv3Key: config.apiv3Key || DEFAULT_CONFIG.apiv3Key,
            publicKey: config.publicKey ? config.publicKey.replace(/\\n/g, '\n') : DEFAULT_CONFIG.publicKey,
            privateKey: config.privateKey ? config.privateKey.replace(/\\n/g, '\n') : DEFAULT_CONFIG.privateKey
        };
    } catch (err) {
        console.error('读取商家配置失败，使用默认配置:', err.message);
        return DEFAULT_CONFIG;
    }
}

// 微信登录接口（修复核心问题：判断微信错误+统一返回格式+打印日志）
app.post('/api/login', async (req, res) => {
    const { code, merchant_id } = req.body;
    // 1. 校验前端传参（新增）
    if (!code) {
        return res.json({
            success: false,
            openid: '', // 统一返回openid字段
            message: '缺少微信授权code'
        });
    }
    try {
        const config = merchant_id ? await getMerchantConfig(merchant_id) : DEFAULT_CONFIG;
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.secret}&js_code=${code}&grant_type=authorization_code`;
        console.log('调用微信code2session接口:', { url, merchant_id }); // 新增日志
        const response = await axios.get(url);
        console.log('微信code2session返回:', response.data); // 新增日志

        // 2. 判断微信接口是否返回错误（核心修复）
        if (response.data.errcode) {
            return res.json({
                success: false,
                openid: '', // 统一返回openid字段
                message: `微信接口错误: ${response.data.errmsg} (errcode: ${response.data.errcode})`
            });
        }

        // 3. 正常返回（确保有openid字段）
        res.json({
            success: true,
            openid: response.data.openid || '',
            session_key: response.data.session_key || '' // 可选：返回session_key
        });
    } catch (e) {
        console.error('登录接口异常:', e.message, e.response?.data); // 新增错误日志
        // 4. 异常时统一返回格式（核心修复）
        res.json({
            success: false,
            openid: '', // 确保前端能拿到openid字段
            message: `登录失败: ${e.message}`
        });
    }
});

// 微信支付接口（保留原有逻辑）
app.post('/api/pay', async (req, res) => {
    const { amount, openid, merchant_id } = req.body;
    console.log('收到下单请求:', { amount, openid });
    try {
        const config = merchant_id ? await getMerchantConfig(merchant_id) : DEFAULT_CONFIG;
        const pay = new WxPay({
            appid: config.appid,
            mchid: config.mchid,
            publicKey: config.publicKey,
            privateKey: config.privateKey,
            key: config.apiv3Key,
        });
        const params = {
            description: '支付测试',
            out_trade_no: 'ORD' + Date.now(),
            notify_url: 'https://api.100000whys.cn/api/pay/notify',
            amount: { total: Math.round(parseFloat(amount) * 100) },
            payer: { openid: openid },
        };
        const result = await pay.transactions_jsapi(params);
        console.log('微信下单成功:', result.data);
        res.json({ success: true, payParams: result.data });
    } catch (e) {
        console.error('支付接口报错:', e);
        res.status(500).json({ success: false, message: '支付服务异常', error: e.message });
    }
});

// 健康检查接口
app.get('/', (req, res) => res.send('沈仙子后端服务运行中（已对接MySQL）...'));

// 手机号一键登录接口
app.post('/api/phone-login', async (req, res) => {
    const { encryptedData, iv, sessionKey, merchant_id } = req.body;

    if (!encryptedData || !iv || !sessionKey) {
        return res.json({
            success: false,
            message: '缺少必要参数'
        });
    }

    try {
        const config = merchant_id ? await getMerchantConfig(merchant_id) : DEFAULT_CONFIG;
        const WXBizDataCrypt = require('./wxApp/utils/WXBizDataCrypt');
        const pc = new WXBizDataCrypt(config.appid, sessionKey);
        const data = pc.decryptData(encryptedData, iv);

        console.log('解密手机号成功:', data);

        if (data.phoneNumber) {
            return res.json({
                success: true,
                phoneNumber: data.phoneNumber,
                countryCode: data.countryCode,
                message: '获取手机号成功'
            });
        } else {
            return res.json({
                success: false,
                message: '未获取到手机号'
            });
        }
    } catch (e) {
        console.error('解密手机号失败:', e.message);
        res.json({
            success: false,
            message: '解密失败: ' + e.message
        });
    }
});

// 手机号一键登录接口
app.post('/api/phone-login', async (req, res) => {
    const { encryptedData, iv, sessionKey, merchant_id } = req.body;

    if (!encryptedData || !iv || !sessionKey) {
        return res.json({
            success: false,
            message: '缺少必要参数'
        });
    }

    try {
        const config = merchant_id ? await getMerchantConfig(merchant_id) : DEFAULT_CONFIG;
        const WXBizDataCrypt = require('./utils/WXBizDataCrypt');
        const pc = new WXBizDataCrypt(config.appid, sessionKey);
        const data = pc.decryptData(encryptedData, iv);

        console.log('解密手机号成功:', data);

        if (data.phoneNumber) {
            return res.json({
                success: true,
                phoneNumber: data.phoneNumber,
                countryCode: data.countryCode,
                message: '获取手机号成功'
            });
        } else {
            return res.json({
                success: false,
                message: '未获取到手机号'
            });
        }
    } catch (e) {
        console.error('解密手机号失败:', e.message);
        res.json({
            success: false,
            message: '解密失败: ' + e.message
        });
    }
});

// 绑定所有地址启动服务
app.listen(3000, '0.0.0.0', (err) => {
    if (err) {
        console.error('服务启动失败:', err);
        return;
    }
    console.log('Server running on port 3000 (绑定所有网卡: 0.0.0.0:3000)');
});

// 捕获所有未处理错误，防止进程退出
process.on('uncaughtException', (err) => {
    console.error('未捕获异常:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('未处理Promise拒绝:', reason);
});