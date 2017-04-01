'use strict';

angular.
module('KCLGS').
component('bookLesson', {
    templateUrl: 'book-lesson/book-lesson.template.html',
    controller: function BookLessonController($scope, $http) {
        var self = this;

        this.daysInMonth = 30;
        this.paddingMonth = 3;
        this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        this.getNumber = function getNumber(num) {
            return new Array(num);
        }
        
        console.log(this.getNumber(this.number));
    }
});