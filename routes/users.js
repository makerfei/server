const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/user')

router.get('/detail', async function  (ctx, next) {
  let res = await sql.promiseCall('select * from user');
  ctx.body = {"code":0,"data":{"base":{
    "avatarUrl":"",
    "birthdayProcessSuccessYear":0,
    "cardNumber":"230317015216050001",
    "city":"北京市",
    "dateAdd":"2023-03-17 01:52:48",
    "dateLogin":"2023-03-17 04:43:54",
    "getLevelDate":"2023-03-17 01:52:49",
    "id":7448958,
    "ipAdd":"171.42.100.96",
    "ipLogin":"171.42.100.96",
    "isFaceCheck":false,
    "isIdcardCheck":false,
    "isManager":false,
    "isSeller":false,
    "isSendRegisterCoupons":true,
    "isShopManager":false,
    "isTeamLeader":false,
    "isTeamMember":false,
    "isUserAttendant":false,
    "lastOrderDate":"2023-03-17 02:02:33",
    "levelId":4199,
    "levelRenew":false,
    "mobile":"15557131909",
    "mobileVisInvister":true,
    "nick":"Fhh ",
    "province":"北京市",
    "pwd":"yes",
    "referrerType":0,
    "secondsAfterRegister":10718,
    "source":1,
    "sourceStr":"手机注册",
    "status":0,
    "statusStr":"默认",
    "taskUserLevelSendMonth":202303,
    "taskUserLevelSendPerMonth":false,
    "taskUserLevelUpgrade":false,
    "userId":1605
  },
  "userLevel":{
    "dateAdd":"2022-01-27 16:25:25",
    "dateUpdate":"2022-02-04 12:27:03",
    "defValidityUnit":3,
    "id":4199,
    "level":1,
    "name":"黄金",
    "paixu":0,
    "rebate":10.00,
    "sendPerMonthScore":2000,"status":0,"upgradePayNumber":2,"upgradeScore":0,"upgradeSendScore":4999,"userId":1605}},"msg":"success"}
})

router.get('/amount', function (ctx, next) {
  ctx.body = {"code":0,"data":{"balance":940.99,"freeze":0.00,"fxCommisionPaying":0.00,"growth":0.00,"score":13997,"scoreLastRound":0,"totalPayAmount":59.01,"totalPayNumber":2,"totalScore":14997,"totalWithdraw":0.00,"totleConsumed":0.00},"msg":"success"}
})

module.exports = router
