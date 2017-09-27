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
var userLocation;

app.controller('home', function($scope, $location) {
    if(socket) {
        socket.disconnect();
        socket = io.connect();
    } else {
        socket = io.connect();
    }
    $(document).ready(function() {
        if(isMobile() == false) {
            $(".background").css({
                position: "fixed"
            });
            $(".local-block, .local-spawn").addClass("padding-expand");
            $(".post, .block").addClass("shadow-expand");
        }
        $(".background").css({
            background: "red url('lib/" + (Math.floor(Math.random() * 8) + 1) + ".gif') no-repeat center",
            backgroundSize: "cover"
        });
    });
    $scope.hover = function() {
        if(isMobile()) {
            $scope.initial();
        } else {
            if($(".label").css("top") == "0px") {
                TweenMax.to(".slider", 0.3, {top: "0%"});
                TweenMax.to(".label", 0.3, {color: "#dd8888"});
            }
        }
    };
    $scope.leave = function() {
        if($(".label").css("top") == "0px") {
            TweenMax.to(".slider", 0.3, {top: "100%"});
            TweenMax.to(".label", 0.3, {color: "white"});
        }
    };
    $scope.initial = function() {
        TweenMax.to(".label", 0.3, {top: "-100%"});
        TweenMax.to(".slider", 0.3, {top: "-100%", onComplete: function() {
            TweenMax.set(".slider", {top: "100%"});
            TweenMax.to(".slider", 0.3, {top: "-100%"});
            TweenMax.to("#room", 0.3, {top: "0%", onComplete: function() {
                $("#room").focus();
            }});
        }});
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
    };
    $scope.locationListener = function(event) {
        if(event.keyCode == 13) {
            var zip = $("#zip").val();
            if(/[0-9]/g.test(zip) == true && zip.length == 5) {
                userLocation = zip;
                $("#header-text").text("Nearby");
                $("#zip").css("display", "none");
                $(".local-spawn").css("display", "initial");
                socket.emit("get-posts", userLocation);
                socket.on("local-posts", function(data) {
                    console.log(data);
                    $(".local-block").remove();
                    for(var i in data) {
                        $(".local-topics").append("<div class='local-block col-12 col-sm-6 col-md-4'><div class='block'><div class='block-topic'>" + data[i].replace(/\d/g, '').replace(/\-/g, ' ') + "</div></div></div>");
                    }
                });
            } else {
                $("#zip").val("");
            }
        }
    };
    $scope.newPostable = function() {
        TweenLite.to(".plus", 0.3, {opacity: 0, onComplete: function() {
            TweenLite.set(".plus", {display: "none"});
            TweenLite.to(".newPostable", 0.3, {top: 0});
        }});
        $(window).click(function() {
            TweenLite.set(".plus", {display: "initial"});
            TweenLite.to(".newPostable", 0.3, {top: "100%", onComplete: function() {
                TweenLite.to(".plus", 0.3, {opacity: 1});
            }}); 
            $(".newPostable").find("input").val("");
        });
        $('.local-spawn').click(function(event) {
            event.stopPropagation();
        });
    };  
    $scope.submitPostable = function() {
        var postable = {
            name: $(".newPostable").find("#topic").val(),
            location: userLocation
        };
        if(postable.name.length > 3 && postable.name.replace(" ", '').length > 3) {
            socket.emit("create-postable", postable);
            socket.emit("get-posts", userLocation);
        } else {
            alert("Revise your posting");
        }
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
    socket.on("room-log", function(data) {
        if(data) {
            for(var i in data) {
                if(data[i].split(":")[0] == name) {
                    $('#loader').append("<div class='message-out'> " + data[i] + "</div>");
                } else {
                    $('#loader').append("<div class='message-in'> " + data[i] + "</div>");
                }
            }
            top();
        } else {

        }
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
    function send() {
        var messageBody = $(".input-box").val();
        if(messageBody.length > 0) {
            socket.emit("message", {name: name, room: room, message: messageBody});
            $('.loader').append("<div class='message-out'> " + name + ": " + messageBody + "</div>");
        }
        $(".input-box").val('');
        top();
        $(".input-box").focus();        
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

// Standard Functions

function isMobile() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    }
    return false;
}