const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
 router.prefix('/api/order')

router.get('/statistics', async function  (ctx, next) {
  ctx.body = {"code":0,"data":{"count_id_close":0,"count_id_no_confirm":0,"count_id_no_pay":0,"count_id_no_reputation":0,"count_id_no_transfer":2,"count_id_peisonging":0,"count_id_success":0,"count_id_wait_to_peisong":0},"msg":"success"}
})



module.exports = router
