const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/shopping-cart')

let getCartLit = function (userId) {
    return new Promise(async (resolve, reject) => {
        let errText = ''
        let cartList = [];
        let totalNumber = 0;
        let totalPrice = 0;
        //获取购物车列表
        if (!errText) {
            let cartListSql = await sql.promiseCall({ sql: `select * ,id as 'key' from shoppingcart where userId = ${userId} `, values: [] })
            if (!cartListSql.error) {
                cartList = cartListSql.results;
            } else {
                errText = cartListSql.error.message;
            }
        }
        if (!errText & cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                let item = cartList[i];
                let cartgoods = await sql.promiseCall({ sql: `select properties,logisticsId,name,pic,minPrice as price,stores,status from goods where id = ${item.goodsId} `, values: [] })
                if (!cartgoods.error) {
                    if (cartgoods.results.length > 0) {
                        cartList[i] = { ...cartList[i], ...cartgoods.results[0] }
                    }
                } else {
                    errText = cartgoods.error.message;
                }

            }
        }
        //循环判断是否是分类
        if (!errText & cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                let item = cartList[i];
                if (item.sku) {
                    let cartgoods = await sql.promiseCall({ sql: `select price,stores from skulist where  propertyChildIds = '${item.sku}' and goodsId = ${item.goodsId} `, values: [] })
                    if (!cartgoods.error) {
                        if (cartgoods.results.length > 0) {
                            cartList[i] = { ...cartList[i], ...cartgoods.results[0] }
                        }
                    } else {
                        errText = cartgoods.error.message;
                    }
                }
            }
        }
        //sku 加入
        if (!errText & cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                let item = cartList[i];
                let propertiesJson = JSON.parse(item.properties);
                item.properties = propertiesJson;
                if (item.sku) {
                    let skuListData = []
                    let skulist = item.sku.split(',');
                    for (let j = 0; j < skulist.length; j++) {
                        if (skulist[j]) {
                            let skuItem = skulist[j].split(':');

                            propertiesJson.map(type => {
                                type.childsCurGoods.map(v => {
                                    if (skuItem[0] == type.id && skuItem[1] == v.id) {
                                        skuListData.push({ optionId: skuItem[0], optionName: type.name, optionValueId: skuItem[1], optionValueName: v.name })
                                    }
                                })
                            })
                        }
                    }

                    cartList[i] = {
                        ...cartList[i],
                        sku: skuListData
                    };

                } else {
                    cartList[i] = {
                        ...cartList[i],
                        sku: undefined
                    };
                }
            }
        }

        if (!errText) {
            cartList.map(item => {
                totalNumber += item.number,
                    totalPrice += item.number * item.price;
            })
        }



        if (!errText) {
            resolve({
                code: 0, data: {
                    items: cartList.map(item => {
                        return {
                            ...item,
                            price: Number(item.price / 100).toFixed(2)
                        }
                    }),
                    number: totalNumber,
                    price: totalPrice,


                }, msg: "success"
            })
        } else {
            resolve({ code: -1, msg: errText })
        }
    })
}



//购物车详情 
router.all('/info', async function (ctx, next) {
    ctx.body = await getCartLit(ctx.session.userId);
})

router.post('/remove', async function (ctx, next) {
    let { key } = ctx.request.body;
    let delsql = await sql.promiseCall({ sql: `delete from shoppingcart  where id in(${key}) `, values: [] })
    ctx.body = await getCartLit(ctx.session.userId);
})

router.post('/modifyNumber', async function (ctx, next) {
    let { number, key } = ctx.request.body;
    await sql.promiseCall({ sql: `update  shoppingcart set number=${number} where id =${key} and userId = ${ctx.session.userId}  `, values: [] })
    ctx.body = await getCartLit(ctx.session.userId);
})

router.post('/empty', async function (ctx, next) {
    let delsql = await sql.promiseCall({ sql: `delete from shoppingcart  where userId =${ctx.session.userId} `, values: [] })
    ctx.body = await getCartLit(ctx.session.userId);
})

router.post('/add', async function (ctx, next) {
    let { goodsId, number, sku = '' } = ctx.request.body;
    if (sku) {
        sku = JSON.parse(sku)
        sku = sku.map(item => { return `${item.optionId}:${item.optionValueId}` });
        sku = `${sku.join(',')},`
    }
    let userId = ctx.session.userId;
    let errText = "";
    let exitId = 0;
    let exitNumber = 0;


    //查询购物车是否已经超过5个
    if (!errText) {
        let cartCountSql = await sql.promiseCall({ sql: `select count(*) as count from shoppingcart where userId = ${userId} `, values: [] })
        if (!cartCountSql.error) {
            if (cartCountSql.results.length > 0 && cartCountSql.results[0].count >= 5) {
                errText = "购物车最多添加五个商品";
            }
        } else {
            errText = cartCountSql.error.message
        }

    }
    //查询是否有这样难过的商品
    if (!errText) {
        let cartListSql = await sql.promiseCall({ sql: `select number,id from shoppingcart where goodsId=${goodsId} and sku ='${sku}' and userId = ${userId}  limit 0,1`, values: [] })
        if (!cartListSql.error) {
            if (cartListSql.results.length > 0) {
                exitId = cartListSql.results[0].id;
                exitNumber = cartListSql.results[0].number
            }
        } else {
            errText = cartListSql.error.message
        }
    }


    //更新购物车数量
    if (!errText && exitId) {
        let cartUpdataSql = await sql.promiseCall({ sql: `update  shoppingcart set number = ${Number(exitNumber) + Number(number)}  where id= ${exitId}`, values: [] })
        if (cartUpdataSql.error) {
            errText = cartUpdataSql.error.message
        }
    }
    if (!errText && !exitId) {
        let cartInsetSql = await sql.promiseCall({ sql: `INSERT INTO shoppingcart (goodsId, number, sku, userId) VALUES(${goodsId}, ${number},  '${sku}', ${userId})`, values: [] })
        if (cartInsetSql.error) {
            errText = cartInsetSql.error.message
        }
    }
    if (!errText) {
        ctx.body = { "code": 0, "msg": "success" }
    } else {
        ctx.body = { code: -1, msg: errText }
    }


})


module.exports = router