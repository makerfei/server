const router = require('koa-router')()
const sql = require('../../tool/sqlConfig')
router.prefix('/api/admin')

//获取用户当前信息
router.get('/currentUser', async function (ctx, next) {
  let res = await sql.promiseCall({ sql: `select * from user where id =?`, values: [ctx.session.userId] });

  let { username: name = '', avatar = '', id: userId = '', email = '', signature = '', title = '', group = '' } = res.results[0] || {}

  ctx.body = {
    success: true,
    data: {
      name,
      avatar,
      userId,
      email,
      signature,   // '海纳百川，有容乃大',
      title,   //: '交互专家',
      group,  //: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
      tags: [
        {
          key: '0',
          label: '很有想法的',
        },
        {
          key: '1',
          label: '专注设计',
        },
        {
          key: '2',
          label: '辣~',
        },
        {
          key: '3',
          label: '大长腿',
        },
        {
          key: '4',
          label: '川妹子',
        },
        {
          key: '5',
          label: '海纳百川',
        },
      ],
      notifyCount: 12,
      unreadCount: 11,
      country: 'China',
      access: 'admin',
      geographic: {
        province: {
          label: '浙江省',
          key: '330000',
        },
        city: {
          label: '杭州市',
          key: '330100',
        },
      },
      address: '西湖区工专路 77 号',
      phone: '0752-268888888',
    }
  }
})

//后端退出登录
router.post('/outLogin', async function (ctx, next) {
  ctx.session.userId = 0
  ctx.session.userType = 0
  ctx.body = {
    status: 'ok',
    currentAuthority: 'admin',
  }

})


//获取用户列表
router.get('/userList', async function (ctx, next) {
  let query = ctx.request.query
  let { current = 1, pageSize = 10 } = query;
  let listVal = [];
  let listVarStr = ''
  for (const key in query) {
    if (key != 'current' && key != 'pageSize' && query[key] !== '') {
      listVarStr += listVarStr === '' ? ` where ${key}=? ` : ` and ${key}=? `
      listVal.push(query[key])
    }
  }
  let orderInfoSql = await sql.promiseCall({
    sql: `select *  from user   ${listVarStr}   order    by id desc limit ${(current - 1) * pageSize},${pageSize}  `,
    values: listVal
  })
  ctx.body = { "code": 0, "data": orderInfoSql.results || [], "msg": "success" }
})

//商品类目管理
router.post('/category/change', async function (ctx, next) {
  let { id = '', isUse = '', name = '', paixu = '', pid = '' } = ctx.request.body;
  if (id && name) {
    await sql.promiseCall({
      sql: `update category set isUse=?,name=?,paixu=?,pid=? where id=?`
      , values: [isUse, name, paixu, pid, id]
    })
  } else if (name) {
    await sql.promiseCall({
      sql: ` INSERT INTO category (isUse, name, paixu, pid) VALUES(?,?,?,?)`
      , values: [isUse, name, paixu, pid]
    })
  } else if (id) {
    await sql.promiseCall({
      sql: `delete  from category WHERE id=?`
      , values: [id]
    })
  }
  ctx.body = { code: 0, msg: 'success' }
})

//获取商品类目
router.get('/category/all', async function (ctx, next) {
  let categorySql = await sql.promiseCall({ sql: `select * from category   ORDER BY paixu ASC`, values: [] });
  if (!categorySql.error) {
    ctx.body = { "code": 0, "data": categorySql.results, "msg": "success" }
  } else {
    ctx.body = { code: -1, msg: categorySql.error.message }
  }
})


//banner管理
router.post('/banner/change', async function (ctx, next) {
  let { id = '', picUrl = '', linkUrl = '', title = '', paixu = '' ,remark='',type=''} = ctx.request.body;
  if (id && picUrl) {
    await sql.promiseCall({
      sql: `update banner set  picUrl = ?, linkUrl = ?, title = ?, paixu = ? ,remark=?,type=? where id=?`
      , values: [ picUrl , linkUrl , title , paixu  ,remark,type, id]
    })
  } else if (picUrl) {
    await sql.promiseCall({
      sql: ` INSERT INTO banner ( picUrl , linkUrl , title , paixu  ,remark,type) VALUES(?,?,?,?,?,?)`
      , values: [picUrl , linkUrl , title , paixu  ,remark,type]
    })
  } else if (id) {
    await sql.promiseCall({
      sql: `delete  from banner WHERE id=?`
      , values: [id]
    })
  }
  ctx.body = { code: 0, msg: 'success' }
})

//banner
router.get('/banner/list', async function (ctx, next) {
  let categorySql = await sql.promiseCall({ sql: `select * from banner   ORDER BY paixu ASC`, values: [] });
  if (!categorySql.error) {
    ctx.body = { "code": 0, "data": categorySql.results, "msg": "success" }
  } else {
    ctx.body = { code: -1, msg: categorySql.error.message }
  }
})

//获取商品列表
router.get('/goods/list', async function (ctx, next) {
  let query = ctx.request.query
  let { current = 1, pageSize = 10 } = query;
  let listVal = [];
  let listVarStr = ''
  for (const key in query) {
    if (key != 'current' && key != 'pageSize' && query[key] !== '') {
      listVarStr += listVarStr === '' ? ` where ${key}=? ` : ` and ${key}=? `
      listVal.push(query[key])
    }
  }
  let orderInfoSql = await sql.promiseCall({
    sql: `select id,categoryId,pic,name,minPrice,recommendStatus,stores,afterSale,status  from goods   ${listVarStr}   order    by id desc limit ${(current - 1) * pageSize},${pageSize}  `,
    values: listVal
  })
  ctx.body = { "code": 0, "data": orderInfoSql.results || [], "msg": "success" }
})


router.get('/goods/detail', async function (ctx, next) {
  let query = ctx.request.query
  let { id } = query;
  let orderInfoSql = await sql.promiseCall({
    sql: `select *  from goods    where id =? `,
    values: [id]
  })

  let picsListSql = await sql.promiseCall({
    sql: `select *  from pics    where goodsId =? `,
    values: [id]
  })

  let skulistSql = await sql.promiseCall({
    sql: `select *  from skulist    where goodsId =? `,
    values: [id]
  })

  ctx.body = {
    "code": 0, "data": {

      skulist:skulistSql.results||[],
      picsList: (picsListSql.results || []).map(item => {
        return {
          // ...item,
          uid: item.id,
          name:  item.pic,
          status: 'done',
          url: item.pic,
          saveType: item.type
        }
      }), ...orderInfoSql.results[0] || {}
    }, "msg": "success"
  }
})

router.post('/goods/picsAdd', async function (ctx, next) {
  let { goodsId, type, url } = ctx.request.body;
  let picsListSql = await sql.promiseCall({
    sql: `INSERT INTO pics ( goodsId, pic, type) VALUES (?, ?, ?)`,
    values: [goodsId, url, type]
  })
  ctx.body = { code: 0, data: picsListSql.results.insertId }
})

router.post('/goods/skuAdd', async function (ctx, next) {
  let { goodsId, img,originalPrice, price,stores,propertyChildIds} = ctx.request.body;
  let picsListSql = await sql.promiseCall({
    sql: `INSERT INTO skulist (  goodsId, img,originalPrice, price,stores,propertyChildIds) VALUES (?, ?, ?,?,?,?)`,
    values: [ goodsId, img,originalPrice, price,stores,propertyChildIds]
  })
  ctx.body = { code: 0, data: picsListSql.results.insertId }
})




router.post('/goods/picsDel', async function (ctx, next) {
  let { id } = ctx.request.body;
  let picsListSql = await sql.promiseCall({
    sql: `DELETE from pics where id = ?`,
    values: [id]
  })
  ctx.body = { code: 0 }
})








//商品详情修改
router.post('/goods/change', async function (ctx, next) {
  let insertId = 0;
  let { id = '', afterSale = '', categoryId = 0, characteristic = '', content = '', feeType = 0,
    isFree = 1, logisticsId = 1, minPrice = '', name = '', originalPrice = '',
    pic = '', recommendStatus = 0, status = '', stores = '',originUrl="" ,properties="[]"} = ctx.request.body;
  if (id && name) {
  let changeSel=  await sql.promiseCall({
      sql: `update goods set 
      afterSale = ?, categoryId = ?, characteristic = ?, content = ?, feeType = ?,
    isFree = ?, logisticsId = ?, minPrice = ?, name = ?, originalPrice = ?,
    pic = ?, recommendStatus = ?, status = ?, stores = ? , originUrl=?,properties=?
      where id=?`
      , values: [afterSale, categoryId, characteristic, content, feeType,
        isFree, logisticsId, minPrice, name, originalPrice,
        pic, recommendStatus, status, stores, originUrl,properties,id]
    }).then(({error,results})=>{
      
  })
  } else if (name) {
   insertId =  await sql.promiseCall({
      sql: ` INSERT INTO goods (afterSale, categoryId, characteristic, content, feeType,
        isFree, logisticsId, minPrice, name, originalPrice,
        pic, recommendStatus, status, stores,originUrl,properties) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      , values: [afterSale, categoryId, characteristic, content, feeType,
        isFree, logisticsId, minPrice, name, originalPrice,
        pic, recommendStatus, status, stores,originUrl,properties]
    }).then(({error,results})=>{
        return  results.insertId
    })
  } else if (id) {
    await sql.promiseCall({
      sql: `delete  from goods WHERE id=?`
      , values: [id]
    })
  }
  ctx.body = { code: 0, msg: 'success',data:{id:id||insertId} }
})
















module.exports = router
