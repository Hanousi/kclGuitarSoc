'use strict';

angular.
module('bookLesson', []).
component('bookLesson', {
    templateUrl: 'book-lesson/book-lesson.template.html',
    controller: function BookLessonController($scope, $http, $uibModal) {
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
        
        this.year = today.getFullYear();

        $http.get('/api/lessons/' + self.month + '/' + self.year).then(function successCallback(response) {
            self.lessons = response.data;

            repopulate();
        }, function errorCallback(response) {
            self.lessons = [];

            repopulate();
        });
        
        this.daysInMonth = daysInAMonth(today.getMonth(), this.year);

        this.paddingMonth = new Date(this.year, today.getMonth(), 1).getDay();
        this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        this.getNumber = function getNumber(num) {
            return new Array(num);
        }

        this.nextMonth = function nextMonth(iMonth) {
            
            self.finalMonth = [];
            
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

            $http.get('/api/lessons/' + self.month + '/' + self.year).then(function successCallback(response) {
                self.lessons = response.data;

                repopulate();
            }, function errorCallback(response) {
                self.lessons = [];

                repopulate();
            });
        }

        this.prevMonth = function prevMonth(iMonth) {
            
            self.finalMonth = [];
            
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

            $http.get('/api/lessons/' + self.month + '/' + self.year).then(function successCallback(response) {
                self.lessons = response.data;

                repopulate();
            }, function errorCallback(response) {
                self.lessons = [];

                repopulate();
            });
        }

        this.open = function (day) {
            var modalInstance = $uibModal.open({
                size: 'lg',
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'book-modal/book-modal.template.html',
                controller: function BookLessonController($uibModalInstance, data, month) {
                    var me = this;

                    me.close = function () {
                        $uibModalInstance.close();
                    };
                    
                    me.data = data;
                    me.day = day.toString();
                    var lastNum = me.day.substr(me.day.length - 1);
                    
                    if(day > 3 && day < 21) {
                        me.day = me.day + "th";
                    } else if(lastNum == 1) {
                        me.day = me.day + "st";
                    } else if (lastNum == 2) {
                        me.day = me.day + "nd";
                    } else if (lastNum == 3) {
                        me.day = me.day + "rd";
                    } else {
                        me.day = me.day + "th";
                    }
                    
                    me.buyLesson = function buyLesson(lessonId) {
                        window.location.href = '#!/book/' + lessonId;
                        me.close();
                    }
                    
                    me.month = month;
                    
                    me.lessonsInDay = me.data[day-1][1];
                                                            
                    me.availableLessons = function () {
                        var counter = 0;
                        
                        for(var i = 0; i < me.lessonsInDay.length; ++i) {

                            if(me.lessonsInDay[i].Available == 0) {
                                counter++;
                            }
                        }
                                                
                        if(counter == me.lessonsInDay.length) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
                controllerAs: '$ctrl',
                resolve: {
                    data: function () {
                        return self.finalMonth;
                    },
                    
                    month: function () {
                        return self.month;
                    }
                }
            })
        }
    }
});