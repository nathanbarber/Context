var express = require("express"),
    http = require("http"),
    socketio = require("socket.io"),
    node_redis = require("redis"),
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
var redis = node_redis.createClient();
redis.flushdb();
io.on("connection", function(socket) {
    clientsConnected++;
    console.log(clientsConnected + " users online");
    socket.on("choose-room", function(data) {
        socket.join(data);
        io.emit("query-count-update");
        redis.lrange(data, 0, -1, function(err, res) {
            if(res) {
                socket.emit("room-log", res);
            }
        });
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
        redis.rpush(data.room, data.name + ": " + data.message, function(err, res) {
            if(err)
                console.log(err);
        });
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

    // Local - postable

    socket.on("create-postable", function(data) {
        redis.lpush(data.name + "-" + data.location, "New Topic: " + data.name);
    });
    socket.on("get-posts", function(data) {
        redis.keys("*-" + data.substring(0,3) + "??", function(err, res) {
            socket.emit("local-posts", res);
        });
    });
    socket.on("post-to", function(data) {
        redis.lpush(socket.posting, data.post);
    });

    // End

    socket.on("disconnect", function(socket) {
        clientsConnected--;
        console.log(clientsConnected + " users online");
        io.emit("query-count-update");
        var rooms = [];
        for(var i in io.sockets.adapter.rooms) {
            if(i.length < 20) {
                rooms.push(i);
            }
        }
        redis.keys("*", function(err, res) {
            for(var i in res) {
                if(rooms.includes(res[i])) {
                    continue;
                } else {
                    redis.del(res[i]);
                }
            }
        });
    });
});