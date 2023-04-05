const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const fs = require('fs')
const path = require('path')
const email = require('../tool/nodemailer')
const shortlink = require('../tool/shortlink')
const {jsApicCeateOrder,get_client_ip} = require('../tool/wx')
router.prefix('/api')



router.get('/shortlink/:type/:data',async function(ctx, next){
  // ctx.cookies.set('a', '100')
  // // 获取cookie(结构化koa2已经做好)
  // console.log('cookie is', ctx.cookies.get('a'))

 ctx.redirect(shortlink(ctx.request.query,ctx.params));
})
router.get('/test',async (ctx, next)=>{
  ctx.body = await jsApicCeateOrder({
    total_fee: 10,
    openid: 'oQ1Td5gcOjqlBKQalxGc7Y6DV1r8',
    body:'街道购',
    bookingNo: '21212322232323233434',
    create_ip:get_client_ip(ctx.req)
  });
})






router.get('/banner/list', async function (ctx, next) {
  const { type } = ctx.request.query;
  let bannerSql = await sql.promiseCall({sql:`select * from banner where type = ? ORDER BY paixu ASC`,values:[type]});
  if (!bannerSql.error) {
    ctx.body = { "code": 0, "data": bannerSql.results, "msg": "success" }
  } else {
    ctx.body = { code: -1, msg: bannerSql.error.message }
  }
})

//发送邮件
router.all('/email', async function (ctx, next) {
  var mail = {
    // 发件人
    from: '美国代购<maker_wx1018@163.com>',
    // 主题
    subject: '接受凭证',//邮箱主题
    // 收件人
    to: 'maker.wx@gmail.com',//前台传过来的邮箱
    // 邮件内容，HTML格式
    text: '用' + 32323 + '作为你的验证码'//发送验证码
  };
  await email(mail);
  ctx.body = { code: 0, msg: "success" }
})





















router.get('/score/deduction/rules', async function (ctx, next) {
  ctx.body = { "code": 0, "data": [{ "loop": true, "money": 100.00, "score": 100, "type": 2 }], "msg": "success" }
})

router.post('/score/exchange/cash', async function (ctx, next) {
  ctx.body = { "code": 0, "data": 1000.00, "msg": "success" }
})














router.post('/score/logs', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-24 20:43:20", "remark": "购买商品: 虚拟商品（购买时无需填写收货地址，无需物流） 赠送", "score": 1000, "scoreLeft": 14497, "type": 11, "typeStr": "购买商品" }, { "behavior": 1, "behaviorStr": "支出", "dateAdd": "2023-03-24 20:26:00", "remark": "1000积分兑换1000.00金额", "score": -1000, "scoreLeft": 13497, "type": 16, "typeStr": "兑换成金额" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 05:26:24", "remark": "购买商品: 实物商品（购买时需填写收货地址，支持售后） 赠送", "score": 500, "scoreLeft": 14497, "type": 11, "typeStr": "购买商品" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 02:02:40", "remark": "黄金会员每月赠送", "score": 2000, "scoreLeft": 13997, "type": 17, "typeStr": "会员赠送" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 02:02:40", "remark": "升级到黄金会员", "score": 4999, "scoreLeft": 11997, "type": 17, "typeStr": "会员赠送" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 02:02:32", "remark": "购买商品: 虚拟商品（购买时无需填写收货地址，无需物流） 赠送", "score": 1000, "scoreLeft": 6998, "type": 11, "typeStr": "购买商品" }, { "behavior": 1, "behaviorStr": "支出", "dateAdd": "2023-03-17 01:57:23", "remark": "1000积分兑换1000.00金额", "score": -1000, "scoreLeft": 5998, "type": 16, "typeStr": "兑换成金额" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 01:52:50", "remark": "白银会员每月赠送", "score": 1000, "scoreLeft": 6998, "type": 17, "typeStr": "会员赠送" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 01:52:50", "remark": "升级到白银会员", "score": 4999, "scoreLeft": 5998, "type": 17, "typeStr": "会员赠送" }, { "behavior": 0, "behaviorStr": "收入", "dateAdd": "2023-03-17 01:52:48", "remark": "注册送积分", "score": 999, "scoreLeft": 999, "type": 0, "typeStr": "注册" }], "totalPage": 1, "totalRow": 10 }, "msg": "success" }
})












const getPostData = (ctx) => {
  return new Promise(function (resolve, reject) {//需要返回一个promise对象
    try {
      let str = '';
      ctx.req.on('data', function (chunk) {
        str += chunk;
      })
      ctx.req.on('end', function (chunk) {
        resolve(str);
      })
    } catch (err) {
      reject(err);
    }
  })
}


module.exports = router