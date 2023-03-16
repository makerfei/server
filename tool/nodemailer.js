//nodemailer.js
const nodemailer = require('nodemailer');
var configData = require('../config/email')
//创建一个smtp服务器
const config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        ...configData
    }
};
// 创建一个SMTP客户端对象
const transporter = nodemailer.createTransport(config);
//发送邮件
module.exports = function (mail){
    transporter.sendMail(mail, function(error, info){
        if(error) {
            return console.log(error);
        }
        console.log('mail sent:', info.response);
    });
};