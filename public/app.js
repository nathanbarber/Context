var app = angular.module("context", ["ngRoute"]);
app.config(function($routeController) {
    $routeController
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'home'
    })
    .when('/com', {
        templateUrl: 'views/com.html',
        controller: 'com'
    });
});

app.controller('home', function($scope, $location) {
    
});

app.controller('com', function($scope, $location) {

});