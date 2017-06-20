'use strict';

angular.
module('resetPassword', []).
component('resetPassword', {
    templateUrl: 'reset-password/reset-password.template.html',
    controller: function ResetPasswordController($window, $scope, $cookies, $http, $routeParams) {
        var self = this;

        self.resetPassword = function () {
            console.log($cookies.get("email_cookie"));
            console.log(self.inCNewPass);
            console.log($routeParams.token);

            $http.post("/reset_password", {
                "userID": $cookies.get("email_cookie"),
                "password": self.inCNewPass,
                "token": $routeParams.token
            }).then(function successCallBack() {
                $cookies.remove("email_cookie");
            })
        }
    }
});