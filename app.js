const Koa = require('koa')
const app = new Koa()
const cors = require('koa2-cors')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session');
const adminIndex = require('./routes/checkLand')
const users = require('./routes/users')
const order = require('./routes/order')
const discounts = require('./routes/discounts')
const comm = require('./routes/comm')
const dfs = require('./routes/dfs')
const shop = require('./routes/shop')
const shoppingCart = require('./routes/shoppingcart')
const admin = require('./routes/admin/index')
const reptile = require('./routes/reptile')
const logistic = require('./routes/logistic')
const wx = require('./routes/wx')
//定时任务
const schedule = require('./tool/schedule');
schedule()
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

app.use(
  cors({
    origin: function (ctx) { //设置允许来自指定域名请求
      return '*'
      //return 'https://www.mgdg.shop'; //只允许http://localhost:8080这个域名的请求
    },
    maxAge: 5, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
  }))



app.use(views(__dirname + '/views', {
  extension: 'pug'
}))
app.use(require('koa-static')(__dirname + '/public'))

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })



const session_signed_key = ["some secret hurr"];  // 这个是配合signed属性的签名key
const session_config = {
  key: 'koa:sess', /**  cookie的key。 (默认是 koa:sess) */
  maxAge: 1000 * 60 * 10,   /**  session 过期时间，以毫秒ms为单位计算 。*/
  autoCommit: true, /** 自动提交到响应头。(默认是 true) */
  overwrite: true, /** 是否允许重写 。(默认是 true) */
  httpOnly: true, /** 是否设置HttpOnly，如果在Cookie中设置了"HttpOnly"属性，那么通过程序(JS脚本、Applet等)将无法读取到Cookie信息，这样能有效的防止XSS攻击。  (默认 true) */
  signed: true, /** 是否签名。(默认是 true) */
  rolling: true, /** 是否每次响应时刷新Session的有效期。(默认是 false) */
  renew: false, /** 是否在Session快过期时刷新Session的有效期。(默认是 false) */
};

app.keys = session_signed_key	// session加密字段
app.use(session(session_config, app))



// routes
//app登录限制
adminIndex(app);


app.use(wx.routes(), wx.allowedMethods())
app.use(logistic.routes(), logistic.allowedMethods())
app.use(reptile.routes(), reptile.allowedMethods())
app.use(admin.routes(), admin.allowedMethods())
app.use(shoppingCart.routes(), shoppingCart.allowedMethods())
app.use(shop.routes(), shop.allowedMethods())
app.use(dfs.routes(), dfs.allowedMethods())
app.use(comm.routes(), comm.allowedMethods())
app.use(discounts.routes(), discounts.allowedMethods())
app.use(order.routes(), order.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
