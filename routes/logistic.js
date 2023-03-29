const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/logistic')

router.post('/upload/file', async function (ctx, next) {
    let form = new formidable.IncomingForm()
    let userId = ctx.session.userId;

    ctx.body = await new Promise((res, inj) => {
        form.parse(ctx.req,async function (err, fields, files) {
            let fileType =   String(files.upfile.originalFilename).split('.')[1] || 'png';
            let fileName = new Date().getTime();
            let fullPath = `upload/${fileName}.${fileType}`
            fs.copyFileSync(files.upfile.filepath, path.join(__dirname, `../public/upload`, `${fileName}.${fileType}`));

            fs.writeSync()
            res({ "code": 0, "data": { "url": fullPath }, "msg": "success" })
        })
    })
})
module.exports = router