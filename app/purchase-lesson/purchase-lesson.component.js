'user strict';

angular.
module('purchaseLesson', []).
component('purchaseLesson', {
    templateUrl: 'purchase-lesson/purchase-lesson.template.html',
    controller: function PurchaseLessonController($routeParams, $http, $cookies) {
        var self = this;

        var getUser = function (done) {
            var user = $cookies.get('selector_user');
            if (user) return done(JSON.parse(user.substring(2, user.length)));
        }

        var monthsInAYear = ['Janurary', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        self.month = 0;

        $http.get('/api/lesson/' + $routeParams.lessonId).then(function (response) {
            self.lesson = response.data;
            console.log(self.lesson[0]);
            self.month = (monthsInAYear.indexOf(self.lesson[0].Month)) + 1;
        })

        self.book = function book() {
            getUser((user) => {
                $http.put('/api/lesson', {
                    "StudentID": user.UserID,
                    "StudentName": user.FName + " " + user.LName,
                    "LessonID": self.lesson[0].LessonID
                }).then(function SuccessCallback() {
                    window.location.href = "#!/book";
                })
            })
        }
    }
})