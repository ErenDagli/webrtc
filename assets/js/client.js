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
        case "offer" :{
            call_status.innerHTML = ' <div class="calling-status-wrap card black white-text"> <div class="user-image"> <img src="assets/images/me.jpg" class="caller-image circle" alt=""> </div> <div class="user-name"> Ahmet Eren </div> <div class="user-calling-status"> Calling... </div> <div class="calling-action"> <div class="call-accept"> <i class="material-icons green darken-2 white-text audio-icon"> call </i> </div> <div class="call-reject"> <i class="material-icons red darken-3 white-text close-icon"> close </i> </div> </div> </div>';
            var call_receive = document.querySelector('.call-accept');
            var call_reject = document.querySelector('.call-reject');
            call_receive.addEventListener("click",function(){
                acceptCall(data.name);
                offerProcess(data.offer,data.name);
                call_status.innerHTML = '';
            })
            call_reject.addEventListener("click",function(){
                alert('Call is rejected');
                call_status.innerHTML = '';
                rejectedCall(data.name);
            })
            break;
        }
        case "answer" :{
            answerProcess(data.answer);
            break;
        }
        case "candidate" :{
            candidateProcess(data.candidate);
            break;
        }
        case "reject" :{
            rejectProcess();
            break;
        }
        case "accept" :{
            acceptProcess();
            break;
        }
    }
}

connection.onerror = function(error){
    console.log(error);
}

var connected_user;
var local_video = document.querySelector("#local-video");
var call_btn = document.querySelector("#call-btn");
var call_to_username_input = document.querySelector("#username-input");
var call_status = document.querySelector(".call-hang-status");

call_btn.addEventListener("click",function(){
    var call_to_username = call_to_username_input.value;
    call_status.innerHTML = ' <div class="calling-status-wrap card black white-text"> <div class="user-image"> <img src="assets/images/other.jpg" class="caller-image circle" alt="">  </div> <div class="user-name"> Ahmet Eren </div> <div class="user-calling-status"> Calling... </div> <div class="calling-action"> <div class="call-reject"> <i class="material-icons red darken-3 white-text close-icon"> close </i> </div> </div> </div>';

    var call_reject = document.querySelector('.call-reject');
    
    call_reject.addEventListener("click",function(){
        alert('Call is rejected');
        call_status.innerHTML = '';
        rejectedCall(call_to_username);
    })

    if(call_to_username.length > 0) {
        connected_user = call_to_username;
        myConn.createOffer(function(offer){
            send({
                type:"offer",
                offer:offer
            })
            myConn.setLocalDescription(offer)
        }, function(error){
            alert("Offer has not created")
        })
    }
})

var uname;
var url_string = window.location.href;
var url = new URL(url_string);
var myConn;
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
    if(connected_user) {
        message.name = connected_user;
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
            
        var configuration = {
            "iceServers" : [{
                "url":"stun:stun2.1.google.com:19302"
            }]
        } 

        myConn = new webkitRTCPeerConnection(configuration,{
            optional:[{
                RtpDataChannels:true
            }]
        });

        myConn.addStream(stream);

        myConn.onicecandidate = function(event) {
            if(event.candidate){
                send({
                    type:"candidate",
                    candidate: event.candidate
                })
            }
        }
        }, function(error){
            console.log(error);
        });


    }
}

function offerProcess(offer,name){
    connected_user = name;
    myConn.setRemoteDescription(new RTCSessionDescription(offer))
    alert(name);
    myConn.createAnswer(function(answer) {
        myConn.setLocalDescription(answer);
        send({
            type:"answer",
            answer: answer
        })
    }, function(error){
        alert("Answer has not created");
    })

}

function answerProcess(answer){
    myConn.setRemoteDescription(new RTCSessionDescription(answer))
}

function candidateProcess(candidate){
    myConn.addIceCandidate(new RTCIceCandidate(candidate))
}

function rejectedCall(rejected_caller_or_callee){
    send({
        type:"reject",
        name:rejected_caller_or_callee
    })
}

function acceptCall(callee_name){
    send({
        type:"accept",
        name:callee_name
    })
}


function rejectProcess() {
    call_status.innerHTML = '';
}

function acceptProcess() {
    call_status.innerHTML = '';
}

