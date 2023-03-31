const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/discounts')

router.get('/statistics', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "canFetch": 1, "canUse": 1, "invalid": 0, "used": 0 }, "msg": "success" }
})

router.get('/coupons', async function (ctx, next) {
  ctx.body = { "code": 0, "data": [{ "batchSendUid": -1, "dateEndDays": 7, "dateEndType": 1, "dateStartType": 1, "id": 10640, "moneyHreshold": 99.00, "moneyMax": 10.00, "moneyMin": 1.00, "moneyType": 0, "name": "满100元减1-10元", "needAmount": 0.00, "needScore": 1, "needSignedContinuous": 0, "numberGit": 364, "numberGitNumber": 350, "numberLeft": 642, "numberPersonMax": 999, "numberTotle": 999, "numberUsed": 0, "onlyFreight": false, "pwd": "Y", "sendBirthday": true, "sendInviteM": true, "sendInviteS": true, "sendRegister": true, "shopId": 0, "showInFront": true, "status": 0, "statusStr": "正常", "type": "随机金额券" }], "msg": "success" }
})

router.get('/my', async function (ctx, next) {
  ctx.body = { "code": 0, "data": [{ "dateAdd": "2023-03-17 01:52:48", "dateEnd": "2023-03-24 01:52:49", "dateStart": "2023-03-17 01:52:49", "dateUpdate": "2023-03-24 02:25:00", "id": 1298767, "money": 7.44, "moneyHreshold": 99.00, "moneyType": 0, "name": "满100元减1-10元", "onlyFreight": false, "pid": 10640, "pwd": "v-shop", "shopId": 0, "source": "新手券", "status": 2, "statusStr": "过期/已结束", "type": "随机金额券" }], "msg": "success" }

})

router.post('/fetch', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }

})



module.exports = router
