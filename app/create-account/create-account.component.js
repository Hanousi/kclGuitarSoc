'use strict';

angular.
module('createAccount', []).
component('createAccount', {
    templateUrl: 'create-account/create-account.template.html',
    controller: function CreateAccountController($window, $scope, $cookies, $http) {
        var self = this;

        function makeToken() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 16; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        var student = true;
        var passed;

        self.teacherOption = function () {
            document.getElementById("teacherBtn").classList.add("active");
            document.getElementById("studentBtn").classList.remove("active");
            student = false;
            $("#accessCode").show(500);
        }

        self.studentOption = function () {
            document.getElementById("studentBtn").classList.add("active");
            document.getElementById("teacherBtn").classList.remove("active");
            student = true;
            $("#accessCode").hide(500);
        }

        self.createAccount = function () {
            passed = 0;

            var pattern = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

            if (self.inACode == undefined && student == false || self.inACode != "0000" && student == false) {
                $("#aCAlert").show();
            } else {
                $("#aCAlert").hide();
                passed++;
            }

            if (self.inFName == undefined) {
                $("#fNAlert").show();
            } else {
                $("#fNAlert").hide();
                passed++;
            }

            if (self.inLName == undefined) {
                $("#lNAlert").show();
            } else {
                $("#lNAlert").hide();
                passed++;
            }

            if (self.inUserId == undefined || !pattern.test(self.inUserId)) {
                $("#cUserIdAlert").show();
            } else {
                $("#cUserIdAlert").hide();
                passed++;
            }

            if (self.inPassword == undefined) {
                $("#cPasswordAlert").show();
            } else {
                $("#cPasswordAlert").hide();
                passed++;
            }

            if (self.inCPassword == undefined) {
                $("#cCPasswordAlert").show();
            } else {
                $("#cCPasswordAlert").hide();
                passed++;

                if (self.inCPassword != self.inPassword) {
                    $("#wCPasswordAlert").show();
                } else {
                    $("#wCPasswordAlert").hide();
                    passed++;
                }
            }

            console.log(self.inUserId);
            console.log(self.inPassword);
            console.log(self.inFName);
            console.log(self.inLName);

            if (passed == 7) {
                $http.post("/signup", {
                    'userID': self.inUserId,
                    'password': self.inPassword,
                    'fName': self.inFName,
                    'lName': self.inLName
                }).then(function successCallback(response) {

                    $http.post("/verify", {
                        "userID": self.inUserId,
                        "token": makeToken()
                    }).then(function successCallback(response) {
                        console.log("email.sent");
                    });

                    $window.location.href = "#!/home"
                })
            }
        }
    }
});