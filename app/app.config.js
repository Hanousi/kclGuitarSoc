angular.module('KCLGS').config(['$locationProvider', '$routeProvider',
 function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
        when('/home/', {
            template: '<home></home>'
        }).
        when('/book', {
            template: '<book-lesson></book-lesson>'
        }).
        when('/book/:lessonId', {
            template: '<purchase-lesson></purchase-lesson>'
        }).
        when('/addLesson', {
            template: '<add-lesson></add-lesson>'
        }).
        when('/yourLessons', {
            template: '<your-lessons></your-lessons>'
        }).
        when('/signIn', {
            template: '<sign-in></sign-in>'
        }).
        when('/forgotPassword', {
            template: '<forgot-password></forgot-password>'
        }).
        when('/createAccount', {
            template: '<create-account></create-account>'
        }).
        when('/verify/:inUserID/:inToken', {
            template: '<verify></verify>'
        }).
        when('/resetPassword/:token', {
            template: '<reset-password></reset-password>'
        }).
        when('/upgradeAccount', {
            template: '<upgrade-account></upgrade-account>'
        }).
        otherwise({
            redirectTo: ('/home')
        });
 }
]);