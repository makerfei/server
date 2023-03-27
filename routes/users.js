const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/user')
//用户详情
router.get('/detail', async function (ctx, next) {
  let errortxt = ""
  let resData = {
    base: {},
    userLevel: {}
  }
  let res = await sql.promiseCall({sql:`select * ,avatar as avatarUrl,username as nick,id as userId   from user where id = '${ctx.session.userId}'`,values:[]});
  if (!res.error && res.results.length > 0) {
    resData.base = res.results[0]
  } else {
    errortxt = res.error.message
  }

  if (!errortxt) {
    let levelsql = await sql.promiseCall({sql:`select * from level where user_id = '${ctx.session.userId}'`,values:[]});
    if (!levelsql.error && levelsql.results.length > 0) {
      resData.userLevel = levelsql.results[0]
    } else {
      errortxt = levelsql.error.message
    }
  }
  if (!errortxt) {
    let level = resData.userLevel.level;
    let name = "";
    switch (level) {
      case 1: name = "黄铜"; break;
      case 2: name = "白银"; break;
      case 3: name = "黄金"; break;
      case 4: name = "钻石"; break;
      case 5: name = "大师"; break;
      case 6: name = "王者"; break;
      default:
        break;
    }

    resData.userLevel.name = name;


    ctx.body = {
      "code": 0, "data": {
        ...resData,



        //  "base": {

        // "avatarUrl": resData.avatar,
        // "birthdayProcessSuccessYear": 0,
        // "cardNumber": "230317015216050001",
        // "city": "北京市",
        // "dateAdd": "2023-03-17 01:52:48",
        // "dateLogin": "2023-03-17 04:43:54",
        // "getLevelDate": "2023-03-17 01:52:49",
        // "id": resData.id,
        // "ipAdd": "171.42.100.96",
        // "ipLogin": "171.42.100.96",
        // "isFaceCheck": false,
        // "isIdcardCheck": false,
        // "isManager": false,
        // "isSeller": false,
        // "isSendRegisterCoupons": true,
        // "isShopManager": false,
        // "isTeamLeader": false,
        // "isTeamMember": false,
        // "isUserAttendant": false,
        // "lastOrderDate": "2023-03-17 02:02:33",
        // "levelId": 4199,
        // "levelRenew": false,
        // "mobile": "15557131909",
        // "mobileVisInvister": true,
        // "nick": resData.username,
        // "province": "北京市",
        // "pwd": "yes",
        // "referrerType": 0,
        // "secondsAfterRegister": 10718,
        // "source": 1,
        // "sourceStr": "手机注册",
        // "status": 0,
        // "statusStr": "默认",
        // "taskUserLevelSendMonth": 202303,
        // "taskUserLevelSendPerMonth": false,
        // "taskUserLevelUpgrade": false,
        // "userId": resData.id       
        // },
        // "userLevel": {
        //   "id": 4199,
        //   // "userId": 1605,
        //   "dateAdd": "2022-01-27 16:25:25",
        //   "dateUpdate": "2022-02-04 12:27:03",
        //   "defValidityUnit": 3,

        //   "level": 1,
        //   "name": "黄金",
        //   "paixu": 0,
        //   "rebate": 10.00,
        //   "sendPerMonthScore": 2000,
        //   "status": 0,
        //   "upgradePayNumber": 2,
        //   "upgradeScore": 0,
        //   "upgradeSendScore": 4999
        // }
      }, "msg": "success"
    }
  } else {
    ctx.body = { "code": -1, msg: errortxt }
  }

})

//更改用户信息
router.get('/modify', async function (ctx, next) {
  let { nick, avatarUrl, province, city } = ctx?.request?.query;
  let res = await sql.promiseCall({sql:`update user set avatar = ?,username = ?,province = ?, city = ? where id =?`,
  values:[avatarUrl,nick,province,city,ctx.session.userId]});
  if (!res.error) {
    ctx.body = { "code": 0, "msg": "success" }
  } else {
    ctx.body = { "code": -1, "msg": res.error.sqlMessage }
  }
})

//用户金额信息
router.get('/amount', async function (ctx, next) {
  let errortxt = ""
  let resData = {};
  let amountsql = await sql.promiseCall({sql:`select * from amount where user_id = '${ctx.session.userId}'`,values:[]});
  if (!amountsql.error && amountsql.results.length > 0) {
    resData = amountsql.results[0]
  } else {
    errortxt = amountsql.error.message
  }
  if (!errortxt) {
    ctx.body = { "code": 0, "msg": "success", data: resData }
  } else {
    ctx.body = { "code": -1, "msg": errortxt }
  }
})
//用户登录出
router.get('/loginout', function (ctx, next) {
  ctx.session.userId = ''
  ctx.body = { "code": 0, "msg": "success" }
})




//地址信息列表
router.post('/shipping-address/list/v2', async function (ctx, next) {
  let resData = [];
  let errortxt = ""
  let addressSql = await sql.promiseCall({sql:`select * from address where userId = '${ctx.session.userId}'`,values:[]});
  if (!addressSql.error > 0) {
    resData = addressSql.results
  } else {
    errortxt = addressSql.error.message
  }
  if (!errortxt) {
    ctx.body = { "code": 0, "msg": "success", data: { result: resData } }
  } else {
    ctx.body = { "code": -1, "msg": errortxt }
  }

})
//获取默认地址
router.get('/shipping-address/default/v2', async function (ctx, next) {
  let resData = [];
  let errortxt = ""
  let addressSql = await sql.promiseCall({sql:`select * from address where isDefault=1 and userId = '${ctx.session.userId}'`,values:[]});
  if (!addressSql.error > 0) {
    resData = addressSql.results
  } else {
    errortxt = addressSql.error.message
  }
  if (!errortxt) {
    ctx.body = { "code": 0, "msg": "success", data: { info: resData[0] || {} } }
  } else {
    ctx.body = { "code": -1, "msg": errortxt }
  }
})
//获取地址详情
router.get('/shipping-address/detail/v2', async function (ctx, next) {
  let { id } = ctx.request.query;
  let resData = [];
  let errortxt = ""
  let addressSql = await sql.promiseCall({sql:`select * from address where  id = ${id} and userId = '${ctx.session.userId}'`,values:[]});
  if (!addressSql.error > 0) {
    resData = addressSql.results
  } else {
    errortxt = addressSql.error.message
  }
  if (!errortxt) {
    ctx.body = {
      "code": 0, "msg": "success", data: {
        info: {
          ...resData[0],
          isDefault: resData?.[0]?.isDefault ? true : false
        }
      }
    }
  } else {
    ctx.body = { "code": -1, "msg": errortxt }
  }
})





//新增加地址
router.post('/shipping-address/add', async function (ctx, next) {
  let { address, linkMan, mobile, isDefault, provinceId, cityId, districtId, areaStr, id } = ctx.request.body;
  let areaStrList = areaStr.split('/');
  let provinceStr = areaStrList[0] || ''
  let cityStr = areaStrList[1] || ''
  let areaStrT = areaStrList[2] || ''

  let addressSql = await sql.promiseCall({sql:` INSERT INTO address (address, areaStr, cityStr, linkMan, mobile, provinceId, provinceStr, districtId, userId, isDefault, cityId)
  VALUES
    ( ?, '${areaStrT}', '${cityStr}', ?, ?, '${provinceId}', '${provinceStr}', '${districtId}', ${ctx.session.userId}, ${isDefault ? 1 : 0}, ${cityId});`,
    
    values:[address,linkMan,mobile]});
  if (!addressSql.error) {
    if (isDefault) {
      await sql.promiseCall({sql:`update address set isDefault = '${0}' where isDefault = 1 and id != ${addressSql.results.insertId} and userId = '${ctx.session.userId}'`,values:[]})
    }
    ctx.body = { "code": 0, "msg": "success" }
  } else {
    ctx.body = { "code": -1, "msg": !addressSql.error.message }
  }
})
//更新地址
router.post('/shipping-address/update', async function (ctx, next) {
  let { address, linkMan, mobile, isDefault, provinceId, cityId, districtId, areaStr, id } = ctx.request.body;
  let areaStrList = areaStr.split('/');
  let provinceStr = areaStrList[0] || ''
  let cityStr = areaStrList[1] || ''
  let areaStrT = areaStrList[2] || ''
  let addressSql = await sql.promiseCall({sql:`update address set 
  address = ?,
  linkMan = ?,
  mobile = ?,
  isDefault = '${isDefault ? 1 : 0}',
  provinceId = '${provinceId}',
  cityId = '${cityId}',
  districtId = '${districtId}',
  provinceStr = '${provinceStr}',
  cityStr = '${cityStr}',
  areaStr = '${areaStrT}'
   where id =${id}`,values:[address,linkMan,mobile]});
  if (!addressSql.error) {
    if (isDefault) {
      await sql.promiseCall({sql:`update address set isDefault = '${0}' where isDefault = 1 and id != ${id} and userId = '${ctx.session.userId}'`,values:[]})
    }
    ctx.body = { "code": 0, "msg": "success" }
  } else {
    ctx.body = { "code": -1, "msg": addressSql.error.message }
  }

})

//删除地址
router.post('/shipping-address/delete', async function (ctx, next) {
  let { id } = ctx.request.body;
  let addressSqlDel = await sql.promiseCall({sql:`DELETE from address where id = ${id} and userId = '${ctx.session.userId}'`,values:[]})
  if (!addressSqlDel.error) {
    ctx.body = { "code": 0, "msg": "success" }
  } else {
    ctx.body = { "code": -1, "msg": addressSqlDel.error.message }
  }

})








router.post('/cashLog/v2', function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "amount": 1.00, "balance": 11111939.99, "behavior": 1, "dateAdd": "2023-03-17 05:26:24", "freeze": 0.00, "id": 2231794, "orderId": 1784887, "orderId2": 1784887, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 0.01, "balance": 940.99, "behavior": 1, "dateAdd": "2023-03-17 02:02:32", "freeze": 0.00, "id": 2231715, "orderId": 1784876, "orderId2": 1784876, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 59.00, "balance": 941.00, "behavior": 1, "dateAdd": "2023-03-17 01:57:47", "freeze": 0.00, "id": 2231714, "orderId": 1784875, "orderId2": 1784875, "shopId": 0, "type": 2, "typeStr": "支付订单", "uid": 7448958, "userId": 1605 }, { "amount": 1000.00, "balance": 1000.00, "behavior": 0, "dateAdd": "2023-03-17 01:57:23", "freeze": 0.00, "id": 2231713, "type": 140, "typeStr": "积分兑换成金额", "uid": 7448958, "userId": 1605 }], "totalPage": 1, "totalRow": 4 }, "msg": "success" }
})





















module.exports = router
