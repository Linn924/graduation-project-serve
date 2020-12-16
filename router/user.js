const Router = require("koa-router")
const Md5 = require("md5")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")
const mime = require('mime-types')
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const user = new Router() 

//登录
user.get('/users',async ctx => {
    const username = ctx.request.query.username.trim()
    const password = Md5(ctx.request.query.password.trim())
    const userdata = {name: username,pwd: password}
    const secret = "Simon"

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT * FROM user where username = '${username}' and password= '${password}'`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.length > 0) {
        ctx.body = {
            code:200,
            tips:'登录成功',
            username:res[0].username,
            email:res[0].email,
            id:res[0].id,
            avatar:res[0].avatar,
            token:jwt.sign(userdata, secret)
        }
    } else {
        ctx.body = {
            code:400,
            tips:'登录失败',
        }
        
    }
})

//验证用户名
user.get('/checkName',async ctx => {
    const username = ctx.request.query.username.trim()
    const status = ctx.request.query.status.trim()

    if(username.length == 0){
        ctx.body = {
            code:400,
            tips:'请输入昵称'
        }
    }else if(username.length < 2){
        ctx.body = {
            code:400,
            tips:'昵称不能少于两位'
        }
    }else if(username.length > 10){
        ctx.body = {
            code:400,
            tips:'昵称超出限制'
        }
    }else{
        const connection = await Mysql.createConnection(mysql)
        const [res] = await connection.query(`SELECT * FROM user`)
        connection.end((err) => console.log(err))

        let flag = res.some(item => {
            if (item.username === username) {
                if(status === '注册'){
                    ctx.body = {
                        code:400,
                        tips:'昵称已经被注册'
                    }
                }else{
                    ctx.body = {
                        code:400,
                        tips:'未作出任何修改'
                    }  
                }
                return true
            }
        })

        if(!flag){
            ctx.body = {
                code:200,
                tips:'昵称可用~'
            }
        }
    }
})

//验证用户身份
user.get('/checkIdentity',async ctx => {
    const username = ctx.request.query.username.trim()
    const email = ctx.request.query.email.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT * FROM user WHERE username='${username}' and email='${email}'`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if(res.length === 1){
        ctx.body = {
            code:200,
            tips:'身份验证成功',
        }
    }else{
        ctx.body = {
            code:400,
            tips:'身份验证失败',
        }
    }
})

//查询图片
user.get('/images/:name', async ctx =>{
    const name = ctx.params.name
    const filePath = path.join(__dirname, `../avatar/${name}`)
    const file = fs.readFileSync(filePath)
    let mimeType = mime.lookup(filePath)
	ctx.set('content-type', mimeType)
    ctx.body = file	
})

//查询用户(管理员)
user.get('/usersByAdmin',async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT id,username,email,praised,status FROM user LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    } else {
        var sql = `SELECT id,username,email,praised,status FROM user WHERE username like '%${key}%'`
        var [res] = await connection.query(sql)
    }

    const sql2 = `SELECT * FROM user`
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    if (res.length >= 0) {
        ctx.body = {
            data:res,
            total:res2.length,
            code:200,
            tips:'查询成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询失败'
        }
    }
})

//注册
user.post('/users',async ctx => {
    const username = ctx.request.body.username.trim()
    const password = Md5(ctx.request.body.password.trim())
    const email = ctx.request.body.email.trim()
    const avatar = ctx.request.body.avatar.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO user (username,password,email,avatar,praised,status)
                 VALUE('${username}', '${password}', '${email}', '${avatar}',0,'false')`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'注册成功',
        }
    } else {
        ctx.body = {
            code:400,
            tips:'注册失败',
        }
    }
})

//上传图片
user.post('/images', async ctx =>{
    const file = ctx.request.files.image
    const username = ctx.request.body.username
    const oldAvatar = ctx.request.body.avatar.split('/').reverse()[0]
    const oldAvatarPath = path.join(__dirname , "../avatar/") + oldAvatar
    
    fs.access(oldAvatarPath,async err => {
        if(!err)
        await fs.unlink(oldAvatarPath.trim(), (err) => { if (err) throw err }) //删除指定文件    
    })

    const reader = fs.createReadStream(file.path) 
    let name = username + (new Date()).getTime() + ".png"
    let filePath = path.join(__dirname , "../avatar/") + name
    const upStream = fs.createWriteStream(filePath) 
    reader.pipe(upStream)
    
    const connection = await Mysql.createConnection(mysql)
    const avatar = `http://127.0.0.1:8888/images/${name}`
    const sql = `UPDATE user SET avatar='${avatar}' WHERE username='${username}' `
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            data:avatar,
            code:200,
            tips:'上传头像成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'上传头像失败'
        }
    }
})

//修改用户信息(管理员)
user.put('/usersByAdmin',async ctx => {
    const id = ctx.request.body.id
    const status = ctx.request.body.status
    
    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE user SET status='${status}' WHERE id=${id}`
    const [res] = await connection.query(sql)
    connection.end(err => console.log(err)) 

    if (res.affectedRows > 0) {
        if(status){
            ctx.body = {
                code:200,
                tips:'冻结成功'
            }
        }else{
            ctx.body = {
                code:200,
                tips:'取消冻结'
            }
        }
    } else {
        ctx.body = {
            code:400,
            tips:'冻结失败'
        }
    }
})

//修改用户信息(用户)
user.put('/users',async ctx => {
    const username = ctx.request.body.username.trim()
    const email = ctx.request.body.email.trim()
    const id = ctx.request.body.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE user SET username='${username}',email='${email}' WHERE id=${id}`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'修改成功',
        }
    } else {
        ctx.body = {
            code:400,
            tips:'修改失败',
        }
    }
})

//修改用户密码
user.put('/password',async ctx => {
    const username = ctx.request.body.username.trim()
    const password = Md5(ctx.request.body.password.trim())

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE user SET password='${password}' WHERE username='${username}'`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'密码重置成功',
        }
    } else {
        ctx.body = {
            code:400,
            tips:'密码重置失败',
        }
    }
})
module.exports = user
