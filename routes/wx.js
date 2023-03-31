const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/wx')
const { snsapi_baseInfo } = require('../tool/wx')
router.get('/snsapi_baseInfo', async function (ctx, next) {
    const { code } = ctx.request.query;
    let wxInfo = await snsapi_baseInfo(code);
    if (wxInfo.openid) {
        let now = new Date().getTime()
        ctx.cookies.set('wxOpenid', wxInfo.openid, { expires:   new     Date(now + 100 * 24 * 60 * 60 * 1000)  })
    }
    ctx.body = { wxOpenid: wxInfo.openid }
})


module.exports = router