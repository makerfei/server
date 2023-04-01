const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const logisticsApi = require('../tool/logisticsApi')
router.prefix('/api/order')
const moment = require('moment');
const { wxPay, get_client_ip } = require('../tool/wx')
//获取状态文字
let getStatusTxt = function (status) {
  let resTxt = ''
  switch (Number(status)) {
    case 0: resTxt = '待付款'; break;
    case 1: resTxt = '待发货'; break;
    case 2: resTxt = '待收货'; break;
    case 3: resTxt = '待评价'; break;
    case 4: resTxt = '完成'; break;
    default: break;
  }
  return resTxt

}

//规格key转文字
let propertyChildIdsGetText = async function (keyStr) {
  let keylist = keyStr.split(',');
  return new Promise(async (resolve, reject) => {
    let resStr = [];
    for (let i = 0; i < keylist.length; i++) {
      let item = keylist[i].split(':');
      if (item.length >= 2 && item[0] && item[1]) {
        let typenamesql = await sql.promiseCall({ sql: `select name from properties where id =? limit 0,1`, values: [item[0]] });
        let valnamesql = await sql.promiseCall({ sql: `select name from childscurgoods where id =? and propertyId=? limit 0,1`, values: [item[1], item[0]] });
        if (!typenamesql.error && !valnamesql.error && typenamesql.results.length > 0 && valnamesql.results.length > 0) {
          resStr.push(`${typenamesql.results[0].name}:${valnamesql.results[0].name}`)
        }
      }
    }
    resolve(resStr.join(','));
  })
}

//获取订单下面所有的商品信息
let getOrderGoodsFun = function (orderId) {
  return new Promise(async (resolve, reject) => {
    let ordergoodsSql = await sql.promiseCall({ sql: `select *, amountSingle as amount,goodsId as id,id as orderItemId from orderItem where orderId = ?`, values: [orderId] });
    if (!ordergoodsSql.error) {
      resolve(ordergoodsSql.results)
    } else {
      resolve([])
    }
  })
}


//对订单进行评价
router.post('/reputation', async function (ctx, next) {
  const { postJsonString } = ctx.request.body;
  let postJson = JSON.parse(postJsonString);
  let { orderId, reputations } = postJson;
  let userId = ctx.session.userId;
  for (let i = 0; i < reputations.length; i++) {
    let item = reputations[i]
    let repsql = await sql.promiseCall({
      sql: ` INSERT INTO reputations ( goodsId, orderId, userId, reputation, remark)
    VALUES(?,?,?,?,? )`, values: [item.id, orderId, userId, item.reputation, item.remark]
    });
  }
  let upStatusSql = await sql.promiseCall({ sql: `update orderinfo set status=4 where id  = ?`, values: [orderId] })
  ctx.body = { "code": 0, msg: 'success' }
})


//创建订单
router.post('/create', async function (ctx, next) {
  let { goodsJsonStr, remark, peisongType, linkMan, mobile, address, provinceId, cityId, districtId } = ctx.request.body;
  let amount = 0;
  let goodsNumber = 0;
  let orderNumber = moment(new Date()).format('YYYYMMDDHHmmss') + '' + Number(Math.random() * 100).toFixed(0)
  let goodsList = JSON.parse(goodsJsonStr);
  let resData = {};
  // [{"goodsId":2,"number":1,"propertyChildIds":""}]

  let errText = ''

  //获取价格
  for (let i = 0; i < goodsList.length; i++) {
    let goods = goodsList[i]
    if (!errText) {
      let goodsDateSql = await sql.promiseCall({ sql: `select minPrice as price,stores,id as goodsId,name as goodsName,pic from goods where id =? limit 0,1`, values: [goods.goodsId] });
      if (!goodsDateSql.error) {
        goodsList[i] = { ...goodsList[i], ...goodsDateSql?.results?.[0], property: '' }
        let delNumber = Number(goodsDateSql?.results?.[0]?.stores) - Number(goodsList[i].number);
        console.log(delNumber)
        if (delNumber >= 0) {
          let jiansql = await sql.promiseCall({ sql: `update goods set  stores = ${delNumber}   where id =?`, values: [goodsDateSql?.results?.[0]?.goodsId] });
        } else {
          errText = '库存不足'
        }
      } else {
        errText = goodsDateSql.error.message;
      }
    }
  }
  //多规格获取价格
  for (let i = 0; i < goodsList.length; i++) {
    let goods = goodsList[i]
    if (!errText && goods.propertyChildIds) {
      //获取规格名称
      let property = await propertyChildIdsGetText(goods.propertyChildIds)
      let goodsDateSql = await sql.promiseCall({ sql: `select  price,stores,id from skulist where goodsId =? and propertyChildIds=?  limit 0,1`, values: [goods.goodsId, goods.propertyChildIds] });
      if (!goodsDateSql.error && goodsDateSql?.results?.[0]?.price) {
        //更新价格
        goodsList[i] = { ...goodsList[i], price: goodsDateSql?.results?.[0]?.price || 0, property }

        //减库存
        let delNumber = Number(goodsDateSql?.results?.[0]?.stores) - Number(goodsList[i].number);
        if (delNumber >= 0) {
          let jiansql = await sql.promiseCall({ sql: `update skulist set  stores = ${delNumber}   where id =?`, values: [goodsDateSql?.results?.[0]?.id] });
        } else {
          errText = '库存不足'
        }
      } else {
        errText = goodsDateSql.error.message;
      }



    }
  }
  //结算价格个数
  if (!errText) {
    for (let i = 0; i < goodsList.length; i++) {
      amount += goodsList[i].price * goodsList[i].number;
    }
    goodsNumber += goodsList.length;
  }
  //放入数据库 
  if (!errText) {
    let orderInfoSql = await sql.promiseCall({
      sql: `INSERT INTO orderInfo (orderNumber, amountReal, amount,goodsNumber,isNeedLogistics,userId,remark)
     VALUES(?,?,?,?,?,?,?);`,
      values: [orderNumber, 0, amount, goodsNumber, peisongType == 'kd' ? 1 : 0, ctx.session.userId, remark]
    })
    if (orderInfoSql.error) {
      errText = orderInfoSql.error.message
    }
  }


  //提取
  if (!errText) {
    let orderInfoSql = await sql.promiseCall({ sql: `select * from orderInfo where orderNumber = ? limit 0 ,1`, values: [orderNumber] })
    if (!orderInfoSql.error) {
      resData = orderInfoSql.results[0] || {}
    } else {
      errText = orderInfoSql.error.message
    }
  }

  //物流地址保存数据库
  if (!errText) {
    let orderInfoSql = await sql.promiseCall({
      sql: `INSERT INTO logistics ( address, linkMan, mobile, provinceId, districtId, orderId, cityId)
  VALUES (?,?,?,?,?,?,?);`,
      values: [address, linkMan, mobile, provinceId, districtId, resData.id, cityId]
    })
    if (orderInfoSql.error) {
      errText = orderInfoSql.error.message
    }
  }

  //单个商品记录放入订单商品表
  if (!errText) {
    for (let i = 0; i < goodsList.length; i++) {
      if (!errText) {
        let item = goodsList[i]
        let orderItemSql = await sql.promiseCall({
          sql: `INSERT INTO orderItem (goodsId, number, propertyChildIds, property, orderId, amountSingle, goodsName, pic)
          VALUES(?,?,?,?,?,?,?,?);`,
          values: [item.goodsId, item.number, item.propertyChildIds, item.property || '', resData.id, item.price, item.goodsName, item.pic]
        })
        if (orderItemSql.error) {
          errText = orderItemSql.error.message
        }
      }
    }
  }

  if (!errText) {
    ctx.body = { "code": 0, "data": { ...resData }, "msg": "success" }
  } else {
    ctx.body = { "code": -1, msg: errText }
  }

})

//订单详情
router.get('/detail', async function (ctx, next) {
  let { orderNumber } = ctx.request.query;
  let errText = ''
  let resData = {}
  //订单详情
  if (!errText) {
    let orderInfoSql = await sql.promiseCall({ sql: `select * from orderInfo where userId=? and  orderNumber = ? limit 0 ,1 `, values: [ctx.session.userId, orderNumber] })
    if (!orderInfoSql.error) {
      resData.orderInfo = orderInfoSql.results[0] || {}
    } else {
      errText = orderInfoSql.error.message
    }
  }
  if (!errText) {
    resData.goods = await getOrderGoodsFun(resData.orderInfo.id)
  }

  resData.goods = await getOrderGoodsFun(resData.orderInfo.id)

  //获取订单地址详情
  if (!errText && resData.orderInfo.isNeedLogistics) {
    let orderInfoSql = await sql.promiseCall({ sql: `select * from logistics where orderId=?  limit 0 ,1 `, values: [resData.orderInfo.id] });
    if (!orderInfoSql.error) {
      if (orderInfoSql.results.length > 0) {
        resData.logistics = { ...orderInfoSql.results[0] }
      }
    } else {
      errText = orderInfoSql.error.message
    }
  }


  if (!errText) {
    ctx.body = { "code": 0, "data": resData, "msg": "success" }
  } else {
    ctx.body = { "code": -1, msg: errText }
  }


})




router.post('/list', async function (ctx, next) {
  let { page = 1, pageSize = 10, status, orderNumber = '' } = ctx.request.body;
  let userId = ctx.session.userId;
  let wheresql = ' '
  let errText = ''
  let resData = {
    goodsMap: {}
  };
  if (status) {
    wheresql += `and status = ${status} `
  } else {
    wheresql += `and status >=0 `
  }
  // if (orderNumber) {
  //   wheresql += `and orderNumber like '%${orderNumber}%' `
  // }


  if (!errText) {
    let orderInfoSql = await sql.promiseCall({
      sql: `select * from orderInfo where userId=? 
    and orderNumber like ?
    ${wheresql} order by id desc limit ${(page - 1) * pageSize},${pageSize}  `,
      values: [userId, `%${orderNumber}%`]
    })
    if (!orderInfoSql.error) {
      resData.orderList = orderInfoSql.results.map(item => {
        let statusStr = getStatusTxt(item.status)
        return {
          ...item,
          statusStr
        }
      })
    } else {
      errText = orderInfoSql.error.message
    }
  }
  if (!errText) {
    for (let i = 0; i < resData.orderList.length; i++) {
      resData.goodsMap[resData.orderList[i].id] = await getOrderGoodsFun(resData.orderList[i].id)
    }
  }
  if (!errText) {
    ctx.body = { "code": 0, "data": resData, "msg": "success" }
  } else {
    ctx.body = { "code": -1, msg: errText }
  }




})



router.get('/set', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "alarmNotranceHours": 0, "autoDeliveryDays": 7, "autoReputationDays": 7, "closeMinute": 60, "endDays": 30, "grab": false, "hxRole": true, "open": true, "refundBeforeFahuo": false, "scoreExchange": 1.00, "successAfterPay": false, "thirdPeisongFeeMod": 0 }, "msg": "success" }

})





//确认收货
router.post('/delivery', async function (ctx, next) {

  let { orderId } = ctx.request.body;
  let errText = ''
  let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=3 where id =?`, values: [orderId] })
  if (updateOrderSql.error) {
    errText = updateOrderSql.error.message
  }
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }
})

//删除订单
router.post('/delete', async function (ctx, next) {

  let { orderId } = ctx.request.body;
  let errText = ''
  let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=-1 where id =?`, values: [orderId] })
  if (updateOrderSql.error) {
    errText = updateOrderSql.error.message
  }
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }

})
//取消订单
router.post('/close', async function (ctx, next) {

  let { orderId } = ctx.request.body;
  let errText = ''
  let orderitemList = []
  let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=-1 where id =?`, values: [orderId] })
  if (updateOrderSql.error) {
    errText = updateOrderSql.error.message
  }
  //创建锁定库存的逆向操作
  let orderitemSql = await sql.promiseCall({ sql: `select * from orderitem  where orderId =?`, values: [orderId] })
  if (!orderitemSql.error) {
    orderitemList = orderitemSql.results
  } else {
    errText = orderitemSql.error.message
  }

  //订单回调
  let goodsCallBackSql = await sql.promiseCall({
    sql: `update goods as a
  set a.stores = (select sum(b.number)+ a.stores from orderitem as b where a.id=b.goodsId and b.orderId = ?)
  where a.id in (select c.goodsId from orderitem as c where c.orderId = ?)`, values: [orderId, orderId]
  })

  let skuCallBackSql = await sql.promiseCall({
    sql: ` update skulist as a  set a.stores = (select sum(b.number)+a.stores from orderitem as b  where  b.propertyChildIds = a.propertyChildIds and b.orderId = ?  and a.goodsId = b.goodsId)
  where a.goodsId in (select c.goodsId from orderitem as c where c.orderId = ?  and a.goodsId = c.goodsId and  c.propertyChildIds = a.propertyChildIds );
`, values: [orderId, orderId]
  })
  if (goodsCallBackSql.error || skuCallBackSql.error) {
    errText = goodsCallBackSql.error.message || skuCallBackSql.message
  }
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }


})



//进行付款 生成微信支付
router.all('/wxPay', async function (ctx, next) {
  const userId = ctx.session.userId;
  const { orderId} = ctx.request.query;
  let userInfo = {}
  let ordernfo = {}
  let create_ip = get_client_ip(ctx.req)

  let userSql = await sql.promiseCall({ sql: `select weixin_openid  from user where id=?`, values: [userId] })
  let orderitemSql = await sql.promiseCall({ sql: `select *  from orderinfo where id=?`, values: [orderId] })

  if (!orderitemSql.error && !userSql.error && orderitemSql.results.length > 0 && userSql.results.length > 0) {
    userInfo = userSql.results[0];
    ordernfo = orderitemSql.results[0];
  }

  ctx.body = await wxPay({ total_fee:ordernfo.amount, openid:userInfo.weixin_openid, body:'街道购物商品', bookingNo:orderitemSql.orderNumber, create_ip})

})

//进行付款
router.post('/pay', async function (ctx, next) {
  let { orderId } = ctx.request.body;

  const userId = ctx.session.userId;
  let errText = ''
  let afterDelBalance = 0;
  let amountReal = 0;
  let orderNumber = 0;
  //查询订单
  let orderSql = await sql.promiseCall({ sql: `select amount ,orderNumber from orderinfo where id =?`, values: [orderId] })
  //查询余额
  let amountSql = await sql.promiseCall({ sql: `select balance  from amount where user_id =?`, values: [userId] })
  //查看余额是否足
  if (!orderSql.error && !amountSql.error && orderSql.results.length > 0 && amountSql.results.length) {
    afterDelBalance = amountSql.results[0].balance - orderSql.results[0].amount
    orderNumber = orderSql.results[0].orderNumber
    amountReal = orderSql.results[0].amount
    if (afterDelBalance < 0) {
      errText = '余额不足'
    }
  } else {
    errText = '账户错误'
  }
  //修改账户金额
  if (!errText) {

    let updateAmountSql = await sql.promiseCall({ sql: `update amount set balance=?  where user_id =?`, values: [afterDelBalance, userId] })
    if (updateAmountSql.error) {
      errText = updateAmountSql.error.message
    }
    //订单状态修改
    let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=1,isPay=1,amountReal=? where id =?`, values: [amountReal, orderId] })
    if (updateOrderSql.error) {
      errText = updateOrderSql.error.message
    }
    //在交易记录里面插值
    let cashLogSql = await sql.promiseCall({
      sql: `INSERT INTO cashLog (behavior, freeze, orderNumber, type, userId)
    VALUES
      ( ?,?,?,?,?);`, values: [1, 0, orderNumber, 1, userId]
    })

    if (cashLogSql.error) {
      errText = cashLogSql.error.message
    }
  }
  if (!errText) {
    ctx.body = { "code": 0, "msg": "success" }
  } else {

    ctx.body = { "code": 0, "msg": errText }
  }

})
router.get('/statistics', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "count_id_close": 10, "count_id_no_confirm": 9, "count_id_no_pay": 8, "count_id_no_reputation": 7, "count_id_no_transfer": 6, "count_id_peisonging": 5, "count_id_success": 4, "count_id_wait_to_peisong": 3 }, "msg": "success" }
})


//物流查询
router.get('/logisticsApi', async function (ctx, next) {
  ctx.body = await logisticsApi(ctx.request.query)
})







module.exports = router
