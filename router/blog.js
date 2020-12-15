const Router = require("koa-router")
const Mysql = require('promise-mysql2')
const mysql = require("../mysql.js")

const blog = new Router() 

//分页或模糊查询博客
blog.get('/blogs', async ctx => {
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const key = ctx.request.query.key

    const connection = await Mysql.createConnection(mysql)
    if (key == '' || key == null) {
        var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                 a.content,a.sortId,a.technologyId,a.pageviews,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = b.id and a.technologyId = c.id
                 LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    } else {
        var sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
                 a.content,a.sortId,a.technologyId,a.pageviews,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = b.id and a.technologyId = c.id and a.title like '%${key}%'
                 LIMIT ${pagenum * pagesize},${pagesize}`
        var [res] = await connection.query(sql)
    }
    
    const sql2 = `SELECT * FROM blog`
    const [res2] = await connection.query(sql2)
    connection.end((err) => console.log(err))

    if (res.length >= 0) {
        ctx.body = {
            data:res,
            code:200,
            tips:'查询成功',
            total:res2.length
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询失败'
        }
    }
})

//查询分类和标签数据
blog.get('/sortsAndlabels', async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT * FROM blog_sort`
    const [data] = await connection.query(sql)

    const sql2 = `SELECT * FROM blog_technology`
    const [data2] = await connection.query(sql2)
    connection.end((err) => console.log(err))
    
    if (data.length >= 0 && data2.length >= 0) {
        ctx.body = {
            data: {data,data2},
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

//查询指定分类博客
blog.get('/blogsBySort',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,
               a.content,a.sortId,a.technologyId,b.sort_name,
               c.technology_name FROM blog a,blog_sort b,blog_technology c 
               WHERE a.sortId = ${id} and a.sortId = b.id and a.technologyId = c.id`
    const [res] = await connection.query(sql)
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

//查询指定标签博客
blog.get('/blogsByLabel',async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,a.pageviews,
                 a.content,a.sortId,a.technologyId,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.technologyId = ${id} and a.sortId = b.id and a.technologyId = c.id`
    const [res] = await connection.query(sql)
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

//查询最近博客
blog.get('/recentBlogs', async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT a.id,a.title,a.introduce,a.date,a.mdname,a.pageviews,
                 a.content,a.sortId,a.technologyId,b.sort_name,
                 c.technology_name FROM blog a,blog_sort b,blog_technology c 
                 WHERE a.sortId = b.id and a.technologyId = c.id`
    const [res] = await connection.query(sql)
    connection.end((err) => console.log(err))

    if (res.length >= 0) {
        ctx.body = {
            data:res.reverse().slice(0,5),
            code:200,
            tips:'查询成功',
            total:res.length
        }
    } else {
        ctx.body = {
            code:400,
            tips:'查询失败'
        }
    }
})

//查询博客内容
blog.get('/content/:name', async ctx => {
    const name = ctx.params.name

    const connection = await Mysql.createConnection(mysql)
    const [res] = await connection.query(`SELECT id,content FROM blog where mdname = '${name}'`)
    connection.end((err) => console.log(err))

    if (res.length > 0) {
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

//查询博客浏览量排行榜
blog.get('/blogList',async ctx => {
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT id,title,date,mdname,pageviews FROM blog ORDER BY pageviews DESC LIMIT 0,10`
    const [res] = await connection.query(sql)
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

//查询当前用户评论过的所有博客
blog.get('/blogs/:id',async ctx => {
    const id = ctx.params.id
    
    const connection = await Mysql.createConnection(mysql)
    const sql = `SELECT b.id,b.title,b.introduce,b.date,b.mdname
                 FROM blog_comment a,blog b where a.user_id = ${id} and a.blog_id = b.id`
    const [res] = await connection.query(sql)
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

//添加博客
blog.post('/blogs', async ctx => {
    const data = ctx.request.body  

    const connection = await Mysql.createConnection(mysql)
    const sql = `INSERT INTO blog (title,introduce,date,sortId,mdname,technologyId,content,pageviews) VALUE
                ('${data.title}', '${data.introduce}', '${data.date}', '${data.sortname}', 
                '${data.mdname}', '${data.technologyname}', '${data.content}',0)`
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

//添加分类
blog.post('/sorts', async ctx => {
    const name = ctx.request.body.sort_name.trim()

    const connection = await Mysql.createConnection(mysql)
    const [res] = await connection.query(`SELECT sort_name FROM blog_sort`)
    connection.end((err) => console.log(err))

    res.some(item => {
        if (item.sort_name === name) {
            ctx.body = {
                code:201,
                tips :'分类重复'
            } 
            return true
        }
    })

    if (code != 201) {
        const connection = await Mysql.createConnection(mysql)
        const sql2 = `INSERT INTO blog_sort (sort_name) VALUE ('${name}')`
        const [res2] = await connection.query(sql2)
        connection.end((err) => console.log(err))

        if (res2.affectedRows > 0) {
            ctx.body = {
                code:200,
                tips :'添加成功'
            } 
        } else {
            ctx.body = {
                code:400,
                tips :'添加失败'
            } 
        }
    }
})

//添加标签
blog.post('/labels', async ctx => {
    const name = ctx.request.body.technology_name.trim()

    const connection = await Mysql.createConnection(mysql)
    const [res] = await connection.query(`SELECT technology_name FROM blog_technology`)
    connection.end((err) => console.log(err))

    res.some(item => {
        if (item.technology_name === name) {
            ctx.body = {
                code:201,
                tips :'标签重复'
            } 
            return true
        }
    })

    if (code != 201) {
        const connection = await Mysql.createConnection(mysql)
        const sql2 = `INSERT INTO blog_technology (technology_name) VALUE ('${name}')`
        const [res2] = await connection.query(sql2)
        connection.end((err) => console.log(err))

        if (res2.affectedRows > 0) {
            ctx.body = {
                code:200,
                tips :'添加成功'
            } 
        } else {
            ctx.body = {
                code:400,
                tips :'添加失败'
            } 
        }
    }
})

//修改博客
blog.put('/blogs', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog SET title='${data.title}',introduce='${data.introduce}',
                 date='${data.date}',sortId=${data.sort_name},
                 mdname='${data.mdname}',technologyId=${data.technology_name},
                 content='${data.content}' WHERE id = ${data.id}`
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

//修改分类
blog.put('/sorts', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_sort SET sort_name='${data.sort_name}' WHERE id = ${data.id}`
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

//修改标签
blog.put('/labels', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog_technology SET technology_name='${data.technology_name}' WHERE id = ${data.id}`
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

//修改博客浏览量
blog.put('/blogsPageview',async ctx => {
    const id = ctx.request.body.blog_id
    const pageviews = ctx.request.body.pageviews

    const connection = await Mysql.createConnection(mysql)
    const sql = `UPDATE blog set pageviews=${pageviews} WHERE id=${id}`
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

//删除分类
blog.delete('/sorts', async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog_sort WHERE ?? = ?`
    const [res] = await connection.query(sql, ['id', id])
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

//删除标签
blog.delete('/labels', async ctx => {
    const id = ctx.request.query.id

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog_technology WHERE ?? = ?`
    const [res] = await connection.query(sql, ['id', id])
    connection.end((err) => console.log(err))

    if (res.affectedRows > 0) {
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

//删除博客
blog.delete('/blogs', async ctx => {
    const id = ctx.request.query.id;

    const connection = await Mysql.createConnection(mysql)
    const sql = `DELETE FROM blog WHERE ?? = ?`;
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
module.exports = blog
