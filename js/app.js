define([
    'app/services/routeResolver',
    'app/services/i18next'
  ], function() {

  var app = angular.module('passwordStorage', [
    'ionic',
    'routeResolverServices',
    'jm.i18next',
    'ui.router'
  ]);

  app.backupRegister = {
    controller: app.controller,
    directive: app.directive,
    filter: app.filter,
    factory: app.factory,
    service: app.service,
    value: app.value
  };

  app.register = app.backupRegister;

  require(['app/config', 'app/routes', 'app/database', 'app/directives'], function() {
    app.run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    });

    
    angular.element(document).ready(function() {
      if(!TEST_ENVIRONMENT) {
        angular.bootstrap(document, ["passwordStorage"]);
      }
    });
  });


  return app;
});