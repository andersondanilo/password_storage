'use strict';

define(['app/services/dataService', 'app/services/repositoryService', 'app/services/syncService'], function () {
  var app = require('app');

  app.register.service('authService', ['$http', '$q', '$ionicPopup', '$rootScope', 'apiHost', 'dataService', 'repositoryService', 'syncService', 'clientId', 'basicAuthentication', AuthService]);

  function AuthService($http, $q, $ionicPopup, $rootScope, apiHost, dataService, repositoryService, syncService, clientId, basicAuthentication) {
    this.isLogged = isLogged;
    this.login = login;
    this.loginUsingAccessToken = loginUsingAccessToken;
    this.getSession = getSession;
    this.getAccessToken = getAccessToken;
    this.logout = logout;
    this.configureSyncronize = configureSyncronize;

    $rootScope.$on('request.unauthorized.invalid_token', function() {
      invalidToken();
    });

    var session = dataService.get('session');

    var syncronizeInterval;

    /**
     * Do a login using email and password
     * @param {object} input - email and password
     * @return {promise}
     */
    function login(input) {
      var deferred = $q.defer();

      $http({
        method: 'POST',
        url: apiHost + '/authentication/token',
        headers: {
          'Authorization': "Basic "+basicAuthentication
        },
        data: {
          'username': input.email,
          'password': input.password,
          'grant_type': 'password',
          'client_id': clientId
        }
      }).success(function(data) {
        loginUsingAccessToken({
          'access_token': data.access_token,
          'refresh_token': data.refresh_token,
        }).then(function(user_data) {
          deferred.resolve(user_data);
        }, function(data) {
          deferred.reject(data);
        });
      }).error(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    }

    function isLogged() {
      if(session && session['access_token']) {
        return true;
      }
    }

    function invalidToken() {
      session = getSession();

      if(session && session.user && session.user.email) {
        redoLogin(session.user.email);
      }
    }

    function configureSyncronize() {
      return $q(function(resolve, reject) {
        if(!syncronizeInterval) {
          syncronizeInterval = setInterval(function() {
            if(isLogged()) {
              syncService.syncronize();
            }
          }, 15000);
        }
        if(isLogged()) {
          syncService.syncronize().then(function() {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    function beforeLogin() {
      return $q(function(resolve, reject) {
        configureSyncronize().then(function() {
          repositoryService.seedDatabase().then(function() {
            resolve();
          })
        });
      });
    }

    function loginUsingAccessToken(accessToken) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: apiHost + '/users/current',
        headers: {
          'Authorization': "Bearer "+accessToken['access_token']
        }
      }).success(function(user_data) {
        session = {
          'access_token': accessToken['access_token'],
          'refresh_token': accessToken['refresh_token'] || null,
          'salt': user_data.data.attributes.salt,
          'user': user_data.data.attributes
        };

        dataService.set('session', session);

        beforeLogin().then(function() {
          deferred.resolve(user_data);
        });
      }).error(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    }

    function logout() {
      return $q(function(resolve, reject) {
        repositoryService.clearAllStores().then(function() {
          repositoryService.seedDatabase();
          session = null;
          dataService.remove('session');
          resolve();
        });
      });
    }

    var redoLoginPromise = false;

    function redoLogin(email) {
      if(redoLoginPromise)
        return redoLoginPromise;

      session = getSession();

      var defer = $q.defer();
      redoLoginPromise = defer.promise;

      var passwordPopup = $ionicPopup.prompt({
        title: 'Password Check',
        template: 'Enter your secret password',
        inputType: 'password',
        inputPlaceholder: 'Your password'
      });

      passwordPopup.then(function(password) {
        redoLoginPromise = null;

        login({
            'email': session.user.email,
            'password': password,
        }).then(function(data) {
            defer.resolve(data);
        }, function(data) {
            defer.reject();
        }); 
      });
    }

    function getSession() {
      return session || null;
    }

    function getAccessToken() {
      var session = getSession();
      return session["access_token"];
    }
  }
});