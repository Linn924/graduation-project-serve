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
user.post('/login',async ctx => {
    const username = ctx.request.body.username.trim()
    const password = Md5(ctx.request.body.password.trim())
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

//检查用户名是否已经被注册
user.post('/checkUname',async ctx => {
    const username = ctx.request.body.username.trim()
    const status = ctx.request.body.status.trim()

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
                        tips:'未作出修改'
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

//注册
user.post('/register',async ctx => {
    const username = ctx.request.body.username.trim()
    const password = Md5(ctx.request.body.password.trim())
    const email = ctx.request.body.email.trim()
    const avatar = ctx.request.body.avatar.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO user (username,password,email,avatar)
                    VALUE('${username}', '${password}', '${email}', '${avatar}')`
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

//验证用户身份
user.post('/checkUidentity',async ctx => {
    const username = ctx.request.body.username.trim()
    const email = ctx.request.body.email.trim()

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
            tips:'身份验证失败，请重新验证',
        }
    }
})

//重置密码
user.put('/resetpwd',async ctx => {
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

//修改用户个人信息
user.put('/reviseUinformation',async ctx => {
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
            tips:'信息修改成功',
        }
    } else {
        ctx.body = {
            code:400,
            tips:'信息修改失败',
        }
    }
})

//上传图片到服务器
user.post('/uploadImg', async ctx =>{
    const file = ctx.request.files.image
    const username = ctx.request.body.username
    const oldAvatar = ctx.request.body.avatar.split('/').reverse()[0]
    const oldAvatarPath = path.join(__dirname , "../avatar/") + oldAvatar
    
    fs.access(oldAvatarPath,async err => {
        if(!err)
        await fs.unlink(oldAvatarPath.trim(), (err) => { if (err) throw err })//删除指定文件    
    })

    const reader = fs.createReadStream(file.path) // 创建可读流
    let name = username + (new Date()).getTime() + ".png"//设置文件名称
    let filePath = path.join(__dirname , "../avatar/") + name//绝对路径
    const upStream = fs.createWriteStream(filePath) // 创建可写流
    reader.pipe(upStream) // 可读流通过管道写入可写流
    
    const connection = await Mysql.createConnection(mysql)
    const avatar = `http://127.0.0.1:8888/showImg/${name}`
    const sql = `UPDATE user SET avatar='${avatar}' WHERE username='${username}' `
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
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

//展示上传的图片
user.get('/showImg/:name', async ctx =>{
    const name = ctx.params.name
    const filePath = path.join(__dirname, `../avatar/${name}`); //默认图片地址
    const file = fs.readFileSync(filePath); //读取文件
    let mimeType = mime.lookup(filePath); //读取图片文件类型
	ctx.set('content-type', mimeType); //设置返回类型
    ctx.body = file	
})

//用户对评论进行点赞
user.put('/agreeComment', async ctx =>{
    const id = ctx.request.body.id
    const agree_count = ctx.request.body.agree_count
    const agree_user_id = ctx.request.body.agree_user_id

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_comment SET agree_count=${agree_count},agree_user_id='${agree_user_id}' WHERE id=${id}`
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

//查询所有当前用户评论过的博客信息
user.get('/allCommentBlog/:id',async ctx => {
    const id = ctx.params.id
    
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT b.id,b.title,b.introduce,b.date,b.mdname
                 FROM blog_comment a,blog b where a.user_id = ${id} and a.blog_id = b.id`
    const [data] = await connection.query(sql)
    connection.end(function (err) { }) //连接结束

    if (data.length >= 0) {
        ctx.body = {
            data,
            code:200,
            tips:'获取数据成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取数据失败'
        }
    }
})

module.exports = user
