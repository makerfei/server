
const  schedule  =  require ('node-schedule');
const {getAccessToken} = require('./wx');
module.exports = ()=>{
    getAccessToken();
    schedule.scheduleJob('0 0 */1 * *', async () => {
        getAccessToken();
        console.log("running every minute")
    });
}