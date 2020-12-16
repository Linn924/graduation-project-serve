const Router = require("koa-router")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const comment = new Router() //路由

//查询当前博客下的所有评论
comment.get('/comments/:id',async ctx => {
    const blog_id = ctx.params.id 

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.id,a.content,a.date,a.agree_count,a.user_id,a.agree_user_id,b.username,b.avatar,b.praised 
                 FROM blog_comment a,user b where a.blog_id = ${blog_id} and a.user_id = b.id`
    const [res] = await connection.query(sql)

    const sql2 = `SELECT a.respondent_id,a.reply_content,b.username 
                  FROM reply_comment a,user b WHERE a.blog_id = ${blog_id} and a.commentator_id = b.id`
    
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    if (res.length >= 0 && res2.length >= 0) {
        ctx.body = {
            data:res,
            data2:res2,
            code:200,
            tips:'查询评论成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询评论失败'
        }
    }
})

//查询所有评论
comment.get('/comments',async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key.trim()

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT a.id,a.blog_id,a.user_id,a.content,a.date,a.agree_count,a.agree_user_id,b.username,c.title 
                   FROM blog_comment a,user b,blog c WHERE a.user_id=b.id and a.blog_id=c.id
                   LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    } else {
        var sql = `SELECT a.id,a.blog_id,a.user_id,a.content,a.date,a.agree_count,a.agree_user_id,b.username,c.title 
                   FROM blog_comment a,user b,blog c WHERE a.user_id=b.id and a.blog_id=c.id and b.username like '%${key}%'`
        var [res] = await connection.query(sql)
    }

    const sql2 = `SELECT a.respondent_id,a.reply_content,a.blog_id,b.username 
                  FROM reply_comment a,user b WHERE a.commentator_id = b.id`
    const [res2] = await connection.query(sql2)

    const sql3 = `SELECT * FROM blog_comment`
    const [res3] = await connection.query(sql3)
    connection.end((err) => console.log(err))

    if (res.length >= 0 && res2.length >= 0 && res3.length >= 0) {
        ctx.body = {
            data:res,
            data2:res2,
            total:res3.length,
            code:200,
            tips:'查询评论成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'获取评论失败'
        }
    }
})

//查询评论排行榜
comment.get('/commentList',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.content,a.agree_count,a.date,b.username FROM blog_comment a,user b WHERE a.user_id = b.id
                 ORDER BY agree_count DESC LIMIT 0,10`
    const [res] = await connection.query(sql)

    const sql2 = `SELECT username,praised FROM user`
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    let data = res.filter(item => item.agree_count !== 0)

    if (res.length >= 0 && res2.length > 0) {
        ctx.body = {
            data,
            data2:res2,
            code:200,
            tips:'查询评论榜单成功'
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询评论榜单失败'
        }
    }
})

//添加用户评论
comment.post('/comments',async ctx => {
    const commentForm = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO blog_comment (blog_id,user_id,content,date,agree_count,agree_user_id) VALUE
                (${commentForm.blog_id}, ${commentForm.user_id},'${commentForm.content.trim()}', 
                '${commentForm.date.trim()}', ${commentForm.agree_count}, '[]')`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
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

//添加用户回复某个用户的评论
comment.post('/replyComment',async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO reply_comment (blog_id,commentator_id,respondent_id,reply_content) VALUE
          (${data.blog_id}, ${data.commentator_id},${data.respondent_id}, '${data.reply_content.trim()}')`
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

//修改某评论的点赞数及点赞用户
comment.put('/comments', async ctx =>{
    const id = ctx.request.body.id
    const agree_count = ctx.request.body.agree_count
    const agree_user_id = ctx.request.body.agree_user_id
    const praised = ctx.request.body.praised
    const linked_id = ctx.request.body.linked_id
    const status = ctx.request.body.status

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_comment SET agree_count=${agree_count},agree_user_id='${agree_user_id}' WHERE id=${id}`
    const [res] = await connection.query(sql)

    const sql2 = `UPDATE user SET praised=${praised} WHERE id=${linked_id}`
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0 && res2.affectedRows > 0) {
        if(status){
            ctx.body = {
                code:200,
                tips:'点赞成功'
            }
        }else{
            ctx.body = {
                code:200,
                tips:'取消点赞'
            }
        }
    } else {
        ctx.body = {
            code:400,
            tips:'点赞失败'
        }
    }
    
})

//删除评论
comment.delete('/comments',async ctx => {
    const id = Number(ctx.request.query.id)
    const blog_id = Number(ctx.request.query.blog_id)
    const user_id = Number(ctx.request.query.user_id)

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog_comment WHERE ?? = ?`
    const [res] = await connection.query(sql, ["id", id])

    const sql2 = `DELETE FROM reply_comment WHERE blog_id = ${blog_id} and respondent_id = ${user_id}`
    const [res2] = await connection.query(sql2)
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
module.exports = comment