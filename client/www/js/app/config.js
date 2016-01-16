define([], function() {
  var app = angular.module('passwordStorage');
  app.config([
    '$stateProvider', '$urlRouterProvider',
    '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    '$httpProvider',
    config
  ]);

  function config($stateProvider, $urlRouterProvider,
    $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider) {

    // configure lazy loades components
    // Provider-based controller.

    if(TEST_ENVIRONMENT) {
      /*
      $httpProvider.interceptors.push(function($q) {
        return {
         'request': function(config) {
             // same as above
             console.log('new request: ' + config.method + ' ' + config.url);
             return config;
          }
        };
      });
      */
    }

    if(TEST_ENVIRONMENT && false) {
      // do nothing
    } else {
      app.register = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service,
        value: $provide.value
      };
    }

    var clientId = 'passwordstorage_app';
    // Please close your eyes and do not look at the line below
    var basicAuthentication = 'cGFzc3dvcmRzdG9yYWdlX2FwcDo3YWE1YjJiODUwZTI2N2U5ZmY5Njg5ZDVjZjU0OTFlZmM1MzA2Mjdi';
    var clientSalt = "3dvcmRzdG9yYWdlX";
    var apiHost = 'https://password-storage-api.herokuapp.com/api/v1';

    app.register.value('apiHost', apiHost);
    app.register.value('clientId', clientId);
    app.register.value('basicAuthentication', basicAuthentication);
    app.register.value('clientSalt', clientSalt);
  };
});