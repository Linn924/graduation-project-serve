const Router = require("koa-router")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const nav = new Router() //路由

//查询导航
nav.get('/navs',async ctx => {
    const data = require('../navData.json')
    ctx.body = {
        data
    }
})

//查询导航(管理员)
nav.get('/navsByAdmin',async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT * FROM nav LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    } else {
        var sql = `SELECT * FROM nav WHERE name like '%${key}%'`
        var [res] = await connection.query(sql)
    }

    const sql2 = `SELECT * FROM nav`
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

//添加导航
nav.post('/navs',async ctx => {
    const name = ctx.request.body.name.trim()
    const url = ctx.request.body.url.trim()
    const introduce = ctx.request.body.introduce.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO nav (name,introduce,url) VALUE
                 ('${name}', '${introduce}', '${url}')`
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

//修改导航
nav.put('/navs',async ctx => {
    const id = ctx.request.body.id
    const introduce = ctx.request.body.introduce.trim()
    const name = ctx.request.body.name.trim()
    const url = ctx.request.body.url.trim()

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE nav set name='${name}',url='${url}',introduce='${introduce}' WHERE id=${id}`
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

//删除导航
nav.delete('/navs',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM nav WHERE ?? = ?`
    const [res] = await connection.query(sql, ["id", id])
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

module.exports = nav