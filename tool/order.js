const sql = require('../tool/sqlConfig')
const cashLogTypeList ={
    '0':'余额支付',
    '1':'支付宝支付'
}


const logsTypeList ={
    '10':'下单', //余额下单
    '11':'下单', //余额下单
    '18':'取消订单',
    '19':'删除订单',
    '20':'余额支付',
    '21':'微信支付',
    '32':'已发货',
    '40':'已签收',
    '50':'发起退货',
    '59':'退款成功',
}





//支付完成，修改订单状态
module.exports.finishOrder = ({ amountReal, orderId,transaction_id='' }) => {
    //订单状态修改
    return sql.promiseCall({ sql: `update orderinfo set status=1,isPay=1,amountReal=? ,transaction_id =? where id =?`, values: [amountReal,transaction_id,orderId] }).then(({ error, results }) => {
        return !error
    })

}


//创建金额变化日志
module.exports.cashLogSql = ({ behavior, orderId='', type, userId ,amount}) => {
    return sql.promiseCall({
        sql: `INSERT INTO cashLog (behavior,  orderId, type, userId,amount)  VALUES( ?,?,?,?,?);`, values: [behavior,orderId,type, userId,amount]
    }).then(({ error, results }) => {
        return !error
    })

}

//创建订单变化日志
module.exports.logsSql = ({ orderId,userId,type}) => {
    return sql.promiseCall({
        sql: `INSERT INTO logs (orderId,userId,type)  VALUES( ?,?,?);`, values: [orderId,userId,type]
    }).then(({ error, results }) => {
        return !error
    })

}