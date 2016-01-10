'use strict';

define([], function () {
  var app = require('app');

  app.register.service('repositoryService', ['$q', '$rootScope', RepositoryService]);

  function RepositoryService($q, $rootScope) {
    this.save = save;
    this.all = all;
    this.byUUID = byUUID;
    this.byIndex = byIndex;
    this.allByIndex = allByIndex;
    this.clearAllStores = clearAllStores;
    this.seedDatabase = seedDatabase;

    var databaseName = 'passwordStorageDb';

    if(TEST_ENVIRONMENT) {
      databaseName = databaseName + 'Test' + String(Math.random());
    }

    /**
     * Each all entries
     */
    function cursor(storeName, indexName, indexRange, callback) {
      return $q(function(resolve, reject) {
        objectStore(storeName, 'readonly').then(function(store) {
          var target = store;

          if(indexName)
            target = store.index(indexName);

          if(indexRange)
            var request = target.openCursor(indexRange);
          else
            var request = target.openCursor();

          request.onsuccess = function(evt) {
            var cursor = evt.target.result;
            if(cursor) {
              callback(cursor);
              cursor.continue();
            } else {
              resolve();
            }
          };
        });
      });
    };

    /**
     * Get an object store
     */
    function objectStore(storeName, mode) {
      return $q(function(resolve, reject) {
        database().then(function(db) {
          var transaction = db.transaction(storeName, mode);
          var objectStore = transaction.objectStore(storeName);
          resolve(objectStore);
        });
      });
    }

    /**
     * Get database
     */
    var databasePromise = null;
    var databaseRequests = [];
    var databaseResult = null;


    function database() {

      if(!databasePromise) {
        databasePromise = configureDatabase();
        databasePromise.then(function(db) {
          databaseResult = db;
          setTimeout(function() {
            angular.forEach(databaseRequests, function(databaseRequest) {
              databaseRequest.resolve(databaseResult);
            });
          }, 1000);
        });
      }

      var deferred = $q.defer();

      if(databaseResult) {
        deferred.resolve(databaseResult);
      } else {
        databaseRequests.push(deferred);
      }

      return deferred.promise.then(function(db) {
        return db;
      });
    }

    function configureDatabase() {
      var deferred = $q.defer();

      // configure database


      var request = indexedDB.open(databaseName, 1);

      request.onupgradeneeded = function(event) {
        var db = event.target.result;

        var categoryStore = db.createObjectStore('categories', {keyPath: 'uuid'});
        categoryStore.createIndex('user_idx', 'user', {unique: false});
        categoryStore.createIndex('special_idx', 'special', {unique: false});        
        categoryStore.createIndex('deleted_idx', 'deleted', {unique: false});

        var passwordStore = db.createObjectStore('passwords', {keyPath: 'uuid'});
        passwordStore.createIndex('category_idx', 'category', {unique: false});
        passwordStore.createIndex('deleted_idx', 'deleted', {unique: false});
      };

      request.onsuccess = function(event) {
        var db = event.target.result;
        deferred.resolve(db);
      };

      request.onerror = function() {
        deferred.reject();
      };
      
      return deferred.promise;
    }

    function clearAllStores() {
      return $q(function(resolve, reject) {
        var promises = [];

        angular.forEach(['categories', 'passwords'], function(storeName) {
          var deferred = $q.defer();

          objectStore(storeName, 'readwrite', true).then(function(store) {
            store.clear().onsuccess = function() {
              deferred.resolve();
            };
          });

          promises.push(deferred.promise);
        });

        $q.all(promises).then(function() {
          resolve();
        });
      });
    }

    function seedDatabase() {
      return $q(function(resolve, reject) {
        all('categories', {
          deleted: {$not: true}
        }).then(function(categories) {
          if(categories.length == 0) {
            byIndex('categories', 'special_idx', 'default').then(function(category) {
              if(!category) {
                save('categories', {
                  'name': i18n.t('dashboard.default') || 'Default',
                  'special': 'default'
                }).then(resolve);
              } else {
                resolve();
              }
            });
          } else {
            // already have categories
            resolve();
          }
        });
      });
    }

    function cursorToArray(storeName, indexName, indexRange, query) {
      if(!query) query = null;
      var sifter = query ? sift(query) : null;

      return $q(function(resolve, reject) {
        var results = [];

        var cursorCallback = function(cursor) {
          if(!sifter || sifter(cursor.value)) {
            results.push(cursor.value);
          }
        };

        var cursorPromise = cursor(
          storeName,
          indexName,
          indexRange,
          cursorCallback
        );

        cursorPromise.then(function() {
          resolve(results);
        });
      });
    }

    function all(type, query) {
      return cursorToArray(type, null, null, query);
    }

    // apply mongodb like query
    function applyQuery(results, query) {
      if(!query || !results)
        return results;
      return sift(query, results);
    }

    function byUUID(type, uuid) {
      return $q(function(resolve, reject) {
        objectStore(type, 'readwrite').then(function(store) {
          var request = store.get(uuid);
          request.onsuccess = function() {
            resolve(request.result);
          };
          request.onerror = function() {
            resolve(null);
          };
        });
      });
    }

    function allByIndex(type, indexName, value, query) {
      return whereIndex(type, indexName, value, query);
    }

    function byIndex(type, indexName, value, query) {
      return whereIndex(type, indexName, value, query).then(function(results) {
        if(results.length > 0)
          return results[0];
        else
          return null;
      });
    }

    function whereIndex(type, indexName, value, query) {
      return cursorToArray(
        type,
        indexName,
        IDBKeyRange.only(value),
        query
      );
    }

    function save(type, entity) {
      return $q(function(resolve, reject) {
        if(entity.uuid) {
          byUUID(type, entity.uuid).then(function(result) {
            callback(result ? true : false, result);
          });
        } else {
          callback(false, null);
        }

        function callback(exist, oldResource) {
          objectStore(type, 'readwrite').then(function(store) {
            if(!exist) {
              // do an insert
              if(!('uuid' in entity)) {
                entity.uuid = generateUUID();
                entity._rev = null;
                entity._sync_status = 0;
                if(oldResource && !oldResource.deleted && entity.deleted) {
                  if(!oldResource._rev) {
                    // dont need to upload because dont exist on server
                    entity._sync_status = 1;
                  }
                }
                
              } else {
                // entity downloaded from remote
                entity._sync_status = 1;
              }
            } else {
              if(oldResource._rev == entity._rev && !entity._dont_change_sync_status) {
                // is an local update
                entity._sync_status = 0;
              }
            }

            delete entity['_dont_change_sync_status'];

            if(!exist) {
              var request = store.add(entity);
            } else {
              var request = store.put(entity);
            }

            request.onsuccess = function() {
              if(!exist) {
                $rootScope.$broadcast('database.'+type+'.insert', entity);
              } else {
                $rootScope.$broadcast('database.'+type+'.update', entity);
              }
              resolve(entity);
            };

            request.onerror = function() {
              reject();
            };
          });
        };
      });
    }

    function generateUUID() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    };
  }
});