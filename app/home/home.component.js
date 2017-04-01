angular.
module('KCLGS').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: function HomeController($scope, $http) {
        var self = this;
        
        this.greeting = "Home";
    }
});