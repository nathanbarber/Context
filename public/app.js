var app = angular.module("context", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'home'
    })
    .when('/com', {
        templateUrl: 'views/com.html',
        controller: 'com'
    });
});

var room = '';
var name = '';
var socket;

app.controller('home', function($scope, $location) {
    if(socket) {
        socket.disconnect();
    }
    $scope.hover = function() {
        if($(".label").css("top") == "0px") {
            TweenMax.to(".slider", 0.3, {top: "0%"});
            TweenMax.to(".label", 0.3, {color: "red"});
        }
    };
    $scope.leave = function() {
        if($(".label").css("top") == "0px") {
            TweenMax.to(".slider", 0.3, {top: "100%"});
            TweenMax.to(".label", 0.3, {color: "white"});
        }
    };
    $scope.initial = function() {
        console.log("initial");
        TweenMax.to(".label", 0.3, {top: "-100%"});
        TweenMax.to(".slider", 0.3, {top: "-100%", onComplete: function() {
            TweenMax.set(".slider", {top: "100%"});
            TweenMax.to(".slider", 0.3, {top: "-100%"});
            TweenMax.to("#room", 0.3, {top: "0%"});
        }});
        socket = io.connect();
        socket.emit("activity");
        socket.on("activity-response", function(data) {
            $("#activity").find(".pair").remove();
            for(var i in data) {
                $("#activity").append("<div class='pair'><span class='room'>" + 
                    data[i].room + ": </span><span class='count'>" + 
                    data[i].clients + "</span></div>");
                TweenMax.to("#activity", 0.3, {opacity: 1, marginTop: "20px"});
            }
        });
    };
    $scope.fromRoom = function(event) {
        if(event.keyCode == 13) {
            if($("#room").val() != '' && $("#room").val().length < 15) {
                $("#room").blur();
                $scope.room = $("#room").val().toUpperCase();
                room = $scope.room;
                TweenMax.to("#room", 0.3, {top: "-100%"});
                TweenMax.to(".slider", 0.3, {top: "-100%", onComplete: function() {
                    TweenMax.set(".slider", {top: "100%"});
                    TweenMax.to("#name", 0.3, {top: 0, onComplete: function() {
                        $("#name").focus();
                    }});
                }});
                TweenMax.to("#activity", 0.3, {opacity: 0, marginTop: "120px"});
            } else {
                TweenLite.to("#button", 0.15, {borderColor: "red", onComplete: function() {
                    TweenLite.to("#button", 0.15, {borderColor: "white"});
                }});
                $("#room").val("");
            }
        }
    };
    $scope.fromName = function(event) {
        console.log("fromname");
        if(event.keyCode == 13) {
            if($("#name").val() != '') {
                $scope.name = $("#name").val();
                name = $scope.name;
                $location.path("/com");
            }
        }
    };
    $scope.revertButton = function() {
        TweenMax.to("#button input", 0.3, {top: "100%", onComplete: function() {
            TweenMax.to(".slider", 0.3, {top: "100%"});
            TweenMax.to(".label", 0.3, {top: 0, color: "white"});
            $("#button input").val('');
        }});
        TweenMax.to("#activity", 0.3, {opacity: 0, marginTop: "120px"});
        if(socket) {
            socket.disconnect();
        }
        socket = undefined;
    };
});

app.controller('com', function($scope, $location) {
    if(room == '' || name == '') {
        if(socket) {
            socket.disconnect();
        }
        $location.path("/");
    }
    $(document).ready(function() {
        $(".input-box").focus();
    });
    if(socket == undefined) {
        socket = io.connect();
    }
    socket.emit("choose-room", room);
    socket.on("query-count-update", function() {
        socket.emit("fetch-count-update", room);
    });
    socket.on("updated-count", function(data) {
        $('#room-name').text(room);
        $('#room-count').text(data.inRoom);
        $('#total-count').text(data.total);
    });
    socket.on("message-in", function(data) {
        $('.loader').append("<div class='message-in'> " + data.name + ": " + data.message + "</div>");
        top();
    });
    function top() {
        var loader = document.getElementById("loader");
        loader.scrollTop = loader.scrollHeight;
    }
    function hideKeyboard(element) {
        element.attr('readonly', 'readonly');
        element.attr('disabled', 'true');
        setTimeout(function() {
            element.blur();
            element.removeAttr('readonly');
            element.removeAttr('disabled');
        }, 100);
    }
    function send() {
        var messageBody = $(".input-box").val();
        if(messageBody.length > 0) {
            console.log(messageBody);
            socket.emit("message", {name: name, room: room, message: messageBody});
            $('.loader').append("<div class='message-out'> " + name + ": " + messageBody + "</div>");
        }
        $(".input-box").val('');
        top();
        hideKeyboard(document.getElementById("#input-box"));
        $(".input-box").blur();        
    }
    $scope.sendButton = function() {
        send();
    };
    $scope.sendListener = function(event) {
        if(event.keyCode == 13) {
            send();
        }
    };
    $scope.leave = function() {
        $location.path("/");
    };
});