

define(['app/services/dataService', 'app/services/repositoryService', 'app/services/syncService', 'app/services/userService'], function () {
  var app = require('app');

  app.register.service('authService', ['$http', '$q', '$ionicPopup', '$rootScope', 'apiService', 'dataService', 'repositoryService', 'syncService', 'clientId', 'basicAuthentication', 'userService', AuthService]);

  function AuthService($http, $q, $ionicPopup, $rootScope, apiService, dataService, repositoryService, syncService, clientId, basicAuthentication, userService) {
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

      apiService.doApiRequestBasic('POST', 'authentication/token', {
        'username': input.email,
        'password': input.password,
        'grant_type': 'password',
        'client_id': clientId
      }).then(function(data) {
        loginUsingAccessToken({
          'access_token': data.access_token,
          'refresh_token': data.refresh_token,
        }).then(function(user_data) {
          deferred.resolve(user_data);
        }, function(data) {
          deferred.reject(data);
        });
      }, function(data) {
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
    var timeoutSyncRequest = null;
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
                timeoutSyncRequest = setTimeout(function() {
                  doSyncRequest();
                }, 60 * 1000);
              });
            }
          }

          var timeoutDoSyncRequestWithDebounce;

          function doSyncRequestWithDebounce() {
            if(timeoutSyncRequest)
              clearTimeout(timeoutSyncRequest);

            if(timeoutDoSyncRequestWithDebounce)
              clearTimeout(timeoutDoSyncRequestWithDebounce);

            timeoutDoSyncRequestWithDebounce = setTimeout(function() {
              doSyncRequest();
            }, 500);
          }

          doSyncRequest();

          $rootScope.$on('database.change', function() {
            doSyncRequestWithDebounce();
          });
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
        if(!lastSyncRequest) {
          chain = chain.then(repositoryService.clearAllStores);
          chain = chain.then(configureSyncronize);
        }
        chain = chain.then(repositoryService.seedDatabase);
        chain.then(function() {
          resolve();
        })
      });
    }

    function loginUsingAccessToken(accessToken) {
      var deferred = $q.defer();

      session = {
        'access_token': accessToken['access_token'],
        'refresh_token': accessToken['refresh_token'] || null,
      };

      dataService.set('session', session);

      userService.current().then(function(user_data) {
        session['salt'] = user_data.data.attributes.salt;
        session['user'] = user_data.data.attributes;

        dataService.set('session', session);

        beforeLogin().then(function() {
          deferred.resolve(user_data);
        });
      }, function(data) {
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