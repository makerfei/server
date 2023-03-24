const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/dfs')
var formidable = require('formidable');
const path = require('path')
const fs = require('fs')
router.post('/upload/file', async function (ctx, next) {
    let form = new formidable.IncomingForm()
    let userId = ctx.session.userId;

    ctx.body = await new Promise((res, inj) => {
        form.parse(ctx.req,async function (err, fields, files) {
            let fileType =   String(files.upfile.originalFilename).split('.')[1] || '';
            let fileName = new Date().getTime();
            let fullPath = `upload/${fileName}.${fileType}`
            fs.copyFileSync(files.upfile.filepath, path.join(__dirname, `../public/upload`, `${fileName}.${fileType}`))
            // await sql.promiseCall(`update user set avatar = '${fullPath}'  where id =${userId}`);
            res({ "code": 0, "data": { "url": fullPath }, "msg": "success" })
        })
    })




})
module.exports = router