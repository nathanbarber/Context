var socket;

function createConnection(room) {
    socket = io.connect();
    socket.emit('con', {});
    socket.emit('classify', {choice: room})
    socket.on("message", function(data) {
        var text = data.text;
        verseit(text, false, 'red');
        return;
    });
    socket.on("update", function(data) {
        var text = data.data;
        verseit(text, false, 'red');
        return;
    })
    socket.on("count", function(data) {
        setTimeout(function() {
            try {
                document.getElementById("total").innerHTML = '/  ' + data.count;
            } catch(e) {}
        }, 500);
    });
    socket.on("roomcount", function(data) {
        try {
            document.getElementById("room-count").innerHTML = data.count;
        } catch(e) {}
    })
}