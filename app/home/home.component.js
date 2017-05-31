angular.
module('home').
component('home', {
    templateUrl: 'home/home.template.html',
    controller: function HomeController($scope, $http, $cookies) {
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

        //        $(function () {
        //            $('#myNavbar').bind('click', 'ul li a', function (event) {
        //                $.scrollTo(event.target.hash, 550);
        //            });
        //        });

        $(".bs-js-navbar-scrollspy li a[href^='#']").on('click', function (event) {
            var target;
            target = this.hash;

            event.preventDefault();

            var navOffset;
            navOffset = $('#navbar').height();

            return $('html, body').animate({
                scrollTop: $(this.hash).offset().top - navOffset
            }, 300, function () {
                return window.history.pushState(null, null, target);
            });
        });
    }
});