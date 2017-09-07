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
    };
    $scope.fromRoom = function(event) {
        if(event.keyCode == 13) {
            if($("#room").val() != '') {
                $scope.room = $("#room").val().toUpperCase();
                room = $scope.room;
                TweenMax.to("#room", 0.3, {top: "-100%"});
                TweenMax.to(".slider", 0.3, {top: "-100%", onComplete: function() {
                    TweenMax.set(".slider", {top: "100%"});
                    TweenMax.to("#name", 0.3, {top: 0, onComplete: function() {
                        $("#name").focus();
                    }});
                }});
            }
        }
    };
    $scope.fromName = function() {
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
    };
});

app.controller('com', function($scope, $location) {
    socket = io.connect();
    socket.emit("choose-room", room);
});