const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const fs = require('fs')
const path = require('path')
const email = require('../tool/nodemailer')
const shortlink = require('../tool/shortlink')
const { jsApicCeateOrder, get_client_ip } = require('../tool/wx')
router.prefix('/api')
const QRCode = require("qrcode");
const axios = require('axios');
const moment = require('moment');
router.get('/shortlink/:type/:data', async function (ctx, next) {

  ctx.redirect(shortlink(ctx.request.query, ctx.params));
})

router.get('/urlTobase64', async function (ctx, next) {
  let { url = '' } = ctx.request.query;
  ctx.body = { code: 0, data: await QRCode.toDataURL(url) }
})



router.get('/banner/list', async function (ctx, next) {
  const { type } = ctx.request.query;
  let bannerSql = await sql.promiseCall({ sql: `select * from banner where type = ? ORDER BY paixu ASC`, values: [type] });
  if (!bannerSql.error) {
    ctx.body = { "code": 0, "data": bannerSql.results, "msg": "success" }
  } else {
    ctx.body = { code: -1, msg: bannerSql.error.message }
  }
})


router.all('/app/version', async function (ctx, next) {
  ctx.body = global.appVersion || 0
})

router.get('/app/setVersion', async function (ctx, next) {
  const { version } = ctx.request.query;
  global.appVersion = version || global.appVersion
  ctx.body = global.appVersion
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

router.all('/openAi', async function (ctx, next) {

  ctx.body = await axios({
    method: 'post',
    url: 'https://api.openai.com/v1/completions',
    data: { ...ctx.request.body, ...ctx.request.query },
    headers: { 'content-type': 'application/json', 'Authorization': 'Bearer ' + '     sk-Va9euMKgjXrcA6EG8X     xVT3BlbkFJ2JpRLJg4fLV5ckjY1kvE' }
  }).then(res => {
    console.log(res);
    return res;

  }).catch(err => {
    console.log(err);
    return err;
  })
})


router.post('/commentInsert', async function (ctx, next) {
  const { commentContent, commentGrade, commentId } = ctx.request.body;
  await sql.promiseCall({
    sql: `INSERT INTO comment ( commentId, commentContent, commentGrade)
  VALUES(?,?,?);`, values: [commentId, commentContent, commentGrade]
  });

  ctx.body = { "code": 0, "msg": "success" }

})

router.post('/commentSelectById', async function (ctx, next) {
  const { commentId } = ctx.request.body;
  const commentRes = await sql.promiseCall({
    sql: `select * from comment where  commentId = ?`, values: [commentId]
  });

  ctx.body = { "code": 0, data: commentRes.results.map(item=>{
    return {...item,commentTime:moment(item.commentTime).format("YYYY-YY-DD HH:mm:ss")}
  }), "msg": "success" }

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