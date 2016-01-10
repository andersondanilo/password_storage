'use strict';

define([], function () {
  var app = require('app');

  app.register.service('apiService', ['$http', '$q', '$rootScope', 'apiHost', 'dataService', ApiService]);

  function ApiService($http, $q, $rootScope, apiHost, dataService) {
    this.doApiRequest = doApiRequest;

    function doApiRequest(method, endpoint, data) {
      return $q(function(resolve, reject) {
        var retry = $q.defer();

        retry.promise.then(doRequest, reject);

        doRequest();

        function doRequest() {
          var session = dataService.get('session');

          $http({
            method: method,
            url: apiHost + '/' + endpoint,
            headers: {
              'Authorization': "Bearer "+session["access_token"],
              'Content-Type': 'application/json',
            },
            data: data
          }).then(function(response) {
            resolve(response.data)
          }, function(response) {
            if(response.status == 401 && response.statusText == "Unauthorized") {
              if('data' in response && 'error' in response.data) {
                $rootScope.$broadcast('request.unauthorized.'+response.data.error, retry);
              } else {
                $rootScope.$broadcast('request.unauthorized.other', retry, response.data);
              }
            } else {
              reject(response);
            }
          });
        };
      });
    }
  }
});