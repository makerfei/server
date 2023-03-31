const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/wx')
const { baseInfo ,snsapi_userinfo,wxLoginOrLogon} = require('../tool/wx')


router.get('/wxLogin', async function (ctx, next) {
    const { code ,state} = ctx.request.query;
    let token = ''
    let userInfo ={}
    let wxInfo = await baseInfo(code);
    if (wxInfo.openid) {
        let now = new Date().getTime()
        ctx.cookies.set('wxOpenid', wxInfo.openid, { expires:   new     Date(now + 100 * 24 * 60 * 60 * 1000)  })
    }
    if(wxInfo.scope==='snsapi_userinfo'){
        userInfo =await snsapi_userinfo(wxInfo.openid,wxInfo.access_token);
    }
    if(wxInfo.openid){
        token = await wxLoginOrLogon({wxInfo,userInfo})
        if(token)ctx.session.userId = token;
    }
  
    ctx.body = { code:0,data:{wxInfo,userInfo,token}  }
})


module.exports = router