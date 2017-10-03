'use strict';

angular.
module('signIn', []).
component('signIn', {
    templateUrl: 'sign-in/sign-in.template.html',
    controller: function SignInController($window, $scope, $cookies, $http) {
        var self = this;
                
        var passwordCheck = function (str) {
            var str2 = "";
            var rnd = ['', '*', '%', '$', '@', '£', '&', '$$', '!', '_', '/', '~'];
            for (var i = str.length - 1; i > 0; --i) {
                str2 += rnd[Math.floor(Math.random() * 11)] + str.charCodeAt(i) + ".";
            }
            str2 += str.charCodeAt(0);
            return str2;
        }

        this.signIn = function signIn() {

            var passed, passed1 = false;

            if (self.inUserId == undefined || self.inUserId == "") {
                $("#userIdAlert").html("<span style='float: right;'><i style='margin-right:5px;' class='glyphicon glyphicon-warning-sign'></i>Please enter your username</span>")
            } else {
                $("#userIdAlert").html("")
                passed = true;
            }

            if (self.inPassword == undefined || self.inPassword == "") {
                $("#passwordAlert").html("<span style='float: right;'><i style='margin-right:5px;' class='glyphicon glyphicon-warning-sign'></i>Please enter your password</span>")
            } else {
                $("#passwordAlert").html("")
                passed1 = true;
            }

            if (passed && passed1) {
                $http.post("/login", {
                    "userID": self.inUserId,
                    "password": self.inPassword,
                    "remember": true
                }).then(function successCallback(response) {
                    var cookie = $cookies.get("selector_user");
                    var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
                    var fName = cookiedata.FName;
                    var lName = cookiedata.LName
                    if (self.inRemember) {
                        var day = new Date();
                        day.setDate(day.getDate() + 7);
                        $cookies.put("remeber-dets", self.inUserId, {
                            "expires": day
                        });
                        $cookies.put("mat", passwordCheck(self.inPassword), {
                            "expires": day
                        });
                    }
                    $window.history.back();
                }, function errorCallback(response) {
                    $("#signin-message-alert").html("<p style='margin-top:30px;' class ='alert'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i>Incorrect Sign In Details, Please Try Again </p>");
                });
            }
        }
    }
})
