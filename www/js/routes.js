angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('linkVanHome', {
    url: '/home',
    templateUrl: 'templates/linkVanHome.html',
    controller: 'linkVanHomeCtrl'
  })

  .state('linkVanFiltered', {
    url: '/filtered',
    templateUrl: 'templates/linkVanFiltered.html',
    controller: 'linkVanFilteredCtrl',
    cache: false
  })

  .state('linkVanShow', {
    url: '/show',
    templateUrl: 'templates/linkVanShow.html',
    controller: 'linkVanShowCtrl'
  })

  .state('linkVanDirections', {
    url: '/directions',
    templateUrl: 'templates/linkVanDirections.html',
    controller: 'linkVanDirectionsCtrl',
    cache: false
  })

  .state('linkVanAboutUs', {
    url: '/about',
    templateUrl: 'templates/linkVanAboutUs.html',
    controller: 'linkVanAboutUsCtrl'
  })

  .state('linkVanDisclaimer', {
    url: '/disclaimer',
    templateUrl: 'templates/linkVanDisclaimer.html',
    controller: 'linkVanDisclaimerCtrl'
  })

  .state('linkVanSearch', {
    url: '/search',
    templateUrl: 'templates/linkVanSearch.html',
    controller: 'linkVanSearchCtrl',
    cache: false
  })

  .state('linkVanCrisisLines', {
    url: '/crisis',
    templateUrl: 'templates/linkVanCrisisLines.html',
    controller: 'linkVanCrisisLinesCtrl'
  })

$urlRouterProvider.otherwise('/home')



});
