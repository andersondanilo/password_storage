'use strict';

define(['app/services/dataService'], function () {
  var app = require('app');

  app.register.service('apiService', ['$http', '$q', '$rootScope', 'apiHost', 'dataService', 'basicAuthentication', ApiService]);

  function ApiService($http, $q, $rootScope, apiHost, dataService, basicAuthentication) {
    this.doApiRequest = doApiRequest;
    this.doApiRequestBasic = doApiRequestBasic;

    function doApiRequest(method, endpoint, data) {
      var session = dataService.get('session');
      return doApiRequestWithAuthorization(
        method,
        endpoint,
        data,
        "Bearer "+session["access_token"]
      );
    }

    function doApiRequestBasic(method, endpoint, data) {
      return doApiRequestWithAuthorization(
        method,
        endpoint,
        data,
        "Basic "+basicAuthentication
      );
    }

    function doApiRequestWithAuthorization(method, endpoint, data, authorization) {
      return $q(function(resolve, reject) {
        var retry = $q.defer();

        retry.promise.then(doRequest, reject);

        doRequest();

        function doRequest() {
          $http({
            method: method,
            url: apiHost + '/' + endpoint,
            headers: {
              'Authorization': authorization,
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
              reject(response.data);
            }
          });
        };
      });
    }
  }
});