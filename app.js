(async function run(){
    const Koa = require('koa')
    const Static = require('koa-static-cache')
    const Router = require('koa-router')
    const cors = require('koa2-cors')
    const koaBody = require('koa-body')
    const jwt = require("jsonwebtoken")

    const app = new Koa()
    const router = new Router()

    app.use(koaBody({ multipart: true })) //支持文件上传
    app.use(cors()) //跨域资源共享
    app.use(Static("./static", { //加载静态资源
        prefix: "/static",
        gzip: true,
    }))

    app.use(async (ctx, next) => { //后台拦截器
        var token = ctx.headers.authorization
        const url = ctx.request.url

        if((url === '/addComment' || url === '/agreeComment' || url === '/replyComment') && (token == 'null')) {
          return ctx.body = {
              code: 444,
              tips: "该功能只有登录用户可以使用",
            }
        }
        if(url !== '/addComment' && url !== '/agreeComment' && url !== '/replyComment') return await next()
        if((url === '/addComment' || url === '/agreeComment' || url === '/replyComment') && (token !== 'null'))
        {   
            let flag = false
            jwt.verify(token, 'Simon', async (error, decoded) => {
                if (!decoded) {
                    flag = true
                    return ctx.body = {
                        code: 445,
                        tips: "token无效",
                    }
                }
            })
            if(!flag){
                return await next()
            }
        }
      })

    const user = require("./router/user.js")
    const blog = require("./router/blog.js")
    const nav = require("./router/nav.js")
    const home = require("./router/home.js")
    
    app.use(user.routes())
    app.use(blog.routes())
    app.use(nav.routes())
    app.use(home.routes())
    app.use(router.routes())

    app.listen(8888, () => {
        console.log('serve is running')
    })

})()