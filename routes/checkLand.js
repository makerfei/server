const router = require('koa-router')()
const sql = require('../tool/sqlConfig')

const svgCaptcha = require('svg-captcha')
router.prefix('/api')

//登录
router.post('/login', async function (ctx, next) {
    const { mobile, deviceId, deviceName, pwd, token } = ctx?.request?.body;
    let res = await sql.promiseCall(`select id from user where password = '${pwd}' and mobile = '${mobile}'`);
    if (res.results && res.results.length > 0) {
        ctx.session.userId = res.results[0].id;
        await sql.promiseCall(`update user set last_login_ip = '${ctx.ip}' ,last_login_time = ${Number(new Date().getTime() / 1000).toFixed(0)}  where id =${res.results[0].id}`);
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
        let res = await sql.promiseCall(`select id from user where  mobile = '${mobile}'`);
        if (!res.error && res.results.length > 0) {
            await sql.promiseCall(`update user set last_login_ip = '${ctx.ip}' ,last_login_time = ${Number(new Date().getTime() / 1000).toFixed(0)}  where id =${res.results[0].id}`);
            insertId = res.results[0].id;
        } else {
            errText = "请先注册！"
        }
    }
    if (!errText) {
        ctx.session.userId = insertId;
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
        ctx.session.imgCodeMobile = mobile;
        ctx.session.RegisterSMSVerificationCode = '1234'
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
        let count = await sql.promiseCall(`select count(*) as res from user where mobile = '${mobile}'`);
        if (count.error || count.results[0].res > 0) {
            errText = "手机号已被注册！"
        }
    }
   

    if (!errText) {
        let sqlstr = `INSERT INTO user ( username, password,  register_time,mobile , register_ip)VALUES(
            "${nick}",
            "${pwd}",
            ${Number(new Date().getTime() / 1000).toFixed(0)},
           "${mobile}",
            "${ctx.ip}")`;
        let sqlRes = await sql.promiseCall(sqlstr);
        if (!sqlRes.error && sqlRes.results.insertId) {
            insertId = sqlRes.results.insertId;
        } else {
            errText = sqlRes.error.message
        }
    }

    if (!errText) {
        let Sqllevel = await sql.promiseCall(`INSERT INTO level(dateAdd,user_id) VALUES(${Number(new Date().getTime() / 1000).toFixed(0)},${insertId})`);
        if (Sqllevel.error ) {
            errText = Sqllevel.error.message
        }
    }

    if (!errText) {
        let Sqlamount = await sql.promiseCall(`INSERT INTO amount(user_id) VALUES(${insertId})`);
        if (Sqlamount.error) {
            errText = Sqlamount.error.message
        }
    }

    if (!errText) {
        ctx.session.userId = insertId;
        ctx.body = { "code": 0, "data": { "token": insertId, "uid": insertId }, "msg": "success" }
    } else {
        ctx.body = { "code": -1, "msg": errText }
    }

})



const adminIndex = (app) => {
    app.use(async (ctx, next) => {
        let needLand = true
        if ((ctx.originalUrl.indexOf('/api/user') === 0 ||
            ctx.originalUrl.indexOf('/api/admin') === 0 ||
            ctx.originalUrl.indexOf('/api/dfs') === 0 ||
            ctx.originalUrl.indexOf('/api/shopping-cart') === 0 ||
            ctx.originalUrl.indexOf('/api/order') === 0)
            && !ctx.session.userId) {
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
