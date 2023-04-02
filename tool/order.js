const sql = require('../tool/sqlConfig')
const cashLogTypeList ={
    '0':'余额支付',
    '1':'支付宝支付'
}





//支付完成，修改订单状态
module.exports.finishOrder = ({ amountReal, orderId,transaction_id='' }) => {
    //订单状态修改
    return sql.promiseCall({ sql: `update orderinfo set status=1,isPay=1,amountReal=? ,transaction_id =? where id =?`, values: [amountReal, orderId,transaction_id] }).then(({ error, results }) => {
        return !error
    })

}

module.exports.cashLogSql = ({ behavior, orderId='', type, userId ,amount}) => {
    return sql.promiseCall({
        sql: `INSERT INTO cashLog (behavior,  orderId, type, userId,amount)  VALUES( ?,?,?,?,?);`, values: [behavior,orderId,type, userId,amount]
    }).then(({ error, results }) => {
        return !error
    })

}