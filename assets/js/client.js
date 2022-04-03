var connection = new WebSocket('ws://localhost:9090');

connection.onopen = function(){
    console.log("Connected to the server");
}

connection.onmessage = function(msg){
    var data = JSON.parse(msg.data)
    switch (data.type){
        case "login" :{
            loginProcess(data.success);
            break;
        }
    }
}

connection.onerror = function(error){
    console.log(error);
}

var local_video = document.querySelector("#local-video");
var uname;
var connectedUser;
var url_string = window.location.href;
var url = new URL(url_string);
var username = url.searchParams.get("username");

setTimeout(function() {
if(connection.readyState === 1){
    if(username != null) {
        uname = username;
        console.log(uname);
        console.log(uname);
        console.log(uname);
        if(uname.length > 0) {
            send({
                type:"login",
                name:uname
            })
        }
    }
} else {
    console.log("Connection has not established")
}
},3000);

function send(message) {
    if(connectedUser) {
        message.name = connectedUser;
    }
    connection.send(JSON.stringify(message))
}

function loginProcess(success) {
    if(success === false) {
        alert("Username is not correct, Try a different username")
    } else {
        navigator.getUserMedia({
            video:true,
            audio:true
        },function(myStream){
            stream = myStream;
            local_video.srcObject = stream;
        }, function(error){
            console.log(error);
        })
    }
}

