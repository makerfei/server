




var xml2js = require("xml2js");
var qs = require("querystring");
var https = require("https");
var http = require("http");
var axios = require("axios");
var crypto = require("crypto");
var mysql = require("mysql");



const pay = (req, res) => {



    
    let time = new Date().getTime();
    var total_fee,attach,openid,body,bookingNo;
    let postData = req.body;
    var apiUrl = "https://api.mch.weixin.qq.com/pay/unifiedorder";
        total_fee = 100;
        openid = postData.openid;
        body = '商品详情-支付';
        bookingNo=time;
    var wxConfig = {
        appid:'小程序APPID',
        mch_id : '微信支付商户号'
    };
    var timeStamp = createTimeStamp(); //时间节点
    var nonce_str = createNonceStr() + createTimeStamp(); //随机字符串
    var create_ip = get_client_ip(req); //请求ip
    var notify_url ='https://tqmsq.7dar.com/notifypay';
 
    var formData = "<xml>";
    formData += "<appid>"+wxConfig['appid']+"</appid>"; //appid
    formData += "<mch_id>"+wxConfig['mch_id']+"</mch_id>"; //商户号
    formData += "<nonce_str>"+nonce_str+"</nonce_str>"; //随机字符串
    formData += "<body>" + body + "</body>"; //商品描述
    formData += "<notify_url>"+notify_url+"</notify_url>";
    formData += "<openid>" + openid + "</openid>";
    formData += "<out_trade_no>" + bookingNo + "</out_trade_no>";
    formData += "<spbill_create_ip>"+create_ip+"</spbill_create_ip>";
    formData += "<total_fee>" + total_fee + "</total_fee>";
    formData += "<trade_type>JSAPI</trade_type>";
    formData += "<sign>" + paysignjsapi(wxConfig['appid'],body,wxConfig['mch_id'],nonce_str,notify_url,openid,bookingNo,create_ip,total_fee,'JSAPI') + "</sign>";
    formData += "</xml>";
    console.log(formData);
 
    axios({
        url: apiUrl,
        method: 'POST',
        body: formData
    },function (err, response, body) {
        if (!err && response.statusCode === 200){
            console.log('成功',body);
            var result_code = getXMLNodeValue('result_code', body.toString("utf-8"));
            var resultCode = result_code.split('[')[2].split(']')[0];
            if(resultCode === 'SUCCESS'){ //成功
                var prepay_id = getXMLNodeValue('prepay_id', body.toString("utf-8")).split('[')[2].split(']')[0]; //获取到prepay_id
                console.log('prepay_id',prepay_id)
                //签名
                var _paySignjs = paysignjs(wxConfig['appid'], nonce_str, 'prepay_id='+ prepay_id,'MD5',timeStamp);
                var args = {
                    appId: wxConfig['appid'],
                    timeStamp: timeStamp,
                    nonceStr: nonce_str,
                    signType: "MD5",
                    package: prepay_id,
                    paySign: _paySignjs,
                    status:200
                };
                return res.send({
                    status: 0,
                    message: '获取成功',
                    data: args
                })
                res.end();
            }else{                         //失败
                var err_code_des = getXMLNodeValue('err_code_des',body.toString("utf-8"));
                var errDes = err_code_des.split('[')[2].split(']')[0];
               var errArg = {
                   status:400,
                   errMsg: errDes
               };
               res.write(JSON.stringify(errArg));
               res.end();
            }
            console.log('prepay_id是'+resultCode)
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
    keys.forEach(function(key) {
        newArgs[key] = args[key];
    });
 
    var string = '';
    for(var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}
 
//生成签名
function paysignjsapi(appid,body,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee,trade_type) {
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
    console.log('ret',ret)
    var string = raw(ret);
    string = string + '&key=支付商户号密钥';
    var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
    return sign.toUpperCase()
}
 
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for(var k in newArgs) {
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
var get_client_ip = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
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