const Router = require("koa-router")
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const home = new Router() //路由

//获取壁纸数据
home.get('/wallpapers',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const [res] = await connection.query(`SELECT * FROM homepage_wallpaper`)
    connection.end((err) => console.log(err))
    
    const flag = res[0].newurl.split('.').includes('mp4')

    if (res.length >= 0) {
        ctx.body = {
            data:res,
            flag,
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

//查询图片
home.get('/homeImages/:name', async ctx =>{
    const name = ctx.params.name
    const filePath = path.join(__dirname, `../wallpaper/${name}`)
    const file = fs.readFileSync(filePath)
    let mimeType = mime.lookup(filePath)
	ctx.set('content-type', mimeType)
    ctx.body = file	
})

//查询导航
home.get('/homeNavs',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const [res] = await connection.query(`SELECT * FROM homepage_nav`)
    connection.end((err) => console.log(err))
   
    if (res.length >= 0) {
        ctx.body = {
            data:res,
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

//分页及模糊查询自定义网站
home.get('/websites',async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT * FROM homepage_nav LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    } else {
        var sql = `SELECT * FROM homepage_nav WHERE title like '%${key}%'`
        var [res] = await connection.query(sql)
    }

    const sql2 = `SELECT * FROM homepage_nav`
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

//上传壁纸
home.post('/wallpapers', async ctx =>{
    const imagePath = path.join(__dirname , "../wallpaper/")
    const image = fs.readdirSync(imagePath)
    image.forEach(item =>  fs.unlinkSync(imagePath + item)) //清空文件夹

    const file = ctx.request.files.image
    const reader = fs.createReadStream(file.path)
    let name = (new Date()).getTime() + ".png"
    let filePath = path.join(__dirname , "../wallpaper/") + name
    const upStream = fs.createWriteStream(filePath)
    reader.pipe(upStream)
    
    const connection = await Mysql.createConnection(mysql)
    const url = `http://127.0.0.1:8888/homeImages/${name}`
    const newurl = url
    const sql = `UPDATE homepage_wallpaper set newurl='${newurl}' , url='${url}' WHERE id=9`
    const [res] = await connection.query(sql)

    const sql2 = `UPDATE homepage_wallpaper set newurl='${newurl}' WHERE id=1`
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0 && res2.affectedRows > 0) {
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

//添加自定义网站
home.post('/websites',async ctx => {
    const name = ctx.request.body.name
    const url = ctx.request.body.url
    const className = `#icon-app${Math.floor(Math.random()*8) + 1}`

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO homepage_nav (title,className,url) VALUE
                 ('${name}', '${className}', '${url}')`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
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

//修改背景图片
home.put('/wallpapers',async ctx => {
    const newurl = ctx.request.body.newurl

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE homepage_wallpaper set newurl='${newurl}' WHERE id=1`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'修改成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'修改失败'
        }
    }
})

//修改导航
home.put('/websites',async ctx => {
    const id = ctx.request.body.id
    const name = ctx.request.body.name.trim()
    const url = ctx.request.body.url.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE homepage_nav set title='${name}',url='${url}' WHERE id=${id}`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
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

//删除导航
home.delete('/websites',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM homepage_nav WHERE ?? = ?`;
    const [res] = await connection.query(sql, ["id", id]);
    connection.end((err) => console.log(err))
    
    if (res.affectedRows > 0) {
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