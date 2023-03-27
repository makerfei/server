const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api')
const axios = require('axios')
const qs = require('qs')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

router.get('/reptile', async function (ctx, next) {


    //   let a =   await  axios({url:"https://detail.m.tmall.com/item.htm?abbucket=11&id=656309998168&ns=1&sku_properties=10004:709990523;5919063:6536025&spm=a230r.1.14.199.7cae6fbeQeBrhY",
    //   responseType: "arraybuffer", // 关键步骤
    //   responseEncoding: "utf8",})

    //   let utf8decoder = new TextDecoder("GBK"); // 关键步骤
    //   let html = utf8decoder.decode(a.data);

    let str = fs.readFileSync(path.join(__dirname, `./`, `index.html`), { encoding: 'utf8' })


    const $ = cheerio.load(str);
    let script = $('script');
    for (let i = 0; i < script.length; i++) {
        let s = script?.[i]?.children[0] && script?.[i]?.children[0].data || ''
        if (s && s.indexOf('var') == 0) {
            if (s && s.indexOf('var _DATA_Detail =') == 0) {
                s = s.replace('var _DATA_Detail =', '')
                // s = s.split(', "mock"')[0]+'}'
                // s = s.replace(/waitForS.*"moduleType": 1,/, '"moduleType": 1,')

                
                console.log(s)
               // var _DATA_Detail = JSON.parse(s)
                console.log(_DATA_Detail.userId)
            }


        }
    }


    ctx.body = _DATA_Detail




})
module.exports = router