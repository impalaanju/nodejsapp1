const express = require("express");
const path = require("path");
const { Socket } = require("socket.io");
var app = express();
var server = app.listen(3000,()=>{

    console.log("Listing to port 3000");
});

const io = require("socket.io")(server,{
    allowEIO3: true
});

app.use(express.static(path.join(__dirname,"")));

var userConnections = [];
io.on("connection",(socket)=>{
    console.log("Connection socket id is "+socket.id);
    socket.on("userconnect",(data)=>{
        console.log("user connected serverside");
        var other_users = userConnections.filter(
            (p) => p.meeting_id == data.meetingid
        );

        //console.log("Other users",other_users);

        userConnections.push({
            connectionid: socket.id,
            user_id: data.displayName,
            meeting_id: data.meetingid,
        });

        other_users.forEach((v)=>{
            socket.to(v.connectionid).emit("inform_others_about_me",{
                other_user_id: data.displayName,
                connid: socket.id, 
            });
        });

        socket.emit("inform_me_about_others",other_users);

    });

    socket.on("SDPProcess",(data)=>{
        socket.to(data.to_connid).emit("SDPProcess",{
            message: data.message,
            from_connid: socket.id, 
        });
    });
});


