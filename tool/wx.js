



var axios = require("axios");
const wxConfig = require('../config/wx');
const sql = require('../tool/sqlConfig')
const { loginPoint, userInster } = require('../tool/loginOrLogon')
const fs = require('fs')
const privateKey = fs.readFileSync('./config/apiclient_key.pem'); // 秘钥
const WxPay = require('wechatpay-node-v3')
const crypto = require("crypto")
const jsSHA = require('jssha');
const pay = new WxPay({
    appid: wxConfig.appid,
    mchid: wxConfig.mch_id,
    publicKey: fs.readFileSync('./config/apiclient_cert.pem'), // 公钥
    privateKey,
    key: wxConfig.APIv3
});


//获取url请求客户端ip
module.exports.get_client_ip = function (req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};



//获取签名
module.exports.getSignature = async (url) => {
    let ticket = await getTicket();
    let nonceStr = Math.random().toString(36).substr(2, 15);
    let timeStamp = parseInt(new Date().getTime() / 1000) + '';
    let str = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timeStamp + '&url=' + url;

    let shasum = crypto.createHash('sha1')
    let signature = shasum.update(str).digest('hex')

    return {
        code: 0,
        data: {
            nonceStr,
            timeStamp,
            signature,
            appId: wxConfig.appid
        }
    }
}


//解析下单的接口
module.exports.decipher_gcm = (ciphertext, associated_data, nonce) => {
    return pay.decipher_gcm(ciphertext, associated_data, nonce, wxConfig.APIv3)
}

//微信支付jsapi下单
module.exports.jsApicCeateOrder = async function (data) {
    const { total_fee, openid, body, bookingNo, create_ip } = data

    let params = {
        "appid": wxConfig.appid,
        "mchid": wxConfig.mch_id,
        "out_trade_no": bookingNo,
        "description": body,
        "notify_url": wxConfig.notify_url,
        "amount": {
            "total": Number(total_fee),
            "currency": "CNY"
        },
        "payer": {
            "openid": openid
        },
        scene_info: {
            payer_client_ip: create_ip,
        },
    }

    return pay.transactions_jsapi(params)
},

    module.exports.wxLoginOrLogon = async function ({ wxInfo, userInfo, ip }) {
        return new Promise(async (res, inj) => {
            let token = '';
            let errText = ''
            //检验是否注册过
            let idRes = await sql.promiseCall({ sql: `select id  from user where weixin_openid = ?`, values: [wxInfo.openid] });
            if (!idRes.error && idRes.results.length > 0) {
                token = idRes.results[0].id;
                await loginPoint({ ip: ip, userId: token })
            }
            //进行注册
            if (!errText && !token && userInfo.openid) {
                let token = await userInster({
                    username: userInfo.nickname,
                    weixin_openid: userInfo.openid,
                    gender: userInfo.sex,
                    avatar: userInfo.headimgurl,
                    city: userInfo.city,
                    province: userInfo.province
                })
            }
            res(token)
        })


    }


//获取微信的基本信息
module.exports.snsapi_userinfo = (openid,access_token) => {
    return axios({
        url: "https://api.weixin.qq.com/sns/userinfo",
        params: {
            access_token: access_token,
            openid: openid,
            lang: 'zh_CN'
        }
    }).then(res => {
        return res.data;
    })
}


//获取微信的基本信息
module.exports.baseInfo = (code = '', state = '') => {
    return axios({
        // method: 'get',
        url: "https://api.weixin.qq.com/sns/oauth2/access_token",
        params: {
            grant_type: 'authorization_code',
            appid: wxConfig.appid,
            secret: wxConfig.secret,
            code: code,
            grant_type: 'authorization_code'

        }
    }).then(res => {
        if (res.data.access_token) {
           // global.access_token = res.data.access_token
        }
        return res.data;
    })
}
//获取 getAccessToken 
module.exports.getAccessToken = () => {
    return axios({
        url: "https://api.weixin.qq.com/cgi-bin/token",
        params: {
            grant_type: "client_credential",
            appid: wxConfig.appid,
            secret: wxConfig.secret,

        }
    }).then(res => {
        if (res.data.access_token) {
            global.access_token = res.data.access_token
        }
        //ctx中的全局变量
        // ctx.state.__HOST__ = '//'
    })
}

//获取 ticket
let getTicket = () => {
    return axios({
        url: "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
        params: {
            type: 'jsapi',
            access_token: global.access_token
        }
    }).then(res => {
        return res.data.ticket
        console.log('----------ticket-----------', res.data.ticket);
    })
}
module.exports.getTicket = getTicket

