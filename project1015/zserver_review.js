var http = require("http");
var url = require("url");
var fs = require("fs");
var mysql = require("mysql");
var ejs = require("ejs");
var qs = require("querystring");

var con;
var urlJson;

var server = http.createServer(function(request,response){
   urlJson = url.parse(request.url,true);
   console.log(urlJson);

   if(urlJson.pathname=="/"){
    fs.readFile("./index.html","utf-8",function(error,data){
        if(error){
            console("index.html 오류",error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(data);
        }
    })
   }else if(urlJson.pathname=="/member/registForm"){
    registForm(request,response);
   }else if(urlJson.pathname=="/member/loginForm"){
    
   }else if(urlJson.pathname=="/member/list"){
    getList(request,response);
   }else if(urlJson.pathname=="/member/regist"){
    regist(request,response);
   }else if(urlJson.pathname=="/member/detail"){
    getDetail(request,response);
   }else if(urlJson.pathname=="/member/del"){
    del(request,response);
  }else if(urlJson.pathname=="/member/edit"){
    update(request,response);
}

});


function registForm(request,response){
 var sql = "select *from skill";
    con.query(sql,function(error,record,fields){
        if(error){
            console.log("skill 조회실패",error);
        }else{
            // console.log("skill record",record);
           fs.readFile("./registForm.ejs","utf-8",function(error,data){
            if(error){
                console.log("registForm.ejs 읽기 실패",error);
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(ejs.render(data,{
                    skillArray:record
                }))
            }
           })
        }

    });
}

//회원등록 처리 
function regist(request, response){
    //post방식으로 전송된, 파라미터받기!! 
    request.on("data", function(param){
        //url모듈에게 파싱을 처리하게 하지 말고, querystring 모듈로 처리한다 
        //console.log("post param :", new String(param).toString());
        var postParam = qs.parse(new String(param).toString());
        console.log("postParam : ", postParam);

        var sql="insert into member2(uid,password,uname,phone,email,receive,addr,memo)";
        sql+=" values(?,?,?,?,?,?,?,?)"; //물음표를 바인드 변수라 한다

        con.query(sql,[ 
               postParam.uid,
               postParam.password,
               postParam.uname,
               postParam.phone,
               postParam.email,
               postParam.receive,
               postParam.addr,
               postParam.memo
            ], function(error, fields){
                if(error){
                    console.log("등록실패",error);
                }else{
                    //목록페이지 보여주기
                    //등록되었음을 alert()으로 알려주고, /member/list 로 재접속 
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    var tag="<script>";
                    tag+="alert('등록성공');";
                    tag+="location.href='/member/list';"; // <a> 태그와 동일한 효과
                    tag+="</script>";

                    response.end(tag);   
                }
        } );
    });
}

function getList(request,response){
    var sql = "select *from member2";
    con.query(sql,function(error,record,fields){
        if(error){
            console.log("조회실패",error);
        }else{
            fs.readFile("./list.ejs","utf-8",function(error,data){
                if(error){
                    console.log("list.ejs 읽기실패",error);
                }else{
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        memberArray:record
                    }));
                }
            })
        }
    })

}

function getDetail(request,response){
    var member2_id = urlJson.query.member2_id;
    var sql ="select * from member2 where member2_id="+member2_id;
    con.query(sql,function(error,record,fields){
        if(error){
            console.log("한건 조회 실패",error);
        }else{
            fs.readFile("./detail.ejs","utf-8",function(err,data){
                if(err){
                    console.log("detail.ejs실패",err);
                }else{
                    response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        member:record[0]
                    }))
                }

            })
        }
    })
}

function  del(request,response){
    var member2_id = urlJson.query.member2_id;
    var sql = "delete from member2 where member2_id="+member2_id;

    con.query(sql,function(error,fields){
        if(error){
            console.log("삭제 실패",error);
        }else{
            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            var tag="<script>";
            tag+="alert('탈퇴처리 되었습니다.');";
            tag+="location.href='/member/list';";
            tag+="</script>";
            response.end(tag);
        }

    })
}

function update(request,response){
    request.on("data",function(param){
        var postParam=qs.parse(new String(param).toString());

        var sql="update member2 set phone=?, email=?, addr=?, memo=?";
        sql+=", password=?, receive=? where member2_id=?";
        console.log("update param",postParam);

        con.query(sql,[
            postParam.phone,
            postParam.email,
            postParam.addr,
            postParam.memo,
            postParam.password,
            postParam.receive,
            postParam.member2_id
        ],function(error,fields){
            if(error){
                console.log("수정실패",error);
            }else{
                response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
            var tag="<script>";
            tag+="alert('수정 되었습니다.');";
            tag+="location.href='/member/detail?member2_id="+postParam.member2_id+"';";
            tag+="</script>";
            response.end(tag);
            }


        })


    })

}



function connect(){
    con = mysql.createConnection({
        url:"localhost",
        user:"root",
        password:"1234",
        database:"node"
    });
}

server.listen(8585,function(){
    console.log("My Server is 8585 ");
    connect();
});