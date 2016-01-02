'use strict';

define(['app/services/authService'], function () {
  var app = require('app');

  app.register.service(
    'userService',
    ['$http', '$q', 'authService', 'apiHost', 'clientId', 'basicAuthentication', UserService]
  );

  function UserService($http, $q, authService, apiHost, clientId, basicAuthentication) {
    this.register = register;

    /**
     * Register a new user
     * @param {object} input - name, email and password
     * @return {promise}
     */
    function register(input) {
      var deferred = $q.defer();

      $http({
        method: 'POST',
        url: apiHost + '/users',
        headers: {
          'Authorization': "Basic "+basicAuthentication
        },
        data: {
          'data': {
            'type': "users",
            'attributes': {
              'name': input.name,
              'email': input.email,
              'password': input.password
            }
          }
        }
      }).success(function(data) {
        deferred.resolve(data);
      }).error(function(data) {
        deferred.reject(data);
      }); 

      return deferred.promise;
    }
  }
});