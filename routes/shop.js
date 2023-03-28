const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/shop/goods')


//获取商品评价
router.post('/reputation/v2', async function (ctx, next) {
    let { goodsId, page = 1, pageSize = 10 } = ctx.request.body;
    let errText = ''
    let goodsList = [];
    let totalRow = 0;
    //查询条数
    if (!errText) {
        let goodsSql = await sql.promiseCall({sql:`select a.*,b.username,b.mobile,b.avatar as avatarUrl  from reputations as a left join user as b on a.userId = b.id where a.goodsId = ${goodsId} ORDER BY id desc
        LIMIT ${(page - 1) * pageSize},${pageSize} `,values:[]});
        if (!goodsSql.error) {
            goodsSql.results.map(item => {
                let { reputation, remark, avatarUrl, mobile, username ,id,dateAdd} = item
                goodsList.push(
                    {
                        goods: {dateReputation:dateAdd, goodReputationStr:reputation, goodReputationRemark:remark, uid:id},
                        user: { avatarUrl, mobile, username,uid:id }
                    }
                )
            })
        } else {
            errText = goodsSql.error.message
        }
    }

    //查询数量
    if (!errText) {
        let goodsSql = await sql.promiseCall({sql:`select count(*) as count from reputations where goodsId = ${goodsId}`,values:[]});
        if (!goodsSql.error) {
            totalRow = goodsSql.results[0].count
        } else {
            errText = goodsSql.error.message
        }
    }

    if (!errText) {
        ctx.body = {
            code: 0,
            data: {
                result: goodsList,
                totalPage: Math.ceil(totalRow / pageSize),
                totalRow: totalRow,
            },
            msg: 'success'
        }
    } else {
        ctx.body = { code: -1, msg: errText }
    }


})

//获取商品类目
router.get('/category/all', async function (ctx, next) {
    let categorySql = await sql.promiseCall({sql:`select * from category where isUse = 1 ORDER BY paixu ASC`,values:[]});
    if (!categorySql.error) {
        ctx.body = { "code": 0, "data": categorySql.results, "msg": "success" }
    } else {
        ctx.body = { code: -1, msg: categorySql.error.message }
    }
})

//获取商品列表
router.post('/list/v2', async function (ctx, next) {
    let { categoryId, page = 1, pageSize = 10 } = ctx.request.body;
    let errortxt = ''
    let whereSqlTxt = ''
    let resCount = 0;
    let resList = []

    if (categoryId) {
        whereSqlTxt = ` where categoryId = ${categoryId} `
    }

    let goodsCountSql = await sql.promiseCall({sql:`select count(*) as count from goods  ${whereSqlTxt} `,values:[]});
    if (!goodsCountSql.error) {
        resCount = goodsCountSql?.results?.[0]?.count || 0
    } else {
        errortxt = goodsCountSql.error.message
    }

    if (!errortxt) {
        let goodsSql = await sql.promiseCall({sql:`select  id,pic ,name,originalPrice, minPrice,recommendStatus   from goods  ${whereSqlTxt} ORDER BY recommendStatus DESC   LIMIT ${(page - 1) * pageSize},${pageSize} `,values:[]});
        if (!goodsSql.error) {
            resList = goodsSql?.results || []
        } else {
            errortxt = goodsSql.error.message
        }
    }

    if (!errortxt) {
        ctx.body = {
            "code": 0, "data": {
                totalPage: Math.ceil(resCount / pageSize), totalRow: resCount,
                result: resList
            }, "msg": "success"
        }
    } else {
        ctx.body = { code: -1, msg: errortxt }
    }
})

//获取商品详情
router.get('/detail', async function (ctx, next) {
    let { id } = ctx.request.query;
    let errortxt = "";
    let goodsCon = {};
    let categoryPid = 0

    if (!id) {
        errortxt = '暂无数据';
    }

    if (!errortxt) {
        let goodsSql = await sql.promiseCall({sql:`select *  from goods where id = ${id}`,values:[]});
        if (!goodsSql.error) {
            if (goodsSql?.results.length > 0) {
                goodsCon.basicInfo = goodsSql?.results[0];
                goodsCon.content = goodsCon.basicInfo.content;
                goodsCon.basicInfo.content = undefined;
                goodsCon.basicInfo.statusStr = goodsCon.basicInfo.status===1?'商品已下架':''
                categoryPid = goodsCon.basicInfo.categoryId
                //物流信息
                goodsCon.logistics = {
                    "details": [{ "addAmount": 5.00, "addNumber": 1.00, "firstAmount": 5.00, "firstNumber": 1.00, "type": 2, "userId": 1605 }, { "addAmount": 5.00, "addNumber": 1.00, "firstAmount": 5.00, "firstNumber": 1.00, "type": 1, "userId": 1605 }, { "addAmount": 10.00, "addNumber": 1.00, "firstAmount": 10.00, "firstNumber": 1.00, "type": 0, "userId": 1605 }],
                    feeType: goodsCon.basicInfo.feeType,
                    isFree: goodsCon.basicInfo.isFree
                }
            } else {
                errortxt = '暂无数据';
            }
        } else {
            errortxt = goodsSql.error.message
        }
    }


    //分类信息获取
    if (!errortxt && categoryPid) {
        let categorySql = await sql.promiseCall({sql:`select * from category where pid = ${categoryPid} LIMIT 0,1`,values:[]});
        if (!categorySql.error) {
            goodsCon.category = categorySql.results.length > 0 ? categorySql.results[0] : {}
        } else {
            errortxt = categorySql.error.message
        }
    }

    //获取图片信息
    if (!errortxt) {
        let picsSql = await sql.promiseCall({sql:`select * from pics where goodsId = ${id}`,values:[]});
        if (!picsSql.error) {
            goodsCon.pics = picsSql.results.length > 0 ? picsSql.results : []

            goodsCon.pics2 = goodsCon.pics.map((item) => item.pic)
        } else {
            errortxt = picsSql.error.message
        }
    }


    //获取sku
    if (!errortxt) {
        let skuliatSql = await sql.promiseCall({sql:`select * from skuList where goodsId = ${id}`,values:[]});
        if (!skuliatSql.error) {
            goodsCon.skuList = skuliatSql.results.map(item=>{
                return {...item,propertyChildIds:item.propertyChildIds+','}
            })
        } else {
            errortxt = skuliatSql.error.message
        }
    }
    //获取properties

    if (!errortxt && goodsCon.skuList.length > 0) {
        goodsCon.properties = [];
        let propertiesIdliststr = goodsCon.skuList[0].propertyChildIds.split(',');
        for (i = 0; i < propertiesIdliststr.length; i++) {
            let properties = propertiesIdliststr[i].split(':')[0];
            if (properties) {
                let propertiesItem = {};

                let propertiesSql = await sql.promiseCall({sql:`select * from properties where id = ${properties} LIMIT 0,1`,values:[]});
                if (!propertiesSql.error) {
                    propertiesItem = propertiesSql.results.length > 0 ? propertiesSql.results[0] : {}
                } else {
                    errortxt = propertiesSql.error.message
                }

                let childsCurGoodsSql = await sql.promiseCall({sql:`select * from childsCurGoods where propertyId = ${properties}`,values:[]});
                if (!childsCurGoodsSql.error) {
                    propertiesItem.childsCurGoods = childsCurGoodsSql.results;
                } else {
                    errortxt = childsCurGoodsSql.error.message
                }
                goodsCon.properties.push(propertiesItem)
            }

        }


    }
    if (!errortxt) {
        ctx.body = { code: 0, data: goodsCon, msg: "success" }
    } else {
        ctx.body = { code: -1, msg: errortxt }
    }
})


module.exports = router