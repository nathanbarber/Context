var app = angular.module("redshift", ["ngRoute"]);

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
    
})

app.controller('home', function($scope, $location) {
    $(".enter").mouseenter(function() {
        TweenMax.to($(this).find(".juice"), .2, {top: 0 + "%", left: 0 + "%"});
        TweenMax.to(this, .2, {color: "red"});
    })  
    $(".enter").mouseleave(function() {
        TweenMax.to($(this).find(".juice"), .2, {top: 100 + "%", left: -100 + "%"});
        TweenMax.to(this, .2, {color: "#d3d3d3"});
    })  
    $(".enter").mousedown(function() {
        createConnection();
    })

    $scope.ref = function(key) {
        if(key == 'live') {
            $location.path("/live");
            $(".field").focus();
        } else {
            $location.path("/");
        }
    }
})

app.controller('live', function($scope, $location) {
    $(".field").focus();
    $scope.ref = function(key) {
        if(key == 'live') {
            $location.path("/live");
        } else {
            $location.path("/");
        }
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
        verseit(document.getElementById("f").value, true, 'red');
    })
    $("#flee").mousedown(function() {
        try {
            socket.disconnect();
        } catch(error) {
            
        }
    })
    $scope.keycheck = function($event) {
        if($event.keyCode == 13) {
            verseit(document.getElementById("f").value, true, 'red');
        }
    }
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
    document.getElementById('f').value = '';
}