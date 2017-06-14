'use strict'

angular.
module('yourLessons', []).
component('yourLessons', {
    templateUrl: 'your-lessons/your-lessons.template.html',
    controller: function YourLessonsController($cookies, $http) {
        var self = this;
        
        this.monthsInAYear = ['Janurary', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        var today = new Date();
        var thisMonth = this.monthsInAYear[today.getMonth()];
        var nextMonth = this.monthsInAYear[(today.getMonth()) + 1];
        var thisYear = today.getFullYear();
        var nextYear = 0;
        
        if(today.getMonth() == 11) {
            today.getFullYear() + 1;
        } else {
           today.getFullYear() 
        };
        
        var getUser = function (done) {
            var user = $cookies.get('selector_user');
            if (user) return done(JSON.parse(user.substring(2, user.length)));
        }
                
        getUser((user) => {
            $http.get('/api/user/lessons/' + user.UserID + '/' + user.UserID + '/' + thisMonth + '/' + nextMonth + '/' + thisYear + '/' + nextYear).then(function(response) {
                self.finalLessons = response.data;
            })
        })
    }
})