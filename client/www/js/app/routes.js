define(['app/services/authService'], function() {
  var app = angular.module('passwordStorage');

  app.config([
    '$stateProvider', '$urlRouterProvider', 'routeResolverProvider',
    makeRoutes
  ]);

  app.run(['$rootScope', '$state', 'authService', makeEvents]);

  function makeRoutes($stateProvider, $urlRouterProvider, routeResolverProvider) {
    var resolve = routeResolverProvider.route.resolve;

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('default', resolve('/', 'default', {'controller':null}))
      .state('default.login', resolve('login', 'login'))
      .state('default.signup', resolve('signup', 'signup'))
      .state('dashboard', resolve(null, 'dashboard', {'requireLogin': true}))
      .state('dashboard.overview', resolve('/dashboard', 'dashboard/overview', {
        'requireLogin': true,
        'dependencies': ['js/app/password/listPassword.controller.js']
      }))
      .state('dashboard.create_password', resolve('/create_password/:category', 'password/formPassword', {'requireLogin': true}))
      .state('dashboard.create_category', resolve('/create_category', 'category/formCategory', {'requireLogin': true}))
      .state('dashboard.edit_category', resolve('/edit_category/:category', 'category/formCategory', {'requireLogin': true}))
      .state('dashboard.category', resolve('/category/:category', 'category/indexCategory', {
        'requireLogin': true,
        'dependencies': ['js/app/password/listPassword.controller.js']
      }))
      .state('dashboard.edit_password', resolve('/edit_password/:password', 'password/formPassword', {'requireLogin': true}))
      .state('dashboard.account_information', resolve('/account_information', 'account/information', {'requireLogin': true}));
  }

  function makeEvents($rootScope, $state, authService) {

    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {

      if(authService.isLogged()) {

        if(toState.name.indexOf('default') == 0) {
          event.preventDefault();
          $state.go('dashboard.overview');
        }  

      } else {

        if(toState.requireLogin) {
          event.preventDefault();
        }

      }

    });

  }
});