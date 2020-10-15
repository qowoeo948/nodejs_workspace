var http = require("http");
var url = require("url");
var fs = require("fs");
var mysql = require("mysql");

var ejs = require("ejs");

let conStr={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"node"
};

var con;

var server = http.createServer(function(request,response){
    var urlJson = url.parse(request.url,true);
    console.log(urlJson);
    
    if(urlJson.pathname=="/"){
        fs.readFile("./index.html","utf-8",function(error,data){
            if(error){
                console.log("에러입니다.",error);
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(data);
            }
        });

    }else if(urlJson.pathname=="/member/registForm"){
        fs.readFile("./registForm.html","utf-8",function(error,data){
            if(error){
                console.log("에러입니다.",error);
            }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(data);
            }
        });
    }else if(urlJson.pathname=="/member/loginForm"){
        fs.readFile("./loginForm.html","utf-8",function(error,data){
            if(error){
                console.log("에러입니다.",error);
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(data);
            }

        });
    }else if(urlJson.pathname=="/member/regist"){
        var sql = "insert into member2(uid,password,uname,phone,email,receive,addr,memo)";
        sql+=" values(?,?,?,?,?,?,?,?)";
        var param = urlJson.query;
        con.query(sql,[
            param.uid,
            param.password,
            param.uname,
            param.phone,
            param.email,
            param.receive,
            param.addr,
            param.memo
        ],function(error,result,fields){
            if(error){
                console.log("오류입니다.",error);
            }else{
                sql = "select last_insert_id() as member2_id";

                con.query(sql,function(error,record,fields){
                    if(error){
                        console.log("가져오기 실패",error);
                    }else{
                        console.log("record:  ",record);
                        var member2_id = record[0].member2_id;
                        for(var i=0;i<param.skill_id.length;i++){
                        sql="insert into member_skill(member2_id,skill_id) values("+member2_id+","+param.skill_id[i]+")";
                        console.log("스킬등록 쿼리: ",sql);

                        con.query(sql,function(err){
                            if(err){
                                alert("회원정보 등록 실패");
                            }else{
                                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                                response.end("회원정보 등록완료");
                            }
                        })
                    }
                    }



                });

            }
        })
      

    }else if(urlJson.pathname=="/member/list"){
        var sql = "select *from member2";
        con.query(sql,function(error,record,fields){

        var tag = "<table width='100%' border='2px'>";
            tag+="<tr>";
            tag+="<td>member2_id</td>";
            tag+="<td>uid</td>";
            tag+="<td>password</td>";
            tag+="<td>uname</td>";
            tag+="<td>phone</td>";
            tag+="<td>email</td>";
            tag+="<td>receive</td>";
            tag+="<td>addr</td>";
            tag+="<td>memo</td>";
            tag+="</tr>";

            for(var i=0;i<record.length;i++){
                var member = record[i];
                tag+="<tr>";
                tag+="<td><a href='/member/detail?member2_id="+member.member2_id+"'>"+member.member2_id+"</a></td>";
                tag+="<td>"+member.uid+"</td>";
                tag+="<td>"+member.password+"</td>";
                tag+="<td>"+member.uname+"</td>";
                tag+="<td>"+member.phone+"</td>";
                tag+="<td>"+member.email+"</td>";
                tag+="<td>"+member.receive+"</td>";
                tag+="<td>"+member.addr+"</td>";
                tag+="<td>"+member.memo+"</td>";
                tag+="</tr>";
            }

            tag+="</table>";

            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(tag);
        })
    }else if(urlJson.pathname=="/member/detail"){
        var member2_id = urlJson.query.member2_id;

        var sql = "select *from member2 where member2_id="+member2_id;
        con.query(sql,function(error,record,fields){
            if(error){
                console.log("회원 조회 실패",error);
            }else{
               var obj = record[0];

               fs.readFile("./detail.ejs","utf-8",function(error,data){
                if(error){
                    console.log(error);
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        member:obj
                    }));
                }
               })
            }

        })



    }
   


});


function getConnection(){
    con = mysql.createConnection(conStr);
}

server.listen(1999,function(){
    console.log("My Server is running at port 1999....");
    getConnection();
});
