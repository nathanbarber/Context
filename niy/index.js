var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

var server = require("http").createServer(app);
var io = require('socket.io')(server);
server.listen(8083, function() {
    console.log("listening on port 8083");
});

var connectioncount = 0;

io.on('connection', function(socket) {
    connectioncount++;
    console.log("connection  / " + connectioncount + " users online");
    io.emit('count', {count: connectioncount});
    socket.on('disconnect', function(){
        connectioncount--;
        console.log('user disconnected / ' + connectioncount + " users online");
    });
    socket.on('chat message', function(message) {
        console.log("message: " + message);
        socket.broadcast.emit("message", {text: message});
    });
});



//room generation
var room = Math.floor(Math.random() * 10000);
var uses = 0;
app.get('/channel', function(req, res) {
    if(uses < 2) {
        res.end("" + room);
        uses++;
    } else {
        room = Math.floor(Math.random() * 10000);
        res.end("" + room);
        uses = 1;
    }
})