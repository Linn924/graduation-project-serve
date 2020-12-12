const Router = require("koa-router")

const nav = new Router() //路由

//获取navData数据
nav.get('/getnavdata',async ctx => {
    const data = require('../navData.json')
    
    ctx.body = {
        data
    }
})

module.exports = nav