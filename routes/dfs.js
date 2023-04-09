const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api/dfs')
var formidable = require('formidable');
const path = require('path')
const fs = require('fs')
const sms = require('../config/sms')
const images = require("images");
const moment = require('moment');

var COS = require('cos-nodejs-sdk-v5');
var cos = new COS({
    SecretId: sms.secretId,
    SecretKey: sms.secretKey,
});


router.post('/upload/file', async function (ctx, next) {
    let form = new formidable.IncomingForm()


    ctx.body = await new Promise((res, inj) => {
        form.parse(ctx.req, async function (err, fields, files) {
            let filePath = files.upfile.filepath // 本地文件路径
            let cutSize = fields.cutSize || 1;
            let nodeCut = fields.nodeCut!=='false';


            //创建分类文件夹
            let dayFile = new moment().format('YYYY_MM_DD');
            const dayFilePath = path.join(__dirname, `../public/upload/${dayFile}`)
            let stats = fs.existsSync(dayFilePath)
            if (!stats) fs.mkdirSync(dayFilePath, true)


            let originType = String(files.upfile.originalFilename).split('.')[1] || 'png';
            let canCut = originType == 'png' || originType == 'jpeg' || originType == 'jpg'
            let fileType = canCut ? 'jpg' : originType;

            let fileName = new Date().getTime();
            let fullPathCos = `img/${dayFile}/${fileName}.${fileType}`
            // fs.copyFileSync(files.upfile.filepath, path.join(__dirname, `../public/upload`, `${fileName}.${fileType}`));

            //如果是图片且可以进行裁剪
            if (canCut) {
                filePath = await imgAndCompressCut(filePath, path.join(__dirname, `../public/upload/${dayFile}`, `${fileName}.${fileType}`), cutSize,nodeCut)
            }
            //上传到cos
            let cosLink = await upToCos(filePath, fullPathCos)
            res({ code: 0, data: { url: cosLink } })
        })
    })
})


//图片裁剪

const imgAndCompressCut = (filePath, fullLocalPath, cutSize = 1, nodeCut = true) => {
    return new Promise(async (res, inj) => {
        let img = images(filePath);
        let width = img._handle.width;
        let height = img._handle.height;

        let reSizeWidth = width;
        let reSizeHeigth = height;
        let left = 0;
        let top = 0
        if (nodeCut) {
            reSizeWidth = height * cutSize > width ? width : height * cutSize;
            reSizeHeigth = height * cutSize > width ? width / cutSize : height;
            left = height * cutSize > width ? 0 : (width - reSizeWidth) / 2;
            top = height * cutSize > width ? (height - reSizeHeigth) / 2 : 0;
        }
        await images(img, left, top, reSizeWidth, reSizeHeigth).resize(750).save(fullLocalPath, {
            quality: 90          //压缩图片质量
        });
        res(fullLocalPath)
    })

}








//传输到cos
const upToCos = (filePath, fullPathCos) => {
    return new Promise((res, inj) => {
        cos.putObject({
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
            res(`https://www.mgdg.shop/${fullPathCos}`)
        });

    })
}


module.exports = router