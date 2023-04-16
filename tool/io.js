
const mysql = require("../tool/chatMysql");
const sql = require('../tool/sqlConfig');

const statu = [
    {
        "code": false,
        "type": "false",
        "message": "请求失败",
        "data": {}
    },
    {
        "code": true,
        "type": "success",
        "message": "请求成功",
        "data": {}
    },
    {
        "code": false,
        "type": "Offline",
        "message": "对方已离线",
        "data": {}
    },
    {
        "code": true,
        "type": "joinSuccess",
        "message": "连接成功",
        "data": {}
    },
    {
        "code": true,
        "type": "joinFalse",
        "message": "当前客服正在忙，请稍后重试",
        "data": {}
    },
    {
        "code": true,
        "type": "nullService",
        "message": "当前没有客服在线",
        "data": {}
    },
    {
        "code": false,
        "type": "illegalData",
        "message": "非法数据",
        "data": {}
    },
    {
        "code": false,
        "type": "dataFalse",
        "message": "数据格式错误",
        "data": {}
    },
    {
        "code": true,
        "type": "returnPublicKeySuccess",
        "message": "公钥返回成功",
        "data": {}
    },
    {
        "code": true,
        "type": "decryptDataSuccess",
        "message": "数据解密成功",
        "data": {}
    },
    {
        "code": true,
        "type": "dataVerificationSuccess",
        "message": "数据校验成功",
        "data": {}
    },
    {
        "code": true,
        "type": "dataVerificationDecryptSuccess",
        "message": "数据校验解密成功",
        "data": {}
    },
    {
        "code": true,
        "type": "createTokenSuccess",
        "message": "token生成成功",
        "data": {}
    },
    {
        "code": false,
        "type": "createTokenError",
        "message": "token生成失败",
        "data": {}
    },
    {
        "code": true,
        "type": "decryptTokenSuccess",
        "message": "token解密成功",
        "data": {}
    },
    {
        "code": false,
        "type": "decryptTokenError",
        "message": "非法token",
        "data": {}
    },
    {
        "code": true,
        "type": "verificationTokenSuccess",
        "message": "token验证通过",
        "data": {}
    },
    {
        "code": false,
        "type": "verificationTokenTimeOut",
        "message": "登录过期，请重新登录",
        "data": {}
    },
    {
        "code": false,
        "type": "loginFalse",
        "message": "账号或密码错误",
        "data": {}
    },
    {
        "code": true,
        "type": "OnlineSuccess",
        "message": "上线成功",
        "data": {}
    },
    {
        "code": false,
        "type": "OnlineFalse",
        "message": "您已在线",
        "data": {}
    },
    {
        "code": true,
        "type": "OfflineSuccess",
        "message": "离线成功",
        "data": {}
    },
    {
        "code": true,
        "type": "OfflineFalse",
        "message": "离线失败，当前未在线",
        "data": {}
    },
    {
        "code": false,
        "type": "TooTast",
        "message": "您的操作太快了！",
        "data": {}
    },
    {
        "code": false,
        "type": "",
        "message": "",
        "data": {}
    },

    {
        "code": false,
        "type": "",
        "message": "",
        "data": {}
    },
    {
        "code": false,
        "type": "",
        "message": "",
        "data": {}
    }

]

//记录所有加入的用户
let users = [];
//记录所有加入的客服
let services = [];
module.exports = function (server) {

    const io = require('socket.io')(server, { cors: true });	// 引入socket.io并立即实例化，把server挂载上去
    io.on('connection', socket => {

        //如果用户存在则传回用户数据，历史聊天记录，否则创建用户
        socket.on("visit", async data => {
            if (data.userId) {
            let userRes = await   sql.promiseCall({sql:`select count(*) as count from chatuser where userId = ?`,values:[data.userId]})
             if(userRes.results&&userRes.results[0].count===0){
                 await  sql.promiseCall({sql:`INSERT INTO chatuser ( userId, userName)
                 VALUES(?,?);`,values:[data.userId,data.userName]}).then(data=>{ })
             }
             socket.emit("visitReturn", {});
            } else {
                //数据格式错误
                socket.emit("error", {code:false,message:"非法数据"})
            }

        })

        //客服上线
        socket.on("serviceOnline", data => {
            //数据校验  

            var newData = data;
            if (newData.id) {
                if (services.filter((v) => v.serviceId === data.serviceId).length == 0) {
                    data.socketId = socket.id;
                    data.userList = [];
                    //存入列表
                    services.push(data)
                    socket.emit("success", statu.filter((v) => v.type == "OnlineSuccess"))
                }
                // else {
                //     socket.emit("error", statu.filter((v) => v.type == "OnlineFalse"))
                // }
            } else {
                socket.emit("error", data)
            }
        })

        //客服手动离线
        socket.on("serviceOffline", data => {
            if (services.length > 0 && services.filter(v => (v.socketId == socket.id)).length > 0) {
                //拿出离线的客服数据
                let service = services.filter(v => (v.socketId == socket.id))
                //获取跟客服连接的用户,全部通知客服下线
                for (var i = 0; i < service[0].userList.length; i++) {
                    socket.to(service[0].userList[i].socketId).emit("Offline", statu.filter((v) => v.type == "Offline"))
                }
                //删除该客服
                services = services.filter(v => (v.socketId != socket.id))
                socket.emit("success", statu.filter((v) => v.type == "OfflineSuccess"))
            } else {
                socket.emit("error", statu.filter((v) => v.type == "OfflineFalse"))
            }
        })

        //客服踢出用户
        socket.on("closeSeesion", data => {
            try {
                for (var i = 0; i < services.length; i++) {
                    if (services[i].socketId == socket.id) {
                        let socketId = services[i].userList.filter((v) => v.userId == data.data.userId)
                        services[i].userList = services[i].userList.filter((v) => v.userId != data.data.userId)
                        socket.to(socketId[0].socketId).emit("Offline", statu.filter((v) => v.type == "Offline"))
                    }
                }
            } catch (e) {
                socket.emit("error", statu.filter((v) => v.type == "TooTast"))
            }
        })

        //用户转人工
        socket.on("toLabor", data => {
            var newData = data;
            if (newData.code) {
                if (services.length > 0) {
                    // let serviceTemp=services.filter((v) => v.serviceState == 0)
                    // if(serviceTemp.length>0){
                    //随机分配客服
                    index = Math.floor(Math.random() * services.length);
                    //改变客服状态
                    services[index].serviceState = 1;
                    services[index].serviceFrequency = services[index].serviceFrequency + 1;
                    //返回用户通知
                    let returns = statu.filter((v) => v.type == "joinSuccess");
                    returns[0].data.serviceName = services[index].username;
                    returns[0].data.socketRoom = services[index].socketId;
                    returns[0].data.receiveId = services[index].serviceId;
                    socket.emit("linkServiceSuccess", returns);

                    // }else{
                    //     socket.emit("error", statu.filter((v) => v.type == "joinFalse"));
                    // }
                } else {
                    socket.emit("error", statu.filter((v) => v.type == "nullService"));
                }

            } else {
                socket.emit("error", data);
            }
        })


        //让用户进入
        socket.on("userJoin", data => {
         
            var newData =data;
            if (newData.code) {
                let socketRoom = data.socketRoom;
                let receiveId = data.userId;
                let serviceId = '';
                //把用户存入列表
                data.socketId = socket.id;
                users.push(data);
                //将用户存入客服列表
                for (var i = 0; i < services.length; i++) {
                    if (services[i].socketId == socketRoom) {
                        services[i].userList.push(data);
                        serviceId = services[i].serviceId;
                    }
                }
                //返回客服通知
                let user_returns = statu.filter((v) => v.type == "joinSuccess");
                let res = Object.assign({}, data)
                user_returns[0].data = res;
                user_returns[0].data.socketRoom = socket.id;
                user_returns[0].data.receiveId = receiveId;
                socket.to(socketRoom).emit("UserJoinSuccess", user_returns);
            } else {
                socket.emit("error", data);
            }
        })

        //发送消息
        socket.on("sendMessage", data => {
            data.time = new moment().format('YYYY-MM-DD hh:mm:ss');
            var newData =data;
            if (newData.code) {
                console.log(newData);
                

                // mysql.insertMessage(newData.data).then((sql_data) => {
                //     if (sql_data) {
                //         //消息发送
                //         let returns = statu.filter((v) => v.type == "success");
                //         returns[0].data = data;
                //         socket.to(data.socketRoom).emit("reviceMessage", returns)
                //     } else {
                //         socket.emit("error", statu.filter((v) => v.type == "false"));
                //     }
                // });
            } else {
                socket.emit("error", data)
            }
        })

        socket.on("disconnect", () => {

            try {
                //用户离线
                if (users.length > 0) {
                    //拿出离线的用户数据
                    let user = users.filter(v => (v.socketId == socket.id))
                    if (user.length > 0) {
                        //通知客服
                        let returns = statu.filter((v) => v.type == "Offline");
                        returns[0].data = { userId: user[0].userId };
                        socket.to(user[0].socketRoom).emit("Offline", returns)
                        //删除该用户
                        users = users.filter(v => (v.socketId != socket.id))
                    }
                }
                //客服离线
                if (services.length > 0) {
                    //拿出离线的客服数据
                    let service = services.filter(v => (v.socketId == socket.id))
                    if (service.length > 0) {
                        //获取跟客服连接的用户,全部通知客服下线
                        for (var i = 0; i < service[0].userList.length; i++) {
                            socket.to(service[0].userList[i].socketId).emit("Offline", statu.filter((v) => v.type == "Offline"))
                        }
                        //删除该客服
                        services = services.filter(v => (v.socketId != socket.id))
                    }
                }

            } catch (e) {
                console.log("下标错误")
            }

        })
    });
}









