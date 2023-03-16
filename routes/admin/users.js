const router = require('koa-router')()
const sql = require('../../tool/sqlConfig')
 router.prefix('/api/admin')

router.get('/list', async function  (ctx, next) {
  let res = await sql.promiseCall('select * from user');
  ctx.body = {...res,api:ctx.session.userId}
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
