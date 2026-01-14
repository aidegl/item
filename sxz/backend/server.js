const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const WxPay = require('wechatpay-node-v3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 配置开始 (建议通过环境变量或宝塔面板配置) ---
const CONFIG = {
    appid: process.env.WX_APPID || 'wx6b073663f74b0976', // 小程序 AppID
    secret: process.env.WX_APP_SECRET || 'YOUR_APP_SECRET', // 请在宝塔面板设置环境变量 WX_APP_SECRET
    mchid: process.env.WX_MCHID || '1737334395', // 商户号
    apiv3Key: process.env.WX_APIV3_KEY || 'shenxianzipzaiSHENXIANZI20260105', // APIv3 密钥
    // 证书和私钥内容
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+0w6x5f4RtQ/m
7km9KUnlSeNCr/h6BuLTTVrXckecjPWirKYNiVZmpMiFA+sPEpT8L484S+r/Op7u
c0CXhkMlU/g5HLkj15+jjsf1xGIUJsCU+4PSwfz9Zc9YRdNCcRNKOtV2AVZ32+6v
hd9Acddbqu53LMzibDx67XeSFQ3XHyJ0n1CUj7EaOyqX2KqX99bNvIYZkyQs+vnk
xiCFSu7JmYdqoshMJb7vsN1atkZmrprihuyNexoXepPzmOuX5GWFBNG1NacQBwdx
xG8Ghc55wvuPSSidAWQ7NNOga8/5aXJfok6enAn4DcTBl8NxcnurDFgFhOx6Cmbz
lWwiHaOVAgMBAAECggEAEUN02+FLx/xScPjz0NowZj72AW18FEYVNTqVUlJzahVS
j6IA786R831K6sW8+UMcGWiQE27C1s5N3JKusEakQndDSJ9xnG2AcsKTEofuu5X5
7ECI34NPSPlx9bFzeFpUfW2vLBrY4MUT5es9lE34RsHDCyMRchaKrjBXle6zrtdp
OHlD4zhoBkCaCgscXERIbp3NC7BIeZWSIAxh+y3Cbn6mz7WFcXbunu0l60W34DXg
yG4k+89lPTNNkIptqEwmfBsQAEroUzYP3xX4cK3+hGmd42+neWazMzdmOUwl4vUV
1dbdlGGyQ1hdomZiMYoZXxXNUJum3Lh0ablFe1/bwQKBgQDlgnbw9yjOvuwlsY2Q
r5U36m/jr+VKNoN972gPLlsM74KEUj+1bkAu5EyRRQxI92JiSgq17/zUpxouqdvY
1luj4hWXoLnhR+Lx4PBa0SDOqst8sR5Im+JWGl9WxYx1HpmkV/nxBn+ZUeTrZLC9
BLHGyu5oNLmjuFpZGY1Bj31E5QKBgQDU2YaHOx3yWN0aohwFKox5BoWvxteY205Z
N4lqsWfClJIDCVjKdWQGs+F5yqMTPhX9g++Q5srdvmsSF2/c9/I/qSvuEnVE70lM
vYYp8Se4w4TYlq9kFQ/UqZg+LJd0zMe9Usyz+11O4ePlNCRa1yE2W2y3+CFcK6HB
rb7Mdfwo8QKBgQCEMkq6b1L1CynQaF4HaeuEYqgCOQ3UWmQRBPYmUGgnoknGV+3U
XmXf3KZxwpjZ6oyj2swikdJK1tmQ6Uv1sTrlwdL4HJ8UsSh6dDtdxDmmcOB2uTqd
ThTnzZb+zxkhWPfcnsQb3cdfk7lNERlwNqUDwV3jbgND12tLCRnBGppoNQKBgHnA
ntCNGvaqTCmbhtAWAgTn5cR9LLqhRSk/eZMyTDjdPpPX3ssKcw8rRunhgYUfwi8Oo
ZLEOU5zj/3spzOMpMXkY2/gittHnzpYHE2eKep5FuQfrqgglxBhxqpRmDXzSZq71
XgLWFlm4/RNu8BzGUkk1osrZNLv0eWLAcBOkqckBAoGAOiFV72PLVCOnAps3zQme
/zJFxLbc8CUCrnZMppdrZb47P3PTLEjUiK1tbeXVbujgElvTuBB4H2KiGV3sYGZI
eF4yQpvGTz2t2hEkFQaUrxoJo9tOVKvVx1ofsdL8MPt8Moq5PBhM2oBA9uKlSCG7
RJlLk/AbnLjVJTBZ0Bl8YHw=
-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN CERTIFICATE-----
MIIEKzCCAxOgAwIBAgIUd9pXw37Nf79a+w+QNJKD0NmiNcUwDQYJKoZIhvcNAQEL
BQAwXjELMAkGA1UEBhMCQ04xEzARBgNVBAoTClRlbnBheS5jb20xHTAbBgNVBAsT
FFRlbnBheS5jb20gQ0EgQ2VudGVyMRswGQYDVQQDExJUZW5wYXkuY29tIFJvb3QK
Q0EwHhcNMjYwMTA1MDQyMTQ0WhcNMzEwMTA0MDQyMTQ0WjCBhDETMBEGA1UEAwwK
MTczNzMzNDM5NTEbMBkGA1UECgwS5b6u5L+h5ZWG5oi357O757ufMTAwLgYDVQQL
DCfkuIrmtbfmsojku5nlrZHnlJ/niannp5HmioDmnInpmZDlhazlj7gxCzAJBgNV
BAYTAkNOMREwDwYDVQQHDAhTaGVuWmhlbjCCASIwDQYJKoZIhvcNAQEBBQADggEP
ADCCAQoCggEBAL7TDrHl/hG1D+buSb0pSeVJ40Kv+HoG4tNNWtdyR5yM9aKspg2J
VmakyIUD6w8SlPwvjzhL6v86nu5zQJeGQyVT+DkcuSPXn6OOx/XEYhQmwJT7g9LB
/P1lz1hF00JxE0o61XYBVnfb7q+F30Bx11uq7ncszOJsPHrtd5IVDdcfInSfUJSP
sRo7KpfYqpf31s28hhmTJCz6+eTGIIVK7smZh2qiyEwlvu+w3Vq2RmaumuKG7I17
Ghd6k/OY65fkZYUE0bU1pxAHB3HEbwaFznnC+49JKJ0BZDs006Brz/lpcl+iTp6c
CfgNxMGXw3Fye6sMWAWE7HoKZvOVbCIdo5UCAwEAAaOBuTCBtjAJBgNVHRMEAjAA
MAsGA1UdDwQEAwID+DCBmwYDVR0fBIGTMIGQMIGNoIGKoIGHhoGEaHR0cDovL2V2
Y2EuaXRydXMuY29tLmNuL3B1YmxpYy9pdHJ1c2NybD9DQT0xQkQ0MjIwRTUwREJD
MDRCMDZBRDM5NzU0OTg0NkMwMUMzRThFQkQyJnNnPUhBQ0M0NzFCNjU0MjJFMTJC
MjdBOUQzM0E4N0FEMUNERjU5MjZFMTQwMzcxMA0GCSqGSIb3DQEBCwUAA4IBAQCW
tgfiQo1lAdvWsEd3kJ4pdrVPfBup5nqnJyKWgXJmbFB8r14/4I9tkUyoEchG1ij7
NDLnep1ayX5xrpxkkGVweab0GA2BjHvYA35KVZoJwF91WB/50K7nPNNX88eTamC3
IJpxt+t84JD8tLOOaxqdcNw9qhXHeTG+jmTMFOt+PSp/LY6aDD5KsnXzvpWofsa0
GshFSGF1ks435Nd6K4xWWhKM5cbeMp/AZc8I/7oVz5euh5hVOpTYBbp+aLW8yYDG
VpXl4B1Wk3x2Pg9+hg+gNZfmNtlnYYImDO4OphkSQMo/dL+o50OYa1PLbWdZtbdR
AA0tRVBqOewko+FUhIoZ
-----END CERTIFICATE-----`
};
// --- 配置结束 ---

// 初始化微信支付 V3 SDK
const pay = new WxPay({
    appid: CONFIG.appid,
    mchid: CONFIG.mchid,
    publicKey: CONFIG.publicKey,
    privateKey: CONFIG.privateKey,
    key: CONFIG.apiv3Key,
});

/**
 * 1. 换取 OpenID 接口
 */
app.post('/api/login', async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.json({ success: false, message: '缺少 code 参数' });
    }

    try {
        // 提醒：需要在 CONFIG 中填入真实的 secret
        if (CONFIG.secret === 'YOUR_APP_SECRET') {
            return res.json({ success: false, message: '后端未配置 AppSecret，请检查 server.js' });
        }

        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${CONFIG.appid}&secret=${CONFIG.secret}&js_code=${code}&grant_type=authorization_code`;
        const response = await axios.get(url);
        
        console.log('微信 API 返回:', response.data);
        
        if (response.data.openid) {
            res.json({
                success: true,
                openid: response.data.openid,
                session_key: response.data.session_key
            });
        } else {
            res.json({
                success: false,
                message: '换取 OpenID 失败',
                detail: response.data
            });
        }
    } catch (error) {
        console.error('登录异常:', error);
        res.status(500).json({ success: false, message: '后端服务异常', error: error.message });
    }
});

/**
 * 2. 发起支付下单接口
 */
app.post('/api/pay', async (req, res) => {
    const { amount, openid, description } = req.body;
    
    if (!amount || !openid) {
        return res.json({ success: false, message: '缺少参数' });
    }

    try {
        const params = {
            description: description || '支付测试',
            out_trade_no: 'ORD' + Date.now(), // 实际项目中应由数据库生成
            notify_url: 'https://api.100000whys.cn/api/pay/notify', // 支付回调地址
            amount: {
                total: Math.round(parseFloat(amount) * 100), // 转换为分
            },
            payer: {
                openid: openid,
            },
        };

        const result = await pay.transactions_jsapi(params);
        console.log('统一下单结果:', result);

        if (result.status === 200) {
            // SDK 会自动生成小程序 wx.requestPayment 所需的签名参数
            res.json({
                success: true,
                payParams: result.data
            });
        } else {
            res.json({
                success: false,
                message: '下单失败',
                detail: result
            });
        }
    } catch (error) {
        console.error('支付下单异常:', error);
        res.status(500).json({ success: false, message: '支付服务异常', error: error.message });
    }
});

// 健康检查接口
app.get('/', (req, res) => {
    res.send('沈仙子后端服务运行中...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务启动成功，监听端口: ${PORT}`);
});
