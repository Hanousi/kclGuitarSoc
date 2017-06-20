'use strict';

angular.
module('forgotPassword', []).
component('forgotPassword', {
    templateUrl: 'forgot-password/forgot-password.template.html',
    controller: function ForgotPasswordController($window, $scope, $cookies, $http) {
        var self = this;

        self.resetPassword = function() {
            $http.post("/request_reset", {
                "userID": self.inUserId
            }).then(function successCallback(response) {
                    $cookies.put("email_cookie", self.inUserId);
                    $("#successfulRequest").show();
            })
        }
    }
});