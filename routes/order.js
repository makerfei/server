const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const logisticsApi = require('../tool/logisticsApi')
router.prefix('/api/order')
const moment = require('moment');
const { jsApicGetOrderPayInfo, get_client_ip, wxQRcodePayApi } = require('../tool/wx')

const { finishOrder, cashLogSql, logsSql, getStatusTxt,
  getLogsTypeList, orderClose, paySuccessEmailToSeller,
  refundsSatus, refundsType
} = require('../tool/order');




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
      resolve(ordergoodsSql.results.map(item => {
        return {
          ...item,
          amount: Number(item.amount / 100).toFixed(2),
          amountSingle: Number(item.amountSingle / 100).toFixed(2)
        }
      }))


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
  //评价打点
  await logsSql({ orderId, type: 50 })

  ctx.body = { "code": 0, msg: 'success' }
})


//创建订单
router.post('/create', async function (ctx, next) {
  let { goodsJsonStr, remark, peisongType, linkMan, mobile, address, provinceId, cityId, districtId, balanceSwitch } = ctx.request.body;
  let userId = ctx.session.userId;
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
      let goodsDateSql = await sql.promiseCall({ sql: `select afterSale, minPrice as price,stores,id as goodsId,name as goodsName,pic from goods where id =? limit 0,1`, values: [goods.goodsId] });
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
      sql: `INSERT INTO orderInfo (orderNumber, amountReal, amount,goodsNumber,isNeedLogistics,userId,remark,balanceSwitch)
     VALUES(?,?,?,?,?,?,?,?);`,
      values: [orderNumber, amount, amount, goodsNumber, peisongType == 'kd' ? 1 : 0, userId, remark, balanceSwitch]
    })
    if (orderInfoSql.error) {
      errText = orderInfoSql.error.message
    }
  }


  //提取信息用于展示
  if (!errText) {
    let orderInfoSql = await sql.promiseCall({ sql: `select * from orderInfo where orderNumber = ? limit 0 ,1`, values: [orderNumber] })
    if (!orderInfoSql.error) {
      resData = orderInfoSql.results[0] || {}
    } else {
      errText = orderInfoSql.error.message
    }
  }

  //物流地址保存数据库
  if (!errText && peisongType == 'kd') {
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
          sql: `INSERT INTO orderItem (goodsId, number, propertyChildIds, property, orderId, amountSingle, goodsName, pic,afterSale)
          VALUES(?,?,?,?,?,?,?,?,?);`,
          values: [item.goodsId, item.number, item.propertyChildIds, item.property || '', resData.id, item.price, item.goodsName, item.pic, item.afterSale]
        })
        if (orderItemSql.error) {
          errText = orderItemSql.error.message
        }
      }
    }
  }

  // 创建下单日志
  if (!errText) {
    await logsSql({ orderId: resData.id, type: balanceSwitch == 1 ? 10 : balanceSwitch == 2 ? 11 : 12 })
  }

  if (!errText) {
    ctx.body = { "code": 0, "data": { orderData: resData }, "msg": "success" }
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
      let orderPayIsOver = false;
      //判断订单超时主题
      if (resData.orderInfo.status == 0 && resData.orderInfo.balanceSwitch == 2 || resData.orderInfo.balanceSwitch == 3) {
        if (moment(resData.orderInfo.dateAdd).valueOf() + resData.orderInfo.closeMinute * 60 * 1000 < moment().valueOf()) {
          //超时自动关闭订单
          orderPayIsOver = true;
          await orderClose({ orderId: resData.orderInfo.id })
        }
      }
      resData.orderInfo = {
        ...resData.orderInfo,
        amountReal: Number(resData.orderInfo.amountReal / 100).toFixed(2),
        amount: Number(resData.orderInfo.amount / 100).toFixed(2),
        amountLogistics: Number(resData.orderInfo.amountLogistics / 100).toFixed(2),
        dateAdd: moment(resData.orderInfo.dateAdd).format('YYYY-MM-DD hh:mm:ss'),
        dateClose: moment(resData.orderInfo.dateAdd).valueOf() + resData.orderInfo.closeMinute * 60 * 1000,
        status: orderPayIsOver ? -1 : resData.orderInfo.status,
        statusStr: getStatusTxt(orderPayIsOver ? -1 : resData.orderInfo.status)
      }
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

  //获取订单操作记录
  if (!errText) {
    resData.logs = await sql.promiseCall({ sql: `select * from logs where orderId = ?`, values: [resData.orderInfo.id] }).then(({ error, results }) => {
      return (!error && results || []).map(item => { return { ...item, typeStr: getLogsTypeList(item.type), dateAdd: moment(item.dateAdd).format('YYYY-MM-DD hh:mm:ss') } })
    })
  }


  if (!errText) {
    ctx.body = { "code": 0, "data": resData, "msg": "success" }
  } else {
    ctx.body = { "code": -1, msg: errText }
  }


})

router.post('/list', async function (ctx, next) {
  let { page = 1, pageSize = 10, status, orderNumber = '', statusBatch = '' } = ctx.request.body;
  let userId = ctx.session.userId;
  let wheresql = ' '
  let errText = ''
  let resData = {
    goodsMap: {}
  };
  if (status) {
    wheresql += `and status = ${status} `
  } else if (statusBatch) {
    wheresql += `and status >=1 and status<=4 `
  } else {
    wheresql += `and status >=-1 `
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
          statusStr,
          amount: Number(item.amount / 100).toFixed(2),
          amountReal: Number(item.amountReal / 100).toFixed(2)
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
  await logsSql({ orderId, type: 40 })
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }
})

//删除订单
router.post('/delete', async function (ctx, next) {

  let { orderId } = ctx.request.body;
  let errText = ''
  let updateOrderSql = await sql.promiseCall({ sql: `update orderinfo set status=-2 where id =?`, values: [orderId] })
  if (updateOrderSql.error) {
    errText = updateOrderSql.error.message
  }
  await logsSql({ orderId, type: 19 })
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }

})
//取消订单
router.post('/close', async function (ctx, next) {

  let { orderId } = ctx.request.body;
  let errText = await orderClose({ orderId })
  ctx.body = { "code": !errText ? 0 : -1, "msg": errText || "success" }


})


//获取到公众号支付的二维码
router.get('/wxQRcodePayApi', async (ctx, next) => {
  ctx.body = { code: 0, data: await wxQRcodePayApi(ctx.request.query) }
})



// 获取微信的支付信息
router.post('/getWxjaspiInfoByOrder', async function (ctx, next) {
  let payInfo = await jsApicGetOrderPayInfo({  openid:ctx.request.body.openid ,  type:ctx.request.body.type,  orderId: ctx.request.body.orderId, create_ip: get_client_ip(ctx.req) });
  ctx.body = {
    code: payInfo.msg ? -1 : 0,
    data: {...payInfo.wxpayInfo,packageData:payInfo.wxpayInfo.package} ,
    msg: payInfo.msg || 'SUCCESS'

  }
})

//进行付款 余额的支付方式
router.post('/pay', async function (ctx, next) {
  let { orderId } = ctx.request.body;
  const userId = ctx.session.userId;
  let errText = ''
  let afterDelBalance = 0;
  let amountReal = 0;
  let orderNumber = 0;
  //查询订单
  let orderSql = await sql.promiseCall({ sql: `select amount ,orderNumber ,balanceSwitch from orderinfo where id =?`, values: [orderId] })
  //查询余额
  let amountSql = await sql.promiseCall({ sql: `select balance  from amount where user_id =?`, values: [userId] })
  //查看余额是否足
  if (!orderSql.error && !amountSql.error && orderSql.results.length > 0 && amountSql.results.length) {
    afterDelBalance = amountSql.results[0].balance - orderSql.results[0].amount;
    orderNumber = orderSql.results[0].orderNumber;
    amountReal = orderSql.results[0].amount;
    //交易类型为1 余额扣款 就检查账户
    if (afterDelBalance < 0) {
      errText = '余额不足'
    }
  } else {
    errText = '账户错误'
  }
  if (orderSql.results[0].balanceSwitch != 1) {
    errText = '付款方式错误'
  }
  //修改账户金额
  let updateAmountSql = await sql.promiseCall({ sql: `update amount set balance=?  where user_id =?`, values: [afterDelBalance, userId] })
  if (updateAmountSql.error) {
    errText = updateAmountSql.error.message
  }

  if (!errText) {
    //订单状态修改
    if (!await finishOrder({ amountReal, orderId })) {
      errText = '更新支付订单错误'
    }
  }
  if (!errText) {
    //更新流水记录
    if (!await cashLogSql({ behavior: 1, orderId, type: 0, userId, amount: orderSql.results[0].amount })) {
      errText = '订单流水记录错误'
    }
  }
  if (!errText) {
    await logsSql({ orderId, type: 20 })
  }

  paySuccessEmailToSeller({ orderNumber, buyerId: userId, summary: 'SUCCESS', emailTotal: orderSql.results[0].amount, payWay: '余额支付', emailPayopenId: '', emailisRepeat: 0, create_time: new moment().format('YYYY-MM-DD HH:mm:ss') })

  ctx.body = { "code": errText ? -1 : 0, "msg": errText || "success" }
})
router.get('/statistics', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "count_id_close": 0, "count_id_no_confirm": 0, "count_id_no_pay": 0, "count_id_no_reputation": 0, "count_id_no_transfer": 0, "count_id_peisonging": 0, "count_id_success": 0, "count_id_wait_to_peisong": 0 }, "msg": "success" }
})


//物流查询
router.get('/logisticsApi', async function (ctx, next) {
  ctx.body = await logisticsApi(ctx.request.query)
})


//邮件进行发货处理
router.post('/deliver', async function (ctx, next) {
  let { token, name, number, orderNumber } = ctx.request.body;
  let errText = ''

  if (token != 'zhangfei') {
    errText = '请填写正确标识';
  }
  if (!orderNumber) {
    errText = '请填写订单';
  }

  let orderSql = {};

  if (!errText) {
    //查询订单
    orderSql = await sql.promiseCall({ sql: `select id, isNeedLogistics,status from orderinfo where orderNumber =?`, values: [orderNumber] }).then(({ error, results }) => {
      if (!error && results.length > 0) {
        return results[0]
      } else {
        errText = '订单不存在';
        return {}
      }
    })
  }

  if (!errText) {
    //无物流的情况
    if (orderSql.isNeedLogistics == 0) {
      if (orderSql.status == 1) {
        //状态修改
        await sql.promiseCall({ sql: `update orderinfo set status =2 where id =?`, values: [orderSql.id] });
        //插入加入
        await logsSql({ orderId: orderSql.id, type: 30 });
        errText = '无物流 ，成功发货'
      } else {
        errText = '无物流 ,已经发过货，无需再次发货'
      }
    } else { //有物流的情况
      if (name && number) {
        await sql.promiseCall({ sql: `update logistics set shipperName =?, trackingNumber = ?  where orderId =?`, values: [name, number, orderSql.id] });
        if (orderSql.status == 1) {
          //状态修改
          await sql.promiseCall({ sql: `update orderinfo set status =2 where id =?`, values: [orderSql.id] });
          await logsSql({ orderId: orderSql.id, type: 30 });
          errText = '物流信息已经填写，发货成功'

        } else {
          errText = '成功更新物流  之前已发货，现在更新了'
        }

      } else {
        errText = '订单需要物流信息，填写物流'
      }
    }
  }
  ctx.body = errText

})

//退货详情
router.get('/refundApply/info', async function (ctx, next) {
  let { orderId, orderGoodsId } = ctx.request.query
  let list = await sql.promiseCall({ sql: `select * from refundapply where  orderId =? and orderGoodsId=? order by id desc limit 0,1`, values: [orderId, orderGoodsId] }).then(({ error, results }) => {
    if (!error && results.length > 0) {
      return { ...results[0], amount: Number(results[0].amount / 100).toFixed(2), statusStr: refundsSatus(results[0].status), typeStr: refundsType(results[0].type) }
    } else {
      return []
    }
  })
  ctx.body = {
    "code": 0,
    data: list.id > 0 ? [{ baseInfo: { ...list } }] : null,
    "msg": "success"
  }
})

//撤销退货
router.post('/refundApply/cancel', async function (ctx, next) {
  let { orderId, orderGoodsId } = ctx.request.body
  await sql.promiseCall({ sql: `update  refundapply set status =1 where orderId =? and orderGoodsId=? `, values: [orderId, orderGoodsId] }).then((error, results) => {

  })
  ctx.body = { "code": 0 }
})
//申请退货
router.post('/refundApply/apply', async function (ctx, next) {
  let { orderId, orderGoodsId, amount, type, logisticsStatus, reason, remark } = ctx.request.body
  await sql.promiseCall({
    sql: `insert  into refundapply (orderId, orderGoodsId, amount, type, logisticsStatus, reason, remark)
value(?,?,?,?,?,?,?)
`, values: [orderId, orderGoodsId, Number(Number(amount * 100).toFixed(0)), type, logisticsStatus, reason, remark]
  })

  ctx.body = { "code": 0 }
})











module.exports = router
