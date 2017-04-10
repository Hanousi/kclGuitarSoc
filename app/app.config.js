angular.module('KCLGS').config(['$locationProvider', '$routeProvider',
 function config($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.
  when('/home', {
   template: '<home></home>'
  }).
  when('/book', {
   template: '<book-lesson></book-lesson>'
  }).
  otherwise({
   redirectTo: ('/home')
  });
 }
]);
