var config = require('../config/sql');
//用户初始化
module.exports.userInster = ({username='请填写',password='',mobile='',register_ip='' }) => {
    return new Promise(async (resolve, reject) => {
        let insertId = 0;
        let sqlstr = `INSERT INTO user ( username, password,mobile , register_ip)VALUES(?,?,?,?)`;
        let sqlRes = await sql.promiseCall({ sql: sqlstr, values: [nick, pwd, mobile, ctx.ip] });
        if (!sqlRes.error && sqlRes.results.insertId) {
            insertId = sqlRes.results.insertId;
            await sql.promiseCall({ sql: `INSERT INTO level(user_id) VALUES(?)`, values: [insertId] });
            await sql.promiseCall({ sql: `INSERT INTO level(user_id) VALUES(?)`, values: [insertId] });
        }
        resolve(insertId)
    })
}
//登录打点
module.exports.loginPoint = ({ ip, userId }) => {
    return sql.promiseCall({ sql: `update user set last_login_ip = ? ,last_login_time = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'  where id =?`, values: [ip,userId] });
}

