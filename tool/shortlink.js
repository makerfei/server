

var config = require('../config/sql')
let shortlink = (ctx, data, cookie) => {
    let returnUrl = ''
    let { shareId = '' } = ctx.request.query

    


    switch (data.type) {
        case 'main':
            let targetMain =  encodeURIComponent(`https://www.mgdg.shop/#/home?shareId=${shareId}`)
            returnUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb3ac0230f6387556&redirect_uri=${targetMain}&response_type=code&scope=snsapi_userinfo&state=snsapi_userinfo#wechat_redirect`
            break;
        case 'wx':
            if (data.data === 'kf') {
                returnUrl = `https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzg3MzI2NDcwNw==#wechat_redirect`
            }
            break;
        case 'goods':
            let targetGoods =  encodeURIComponent(`https://www.mgdg.shop/#/good/detail?id=${data.data}&shareId=${shareId}`)
            returnUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb3ac0230f6387556&redirect_uri=${targetGoods}&response_type=code&scope=snsapi_userinfo&state=snsapi_userinfo#wechat_redirect`
            break;
        default:
            break;
    }




    ctx.redirect(returnUrl)
}

module.exports = shortlink