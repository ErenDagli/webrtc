var webSocketServ = require('ws').Server;

var wss = new webSocketServ({
    port:9090
})

var users = { };
wss.on('connection',function(conn) {
    console.log("User connected");

    conn.on('message',function(message){
        var data;

        try{
            data = JSON.parse(message);
        } catch(e){
            console.log("Invalid JSON");
            data = {};
        }

        switch(data.type){
            case "login": {
                debugger;
                if(users[data.name]){
                    sendToOtherUser(conn,{
                        type: "login",
                        success:false
                    })
                } else {
                    users[data.name] = conn;
                    conn.name = data.name;
                    sendToOtherUser(conn, {
                        type: "login",
                        success: true
                    })
                }
                break;
            }

            case "offer": {
                debugger;
                var connect = users[data.name];
                if(connect != null){
                    conn.otherUser = data.name;
                    sendToOtherUser(connect,{
                        type: "offer",
                        offer : data.offer,
                        name: conn.name
                    })
                }
                break;
            }

            case "answer": {
                debugger;
                var connect = users[data.name];

                if(connect != null) {
                    conn.otherUser = data.name;
                    sendToOtherUser(connect,{
                        type: "answer",
                        answer : data.answer
                    })
                }
                break;
            }

            case "candidate": {
                debugger;
                var connect = users[data.name];

                if(connect != null) {
                    sendToOtherUser(connect,{
                        type:"candidate",
                        candidate: data.candidate
                    })
                }
                break;
            }
            
            case "reject": {
                debugger;
                var connect = users[data.name];

                if(connect != null) {
                    sendToOtherUser(connect,{
                        type:"reject",
                        name: conn.name
                    })
                }
                break;
            }
            
            case "accept": {
                debugger;
                var connect = users[data.name];

                if(connect != null) {
                    sendToOtherUser(connect,{
                        type:"accept",
                        name: conn.name
                    })
                }
                break;
            }

            case "leave":{
                debugger;
                var connect = users[data.name];
                if(connect != null) {
                    sendToOtherUser(connect,{
                        type:"leave"
                    })
                }
                break;
            }

            default:
                debugger;
                sendToOtherUser(conn,{
                    type:"error",
                    message:"Command not found: " + data.type
                })
                break;
        }

    })
    conn.on('close',function() {
        console.log('Connection closed');
        if(conn.name){
            delete users[conn.name];
            if(conn.otherUser){
                var connect = users[conn.otherUser];
                conn.otherUser = null;
                if(conn!= null){
                    sendToOtherUser(connect, {
                        type:"leave"
                    })
                }
            }
        }
    })

    conn.send("Hello World");
})

function sendToOtherUser(connection,message){
    if(connection != undefined){
        connection.send(JSON.stringify(message))
    }
}