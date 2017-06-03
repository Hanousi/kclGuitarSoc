angular.
module('home').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: function HomeController($scope, $http, $cookies, $route, $anchorScroll, $location) {
        var self = this;

        self.loggedIn = false;

        var cookie = $cookies.get("selector_user");
        if (cookie != undefined) {
            var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
            if (cookiedata.FName != null) {
                self.loggedIn = true;
            }
        }

        self.logout = function () {
            $http.get("/logout");
            location.reload();
        }

        self.scrollTo = function (id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            $location.hash(old);
        }
    }
});