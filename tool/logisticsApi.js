
//http://localhost/api/order/logisticsApi?ShipperCode=JGSD&LogisticCode=KK300069606974
const axios = require('axios')
const md5Hex =require("md5") 

const querystring = require('querystring')

const {Url,EBusinessID,ApiKey} = require('../config/logistic')

async function post(url,data){
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    const res = await axios.post(url,querystring.stringify(data))
    return res.data
}

//以form表单形式提交post请求，post请求体中包含了应用级参数和系统级参数
function getParams(RequestData={}){
    //请求接口指令
    const RequestType  = '1002';//免费即时查询接口指令1002/在途监控即时查询接口指令8001/地图版即时查询接口指令8003
    // 组装应用级参数
     RequestData = {
    'CustomerName': '',
    'OrderCode': '',
    'ShipperCode': 'YTO',
    'LogisticCode': 'YT00003618100',
    ...RequestData
    };
    const DataSign = Buffer.from(md5Hex(JSON.stringify(RequestData)+ApiKey)).toString('base64')
    const reqParams = {
        RequestType,
        EBusinessID,
        DataSign,
        RequestData:JSON.stringify(RequestData),
        DataType:2
    }
    return reqParams
}// 组装系统级参数

module.exports = function (data={}) {
    return post(Url, getParams(data))
}





