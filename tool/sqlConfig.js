
var mysql = require('mysql');
var config = require('../config/sql')
var nodemailer =require('./nodemailer')
var sql ={
    start(query,res){
        var connection = mysql.createConnection({
           ...config
        })
        connection.connect();
        connection.query(query, function(error,results,fields){
            res(error,results,fields)
        })
        connection.end();
    },

   
    // promise执行存储过程
    promiseCall(query){
        return  new Promise((res,rej)=>{
            this.start(query,(error,results,fields)=>{
                if(error){
                    //数据库错误报给邮件
                    nodemailer({
                        subject:'数据库错误',
                        to: 'maker.wx@gmail.com',
                        text:JSON.stringify(error)
                    })
                    console.log('数据库错误，邮件已发送到maker.wx@gmail.com')
                }
                res({error,results});  
            });
        })
    }
}

module.exports=sql













