



var axios = require("axios");
const wxConfig = require('../config/wx');
const sql = require('../tool/sqlConfig')
const fs = require('fs')

const WxPay = require('wechatpay-node-v3')



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

// 随机字符串产生函数
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15)
}
// 时间戳产生函数
function createTimeStamp() {
    return parseInt(new Date().getTime() / 1000) + ''
}


//微信支付jsapi下单
module.exports.jsApicCeateOrder = async function (data) {
    const { total_fee,openid, body, bookingNo, create_ip } = data
    const pay = new WxPay({
        appid: wxConfig.appid,
        mchid: wxConfig.mch_id,
        // publicKey: fs.readFileSync('../config/apiclient_cert.pem'), // 公钥
        // privateKey: fs.readFileSync('../config/apiclient_key.pem'), // 秘钥
    
        publicKey: fs.readFileSync('./config/apiclient_cert.pem'), // 公钥
        privateKey: fs.readFileSync('./config/apiclient_key.pem'), // 秘钥
        key:wxConfig.APIv3
    });
    let params = {
        "appid": wxConfig.appid,
        "mchid": wxConfig.mch_id,
        "out_trade_no": bookingNo,
        "description": body,
        "notify_url": wxConfig.notify_url,
        "amount": {
            "total": Number(total_fee) ,
            "currency": "CNY"
        },
        "payer": {
            "openid": openid
        },
        scene_info: {
            payer_client_ip:create_ip,
          },
    }
   
    return  pay.transactions_jsapi(params)
},





    module.exports.wxLoginOrLogon = async function ({ wxInfo, userInfo }) {
        return new Promise(async (res, inj) => {
            let token = '';
            let errText = ''
            //检验是否注册过
            let idRes = await sql.promiseCall({ sql: `select id  from user where weixin_openid = ?`, values: [wxInfo.openid] });
            if (!idRes.error && idRes.results.length > 0) {
                token = idRes.results[0].id
            }
            //进行注册

            if (!errText && !token && userInfo.openid) {
                let sqlstr = `INSERT INTO user ( weixin_openid,username, gender,avatar , city,province)VALUES
            (?,?,?,?,?,?)`;
                let sqlRes = await sql.promiseCall({ sql: sqlstr, values: [userInfo.openid, userInfo.nickname, userInfo.sex, userInfo.headimgurl, userInfo.city, userInfo.province] });
                if (!sqlRes.error && sqlRes.results.insertId) {
                    token = sqlRes.results.insertId;
                } else {
                    errText = sqlRes.error.message
                }
                await sql.promiseCall({ sql: `INSERT INTO level(user_id) VALUES(?)`, values: [token] });
                await sql.promiseCall({ sql: `INSERT INTO amount(user_id) VALUES(?)`, values: [token] });

            }
            res(token)
        })


    }


//获取微信的基本信息
module.exports.snsapi_userinfo = (openid) => {
    return axios({
        url: "https://api.weixin.qq.com/sns/userinfo",
        params: {
            access_token: global.access_token,
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
            global.access_token = res.data.access_token
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

