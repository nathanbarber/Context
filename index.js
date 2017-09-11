var express = require("express"),
    http = require("http"),
    socketio = require("socket.io"),
    path = require("path"),
    fav = require("serve-favicon"),
    clientsConnected = 0,
    port = 8083;

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
        //console.log(socket.id + " chose room " + data);
        io.emit("query-count-update");
    });
    socket.on("fetch-count-update", function(room) {
        io.in(room).clients(function(err, userArray) {
            socket.emit("updated-count", {
                inRoom: userArray.length,
                total: clientsConnected
            });
        });
    });
    socket.on("message", function(data) {
        socket.broadcast.to(data.room).emit("message-in", data);
    }); 
    socket.on("activity", function(data) {
        var rooms = [];
        for(var i in io.sockets.adapter.rooms) {
            if(i.length < 15) {
                rooms.push({
                    room: i,
                    clients: (function(room) {
                        var clients = 0;
                        for(var j in io.sockets.adapter.rooms[room].sockets) {
                            clients++;
                        }
                        return clients;
                    })(i)
                });
            }
        }
        function compare(a,b) {
            if (a.clients < b.clients)
                return 1;
            if (a.clients > b.clients)
                return -1;
            return 0;
        }
        rooms.sort(compare);
        socket.emit("activity-response", rooms);
    });
    socket.on("disconnect", function(socket) {
        clientsConnected--;
        console.log(clientsConnected + " users online");
        io.emit("query-count-update");
    });
});