const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/user')

router.get('/detail', async function (ctx, next) {
  let errortxt = ""
  let resData = {}
  let res = await sql.promiseCall(`select * from user where id = '${ctx.session.userId}'`);
  if (res.error && res.results.length > 0) {
    resData = res.results[0]
  } else {
    errortxt = '信息查询错误'
  }
  if (!errortxt) {
    ctx.body = {
      "code": 0, "data": {
        "base": {
          "avatarUrl": resData.avatar,
          "birthdayProcessSuccessYear": 0,
          "cardNumber": "230317015216050001",
          "city": "北京市",
          "dateAdd": "2023-03-17 01:52:48",
          "dateLogin": "2023-03-17 04:43:54",
          "getLevelDate": "2023-03-17 01:52:49",
          "id": resData.id,
          "ipAdd": "171.42.100.96",
          "ipLogin": "171.42.100.96",
          "isFaceCheck": false,
          "isIdcardCheck": false,
          "isManager": false,
          "isSeller": false,
          "isSendRegisterCoupons": true,
          "isShopManager": false,
          "isTeamLeader": false,
          "isTeamMember": false,
          "isUserAttendant": false,
          "lastOrderDate": "2023-03-17 02:02:33",
          "levelId": 4199,
          "levelRenew": false,
          "mobile": "15557131909",
          "mobileVisInvister": true,
          "nick": resData.username,
          "province": "北京市",
          "pwd": "yes",
          "referrerType": 0,
          "secondsAfterRegister": 10718,
          "source": 1,
          "sourceStr": "手机注册",
          "status": 0,
          "statusStr": "默认",
          "taskUserLevelSendMonth": 202303,
          "taskUserLevelSendPerMonth": false,
          "taskUserLevelUpgrade": false,
          "userId": resData.id,
        },
        "userLevel": {
          "dateAdd": "2022-01-27 16:25:25",
          "dateUpdate": "2022-02-04 12:27:03",
          "defValidityUnit": 3,
          "id": 4199,
          "level": 1,
          "name": "黄金",
          "paixu": 0,
          "rebate": 10.00,
          "sendPerMonthScore": 2000, "status": 0, "upgradePayNumber": 2, "upgradeScore": 0, "upgradeSendScore": 4999, "userId": 1605
        }
      }, "msg": "success"
    }
  } else {
    ctx.body = { "code": -1, msg: errortxt }
  }

})






router.get('/amount', function (ctx, next) {
  ctx.body = { "code": 0, "data": { "balance": 1111140.99, "freeze": 0.00, "fxCommisionPaying": 0.00, "growth": 0.00, "score": 13997, "scoreLastRound": 0, "totalPayAmount": 59.01, "totalPayNumber": 2, "totalScore": 14997, "totalWithdraw": 0.00, "totleConsumed": 0.00 }, "msg": "success" }
})


router.post('/cashLog/v2', function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "amount": 1.00, "balance": 11111939.99, "behavior": 1, "dateAdd": "2023-03-17 05:26:24", "freeze": 0.00, "id": 2231794, "orderId": 1784887, "orderId2": 1784887, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 0.01, "balance": 940.99, "behavior": 1, "dateAdd": "2023-03-17 02:02:32", "freeze": 0.00, "id": 2231715, "orderId": 1784876, "orderId2": 1784876, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 59.00, "balance": 941.00, "behavior": 1, "dateAdd": "2023-03-17 01:57:47", "freeze": 0.00, "id": 2231714, "orderId": 1784875, "orderId2": 1784875, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 1000.00, "balance": 1000.00, "behavior": 0, "dateAdd": "2023-03-17 01:57:23", "freeze": 0.00, "id": 2231713, "type": 140, "typeStr": "积分兑换成金额", "uid": 7448958, "userId": 1605 }], "totalPage": 1, "totalRow": 4 }, "msg": "success" }
})

router.get('/modify', function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})

router.get('/loginout', function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})



router.get('/shipping-address/default/v2', function (ctx, next) {
  ctx.body = { "code": 0, "data": { "extJson": {}, "info": { "address": "Thuu", "areaStr": "东城区", "cityId": "110100", "cityStr": "-", "dateAdd": "2023-03-17 01:55:20", "dateUpdate": "2023-03-24 20:33:04", "districtId": "110101", "id": 560611, "isDefault": false, "linkMan": "Ghhj", "mobile": "15557155555", "provinceId": "110000", "provinceStr": "北京市", "status": 0, "statusStr": "正常", "uid": 7448958, "userId": 1605 } }, "msg": "success" }
})














module.exports = router
