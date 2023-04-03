const sql = require('../tool/sqlConfig')
const nodemailer = require('../tool/nodemailer');
const fs = require('fs');
const path = require('path');
const art = require('art-template');
//获取状态文字
let getStatusTxt = function (status) {
    let resTxt = ''
    switch (Number(status)) {
        case -1: resTxt = '已取消'; break;
        case 0: resTxt = '待付款'; break;
        case 1: resTxt = '待发货'; break;
        case 2: resTxt = '待收货'; break;
        case 3: resTxt = '待评价'; break;
        case 4: resTxt = '完成'; break;
        case 5: resTxt = '已退款'; break;
        default: break;
    }
    return resTxt
}
module.exports.getStatusTxt = getStatusTxt

const getCashLogTypeList = function (status) {
    let resTxt = ''
    switch (Number(status)) {
        case 0: resTxt = '余额支付'; break;
        case 1: resTxt = '微信支付'; break;
        default: break;
    }
    return resTxt
}

module.exports.getCashLogTypeList = getCashLogTypeList


const getLogsTypeList = function (status) {
    let resTxt = ''
    switch (Number(status)) {
        case 10: resTxt = '余额下单'; break;
        case 11: resTxt = '微信下单'; break;
        case 18: resTxt = '取消订单'; break;
        case 19: resTxt = '删除订单'; break;
        case 20: resTxt = '余额支付'; break;
        case 21: resTxt = '微信支付'; break;
        case 30: resTxt = '已发货'; break;   
        case 40: resTxt = '已签收'; break;
        case 50: resTxt = '已评价'; break;
        case 60: resTxt = '发起退货'; break;  //?
        case 69: resTxt = '退款成功'; break;   //?
        default: break;
    }
    return resTxt
}
module.exports.getLogsTypeList = getLogsTypeList
//支付完成，修改订单状态
module.exports.finishOrder = ({ amountReal, orderId, transaction_id = '' }) => {
    //订单状态修改
    return sql.promiseCall({ sql: `update orderinfo set status=1,isPay=1,amountReal=? ,transaction_id =? where id =?`, values: [amountReal, transaction_id, orderId] }).then(({ error, results }) => {
        return !error
    })
}






//创建金额变化日志
module.exports.cashLogSql = ({ behavior, orderId = '', type, userId, amount }) => {
    return sql.promiseCall({
        sql: `INSERT INTO cashLog (behavior,  orderId, type, userId,amount)  VALUES( ?,?,?,?,?);`, values: [behavior, orderId, type, userId, amount]
    }).then(({ error, results }) => {
        return !error
    })

}

//创建订单变化日志
const logsSql = ({ orderId, type }) => {
    return sql.promiseCall({
        sql: `INSERT INTO logs (orderId,type)  VALUES( ?,?);`, values: [orderId, type]
    }).then(({ error, results }) => {
        return !error
    })

}
module.exports.logsSql = logsSql;


//取消订单 数据库回调
module.exports.orderClose = ({ orderId }) => {
    return new Promise(async (resolve, reject) => {
        let errText = ''
        let orderitemList = []
        let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=-1 where id =?`, values: [orderId] })
        if (updateOrderSql.error) {
            errText = updateOrderSql.error.message
        }
        //创建锁定库存的逆向操作
        let orderitemSql = await sql.promiseCall({ sql: `select * from orderitem  where orderId =?`, values: [orderId] })
        if (!orderitemSql.error) {
            orderitemList = orderitemSql.results
        } else {
            errText = orderitemSql.error.message
        }

        //订单回调
        let goodsCallBackSql = await sql.promiseCall({
            sql: `update goods as a
  set a.stores = (select sum(b.number)+ a.stores from orderitem as b where a.id=b.goodsId and b.orderId = ?)
  where a.id in (select c.goodsId from orderitem as c where c.orderId = ?)`, values: [orderId, orderId]
        })

        let skuCallBackSql = await sql.promiseCall({
            sql: ` update skulist as a  set a.stores = (select sum(b.number)+a.stores from orderitem as b  where  b.propertyChildIds = a.propertyChildIds and b.orderId = ?  and a.goodsId = b.goodsId)
  where a.goodsId in (select c.goodsId from orderitem as c where c.orderId = ?  and a.goodsId = c.goodsId and  c.propertyChildIds = a.propertyChildIds );
`, values: [orderId, orderId]
        })
        if (goodsCallBackSql.error || skuCallBackSql.error) {
            errText = goodsCallBackSql.error.message || skuCallBackSql.message
        }
        //订单取消打点
        await logsSql({ orderId, type: 18 })
        resolve(errText)
    })

}


//付款成功发送邮件  给自己
module.exports.paySuccessEmailToSeller = (data) => {
    let { orderNumber = '', summary = '', emailTotal = '',
        payWay = '', buyerId = '', emailPayopenId = '',
        emailisRepeat = 0, create_time = '' } = data

    let emailTem = fs.readFileSync(path.join(__dirname, `../emailTemplates/deliver.html`)).toString()
    let emailfile = art.render(emailTem,{...data,emailTotal:Number(emailTotal/100).toFixed(2)});
    nodemailer({
        subject: '支付回调',
        to: 'maker.wx@gmail.com',
        html: emailfile
    })





}











