var http = require("http");
var fs = require("fs");
var express = require("express");
var static = require("serve-static");
var mysql = require("mysql");
var common = require("./common.js");
var ejs = require("ejs");
const { response } = require("express");

var conStr ={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"node"
};
var con;

var app = express();
// console.log("디렉터리 경로  ",__dirname);

app.use(static(__dirname+"/static"));
app.use(express.urlencoded({
    extended:true
}));

app.post("/notice/regist",function(request, response){
    var title = request.body.title;
    var writer = request.body.writer;
    var content = request.body.content;

    console.log("title: ",title);
    console.log("writer: ",writer);
    console.log("content: ",content);
   
    var sql = "insert into notice(title,writer,content)";
        sql+=" values(?,?,?)";
        
        con.query(sql,[
            title,
            writer,
            content
        ],function(error,fields){
            if(error){
                console.log("insert 실패",error);
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(common.getMsgURL("등록성공","/notice/list"));
            }
            
        })

});

app.get("/notice/list",function(request,response){
    var sql = "select *from notice order by notice_id desc";

    con.query(sql,function(error,record,fields){
        if(error){
            console.log("list error",error);
        }else{
            fs.readFile("list.ejs","utf-8",function(err,data){
                if(err){
                    console.log("list.ejs 에러",err);
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        noticeArray:record
                    }));
                }

            })
        }
    })
})

app.get("/notice/detail",function(request,response){
    var notice_id = request.query.notice_id;
    var sql = "select *from notice where notice_id="+notice_id;
    con.query(sql,function(error,record,fields){
        if(error){
            console.log("select error",error);
        }else{
            fs.readFile("detail.ejs","utf-8",function(err,data){
                if(err){
                    console.log("list.ejs error",err);
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        notice:record[0]
                    }))
                }
            })
        }
    })
})

app.post("/notice/del",function(request,response){
    var notice_id = request.body.notice_id;
    var sql ="delete from notice where notice_id="+notice_id;

    con.query(sql,function(error,fields){   
        if(error){
            console.log("delete error",error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(common.getMsgURL("삭제성공","/notice/list"));
        }

    })

})

app.post("/notice/updat",function(request,response){
    var notice_id = request.body.notice_id;
    var title = request.body.title;
    var writer = request.body.writer;
    var content = request.body.content;

    

    var sql = "update notice set title=?, writer=?, content=?"
        sql+=" where notice_id="+notice_id;
    con.query(sql,[
        title,
        writer,
        content,
    ],function(error,fields){
        if(error){
            console.log("updat error",error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(common.getMsgURL("수정성공","/notice/list"));
        }


    })


})




function connect(){
    con = mysql.createConnection(conStr);
}


var server = http.createServer(app);

server.listen(3333,function(){
    console.log("MY PORT 3333...");
    connect();
})