const Router = require("koa-router")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const blog = new Router() 

//分页或者搜索处理博客数据
blog.get('/blogdata', async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                 a.content,a.sortId,a.technologyId,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = b.id and a.technologyId = c.id
                 LIMIT ${pagenum * pagesize},${pagesize}`
        var [data] = await connection.query(sql)
    } else {
        var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                 a.content,a.sortId,a.technologyId,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = b.id and a.technologyId = c.id and a.title like '%${key}%'
                 LIMIT ${pagenum * pagesize},${pagesize}`
        var [data] = await connection.query(sql)
    }
    
    const sql2 = `SELECT * FROM blog`
    const [data2] = await connection.query(sql2)
    connection.end(function (err) { }) //连接结束

    if (data.length >= 0) {
        ctx.body = {
            data,
            code:200,
            tips:'获取blog数据成功',
            total:data2.length
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取blog数据失败'
        }
    }
})

//获取分类、标签表的所有数据
blog.get('/blogdatadetail', async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT * FROM blog_sort`
    const sql2 = `SELECT * FROM blog_technology`
    const [data] = await connection.query(sql)
    const [data2] = await connection.query(sql2)
    connection.end(function (err) { }) //连接结束
    
    if (data.length >= 0 && data2.length >= 0) {
        ctx.body = {
            data: {data,data2},
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

//添加分类
blog.post('/addsort', async ctx => {
    const name = ctx.request.body.sort_name.trim()

    const connection = await Mysql.createConnection(mysql)
    const [data] = await connection.query(`SELECT sort_name FROM blog_sort`)
    connection.end(function (err) {}) //连接结束

    var code, tips
    data.some(item => {
        if (item.sort_name === name) {
            code = 201
            tips = '分类重复'
            return true
        }
    })

    if (code != 201) {
        const connection = await Mysql.createConnection(mysql)
        const sql = `INSERT INTO blog_sort (sort_name) VALUE ('${name}')`
        const [rs] = await connection.query(sql)
        connection.end(function (err) {}) //连接结束

        if (rs.affectedRows > 0) {
            code = 200,
            tips = '添加分类成功'
        } else {
            code = 400,
            tips = '添加分类失败'
        }
    }

    ctx.body = {
        code,
        tips
    }
})

//添加标签
blog.post('/addtechnology', async ctx => {
    const name = ctx.request.body.technology_name.trim()

    const connection = await Mysql.createConnection(mysql)
    const [data] = await connection.query(`SELECT technology_name FROM blog_technology`)
    connection.end(function (err) {}) //连接结束

    var code, tips
    data.some(item => {
        if (item.technology_name === name) {
            code = 201
            tips = '标签重复'
            return true
        }
    })

    if (code != 201) {
        const connection = await Mysql.createConnection(mysql)
        const sql = `INSERT INTO blog_technology (technology_name) VALUE ('${name}')`
        const [rs] = await connection.query(sql)
        connection.end(function (err) {}) //连接结束

        if (rs.affectedRows > 0) {
            code = 200,
            tips = '添加标签成功'
        } else {
            code = 400,
            tips = '添加标签失败'
        }
    }

    ctx.body = {
        code,
        tips
    }
})

//删除分类
blog.delete('/deletesort', async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog_sort WHERE ?? = ?`
    const [data] = await connection.query(sql, ['id', id])
    connection.end(function (err) {}) //连接结束

    if (data.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'删除分类成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'删除分类失败'
        }
    }
})

//删除标签
blog.delete('/deletetechnology', async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog_technology WHERE ?? = ?`
    const [data] = await connection.query(sql, ['id', id])
    connection.end(function (err) {}) //连接结束

    if (data.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'删除标签成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'删除标签失败'
        }
    }

})

//添加博客
blog.post('/addblog', async ctx => {
    const data = ctx.request.body  
    var connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO blog (title,introduce,date,sortId,mdname,technologyId,content) VALUE
    ('${data.title}', '${data.introduce}', '${data.date}', '${data.sortname}', 
    '${data.mdname}', '${data.technologyname}', '${data.content}')`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'添加博客成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'添加博客失败'
        }
    }
})

//删除博客
blog.delete('/deleteblog', async ctx => {
    const id = ctx.request.query.id;

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog WHERE ?? = ?`;
    const [data] = await connection.query(sql, ["id", id]);
    connection.end(function (err) {}) //连接结束
    
    if (data.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'删除博客成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'删除博客失败'
        }
    }
})

//更新博客
blog.put('/updateblog', async ctx => {
    const data = ctx.request.body
    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog SET title='${data.title}',introduce='${data.introduce}',
                 date='${data.date}',sortId=${data.sort_name},
                 mdname='${data.mdname}',technologyId=${data.technology_name},
                 content='${data.content}' WHERE id = ${data.id}`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'更新博客成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'更新博客失败'
        }
    }
})

//更新分类
blog.put('/updatesort', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_sort SET sort_name='${data.sort_name}' WHERE id = ${data.id}`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'修改分类成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'修改分类失败'
        }
    }
})

//更新标签
blog.put('/updatetechnology', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_technology SET technology_name='${data.technology_name}' WHERE id = ${data.id}`
    const [rs] = await connection.query(sql)
    connection.end(function (err) {}) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'修改标签成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'修改标签失败'
        }
    }
})

//获取所有与指定分类有关的博客数据
blog.get('/getAboutSortData',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                 a.content,a.sortId,a.technologyId,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = '${id}' and a.sortId = b.id and a.technologyId = c.id`
    var [data] = await connection.query(sql)
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

//获取所有博客数据
blog.get('/blogAllData', async ctx => {
    const connection = await Mysql.createConnection(mysql)
    var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                a.content,a.sortId,a.technologyId,b.sort_name,
                c.technology_name FROM blog a,blog_sort b,blog_technology c 
                WHERE a.sortId = b.id and a.technologyId = c.id`
    var [data] = await connection.query(sql)
    connection.end(function (err) { }) //连接结束

    if (data.length >= 0) {
        ctx.body = {
            data:data.reverse().slice(0,5),
            code:200,
            tips:'获取blog数据成功',
            total:data.length
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取blog数据失败'
        }
    }
})

//根据mdname获取博客内容
blog.get('/readmd/:name', async ctx => {
    const name = ctx.params.name

    const connection = await Mysql.createConnection(mysql)
    const [data] = await connection.query(`SELECT id,content FROM blog where mdname = '${name}'`)
    connection.end(function (err) { }) //连接结束

    if (data.length > 0) {
        ctx.body = {
            data,
            code:200,
            tips:'获取博客成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取博客失败'
        }
    }
})

//根据博客id获取该博客的所有评论
blog.get('/getAllComment/:id',async ctx => {
    const blog_id = ctx.params.id 

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.id,a.content,a.date,a.agree_count,a.user_id,a.agree_user_id,b.username,b.avatar 
                 FROM blog_comment a,user b where a.blog_id = ${blog_id} and a.user_id = b.id`
    const [data] = await connection.query(sql)

    const sql2 = `SELECT a.respondent_id,a.reply_content,b.username 
                  FROM reply_comment a,user b WHERE a.blog_id = ${blog_id} and a.commentator_id = b.id`
    
    const [data2] = await connection.query(sql2)
    connection.end(function (err) { }) //连接结束

    if (data.length >= 0) {
        ctx.body = {
            data,
            data2,
            code:200,
            tips:'获取评论数据成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取评论数据失败'
        }
    }
})

//添加用户的评论
blog.post('/addComment',async ctx => {
    const commentForm = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO blog_comment (blog_id,user_id,content,date,agree_count,agree_user_id) VALUE
          (${commentForm.blog_id}, ${commentForm.user_id},'${commentForm.content.trim()}', 
          '${commentForm.date.trim()}', ${commentForm.agree_count},, '[]')`
    const [rs] = await connection.query(sql)
    connection.end(function (err) { }) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'发表评论成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'发表评论失败'
        }
    }
})

//用户回复某个用户的评论
blog.post('/replyComment',async ctx => {
    const replyForm = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO reply_comment (blog_id,commentator_id,respondent_id,reply_content) VALUE
          (${replyForm.blog_id}, ${replyForm.commentator_id},${replyForm.respondent_id}, 
           '${replyForm.reply_content.trim()}')`
    const [rs] = await connection.query(sql)
    connection.end(function (err) { }) //连接结束

    if (rs.affectedRows > 0) {
        ctx.body = {
            code:200,
            tips:'评论成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'评论失败'
        }
    }
})
module.exports = blog
