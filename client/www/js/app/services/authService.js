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

    angular.forEach([
      'request.unauthorized.invalid_token',
      'request.unauthorized.unauthorized'
    ], function(eventName) {
      $rootScope.$on(eventName, function(event, retry) {
        invalidToken().then(function() {
          retry.resolve();
        }, function() {
          retry.reject();
        });
      });
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
      return $q(function(resolve, reject) {
        session = getSession();

        if(session && session.user && session.user.email) {
          redoLogin(session.user.email).then(resolve, reject);
        } else {
          reject();
        }
      });
    }

    var lastSyncRequest = null;
    var syncronizeEnabled = false;

    function configureSyncronize() {
      return $q(function(resolve, reject) {
        syncronizeEnabled = true;

        if(!isLogged())
          reject();

        if(!lastSyncRequest) {
          function doSyncRequest() {
            if(syncronizeEnabled) {
              lastSyncRequest = syncService.syncronize().then(function() {
                setTimeout(function() {
                    doSyncRequest();
                }, 15000);
              });
            }
          }

          doSyncRequest();
        }

        lastSyncRequest.then(resolve, reject);
      });
    }

    function executeInOrder(promisesFns) {
      var prevPromise;
      angular.forEach(promisesFns, function(promiseFn) {
        if(!prevPromise) {
          prevPromise = promiseFn();
        } else {
          prevPromise = prevPromise.then(promiseFn);
        }
      });
      return prevPromise;
    }

    function beforeLogin() {
      return $q(function(resolve, reject) {
        var chain = $q.when();
        chain = chain.then(repositoryService.clearAllStores);
        if(!lastSyncRequest) {
          chain = chain.then(function() {
            return $q(function(resolve, reject) {
              resolve();
            });
          });
          chain = chain.then(configureSyncronize);
        }
        chain = chain.then($q(function(resolve, reject) {
          chain = chain.then(function() {
            return $q(function(resolve, reject) {
              resolve();
            });
          });
          resolve();
        }));
        chain = chain.then(repositoryService.seedDatabase);
        chain.then(function() {
          resolve();
        })
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
      syncronizeEnabled = false;
      lastSyncRequest = null;
      return $q(function(resolve, reject) {
        syncService.syncronize().then(function() {
          repositoryService.clearAllStores().then(function() {
            //repositoryService.seedDatabase();
            session = null;
            dataService.remove('session');
            resolve();
          });
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

      configurePromise(passwordPopup);

      function configurePromise(passwordPopup) {
        passwordPopup.then(function(password) {
          login({
            'email': session.user.email,
            'password': password,
          }).then(function(data) {
            redoLoginPromise = null;
            defer.resolve(data);
          }, function(data) {
            if(data && ('error' in data) && data.error == 'invalid_grant') {
              var passwordPopup = $ionicPopup.prompt({
                title: 'Password Check',
                template: 'Wrong password, enter your secret password',
                inputType: 'password',
                inputPlaceholder: 'Your password'
              });

              configurePromise(passwordPopup);
            } else {
              redoLoginPromise = null;
              defer.reject();
            }
          }); 
        });
      }

      return redoLoginPromise;
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