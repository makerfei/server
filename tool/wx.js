
var xml2js = require("xml2js");
var qs = require("querystring");
var https = require("https");
var http = require("http");
var axios = require("axios");
var crypto = require("crypto");
const wxConfig = require('../config/wx');
const { promises } = require("dns");
const sql = require('../tool/sqlConfig')
const pay = (req, res) => {

    let time = new Date().getTime();
    var total_fee, attach, openid, body, bookingNo;
    let postData = req.body;
    var apiUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";
    total_fee = 100;
    openid = postData.openid;
    body = '商品详情-支付';
    bookingNo = time;

    var timeStamp = createTimeStamp(); //时间节点
    var nonce_str = createNonceStr() + createTimeStamp(); //随机字符串
    var create_ip = get_client_ip(req); //请求ip
    var notify_url = 'https://tqmsq.7dar.com/notifypay';

    var formData = "<xml>";
    formData += "<appid>" + wxConfig['appid'] + "</appid>"; //appid
    formData += "<mch_id>" + wxConfig['mch_id'] + "</mch_id>"; //商户号
    formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串
    formData += "<body>" + body + "</body>"; //商品描述
    formData += "<notify_url>" + notify_url + "</notify_url>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<out_trade_no>" + bookingNo + "</out_trade_no>";
    formData += "<spbill_create_ip>" + create_ip + "</spbill_create_ip>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<trade_type>JSAPI</trade_type>";
    formData += "<sign>" + paysignjsapi(wxConfig['appid'], body, wxConfig['mch_id'], nonce_str, notify_url, openid, bookingNo, create_ip, total_fee, 'JSAPI') + "</sign>";
    formData += "</xml>";
    console.log(formData);

    axios({
        url: apiUrl,
        method: 'POST',
        body: formData
    }, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            console.log('成功', body);
            var result_code = getXMLNodeValue('result_code', body.toString("utf-8"));
            var resultCode = result_code.split('[')[2].split(']')[0];
            if (resultCode === 'SUCCESS') { //成功
                var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8")).split('[')[2].split(']')[0]; //获取到prepay_id
                console.log('prepay_id', prepay_id)
                //签名
                var _paySignjs = paysignjs(wxConfig['appid'], nonce_str, 'prepay_id=' + prepay_id, 'MD5', timeStamp);
                var args = {
                    appId: wxConfig['appid'],
                    timeStamp: timeStamp,
                    nonceStr: nonce_str,
                    signType: "MD5",
                    package: prepay_id,
                    paySign: _paySignjs,
                    status: 200
                };
                return res.send({
                    status: 0,
                    message: '获取成功',
                    data: args
                })
                res.end();
            } else {                         //失败
                var err_code_des = getXMLNodeValue('err_code_des', body.toString("utf-8"));
                var errDes = err_code_des.split('[')[2].split(']')[0];
                var errArg = {
                    status: 400,
                    errMsg: errDes
                };
                res.write(JSON.stringify(errArg));
                res.end();
            }
            console.log('prepay_id是' + resultCode)
        }
    })
}

function paysignjs(appid, nonceStr, package, signType, timeStamp) {
    var ret = {
        appId: appid,
        nonceStr: nonceStr,
        package: package,
        signType: signType,
        timeStamp: timeStamp,

    };
    var string = raw1(ret);
    string = string + '&key=支付商户号密钥';
    console.log(string);

    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
}

function raw1(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

//生成签名
function paysignjsapi(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
    var ret = {
        appid: appid,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url: notify_url,
        openid: openid,
        out_trade_no: out_trade_no,
        spbill_create_ip: spbill_create_ip,
        total_fee: total_fee,
        trade_type: trade_type
    };
    console.log('ret', ret)
    var string = raw(ret);
    string = string + '&key=支付商户号密钥';
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
    return sign.toUpperCase()
}

function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}
//解析xml
function getXMLNodeValue(node_name, xml) {
    var tmp = xml.split("<" + node_name + ">");
    var _tmp = tmp[1].split("</" + node_name + ">");
    return _tmp[0];
}
//获取url请求客户端ip
var get_client_ip = function (req) {
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


module.exports.wxLoginOrLogon = async function({wxInfo,userInfo}){
    return new Promise(async (res, inj) => {
        let token ='';
        let errText = ''
        //检验是否注册过
        let idRes = await sql.promiseCall({ sql: `select id  from user where weixin_openid = ?`, values: [wxInfo.openid] });
        if(!idRes.error&&idRes.results.length>0){
            token = idRes.results[0].id
        }
        //进行注册

        if(!errText&&!token&&userInfo.openid){
            let sqlstr = `INSERT INTO user ( weixin_openid,username, gender,avatar , city,province)VALUES
            (?,?,?,?,?,?)`;
            let sqlRes = await sql.promiseCall({sql:sqlstr,values:[userInfo.openid,userInfo.nickname,userInfo.sex,userInfo.headimgurl,userInfo.city,userInfo.province]});
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
            access_token:  global.access_token,
            openid: openid,
            lang: 'zh_CN'
        }
    }).then(res => {
        return res.data;
    })
}


//获取微信的基本信息
module.exports.baseInfo = (code = '',state='') => {
    return axios({
        url: "https://api.weixin.qq.com/sns/oauth2/access_token",
        params: {
            grant_type: 'authorization_code',
            appid: wxConfig.appid,
            secret: wxConfig.mch_id,
            code: code,
            grant_type: 'authorization_code'

        }
    }).then(res => {
        if(res.data.access_token){
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
            secret: wxConfig.mch_id,

        }
    }).then(res => {
        if(res.data.access_token){
            global.access_token = res.data.access_token
        }
       

        //ctx中的全局变量
        // ctx.state.__HOST__ = '//'
    })
}

