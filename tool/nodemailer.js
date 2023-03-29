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

// // 入参数 
// {
// subject: '接受凭证',//邮箱主题
// to: 'maker.wx@gmail.com',//前台传过来的邮箱
// text: '用' + 32323 + '作为你的验证码'// 邮件内容，HTML格式
// };
//发送邮件
module.exports = function (mail){
    transporter.sendMail({from:configData.from,...mail}, function(error, info){
        if(error) {
             console.log(error);
        }
        console.log('mail sent:', info.response);
    });
};