const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const svgCaptcha = require('svg-captcha')
const moment = require('moment');
router.prefix('/api')

const sms = require('../tool/sms')
const { loginPoint, userInster } = require('../tool/loginOrLogon')
const { get_client_ip } = require('../tool/wx')


//后端登录
router.post('/loginAdmin', async function (ctx, next) {
    let errText = ''
    const { autoLogin, password, type, username } = ctx?.request?.body;
    let res = await sql.promiseCall({ sql: `select id ,type from user where password = ? and mobile = ?`, values: [password, username] });
    if (res.results && res.results.length > 0) {

        if (res.results[0].type > 0) {
            let sqllogin = await sql.promiseCall({ sql: `update user set last_login_ip = '${get_client_ip(ctx.req)}' ,last_login_time = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'  where id =?`, values: [res.results[0].id] });
        } else {
            errText = '权限不够'
        }
    } else {
        errText = '账号密码错误'
    }

    if (!errText) {
        ctx.body = {
            status: 'ok',
            type,
            currentAuthority: 'admin',
        }
    } else {
        ctx.body = {
            status: 'error',
            type,
            currentAuthority: 'guest',
            message: errText
        }
    }
})


//登录
router.post('/login', async function (ctx, next) {
    const { mobile, deviceId, deviceName, pwd, token } = ctx?.request?.body;
    let res = await sql.promiseCall({ sql: `select id from user where password = ? and mobile = ?`, values: [pwd, mobile] });
    if (res.results && res.results.length > 0) {
        //登录更新最后登录时间
        await loginPoint({ ip: get_client_ip(ctx.req), userId: res.results[0].id })
        ctx.body = {
            code: 0,
            "data": { "token": res.results[0].id, "uid": res.results[0].id },
            msg: "success"
        }
    } else {
        ctx.body = { code: -1, msg: "登录失败，密码或账号错误" }
    }
})


router.post('/loginMobile', async function (ctx, next) {
    let errText = "";
    let insertId = "";
    const { mobile, deviceId, deviceName, code, autoReg, token } = ctx?.request?.body;
    //判断验证码
    if (ctx.session.RegisterSMSVerificationCode !== code || ctx.session.imgCodeMobile !== mobile) {
        errText = "短信验证码错误"
    }
    if (!errText) {
        let res = await sql.promiseCall({ sql: `select id from user where  mobile = ?`, values: [mobile] })
        if (!res.error && res.results.length > 0) {
            //登录更新最后登录时间
            await loginPoint({ ip: get_client_ip(ctx.req), userId: res.results[0].id })
            insertId = res.results[0].id;
        } else {
            //进行注册初始化
            insertId = await userInster({ mobile: mobile, register_ip: get_client_ip(ctx.req) })
            if (!insertId) {
                errText = "登录失败"
            }
        }
    }
    if (!errText) {
        ctx.body = {
            code: 0,
            "data": { "token": insertId, "uid": insertId },
            msg: "succcess"
        }
    } else {
        ctx.body = { code: -1, msg: errText }
    }
})



//判断图形验证码是否正确
router.get('/verification/sms/get', async function (ctx, next) {
    let errtxt = ""
    let { mobile, picCode } = ctx?.request?.query;
    picCode = String(picCode).toLowerCase()
    if (picCode !== ctx.session.imgCode) {
        errtxt = "图形验证码错误"
    }
    //发送验证码
    if (!errtxt) {
        let mathCode = Number(Math.random() * 8999 + 1000).toFixed(0);
        ctx.session.imgCodeMobile = mobile;
        ctx.session.RegisterSMSVerificationCode = mathCode;
        //进行短信发送
        sms(mobile, mathCode);

    }
    if (!errtxt) {
        ctx.body = { "code": 0, "msg": "success" };
    } else {
        ctx.body = { "code": -1, "msg": errtxt };
    }

})

//获取图形验证码
router.get('/verification/pic/get', async function (ctx, next) {
    let svg = svgCaptcha.create({
        height: 40,
        width: 160,
        size: 4,
        ignoreChars: '0o1i', // 验证码字符中排除 0o1i
        color: 'blue',
        background: '#ccc',
        noise: 2,
    });
    ctx.session.imgCode = String(svg.text).toLowerCase();
    console.log(svg.text)
    // 指定返回的类型
    ctx.response.type = 'image/svg+xml';
    ctx.body = svg.data;

})

//注册
router.post('/register', async function (ctx, next) {
    let errText = '';
    let insertId = ''
    const { mobile, code, nick, pwd, autoLogin } = ctx?.request?.body;
    //判断验证码
    if (ctx.session.RegisterSMSVerificationCode !== code || ctx.session.imgCodeMobile !== mobile) {
        errText = "短信验证码错误"
    }
    //判断电话是否被注册
    if (!errText) {
        let count = await sql.promiseCall({ sql: `select count(*) as res from user where mobile = ?`, values: [mobile] });
        if (count.error || count.results[0].res > 0) {
            errText = "手机号已被注册！"
        }
    }
    if (!errText) {
        //进行注册初始化
        insertId = await userInster({ mobile: mobile, register_ip: get_client_ip(ctx.req), password: pwd, username: nick })
        if(!insertId){
            errText = "注册失败"
        }
    }
    if (!errText) {
        ctx.body = { "code": 0, "data": { "token": insertId, "uid": insertId }, "msg": "success" }
    } else {
        ctx.body = { "code": -1, "msg": errText }
    }
})
const adminIndex = (app) => {
    app.use(async (ctx, next) => {
        
        let userId = ctx.request.body.token || ctx.request.query.token || '';
        if(userId){
            console.log(userId)
            ctx.session.userId =Number(userId);
        }
        let needLand = true
        if ((ctx.originalUrl.indexOf('/api/user') === 0 ||
            ctx.originalUrl.indexOf('/api/admin') === 0 ||
            ctx.originalUrl.indexOf('/api/dfs') === 0 ||
            ctx.originalUrl.indexOf('/api/shopping-cart') === 0 ||
            ctx.originalUrl.indexOf('/api/order') === 0)
            && !userId) {
            needLand = true;
        } else {
            needLand = false;
        }
        if (needLand) {
            ctx.body = { 'code': -999, msg: "请登录" }
        } else {
            await next();
        }
    })
    app.use(router.routes(), router.allowedMethods())
}


module.exports = adminIndex
