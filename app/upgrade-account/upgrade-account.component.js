'use strict';

angular.
module('upgradeAccount', []).
component('upgradeAccount', {
    templateUrl: 'upgrade-account/upgrade-account.template.html',
    controller: function UpgradeAccountController($window, $scope, $cookies, $http, $routeParams) {
        var self = this;

        self.upgradeAccount = function() {
            console.log(self.inUserId);
            $http.put("reset_access_group", {
                "userID": self.inUserId,
                "accessGroup": 1
            }).then(function successCallBack(response) {
                $("#successfulUpgrade").show();
                $("#unsuccessfulUpgrade").hide();
            }, function errorCallBack(response) {
                $("#unsuccessfulUpgrade").show();
                $("#successfulUpgrade").hide();
            });
        }
    }
});