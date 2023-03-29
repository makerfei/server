const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/logistic')
const logisticConfig = require('../config/logistic')
const moment = require('moment');
router.all('/callback', async function (ctx, next) {
    ctx.body = {
        "EBusinessID": logisticConfig.EBusinessID,
        "UpdateTime":moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        "Success": true,
        "Reason": ""
    }

})
module.exports = router