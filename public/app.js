var app = angular.module("redshift", ["ngRoute"]);
var room = "Connection Interrupted"
var activerooms = new Array();
var name;

app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        controller: 'home',
        templateUrl: '/views/home.html'
    })
    .when('/live', {
        controller: 'live',
        templateUrl: '/views/live.html'
    })
});

app.run(function() {
    updateActive();
})

app.controller('home', function($scope, $location) {
    var listen;
    var triggered;
    var last;
    var stage1;
    var stage2;
    var complete;
    $(".enter").mouseenter(function() {
        if(!triggered) {
            TweenMax.to($(this).find(".juice"), .2, {top: 0 + "%"});
            TweenMax.to($(".label"), .2, {color: "red"});
        }
    })  
    $(".enter").mouseleave(function() {
        if(!triggered) {
            TweenMax.to($(this).find(".juice"), .2, {top: 100 + "%"});
            TweenMax.to($(".label"), .2, {color: "#d3d3d3"});
        }
    })  
    $(".enter").mousedown(function() {
        if(parseFloat($('.roomwrapper').css("top")) > 10) {
            TweenLite.to(".roomwrapper", .2, {top: 0 + "%"});
            TweenLite.to(".juice", .2, {top: -100 + "%"})
            TweenLite.to(".label", .2, {top: -100 + "%"})
            TweenLite.to('.trendPanel', .2, {right: 5+'vw'})
            updateActive();
            triggered = true;
            stage1 = true;
        } else {
            if(stage1) {
                document.getElementById("roominput").value = "";
            }
        }
        if(last) {
            document.getElementById("nameinput").value = "";
        }
    })
    $('.enter').keypress(function(e) {
        if(stage1) {
            if(e.which == 13) {
                nameOverlay();
                stage1 = false;
                stage2 = true;
            }
        } else if(stage2) {
            if(e.which == 13 && document.getElementById("nameinput").value != "Pseudonym?") {
                complete = true;
            }
        }
    })
    $('.video').mousedown(function() {
        if(triggered) {
            TweenLite.to(".roomwrapper", .2, {top: 100 + "%"});
            TweenLite.to(".juice", .2, {top: 100 + "%"})
            TweenLite.to(".label", .2, {top: 0 + "%", color: "#d3d3d3"})
            TweenLite.to(".secondjuice", .2, {top: 100+"%"})
            TweenLite.to(".namewrapper", .2, {top: 100+"%"})
            TweenLite.to('.trendPanel', .2, {right: -25 + 'vw'})
            setTimeout(function() {
                document.getElementById("roominput").value = "What Topic?";
                document.getElementById("nameinput").value = "Pseudonym?";
            }, 200);
            triggered = false;
            last = false;
        }
    });

    function nameOverlay() {
        TweenLite.to(".roomwrapper", .2, {top: -100 + "%"})
        TweenLite.to(".secondjuice", .4, {top: -100+"%"})
        TweenLite.to(".namewrapper", .2, {top: 0+"%"})
        TweenLite.to('.trendPanel', .2, {right: -25 + 'vw'})
        last = true;
    }

    $scope.switch = function(e) {
        if(e.keyCode == 13) {
            if(complete) {
                $location.path("/live");
                room = document.getElementById("roominput").value;
                room = room.toLowerCase();
                name = (document.getElementById("nameinput").value)
                name = name.substring(0,1).toUpperCase() + name.substring(1).toLowerCase();
                if(name.length > 15) {
                    name = name.substring(0, 15);
                }
                if(room.length > 15) {
                    room = room.substring(0, 15);
                }
                createConnection(room)
                //SWITCH PAGES
            }
        }
    }
})

app.controller('live', function($scope, $location) {
    $(".field").focus();
    document.getElementById("rname").innerHTML = room;
    $scope.ref = function(key) {
        if(room != "Connection Interrupted") {
            socket.emit('disc', {data: ""});
        }
        $location.path('/')
        setTimeout(function() {
            updateActive();
        }, 500)
    }
    $('.toss').mouseenter(function() {
        TweenLite.to($(this).find(".tossjuice"), .2, {top: 0 + "%", ease: Power4.easeIn})
        TweenLite.to($(this).find(".tosstext"), .2, {color: "white"});
    });
    $('.toss').mouseleave(function() {
        TweenLite.to($(this).find(".tossjuice"), .2, {top: -100 + "%", ease: Power4.easeOut})
        var t = $(this).find('.tossjuice');
        setTimeout(function() {
            TweenLite.set(t, {top: 100 + "%"})
        }, 200);
        TweenLite.to($(this).find(".tosstext"), .2, {color: "red"});
    });
    $("#toss").mousedown(function() {
        verseit(document.getElementById("f").value, true, 'green');
    })

    $scope.keycheck = function($event) {
        if($event.keyCode == 13) {
            verseit(name + ":  " + document.getElementById("f").value, true, 'green');
        }
    }
})

app.controller('menu', function($scope) {
    
})

function verseit(txt, sec, color) {
    if(txt.replace(/ /g, '') != '' && txt != ''){
        var loader = document.getElementById("l");
        var verse = document.createElement("div")
        if(color == "red") {
            verse.setAttribute("class", "verse");
        } else if(color == "green") {
            verse.setAttribute("class", "respond");
        }
        verse.innerHTML = "<div style='margin-left: 2vw'>" + txt + '</div>';
        loader.appendChild(verse);
        setTimeout(function() {
            $('.field').focus();
        }, 200)
        var off = $(verse).offset().top;
        loader.scrollTop = loader.scrollHeight;
        if(sec) {
            socket.emit('chat message', txt);
        }
    }
    if(color == "green") {
        document.getElementById('f').value = '';
    }
}

function updateActive() {
    $.get('/activerooms', function(data) {
        $(document).ready(function() {
            document.getElementById('tp').innerHTML = "";
            activerooms = new Array();
            if(data.length == 0) {
                var trend = document.createElement("div");
                trend.setAttribute("class", "trend");
                trend.innerHTML = "No active rooms";
                document.getElementById('tp').appendChild(trend);
            }
            for(var i in data) {
                activerooms.push(data[i]);
            }
            for(var i in activerooms) {
                var trend = document.createElement("div");
                trend.setAttribute("class", "trend");
                trend.innerHTML = activerooms[i].room.replace('/', '') + ': ' + '<span style="font-family: Courier New, Courier, monospace;">' + activerooms[i].online + '</span>';
                document.getElementById('tp').appendChild(trend);
            }
        });
    })
}



function i_cant_() {
    console.log("ehh fuck")
}