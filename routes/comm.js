const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const fs = require('fs')
const path = require('path')
const email = require('../tool/nodemailer')
router.prefix('/api')

router.get('/banner/list', async function (ctx, next) {
  const { type } = ctx.request.query;
  let bannerSql = await sql.promiseCall(`select * from banner where type = '${type}' ORDER BY paixu ASC`);
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















router.post('/shop/goods/reputation/v2', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "goods": { "afterSale": "0,1,2", "amount": 3.00, "amountCoupon": 0.00, "amountSingle": 1.00, "amountSingleBase": 1.00, "benefitFwf": 0.00, "benefitOther1": 0.00, "benefitSale": 0.00, "buyRewardEnd": false, "categoryId": 272693, "cost": 0.00, "cyTableStatus": 1, "dateAdd": "2022-02-05 19:44:48", "dateReputation": "2022-03-07 21:20:00", "fxType": 2, "goodReputation": 2, "goodReputationRemark": "系统默认好评", "goodReputationStr": "好评", "goodsId": 1052000, "goodsIdStr": "1052000", "goodsName": "实物商品（购买时需填写收货地址，支持售后）", "id": 2064935, "isProcessHis": true, "isScoreOrder": false, "number": 3, "numberNoFahuo": 0, "orderId": 1298567, "persion": 0, "pic": "https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png", "propertyChildIds": "", "purchase": true, "refundStatus": 1, "score": 0, "shopId": 0, "status": 4, "type": 0, "uid": 869081, "unit": "件", "userId": 1605 }, "user": { "avatarUrl": "https://dcdn.it120.cc/2022/01/31/ea90f530-4e4f-4a9b-a979-b39cd36429a5.jpg", "mobile": "153****4345", "nick": "J****hu", "uid": 869081 } }], "totalPage": 5, "totalRow": 5 }, "msg": "success" }
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