const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/wx')
const { baseInfo, decipher_gcm, snsapi_userinfo, wxLoginOrLogon, get_client_ip,getSignature } = require('../tool/wx')

const { finishOrder, cashLogSql,logsSql,paySuccessEmailToSeller } = require('../tool/order')



router.get('/wxLogin', async function (ctx, next) {
    const { code, state } = ctx.request.query;
    let token = ''
    let userInfo = {}
    let wxInfo = await baseInfo(code);
    let ip = get_client_ip(ctx.req)
    // if (wxInfo.openid) {
    //     let now = new Date().getTime()
    //     ctx.cookies.set('wxOpenid', wxInfo.openid, { expires:   new     Date(now + 100 * 24 * 60 * 60 * 1000)  })
    // }
    if (wxInfo.scope === 'snsapi_userinfo') {
        userInfo = await snsapi_userinfo(wxInfo.openid, wxInfo.access_token);
    }
    if (wxInfo.openid) {
        token = await wxLoginOrLogon({ wxInfo, userInfo, ip })
    }
    ctx.body = { code: 0, data: { wxInfo, userInfo, token } }
})

router.all('/payCallBack', async function (ctx, next) {
    let emailTotal = 0;
    let emailPayopenId = 0;
    let emailisRepeat = 0;
    let { summary, create_time, resource: { ciphertext, associated_data, nonce } } = ctx.request.body
    //let { summary, create_time, resource: { ciphertext, associated_data, nonce } } = { "id": "383529bd-2422-5968-93f5-172f4b40f2ef", "create_time": "2023-04-02T21:57:01+08:00", "resource_type": "encrypt-resource", "event_type": "TRANSACTION.SUCCESS", "summary": "支付成功", "resource": { "original_type": "transaction", "algorithm": "AEAD_AES_256_GCM", "ciphertext": "ammJ0mSSXKCsacRYfZKGfuJzbvBg567dnv2g2KJbyuXl5Hkrjbdf2XBxV03bmWJsYZC/3mY1gKGJoTshgtk7nJ3WvVfHbd7SPE7jdGkhJ+4+/VExWHrU/4zhP2YhoDxUAEKGfG2PumbNhVLrXvnxyxtYkqeXwQTT2NWHsMr1IEK5RRpisAua2QBZ2ajVfBigRwaM0R7JypOjZQA87l49GEa7hU/4qf1P9KGp6IeVyOX/42pkKRn7h6b8I+bL08dqMM8PiekPtRGkR1h8ApjX/Nv3Tyub0CrtfLcN2Afey4XKnRmOO2He+ms9LRjoYxyohaYVFFod2D+JxYoRcFVd/veJ+P8lJTF0rqcd3D9gLmZkbhAR9yUCFfFBLN/fPRRcHLWSMsKhd7rfM6FviC2rFXww7GZ2jTBYlns0jqkL5QRIG5OGq6CIWUu7UhfdLq9jFLrWrskJRIFQWvRUds93v0cFI2GKbNhv6zd+Pgxs1Bv+V0Idywf9qk58gVKq27wsah38HbD4AKdq+f0JWjPr9yEqlY2OBjA7XBIoEeHPsII+HZWnSwJwRs05pwUtL2+vv6A=", "associated_data": "transaction", "nonce": "J046XMfSwfZD" } }
    if (ciphertext && associated_data && nonce) {
        let payJsonInfo = decipher_gcm(ciphertext, associated_data, nonce);
        let { out_trade_no, amount: { total }, transaction_id, trade_state, payer: { openid } } = payJsonInfo;

        //支付成功订单状态修改
        if (trade_state = 'SUCCESS') {
            let { id, userId, isPay } = await sql.promiseCall({ sql: `select id,userId,isPay from orderinfo  where orderNumber =? limit 0,1 `, values: [out_trade_no] }).then(({ error, results }) => {
                return !error && results.length > 0 && results[0] || {}
            });
            emailPayopenId = isPay;
            emailTotal = total;
            emailPayopenId = openid;
            if (id && userId && transaction_id && !isPay) {
                let orderRes = await finishOrder({ amountReal: total, orderId: id, transaction_id })
                let cashRes = await cashLogSql({ behavior: 1, orderId: id, type: 1, userId, amount: total })
                let logsRes = await logsSql({ orderId: id, type: 21 })
            }
        }
         //支付成功发送邮件给商户
        paySuccessEmailToSeller({  orderNumber:out_trade_no, summary,emailTotal,payWay:'微信jsapi',emailPayopenId,emailisRepeat,create_time})
    }

    ctx.body = { code: 0, data: {} }
})


router.get('/share', async function (ctx, next) {
    ctx.body =await getSignature(ctx.request.query.url);
})





module.exports = router