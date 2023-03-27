
var mysql = require('mysql');
var config = require('../config/sql')

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
                res({error,results});  
            });
        })
    }
}

module.exports=sql













