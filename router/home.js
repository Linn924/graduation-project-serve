const Router = require("koa-router")
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const home = new Router() //路由


//获取壁纸数据
home.get('/getHomePageWallpaper',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const [rs] = await connection.query(`SELECT * FROM homepage_wallpaper`)
    connection.end(function (err) {}) //连接结束
    const flag = rs[0].newurl.split('.').includes('mp4')
    if (rs.length >= 0) {
        ctx.body = {
            data:rs,
            flag,
            code:200,
            tips:'获取壁纸数据成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取壁纸数据失败'
        }
    }
})

//修改背景图片
home.put('/putHomePageWallpaper',async ctx => {
    const newurl = ctx.request.body.newurl

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE homepage_wallpaper set newurl='${newurl}' WHERE id=1`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'更新壁纸成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'更新壁纸失败'
        }
    }
})

//上传壁纸
home.post('/postHomePageWallpaper', async ctx =>{
    const imagePath = path.join(__dirname , "../wallpaper/")
    const image = fs.readdirSync(imagePath)
    image.forEach(item =>  fs.unlinkSync(imagePath + item)) //清空image文件夹

    const file = ctx.request.files.image
    const reader = fs.createReadStream(file.path) // 创建可读流
    let name = (new Date()).getTime() + ".png"//设置文件名称
    let filePath = path.join(__dirname , "../wallpaper/") + name//绝对路径
    const upStream = fs.createWriteStream(filePath) // 创建可写流
    reader.pipe(upStream) // 可读流通过管道写入可写流
    
    const connection = await Mysql.createConnection(mysql)
    const url = `http://127.0.0.1:8888/showImage/${name}`
    const newurl = url
    const sql = `UPDATE homepage_wallpaper set newurl='${newurl}' , url='${url}' WHERE id=9`
    const sql2 = `UPDATE homepage_wallpaper set newurl='${newurl}' WHERE id=1`
    const [rs] = await connection.query(sql)
    const [rs2] = await connection.query(sql2)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0 && rs2.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'上传壁纸成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'上传壁纸失败'
        }
    }
})

//访问服务器上的图片
home.get('/showImage/:name', async ctx =>{
    const name = ctx.params.name
    const filePath = path.join(__dirname, `../wallpaper/${name}`) //默认图片地址
    const file = fs.readFileSync(filePath) //读取文件
    let mimeType = mime.lookup(filePath) //读取图片文件类型
	ctx.set('content-type', mimeType) //设置返回类型
    ctx.body = file	
})

//获取nav数据
home.get('/getHomePageNav',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const [rs] = await connection.query(`SELECT * FROM homepage_nav`)
    connection.end(function (err) {}) //连接结束
   
    if (rs.length >= 0) {
        ctx.body = {
            data:rs,
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

//修改nav数据
home.put('/putHomePageNav',async ctx => {
    const data = ctx.request.body
    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE homepage_nav set title='${data.title}',url='${data.url}' WHERE id=${data.id}`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'更新成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'更新失败'
        }
    }
})

//添加nav数据
home.post('/postHomePageNav',async ctx => {
    const data = ctx.request.body
    const num = Math.floor(Math.random()*8) + 1
    const className = `#icon-app${num}`
    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO homepage_nav (title,className,url) VALUE
    ('${data.title}', '${className}', '${data.url}')`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'添加成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'添加失败'
        }
    }
})

//删除nav数据
home.delete('/deleteHomePageNav',async ctx => {
    const id = ctx.request.query.id
    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM homepage_nav WHERE ?? = ?`;
    const [rs] = await connection.query(sql, ["id", id]);
    connection.end(function (err) {}) //连接结束
    
    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'删除成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'删除失败'
        }
    }
})

module.exports = home