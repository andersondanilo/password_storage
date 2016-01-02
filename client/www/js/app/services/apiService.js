'use strict';

define([], function () {
  var app = require('app');

  app.register.service('apiService', ['$http', '$q', '$rootScope', 'apiHost', 'dataService', ApiService]);

  function ApiService($http, $q, $rootScope, apiHost, dataService) {
    this.doApiRequest = doApiRequest;

    function doApiRequest(method, endpoint, data) {
      var session = dataService.get('session');
      return $q(function(resolve, reject) {
        return $http({
          method: method,
          url: apiHost + '/' + endpoint,
          headers: {
            'Authorization': "Bearer "+session["access_token"]
          },
          data: data
        }).then(function(response) {
          resolve(response.data);
        }, function(response) {
          reject();
          if(response.status == 401 && response.statusText == "Unauthorized") {
            if('error' in response.data) {
              $rootScope.$broadcast('request.unauthorized.'+response.data.error, response.data);
            } else {
              $rootScope.$broadcast('request.unauthorized.other', response.data);
            }
          }

        });
      });
    }
  }
});