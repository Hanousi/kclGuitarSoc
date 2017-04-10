angular.
module('home').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: function HomeController($scope, $http) {
        var self = this;

        $('#homeBody').scrollspy({
            offset: 63
        });

        this.greeting = "Home";
    }
});