'use strict';

define(['app/services/apiService'], function () {
  var app = require('app');

  app.register.service('syncService', ['$q', '$rootScope', '$http', 'apiService', 'repositoryService', 'apiHost', SyncService]);

  function SyncService($q, $rootScope, $http, apiService, repositoryService, apiHost) {
    this.syncronize = syncronize;

    var SYNC_WAITING = 0;
    var SYNC_OK = 1;

    var defaultSyncTables = {
      "categories": {
        "endpoint": "categories",
        "attributes": ["name"],
        "relationships": {
          "passwords": {
            "endpoint": "/categories/:category_uuid/passwords",
            "attributes": ["title", "username", "password", "informations"]
          }
        }
      }
    };

    function syncronize(syncTables) {
      if(!syncTables)
        syncTables = defaultSyncTables;

      var promises = [];

      angular.forEach(syncTables, function(value, key) {
        promises.push($q(function(resolve, reject) {
          var tablePromise = syncronizeTable(key, value["attributes"], value["endpoint"]);
          if(("relationships" in value) && (value["relationships"].length > 0)) {
            tablePromise.then(function() {
              var relationPromise = syncronize(value["relationships"]);
              relationPromise.then(function() {
                resolve();
              })
            });
          } else {
            tablePromise.then(function() {
              resolve();
            });
          }
        }));
      });

      return $q.all(promises);
    }

    function getLocalResoucesByTable(tableName, query) {
      return $q(function(resolve, reject) {
        repositoryService.all(tableName, query).then(function(resources) {
          resolve(resources);
        });
      });
    };

    function syncronizeTable(tableName, attributes, endpoint) {
      var getLocalResouces = function(query) {
        return getLocalResoucesByTable(tableName, query);
      };

      // iterate each item in a condition      
      var eachByQuery = function(query, callback) {
        return $q(function(resolve, reject) {
          getLocalResouces(query).then(function(resources) {
            var promises = [];
            angular.forEach(resources, function(resource) {
              promises.push(callback(resource));
            });
            if(promises.length > 0)
              $q.all(promises).then(resolve);
            else
              resolve();
          });
        });
      }

      // remove all deleted resources
      var syncLocalDeleteds = function() {
        return eachByQuery({deleted: true, _sync_status: SYNC_WAITING}, function(resource) {
          return uploadDeletedResource(tableName, resource, endpoint);
        });
      };

      // insert all news resources
      var syncLocalNews = function() {
        return eachByQuery({_rev: null, deleted: {$not: true}, _sync_status: SYNC_WAITING}, function(resource) {
          return uploadNewResource(tableName, resource, endpoint);
        });
      };

      // update all updateds resources
      var syncLocalUpdateds = function() {
        return eachByQuery({_rev: {$not: null}, deleted: {$not: true}, _sync_status: SYNC_WAITING}, function(resource) {
          return uploadUpdatedResource(tableName, resource, endpoint);
        });
      };

      // lists all resources on remote server
      var getRemoteResources = function() {
        return $q(function(resolve, reject) {
          apiService.doApiRequest('GET', endpoint).then(function(response) {
            var remoteResources = response.data;
            resolve(remoteResources);
          });
        });
      };

      // get remote resources
      // update, create or delete local resource
      var syncWithRemoteResources = function() {
        return $q(function(resolve, reject) {
          var promises = [];

          $q.all([
            getLocalResouces({deleted: {$not: true}}),
            getRemoteResources()
          ]).then(function(results) {
            var localResources = results[0];
            var remoteResources = results[1];

            // delete resources that are not on remote server
            angular.forEach(localResources, function(localResource) {
              var found = false;
              angular.forEach(remoteResources, function(remoteResource) {
                if(remoteResource.id == localResource.uuid)
                  found = true;
              });
              if(!found) {
                localResource.deleted = true;
                localResource._sync_status = SYNC_OK;
                localResource._dont_change_sync_status = 1;
                promises.push(repositoryService.save(tableName, localResource));
              }
            });

            angular.forEach(remoteResources, function(remoteResource) {
              var localResource = {};

              angular.forEach(localResources, function(auxLocalResource) {
                if(auxLocalResource.uuid == remoteResource.id)
                  localResource = auxLocalResource;
              });

              if(!localResource.uuid || localResource._rev != remoteResource.attributes.rev) {
                refreshResourceFromRemote(localResource, remoteResource);
                promises.push(repositoryService.save(tableName, localResource));
              }
            });

            if(promises.length > 0)
              $q.all(promises).then(resolve);
            else
              resolve();
          });
        });
      };


      return executeInOrder([
        syncLocalDeleteds,
        syncLocalNews,
        syncLocalUpdateds,
        syncWithRemoteResources
      ]);
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

    function parseEndpoint(endpoint, resource) {
      angular.forEach(resource, function(value, key) {
        endpoint = endpoint.replace(':'+key, value);
      });
      return endpoint;
    }

    function doApiResourceUpload(method, tableName, resource, endpoint) {
      return $q(function(resolve, reject) {
        return apiService.doApiRequest(
          method,
          endpoint,
          {
            'data': {
              'type': tableName,
              'id': resource.uuid || null,
              'attributes': resource
            }
          }
        ).then(function(response) {
          // refresh sync status
          refreshResourceFromRemote(resource, response.data);
          repositoryService.save(tableName, resource).then(resolve);
        }, reject);
      });
    }

    function refreshResourceFromRemote(localResource, remoteResource) {
      localResource._sync_status = SYNC_OK;
      localResource._dont_change_sync_status = 1;

      if(remoteResource) {
        if('data' in remoteResource)
          throw new Error("Invalid remote resource: with data");

        if(!('attributes' in remoteResource))
          throw new Error("Invalid remote resource: without attributes");

        localResource._rev = remoteResource.attributes.rev;

        if(localResource.uuid && localResource.uuid != remoteResource.attributes.uuid) {
          throw new Error("Remote resource uuid mismatch "+localResource.uuid+" with "+remoteResource.attributes.uuid);
        }

        angular.forEach(remoteResource.attributes, function(value, key) {
          if(key == "rev")
            return;
          localResource[key] = value;
        });
      } else {
        throw new Error("Invalid remote resource");
      }
    }

    function uploadDeletedResource(tableName, resource, endpoint) {
      return doApiResourceUpload(
        'DELETE',
        tableName,
        resource,
        parseEndpoint(endpoint, resource) + '/' + resource.uuid
      );
    }

    function uploadNewResource(tableName, resource, endpoint) {
      return doApiResourceUpload(
        'POST',
        tableName,
        resource,
        parseEndpoint(endpoint, resource)
      );
    }

    function uploadUpdatedResource(tableName, resource, endpoint) {
      return doApiResourceUpload(
        'PATCH',
        tableName,
        resource,
        parseEndpoint(endpoint, resource) + '/' + resource.uuid
      );
    }
  }
});