



var axios = require("axios");
const wxConfig = require('../config/wx');
const sql = require('../tool/sqlConfig')
const { loginPoint, userInster } = require('../tool/loginOrLogon')
const fs = require('fs')
const privateKey = fs.readFileSync('./config/apiclient_key.pem'); // 秘钥
const WxPay = require('wechatpay-node-v3')
const crypto = require("crypto")
const jsSHA = require('jssha');
const moment = require('moment');
const QRCode = require("qrcode");
const { error } = require("console");
const shortlink = require('../tool/shortlink')

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

//解析下单的接口
module.exports.decipher_gcm = (ciphertext, associated_data, nonce) => {
    return pay.decipher_gcm(ciphertext, associated_data, nonce, wxConfig.APIv3)
}

//获取签名
module.exports.getSignature = async (url) => {
    let ticket = global.ticket;
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
module.exports.wxQRcodePayApi = ({ orderId, token }) => {
    return QRCode.toDataURL(shortlink({ token }, { type: 'pay', data: orderId }))
}

//微信支付jsapi下单 查询订单的微信支付信息，如果有 就直接返回 没有就进行下单
module.exports.jsApicGetOrderPayInfo = async function ({ orderId, create_ip, openid = '', type = 'wx' }) {  //为h5 或wx
    let errText = ''
    let orderIdInfo = {};//订单信息
    let userInfo = {} //用户信息
    let resData = { wxpayInfo: {}, msg: '' }
    //订单唯独查询
    orderIdInfo = await sql.promiseCall({ sql: `select amount, userId,orderNumber,wxPayData from orderinfo where id=? and isPay =0 limit 0,1`, values: [orderId] }).then(({ error, results }) => {
        return !error && results.length > 0 && results[0] || {}
    })
    if (!orderIdInfo.orderNumber) {
        errText = '没有可以支付的订单'
    }
    let hasRigthPayInfo = false;
    if (!errText) {
        let wxPayData = orderIdInfo.wxPayData && JSON.parse(orderIdInfo.wxPayData) || {}
        if (wxPayData.status == 200 && ((type == 'native' && wxPayData.code_url || type == 'h5' && wxPayData.h5_url) || (wxPayData.prepay_id && type == 'wx'))) {
            hasRigthPayInfo = true
        }
    }
    //如果有 wxPayData 且正确  直接就返回了
    if (hasRigthPayInfo) {
        resData.wxpayInfo = wxpayInfo.wxPayData;
    } else if (!errText) { //没有或 订单支付错误就新建
        userInfo = await sql.promiseCall({ sql: `select weixin_openid  from user where id=?  limit 0,1`, values: [orderIdInfo.userId] }).then(({ error, results }) => {
            return !error && results.length > 0 && results[0] || {}
        })
        if ((!userInfo.weixin_openid && !openid) && type == 'wx') {
            errText = '用户请先绑定微信'
        }
        //新微信支付信息创建
        if (!errText) {
            resData.wxpayInfo = await jsApicCeateOrder({ type, total_fee: orderIdInfo.amount, openid: openid || userInfo.weixin_openid, body: '街道购支付', bookingNo: orderIdInfo.orderNumber, create_ip })
        }
    }
    resData.msg = errText;
    return resData
}


//   确定是新单，直接创建  微信支付jsapi下单
let jsApicCeateOrder = async function (data) {
    const { total_fee, openid, body, bookingNo, create_ip, type } = data
    let params = {
        "appid": wxConfig.appid,
        "mchid": wxConfig.mch_id,
        "out_trade_no": bookingNo,
        "description": body,
        "notify_url": wxConfig.notify_url,
        //'time_expire':  '2023-04-05T23:34:56+08:00',   //moment((moment().valueOf()+17000*1000)).format('yyyy-MM-DDTHH:mm:ss+TIMEZONE') ,
        "amount": {
            "total": Number(total_fee),
            "currency": "CNY"
        },
        "payer": type == 'wx' ? {
            "openid": openid,
        } : undefined,
        scene_info: type == 'native'?{
            payer_client_ip: create_ip,
            h5_info: type == 'h5' ? { "type": "Wap" } : undefined
        }:undefined,
    }
    //
    let payinf = type == 'h5' ? await pay.transactions_h5(params) :
                 type == 'wx' ? await pay.transactions_jsapi(params) : 
                 type == 'native' ? await pay.transactions_native(params) : 
                 {};
    //保存支付的信息
    sql.promiseCall({ sql: `update orderinfo set wxPayData = ? where  orderNumber = ?`, values: [JSON.stringify(payinf), bookingNo] })
    //返回支付
    return payinf
}
module.exports.jsApicCeateOrder = jsApicCeateOrder;

module.exports.wxLoginOrLogon = async function ({ wxInfo, userInfo, ip }) {
    return new Promise(async (res, inj) => {
        let token = '';
        let errText = ''
        //检验是否注册过 微信是否注册过
        let idRes = await sql.promiseCall({ sql: `select id  from user where weixin_openid = ?`, values: [wxInfo.openid] });
        if (!idRes.error && idRes.results.length > 0) {
            token = idRes.results[0].id;
            await loginPoint({ ip: ip, userId: token })
        }

        //不要绑定机制
        //如果这个号没有注册过，就进行绑定 且从其他地方传来intoken
        // if(!errText &&intoken&&!token && userInfo.openid){
        //     await sql.promiseCall({sql:`update user set weixin_openid = ? where id =? and weixin_openid = ''`,values:[userInfo.openid,intoken]});
        // }else

        if (!errText && !token && userInfo.openid) {//进行注册
            token = await userInster({
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
module.exports.snsapi_userinfo = (openid, access_token) => {
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
            code: code
        }
    }).then(res => {
        if (res.data.access_token) {
            // global.access_token = res.data.access_token
        }
        return res.data;
    })
}

//获取 getAccessToken 
let getAccessToken = () => {

    return new Promise(async (resolve, reject) => {
        await axios({
            url: "https://api.weixin.qq.com/cgi-bin/token",
            params: {
                grant_type: "client_credential",
                appid: wxConfig.appid,
                secret: wxConfig.secret,

            }
        }).then(res => {
            if (res.data.access_token) {
                global.access_token = res.data.access_token;
                // 获取的
                console.log('获取的全局token为', global.access_token);
            }
            //ctx中的全局变量
            // ctx.state.__HOST__ = '//'
        })

        await getTicket();
        resolve();

    })

}
module.exports.getAccessToken = getAccessToken;

//获取 ticket
let getTicket = () => {
    console.log('----------ticket:global.access_token-----------', global.access_token);
    return axios({
        url: "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
        params: {
            type: 'jsapi',
            access_token: global.access_token
        }
    }).then(res => {
        console.log('----------ticket-----------', res.data.ticket);
        global.ticket = res.data.ticket
        return res.data.ticket

    }).catch(err => {
        console.log('----------ticket err-----------', JSON.stringify(res));
    })
}
module.exports.getTicket = getTicket





