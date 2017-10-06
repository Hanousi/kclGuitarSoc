angular.
module('home').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: function HomeController($scope, $http, $cookies, $route, $anchorScroll, $location, $timeout) {
        var self = this;

        self.loggedIn = false;
        self.isAdmin = 0;

        var cookie = $cookies.get("selector_user");
        if (cookie != undefined) {
            var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
            if (cookiedata.FName != null) {
                self.loggedIn = true;
            }
        }

        var getUser = function (done) {
            var user = $cookies.get('selector_user');
            if (user) return done(JSON.parse(user.substring(2, user.length)));
        }

        getUser((user) => {
            if (user.AccessGroup == 0) {
                self.isAdmin = 1;
            }
        })

        self.logout = function () {
            $http.get("/logout").then(function() {
              location.reload();
            });
        }

        self.scrollTo = function (id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            $location.hash(old);
        }

        self.enterPortal = function () {
            if (self.loggedIn) {
                location.href = '#!/book';
            } else {
                alert("You can only enter the portal once you have signed in.")
            }
        }

        self.sendTo = function (dest) {
            location.href(dest);
        }
    }
});
