const router = require('koa-router')()
const sql = require('../tool/sqlConfig')
router.prefix('/api')
const axios = require('axios')
const qs = require('qs')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const { match } = require('assert')

router.post('/reptile', async function (ctx, next) {

    let { html } = ctx.request.body
    let retrunData = {
        imgCon: [],
        video: [],
        titleText: []
    }
    // let str = fs.readFileSync(path.join(__dirname, `../`, `index.json`), { encoding: 'utf8' })
    const $ = cheerio.load(html);
    let script = $('script');
    //内容列表
    $('.content-detail img').map((i, item) => {
        let src = item.attribs.src;
        src = src.indexOf('http') !== 0 ? "https:" + src : src
        retrunData.imgCon.push(src)
    });

    //视频
    $('video').map((i, item) => {
        if(i===0){
            return retrunData.video.push(item.attribs.src)
        }
       
    });
    //名称 
    $('.title-text').map((i, item) => {
        return retrunData.titleText.push($(item).text())

    });


    for (let i = 0; i < script.length; i++) {
        let s = script?.[i]?.children[0] && script?.[i]?.children[0].data || ''
        if (s && s.indexOf('window.__GLOBAL_DADA') > -1) {
            s = s.split("window.__INIT_DATA=")[1]
            _DATA_Detail = JSON.parse(s);
            //对这个进行解析
            retrunData.images = _DATA_Detail.globalData.images.map((item, i) => {
                return item.fullPathImageURI
            });
            retrunData.price = _DATA_Detail.globalData.orderParamModel.orderParam.skuParam.skuRangePrices[0].price||0;
            //retrunData.skuModel = _DATA_Detail.globalData.skuModel;
        }
    }
    let properties = _DATA_Detail.globalData.skuModel.skuProps.map((item,i)=>{
        let resItem ={id:i,name:item.prop,childsCurGoods:[]};
        item.value.map((v,j)=>{
            resItem.childsCurGoods.push({id:j,name:v.name,imageUrl:v.imageUrl});
        })
        return resItem
    });

    retrunData.price = Math.ceil( Number(retrunData.price) * 200  + 500);
    retrunData.originalPrice = Math.ceil( Number(retrunData.price)*3.2);
   
    retrunData.pic = retrunData.images[0] || "";
    retrunData.name = retrunData.titleText[0]||"";
    retrunData.recommendStatus = 0;
    retrunData.stores =0;
    retrunData.video = retrunData.video.length>0?retrunData.video[0]:""
    retrunData.skuList =[];
    //
   

    let skuInfoMap =  _DATA_Detail.globalData.skuModel.skuInfoMap;
   
    for (const key in skuInfoMap) {
        let propertyChildIds = []
        let valueList = key.split("&gt;");
        let imageUrl = "";
        properties.map((pro,proi)=>{
            pro.childsCurGoods.map((chi,chii)=>{
                if(valueList[proi]===chi.name){
                    propertyChildIds.push(`${proi}:${chii}`);
                    if(chi.imageUrl){
                        imageUrl = chi.imageUrl
                    }
                }
            })
        })
        propertyChildIds = propertyChildIds.join(",");
        retrunData.stores += Math.ceil(skuInfoMap[key].canBookCount/10)
        // 算归宿
        retrunData.skuList.push({
            originalPrice:retrunData.originalPrice,
            price:retrunData.price,
            stores: Math.ceil(skuInfoMap[key].canBookCount/10),
            propertyChildIds:propertyChildIds,
            img:imageUrl
        })
    }


    retrunData.properties = properties.map((item,i)=>{
       return {...item,childsCurGoods:item.childsCurGoods.map(v=>{
        return {...v,imageUrl:undefined}
       })}
       
    });
   

   
    
   
    ctx.body = retrunData

})
module.exports = router