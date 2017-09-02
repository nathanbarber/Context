var express = require('express');
var bodyparser = require('body-parser');
var favicon = require('serve-favicon');
var path = require('path');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use(favicon(path.join(__dirname + "/public" + "/img" + "/favicon.png")));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

var server = require("http").createServer(app);
var io = require('socket.io')(server);
server.listen(8084, function() {
    console.log("listening on port 8083");
});

var connectionCount = 0;
var softDisconnect = false;

io.on('connection', function(socket) {
    connectionCount++;
    console.log("Client connected: " + connectionCount + " users online | " + new Date);
    io.emit("count", {count: connectionCount, decrement: false});
    socket.on("disc", function(data) {
        connectionCount--;
        console.log("Client disconnected: " + connectionCount + " users online | " + new Date);
        io.emit("count", {count: connectionCount, decrement: false});
        softDisconnect = true;
        socket.disconnect();
    })
    socket.on("disconnect", function() {
        if(softDisconnect == false) {
            connectionCount--;``
            console.log("Client disconnected: " + connectionCount + " users online | " + new Date);
            io.emit("count", {count: connectionCount, decrement: true});
            socket.disconnect();
        } else {
            softDisconnect = false;
        }
    })
    socket.on('classify', function(data) {
        var s = '/' + data.choice;
        socket.join(s);
    });
    socket.on('chat message', function(message) {
        socket.broadcast.in(getRoom(socket)).emit("message", {text: message});
        //console.log(getRoom(socket));
    });
});

function getRoom(client) {
    var rooms = client.rooms;
    for(var key in rooms) {
        if(key.substring(0, 1) == '/') {
            return key;
        }
    }
}

function userCount(room) {
    var clients = io.nsps['/'].adapter.rooms[room];
    if(clients == null || clients == undefined) {
        return undefined;
    } else {
        return Object.keys(clients).length;
    }
}

setInterval(function() {
    var openrooms = io.sockets.adapter.rooms
    var existing = new Array();
    for(var i in openrooms) {
        if(i.substring(0,1) == '/') {
            existing.push(i);
        }
    }
    for(var i = 0; i < existing.length; i++) {
        var c = io.sockets.adapter.rooms[existing[i]].length;
        //console.log(existing[i] + " with users: " + c);
        io.in(existing[i]).emit("roomcount", {count: c});
    }
}, 300);
    
app.get('/activerooms', function(req, res) {
    var finalreturn = new Array();
    var openrooms = io.sockets.adapter.rooms
    var existing = new Array();
    for(var i in openrooms) {
        if(i.substring(0,1) == '/') {
            existing.push(i);
        }
    }
    for(var i = 0; i < existing.length; i++) {
        var c = io.sockets.adapter.rooms[existing[i]].length;
        finalreturn.push({room: existing[i], online: c});
    }
    var ii = 0;
    while(ii < finalreturn.length) {
        if(ii > 0 && finalreturn[ii].online > finalreturn[ii-1].online) {
            var temp = finalreturn[ii];
            finalreturn[ii] = finalreturn[ii-1];
            finalreturn[ii - 1] = temp;
            ii--;
        } else {
            ii++;
        }
    }
    res.send(finalreturn);
});