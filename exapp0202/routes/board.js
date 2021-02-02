var express = require('express');
var router = express.Router();

var mysql = require("mysql");
var conStr={
  url:"localhost",
  user:"root",
  password:"1234",
  database:"android"
}

/* /board/ 요청을 처리하는 메서드 */
router.get('/', function(request, response, next) {
  var con = mysql.createConnection(conStr);
  var sql = "select *from board order by board_id desc";
  con.query(sql,function(error,result,fields){
    if(error){
      response.writeHead(500,{"Content-Type":"application/json;charset=utf-8"});
      var message={};
      message["msg"]="가져오기 실패";
      message["code"]="0";
      response.end(JSON.stringify(message));

    }else{
      response.writeHead(200,{"Content-Type":"application/json;charset=utf-8"});
      response.end(JSON.stringify(result));
    }

  });
});

//등록
router.post("/",function(request,response,next){

  console.log("게시판 등록을 원해?");
  console.log(request.body);
  request.body; //post로 전송된 데이터 받기!
  var con = mysql.createConnection(conStr);
  var sql="insert into board(title,writer,content) values(?,?,?)";
  var title=request.body.title;
  var writer=request.body.writer;
  var content=request.body.content;
  con.query(sql,[title,writer,content],function(error,result,fields){
    if(error){
      response.writeHead(500,{"Content-Type":"application/json;charset=utf-8"});
      response.end("{....}");
    }else{
      response.writeHead(200,{"Content-Type":"application/json;charset=utf-8"});
      var message={};
      message["msg"]="등록성공";
      message["code"]="1";
      response.end(JSON.stringify(message));

      //웹소켓을 통해, 브로드케스팅 하자!!
      console.log("app.js파일의 sockeyArray",socketArray);
      broadCasting(JSON.stringify(message));

    }

  });
});


  //한건
  //url임에도 불구하고, 파라미터로 추출가능..
  router.get("/:board_id",function(request,response,next){
    console.log("넘겨받은 아이디는 ",request.params.board_id);
    
  }); 


function broadCasting(msg){
  for(var i=0;i<socketArray.length;i++){
    socketArray[i].send(msg); 
  }
}

module.exports = router;
