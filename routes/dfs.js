const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/dfs')
var formidable = require('formidable');
const path = require('path')
const fs = require('fs')
const sms = require('../config/sms')


var COS = require('cos-nodejs-sdk-v5');
var cos = new COS({
    SecretId: sms.secretId,
    SecretKey: sms.secretKey,
});


router.post('/upload/file', async function (ctx, next) {
    let form = new formidable.IncomingForm()
    let userId = ctx.session.userId;

    ctx.body = await new Promise((res, inj) => {
        form.parse(ctx.req, async function (err, fields, files) {
            let fileType = String(files.upfile.originalFilename).split('.')[1] || 'png';
            let fileName = new Date().getTime();
            let fullPathCos = `img/${fileName}.${fileType}`
           // fs.copyFileSync(files.upfile.filepath, path.join(__dirname, `../public/upload`, `${fileName}.${fileType}`));
            const filePath = files.upfile.filepath // 本地文件路径
          await  cos.putObject({
                Bucket: 'h5-1316824427', /* 填入您自己的存储桶，必须字段 */
                Region: 'ap-shanghai',  /* 存储桶所在地域，例如 ap-beijing，必须字段 */
                Key: fullPathCos,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
                StorageClass: 'STANDARD',
                /* 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息 */
                Body: fs.createReadStream(filePath), // 上传文件对象
                ContentLength: fs.statSync(filePath).size,
                onProgress: function (progressData) {
                    console.log(JSON.stringify(progressData));
                }
            }, function (err, data) {
                res({ "code": 0, "data": { "url":`https://www.mgdg.shop/${fullPathCos}`  }, "msg": "success" })
            });

          

        })
    })
})
module.exports = router