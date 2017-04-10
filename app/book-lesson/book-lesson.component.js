'use strict';

angular.
module('KCLGS').
component('bookLesson', {
    templateUrl: 'book-lesson/book-lesson.template.html',
    controller: function BookLessonController($scope, $http) {
        var self = this;

        var myMap = new Map();
        this.finalMonth = [];

        var repopulate = function repopulate() {
            myMap.clear();
            self.finalMonth = [];

            for (var i = 1; i < (self.daysInMonth + 1); ++i) {
                myMap.set(i, []);
            }

            for (var key in self.lessons) {
                console.log(myMap.get(Number(self.lessons[key].Day)));
                var lessonsOnDay = myMap.get(Number(self.lessons[key].Day));
                lessonsOnDay.push(self.lessons[key]);
                myMap.set(Number(self.lessons[key].Day), lessonsOnDay);
            }

            for (var v of myMap) {
                self.finalMonth.push(v);
            }
        }

        var daysInAMonth = function daysInAMonth(month, year) {
            return 32 - new Date(year, month, 32).getDate();
        }

        var monthsInAYear = ['Janurary', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        var today = new Date()

        this.month = monthsInAYear[today.getMonth()];

        $http.get('/api/lessons/' + self.month).then(function successCallback(response) {
                self.lessons = response.data;
                
                repopulate();
            }, function errorCallback(response) {
                self.lessons = [];
                
                repopulate();
            });

        this.year = today.getFullYear();

        this.daysInMonth = daysInAMonth(today.getMonth(), this.year);

        console.log(this.finalMonth);

        this.paddingMonth = new Date(this.year, today.getMonth(), 1).getDay();
        this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        this.getNumber = function getNumber(num) {
            return new Array(num);
        }

        this.nextMonth = function nextMonth(iMonth) {
            var numberMonth = monthsInAYear.indexOf(iMonth);

            var newYear = this.year;
            var newMonth = numberMonth + 1;

            if (newMonth == 12) {
                newMonth = 0;
                newYear = newYear + 1;
            }

            self.month = monthsInAYear[newMonth];
            self.year = newYear;

            self.daysInMonth = daysInAMonth(newMonth, newYear);
            self.paddingMonth = new Date(newYear, newMonth, 1).getDay();

            $http.get('/api/lessons/' + self.month).then(function successCallback(response) {
                self.lessons = response.data;
                
                repopulate();
            }, function errorCallback(response) {
                self.lessons = [];
                
                repopulate();
            });
        }

        this.prevMonth = function prevMonth(iMonth) {
            var numberMonth = monthsInAYear.indexOf(iMonth);

            var newYear = this.year;
            var newMonth = numberMonth - 1;

            if (newMonth == -1) {
                newMonth = 11;
                newYear = newYear - 1;
            }

            self.month = monthsInAYear[newMonth];
            self.year = newYear;

            self.daysInMonth = daysInAMonth(newMonth, newYear);
            self.paddingMonth = new Date(newYear, newMonth, 1).getDay();

            $http.get('/api/lessons/' + self.month).then(function successCallback(response) {
                self.lessons = response.data;
                
                repopulate();
            }, function errorCallback(response) {
                self.lessons = [];
                
                repopulate();
            });
        }
    }
});