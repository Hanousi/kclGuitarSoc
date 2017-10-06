'use strict';

angular.
module('addLesson', []).
component('addLesson', {
    templateUrl: 'add-lesson/add-lesson.template.html',
    controller: function AddLessonController($cookies, $scope, $http) {
        var self = this;

        var getUser = function (done) {
            var user = $cookies.get('selector_user');
            if (user) return done(JSON.parse(user.substring(2, user.length)));
        }

        var buildings = ['Macadam Building', 'East Wing'];
        var buildingRooms = new Map();

        buildingRooms.set('Macadam Building', [{
            id: 1,
            text: 'Skills Room'
        }, {
            id: 2,
            text: 'Lobby Meeting Room'
        }]);
        buildingRooms.set('East Wing', [{
            id: 3,
            text: 'Meeting Room 3'
        }, {
            id: 4,
            text: 'The Spit'
        }]);

        var roomOptions = buildingRooms.get(buildings[0]);

        var monthsInAYear = ['Janurary', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        self.inBuilding = "Macadam Building";
        self.inRoom = "Skills Room";

        $(document).ready(function () {
            if ($("#building").length > 0) {
                $("#building").select2({
                    allowClear: false,
                    minimumResultsForSearch: Infinity,
                    data: buildings
                });

                $("#building").on("select2:select", function (e) {
                    self.inBuilding = e.params.data.text;
                    roomOptions = buildingRooms.get(self.inBuilding);
                    $('#room').select2('destroy').empty().select2({
                        minimumResultsForSearch: Infinity,
                        allowClear: false,
                        data: roomOptions
                    });
                });
            }
        })

        $(document).ready(function () {
            if ($("#room").length > 0) {
                $("#room").select2({
                    minimumResultsForSearch: Infinity,
                    allowClear: false,
                    data: roomOptions
                });

                $("#room").on("select2:select", function (e) {
                    self.inRoom = e.params.data.text;
                });
            }
        })

        this.addMinutes = function addMinutes(date, minutes) {
            return new Date(date.getTime() + minutes * 60000);
        }

        document.addEventListener('keypress', e => {
          if(e.keyCode === 13) {
            self.submitLesson();
          }
        })

        this.submitLesson = function submitLesson() {
            var dateFormat;
            var timeFormat;
            var endTimeFormat;
            var passed1, passed2 = false;

            if (self.inDate == undefined) {
                $("#dateAlert").html("<span style='float: right;'><i style='margin-right:5px;' class='glyphicon glyphicon-warning-sign'></i>Please Enter a date</span>")
            } else {
                $("#dateAlert").html("")
                dateFormat = new Date(self.inDate);
                passed1 = true;
            }

            if (self.inTime == undefined) {
                $("#timeAlert").html("<span style='float: right;'><i style='margin-right:5px;' class='glyphicon glyphicon-warning-sign'></i>Please enter a time</span>")
            } else {
                $("#timeAlert").html("")
                timeFormat = new Date(self.inTime);
                endTimeFormat = self.addMinutes(timeFormat, 30);
                passed2 = true;
            }

            if (passed1 && passed2) {

                getUser((user) => {
                    $http.post("/api/lessons", {
                        "teacherId": user.UserID,
                        "teacherName": user.FName + " " + user.LName.charAt(0),
                        "year": dateFormat.getFullYear(),
                        "month": monthsInAYear[dateFormat.getMonth()],
                        "day": dateFormat.getDate(),
                        "startTime": timeFormat.getHours() + ":" + timeFormat.getMinutes(),
                        "endTime": endTimeFormat.getHours() + ":" + endTimeFormat.getMinutes(),
                        "building": self.inBuilding,
                        "room": self.inRoom,
                        "available": 1,
                        "studentId": null,
                        "studentName": null
                    }).then(function successCallback(response) {
                        window.location.href = "#!/book";
                    })
                });

            }

        }
    }
})
