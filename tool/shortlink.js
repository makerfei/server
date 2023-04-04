

var config = require('../config/sql')
let shortlink = (ctx, data, cookie) => {
    let returnUrl = ''
    switch (data.type) {
        case 'main':
            returnUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxb3ac0230f6387556&redirect_uri=https://mgdg.shop&response_type=code&scope=${data.data}&state=${data.data}#wechat_redirect`
            break;
        case 'wx':
            if (data.data === 'kf') {
                returnUrl = `https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzg3MzI2NDcwNw==#wechat_redirect`
            }
            break;
            case 'img':
                if (data.data === 'main') {
                    returnUrl = `https://mgdg.shop/logo.jpg`
                }
                break;
        default:
            break;
    }
    ctx.redirect(returnUrl)
}

module.exports = shortlink