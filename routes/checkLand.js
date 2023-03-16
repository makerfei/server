const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
const email = require('../tool/nodemailer')
//登录
router.post('/api/login', async function (ctx, next) {
    const { mobile, deviceId, deviceName, pwd, token } = ctx?.request?.body;
    let res = await sql.promiseCall(`select id from user where password = '${pwd}' and mobile = '${mobile}'`);
    if (res.results && res.results.length > 0) {
        ctx.session.userId = res.results[0].id;
        let a = await sql.promiseCall(`update user set last_login_ip = '${ctx.ip}' ,last_login_time = ${Number(new Date().getTime() / 1000).toFixed(0)}  where id =${res.results[0].id}`);
        ctx.body = {
            code: 0,
            "data": { "token": res.results[0].id, "uid": res.results[0].id },
            mes: "登录成功"
        }
    } else {
        ctx.body = { code: -2, mes: "登录失败，密码或账号错误" }
    }
})


router.post('/api/loginMobile', async function (ctx, next) {
    const { mobile, deviceId, deviceName, code, autoReg, token } = ctx?.request?.body;
    let res = await sql.promiseCall(`select id from user where  mobile = '${mobile}'`);
    if (res.results && res.results.length > 0) {
        ctx.session.userId = res.results[0].id;
        let a = await sql.promiseCall(`update user set last_login_ip = '${ctx.ip}' ,last_login_time = ${Number(new Date().getTime() / 1000).toFixed(0)}  where id =${res.results[0].id}`);
        ctx.body = {
            code: 0,
            "data": { "token": res.results[0].id, "uid": res.results[0].id },
            mes: "登录成功"
        }
    } else {
        ctx.body = { code: -2, mes: "登录失败，密码或账号错误" }
    }
})






//发送邮件
router.all('/api/email', async function (ctx, next) {
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


//注册
router.post('/api/register', async function (ctx, next) {
    const { mobile, code, nick, pwd, autoLogin } = ctx?.request?.body;
    let sqlstr = `INSERT INTO user ( username, password,  register_time, user_level_id,  mobile, register_ip)VALUES(
        "${nick}",
        "${pwd}",
        ${Number(new Date().getTime() / 1000).toFixed(0)},
        1,
       "${mobile}",
        "${ctx.ip}");
    `
    let sqlRes = await sql.promiseCall(sqlstr);
    if (sqlRes.results.insertId) {
        ctx.body = { "code": 0, "data": { "token": sqlRes.results.insertId, "uid": sqlRes.results.insertId }, "msg": "success" }
    } else {
        ctx.body = { "code": -1, "msg": "注册失败" }
    }
})








const adminIndex = (app) => {
    app.use(async (ctx, next) => {
        let needLand = true
        if ((ctx.originalUrl.indexOf('/api/user') === 0 ||
            ctx.originalUrl.indexOf('/api/admin') === 0
            || ctx.originalUrl.indexOf('/api/order') === 0)
            && !ctx.session.userId) {
            needLand = true;
        } else {
            needLand = false;
        }
        if (needLand) {
            ctx.body = { 'code': -1, msg: "请登录" }
        } else {
            await next();
        }
    })
    app.use(router.routes(), router.allowedMethods())
}


module.exports = adminIndex
