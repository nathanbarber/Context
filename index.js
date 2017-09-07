var express = require("express"),
    http = require("http"),
    socketio = require("socket.io"),
    path = require("path"),
    fav = require("serve-favicon"),
    clientsConnected = 0,
    port = 8084;

var app = express();
app.use("/socket", express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use(express.static(__dirname + "/public"));
app.use(fav(path.join(__dirname + "/public/img/favicon.png")));

var server = http.createServer(app);
var io = socketio(server);
server.listen(port, function() {
    console.log("\t CONTEXT running on port " + port);
});

io.on("connection", function(socket) {
    clientsConnected++;
    console.log(clientsConnected + " users online");
    socket.on("choose-room", function(data) {
        socket.join(data);
        console.log(socket.id + " chose room " + data);
    });
    socket.on("disconnect", function(socket) {
        clientsConnected--;
        console.log(clientsConnected + " users online");
    });
});