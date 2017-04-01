'use strict';

angular.
module('KCLGS').
component('bookLesson', {
    templateUrl: 'book-lesson/book-lesson.template.html',
    controller: function BookLessonController($scope, $http) {
        var self = this;
        console.log('hi');
        this.greeting = "Book a lesson";
    }
});