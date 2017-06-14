'use strict';

angular.
module('verify', []).
component('verify', {
    templateUrl: 'verify/verify.template.html',
    controller: function VerifyController($window, $scope, $cookies, $http, $routeParams) {
        var self = this;

        $http.get("/api/code/" + $routeParams.inUserID).then(function successCallBack(response) {
            if(response.data[0].AccessCode == $routeParams.inToken) {
                $http.post("/api/verifyAccount", {
                    "userID": $routeParams.inUserID
                })
            }
        })
    }
});