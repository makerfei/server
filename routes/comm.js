const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const fs = require('fs')
const path = require('path')
var multiparty = require('multiparty');
var formidable = require('formidable');
const email = require('../tool/nodemailer')
router.prefix('/api')



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
  ctx.body = { code: 0, mes: "成功" }
})

router.get('/banner/list', async function (ctx, next) {
  ctx.body = { "code": 0, "data": [{ "businessId": 0, "dateAdd": "2022-05-05 11:26:09", "id": 222083, "linkType": 0, "linkUrl": "https://gitee.com/joeshu/v-shop", "paixu": 0, "picUrl": "https://dcdn.it120.cc/2022/05/05/ac956ae3-151f-418e-b0e9-fadd76a9ea6d.jpeg", "remark": "跳转gitee v-shop", "shopId": 0, "status": 0, "statusStr": "显示", "title": "首页Banner4", "type": "indexBanner", "userId": 1605 }, { "businessId": 0, "dateAdd": "2022-02-02 16:04:11", "dateUpdate": "2022-02-02 16:19:17", "id": 204167, "linkType": 0, "linkUrl": "https://github.com/JoeshuTT/v-shop", "paixu": 0, "picUrl": "https://dcdn.it120.cc/2022/02/02/d0442c95-cd44-435a-888d-2539c5399334.png", "remark": "跳转github v-shop", "shopId": 0, "status": 0, "statusStr": "显示", "title": "首页banner3", "type": "indexBanner", "userId": 1605 }, { "businessId": 0, "dateAdd": "2017-12-04 10:35:09", "dateUpdate": "2022-02-02 16:19:07", "id": 2772, "linkType": 0, "linkUrl": "", "paixu": 2, "picUrl": "https://cdn.it120.cc/apifactory/2019/06/18/4c458676-85bb-4271-91a6-79ed9fc47545.jpg", "remark": "", "shopId": 0, "status": 0, "statusStr": "显示", "title": "首页banner2", "type": "indexBanner", "userId": 1605 }, { "businessId": 0, "dateAdd": "2017-12-04 10:34:35", "dateUpdate": "2022-02-02 16:19:13", "id": 2771, "linkType": 0, "linkUrl": "", "paixu": 2, "picUrl": "https://cdn.it120.cc/apifactory/2019/06/18/06b337d7-92a1-498b-8142-5c5951e8fb97.jpg", "remark": "", "shopId": 0, "status": 0, "statusStr": "显示", "title": "首页banner1", "type": "indexBanner", "userId": 1605 }], "msg": "success" }
})


router.post('/shop/goods/list/v2', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "afterSale": "0", "categoryId": 272693, "characteristic": "本商城所有商品，都是测试商品，仅限线上调试，模拟交易流程", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2022-02-04 12:14:12", "dateUpdate": "2023-03-17 04:54:50", "discountPrice": 0.00, "fxType": 2, "gotScore": 500, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 1052000, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 1.00, "minScore": 0, "name": "实物商品（购买时需填写收货地址，支持售后）", "numberFav": 1, "numberGoodReputation": 5, "numberOrders": 112, "numberReputation": 5, "numberSells": 10066, "originalPrice": 199.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png", "pingtuan": false, "pingtuanPrice": 0.00, "priceShopSell": 0.00, "recommendStatus": 1, "recommendStatusStr": "推荐", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 932, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unit": "件", "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 77503, "weight": 0.00 }, { "afterSale": "", "categoryId": 272693, "characteristic": "本商城所有商品，都是测试商品，仅限线上调试，模拟交易流程", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-07-29 19:12:45", "dateUpdate": "2023-03-17 02:04:34", "fxType": 2, "gotScore": 1000, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 157447, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 0, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 0.01, "minScore": 0, "name": "虚拟商品（购买时无需填写收货地址，无需物流）", "numberFav": 23, "numberGoodReputation": 4, "numberOrders": 161, "numberReputation": 4, "numberSells": 10159, "originalPrice": 99.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://dcdn.it120.cc/2022/02/04/b5017470-29bb-43a3-b34c-56cdf6b0fb05.png", "pingtuan": false, "pingtuanPrice": 0.00, "priceShopSell": 0.00, "recommendStatus": 1, "recommendStatusStr": "推荐", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 956, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 1, "unit": "件", "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 45208, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37963, "characteristic": "10000mAh大电量 / 可上飞机 / 双输入接口（USB-C＆amp;amp;amp;Micro-USB） / 双输出接口（2xUSB-A） / 高密度锂聚合物电芯", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-07-23 14:46:00", "dateEndPingtuan": "2022-01-31 23:59:59", "dateUpdate": "2023-03-17 02:32:14", "discountPrice": 0.00, "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 155197, "kanjia": false, "kanjiaPrice": 19.90, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 59.00, "minScore": 0, "name": "Redmi充电宝[拼团-无规格]", "numberFav": 20, "numberGoodReputation": 1, "numberOrders": 56, "numberReputation": 1, "numberSells": 72, "originalPrice": 59.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://dcdn.it120.cc/2019/07/23/3140ac2f-7311-475d-840b-d4dd2ec59a54.jpg", "pingtuan": true, "pingtuanPrice": 0.00, "priceShopSell": 0.00, "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 953, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unit": "份", "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 32558, "weight": 0.00 }, { "afterSale": "0,1,2", "barCode": "", "categoryId": 37963, "characteristic": "全新 AMOLED 大屏彩显，支持77种个性主题。拥有20天的超长续航，能用支付宝抬手支付。50米防水，支持游泳模式。还能看微信、看来电、测心率、测睡眠。带上它，你的改变从今天开始。", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-07-18 18:51:27", "dateUpdate": "2023-03-17 02:01:59", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 153331, "kanjia": true, "kanjiaPrice": 69.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 169.00, "minScore": 0, "name": "小米手环4[砍价]", "numberFav": 102, "numberGoodReputation": 0, "numberOrders": 62, "numberReputation": 0, "numberSells": 138, "originalPrice": 169.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/07/18/85d3a148-f88f-4fe1-8c6c-9d16638dd9ef.jpg", "pingtuan": false, "pingtuanPrice": 69.00, "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 977, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "tags": "砍价", "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 110989, "weight": 0.00 }, { "afterSale": "0,1,2", "barCode": "", "categoryId": 37965, "characteristic": "1.5匹 / 全直流变频 / 高效制冷热 / 智能控制 / 售后无忧 / 官网购买，免预约安装，签收后服务人员主动联系", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-07-16 18:15:26", "dateEnd": "2019-07-27 00:00:00", "dateStart": "2019-07-19 09:55:29", "dateUpdate": "2023-03-17 01:50:41", "expiryMillis": 0, "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 152592, "kanjia": true, "kanjiaPrice": 1999.00, "limitation": false, "logisticsId": 4751, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 2497.00, "minScore": 0, "name": "米家互联网空调[砍价]", "numberFav": 58, "numberGoodReputation": 0, "numberOrders": 6, "numberReputation": 0, "numberSells": 107, "originalPrice": 2699.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/07/16/9dbcc4e2-fac4-4dd0-914e-b29c59a913df.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 997, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "tags": "砍价", "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 42416, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37963, "characteristic": "小米无人机4K版套装 / 易上手 / 高品质影像 / 安全 / 小巧便携", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-06-20 09:55:24", "dateUpdate": "2023-03-16 22:44:56", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 144643, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 2999.00, "minScore": 0, "name": "小米无人机[售罄]", "numberFav": 12, "numberGoodReputation": 0, "numberOrders": 6, "numberReputation": 0, "numberSells": 7, "originalPrice": 2999.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/cd126315-5f7d-43b7-92fe-b9444a293f21.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 998, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "tags": "", "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 25641, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37962, "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-06-20 09:36:24", "dateUpdate": "2023-03-17 01:56:04", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 144614, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 2099.00, "minScore": 0, "name": "Redmi K20[2种规格]", "numberFav": 28, "numberGoodReputation": 1, "numberOrders": 29, "numberReputation": 0, "numberSells": 30, "originalPrice": 2099.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/b30cd900-8034-4a0d-88af-62f6cf042577.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "propertyIds": ",13090,13093,", "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 80, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 58639, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37962, "characteristic": "骁龙8核高性能处理器，最高主频2.0GHz / 4000mAh超长续航，标配10W充电器 / 大字体，大音量，无线收音机 / AI人脸解锁 / 整机生活防泼溅 / 极简模式，亲情守护", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-06-20 09:24:09", "dateUpdate": "2023-03-17 01:53:47", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 144612, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 599.00, "minScore": 0, "name": "Redmi 7A[1种规格]", "numberFav": 18, "numberGoodReputation": 1, "numberOrders": 10, "numberReputation": 1, "numberSells": 198, "originalPrice": 599.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/1f78d465-6005-4671-943f-46964c665c29.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "priceShopSell": 0.00, "propertyIds": ",13093,", "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 0, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unit": "份", "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 21889, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37963, "characteristic": "小米AI音箱 / 能播音乐 / 讲故事 / 听相声 / 查路况 / 设闹钟 / 还能控制智能设备", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-06-04 10:35:47", "dateUpdate": "2023-03-17 03:56:14", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 141766, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 299.00, "minScore": 0, "name": "小米AI音箱[无规格]", "numberFav": 20, "numberGoodReputation": 2, "numberOrders": 10, "numberReputation": 0, "numberSells": 106, "originalPrice": 299.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/e1b571e2-7a67-4fc8-87e9-e1dd3e0f56e5.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "recommendStatus": 1, "recommendStatusStr": "推荐", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 998, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 13613, "weight": 0.00 }, { "afterSale": "0,1,2", "categoryId": 37962, "characteristic": "相机全新升级 / 960帧超慢动作 / 手持超级夜景 / 全球首款双频GPS / 骁龙845处理器 / 红外人脸解锁 / AI变焦双摄 / 三星 AMOLED 屏", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2019-05-27 15:02:52", "dateUpdate": "2023-03-16 19:44:26", "fxType": 2, "gotScore": 0, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 139133, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 0, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 2599.00, "minScore": 0, "name": "小米8[虚拟商品]", "numberFav": 27, "numberGoodReputation": 2, "numberOrders": 25, "numberReputation": 0, "numberSells": 34, "originalPrice": 2999.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/9ebdb53d-aa8e-48e6-ba71-2dc8ceea3259.jpg", "pingtuan": false, "pingtuanPrice": 0.00, "propertyIds": ",13090,13093,", "recommendStatus": 0, "recommendStatusStr": "普通", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 94, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 22716, "weight": 0.00 }], "totalPage": 2, "totalRow": 12 }, "msg": "success" }

})




router.get('/shop/goods/category/all', async function (ctx, next) {
  ctx.body = { "code": 0, "data": [{ "id": 272693, "isUse": true, "level": 1, "name": "测试分类", "paixu": 0, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37962, "isUse": true, "level": 1, "name": "手机", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37963, "isUse": true, "level": 1, "name": "智能", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37964, "isUse": true, "level": 1, "name": "电视", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37965, "isUse": true, "level": 1, "name": "家电", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37966, "isUse": true, "level": 1, "name": "笔记本", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }, { "id": 37967, "isUse": true, "level": 1, "name": "生活周边", "paixu": 1, "pid": 0, "shopId": 0, "userId": 1605 }], "msg": "success" }
})

router.get('/shopping-cart/info', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "goodsStatus": [{ "id": 153331, "sellEnd": false, "sellStart": true, "status": 0, "statusStr": "上架", "stores": 977 }, { "id": 144614, "sellEnd": false, "sellStart": true, "status": 0, "statusStr": "上架", "stores": 80 }], "items": [{ "categoryId": 37963, "goodsId": 153331, "key": "37f5e16926d1eefa448f22b962edcd24", "logisticsId": 4727, "minBuyNumber": 1, "name": "小米手环4[砍价]", "number": 1, "overseas": false, "pic": "https://cdn.it120.cc/apifactory/2019/07/18/85d3a148-f88f-4fe1-8c6c-9d16638dd9ef.jpg", "price": 169.00, "score": 0, "selected": true, "shopId": 0, "status": 0, "statusStr": "上架", "stores": 977, "type": 0, "weight": 0.00 }, { "categoryId": 37962, "goodsId": 144614, "key": "7b6d7d44d73bace9079e125a6a08e2ec", "logisticsId": 4727, "minBuyNumber": 1, "name": "Redmi K20[2种规格]", "number": 1, "overseas": false, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/b30cd900-8034-4a0d-88af-62f6cf042577.jpg", "price": 2099.00, "score": 0, "selected": true, "shopId": 0, "sku": [{ "optionId": 13090, "optionName": "版本", "optionValueId": 49809, "optionValueName": "6GB+128GB" }, { "optionId": 13093, "optionName": "颜色", "optionValueId": 52622, "optionValueName": "冰川蓝" }], "status": 0, "statusStr": "上架", "stores": 95, "type": 0, "weight": 0.00 }], "number": 2, "price": 2268.00, "score": 0, "shopList": [{ "id": 0, "name": "其他", "serviceDistance": 99999999 }] }, "msg": "success" }
})


router.get('/shop/goods/detail', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "basicInfo": { "afterSale": "0", "categoryId": 272693, "characteristic": "本商城所有商品，都是测试商品，仅限线上调试，模拟交易流程", "commission": 0.00, "commissionSettleType": 0, "commissionType": 0, "commissionUserType": 0, "dateAdd": "2022-02-04 12:14:12", "dateUpdate": "2023-03-17 04:54:50", "discountPrice": 0.00, "fxType": 2, "gotScore": 500, "gotScoreType": 0, "hasAddition": false, "hasTourJourney": false, "hidden": 0, "id": 1052000, "kanjia": false, "kanjiaPrice": 0.00, "limitation": false, "logisticsId": 4727, "maxCoupons": 1, "miaosha": false, "minBuyNumber": 1, "minPrice": 1.00, "minPriceOriginal": 1.00, "minScore": 0, "name": "实物商品（购买时需填写收货地址，支持售后）", "numberFav": 1, "numberGoodReputation": 5, "numberOrders": 112, "numberReputation": 5, "numberSells": 10066, "originalPrice": 199.00, "overseas": false, "paixu": 0, "persion": 0, "pic": "https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png", "pingtuan": false, "pingtuanPrice": 0.00, "priceShopSell": 0.00, "recommendStatus": 1, "recommendStatusStr": "推荐", "seckillBuyNumber": 0, "sellEnd": false, "sellStart": true, "shopId": 0, "status": 0, "statusStr": "上架", "storeAlert": false, "stores": 932, "stores0Unsale": false, "storesExt1": 0, "storesExt2": 0, "type": 0, "unit": "件", "unusefulNumber": 0, "usefulNumber": 0, "userId": 1605, "vetStatus": 1, "views": 77503, "weight": 0.00 }, "category": { "id": 272693, "isUse": true, "name": "测试分类", "paixu": 0, "pid": 0, "shopId": 0, "userId": 1605 }, "content": "<p><font color=\"#E03E2D\">【特别提醒】</font><br /><font color=\"#E03E2D\">1.测试商品，仅限调试。</font><br /><font color=\"#E03E2D\">2.下单消费，个人中心 -&gt; 积分兑换 -&gt; 兑换成余额进行消费。</font><br /><font color=\"#E03E2D\">2.实物商品购买时需要填写收货地址，订单使用快递发货。</font></p>\n<p><font color=\"#E03E2D\"><img src=\"https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png\" alt=\"\" width=\"640\" height=\"640\" /></font></p>\n<p>&nbsp;</p>\n<p><audio style=\"display: none;\" controls=\"controls\"></audio></p>", "extJson": {}, "extJson2": {}, "logistics": { "details": [], "feeType": 0, "feeTypeStr": "按件数", "isFree": true }, "pics": [{ "goodsId": 1052000, "id": 5888373, "pic": "https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png", "userId": 1605 }], "pics2": ["https://dcdn.it120.cc/2022/02/04/fa78ff5e-553f-40f2-8c78-b7ab8ed8bd39.png"], "subPics": [] }, "msg": "success" }
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

router.post('/user/shipping-address/list/v2', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "result": [{ "address": "Thuu", "areaStr": "东城区", "cityId": "110100", "cityStr": "-", "dateAdd": "2023-03-17 01:55:20", "dateUpdate": "2023-03-17 01:55:44", "districtId": "110101", "id": 560611, "isDefault": false, "linkMan": "Ghhj", "mobile": "15557155555", "provinceId": "110000", "provinceStr": "北京市", "status": 0, "statusStr": "正常", "uid": 7448958, "userId": 1605 }], "totalPage": 1, "totalRow": 1 }, "msg": "success" }
})


router.get('/user/shipping-address/detail/v2', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "extJson": {}, "info": { "address": "Thuu", "areaStr": "东城区", "cityId": "110100", "cityStr": "-", "dateAdd": "2023-03-17 01:55:20", "dateUpdate": "2023-03-17 01:55:44", "districtId": "110101", "id": 560611, "isDefault": false, "linkMan": "Ghhj", "mobile": "15557155555", "provinceId": "110000", "provinceStr": "北京市", "status": 0, "statusStr": "正常", "uid": 7448958, "userId": 1605 } }, "msg": "success" }
})

router.post('/user/shipping-address/update', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})

router.post('/user/shipping-address/add', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})
router.post('/user/shipping-address/delete', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})


router.post('/shopping-cart/modifyNumber', async function (ctx, next) {
  ctx.body = { "code": 0, "data": { "goodsStatus": [{ "id": 153331, "sellEnd": false, "sellStart": true, "status": 0, "statusStr": "上架", "stores": 971 }, { "id": 144614, "sellEnd": false, "sellStart": true, "status": 0, "statusStr": "上架", "stores": 79 }], "items": [{ "categoryId": 37963, "goodsId": 153331, "key": "37f5e16926d1eefa448f22b962edcd24", "logisticsId": 4727, "minBuyNumber": 1, "name": "小米手环4[砍价]", "number": 2, "overseas": false, "pic": "https://cdn.it120.cc/apifactory/2019/07/18/85d3a148-f88f-4fe1-8c6c-9d16638dd9ef.jpg", "price": 169.00, "score": 0, "selected": true, "shopId": 0, "status": 0, "statusStr": "上架", "stores": 971, "type": 0, "weight": 0.00 }, { "categoryId": 37962, "goodsId": 144614, "key": "7b6d7d44d73bace9079e125a6a08e2ec", "logisticsId": 4727, "minBuyNumber": 1, "name": "Redmi K20[2种规格]", "number": 1, "overseas": false, "pic": "https://cdn.it120.cc/apifactory/2019/06/20/b30cd900-8034-4a0d-88af-62f6cf042577.jpg", "price": 2099.00, "score": 0, "selected": true, "shopId": 0, "sku": [{ "optionId": 13090, "optionName": "版本", "optionValueId": 49809, "optionValueName": "6GB+128GB" }, { "optionId": 13093, "optionName": "颜色", "optionValueId": 52622, "optionValueName": "冰川蓝" }], "status": 0, "statusStr": "上架", "stores": 95, "type": 0, "weight": 0.00 }], "number": 3, "price": 2437.00, "score": 0, "shopList": [{ "id": 0, "name": "其他", "serviceDistance": 99999999 }] }, "msg": "success" }
})


router.post('/shopping-cart/empty', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
})

router.post('/shopping-cart/add', async function (ctx, next) {
  ctx.body = { "code": 0, "msg": "success" }
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

router.post('/dfs/upload/file', async function (ctx, next) {
  let form = new formidable.IncomingForm()
  form.parse(ctx.req, function (err, fields, files) {
    fs.copyFileSync(files.upfile.filepath, path.join(__dirname, '../public/upload', '111.png'))
  })
  ctx.body = { "code": 0, "data": { "id": "3090661", "msg": "SUCCESS", "name": "cuser/1605/2023/03/24/7687072f-093f-4f2d-8620-a7703fcfc931.png", "originalName": "20da2bc9-bb53-4183-a553-d1b4805f4ed6.png", "size": "2318", "type": ".png", "url": "https://dcdn.it120.cc/cuser/1605/2023/03/24/7687072f-093f-4f2d-8620-a7703fcfc931.png" }, "msg": "success" }
})











module.exports = router