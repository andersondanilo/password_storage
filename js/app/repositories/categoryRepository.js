

define(['app/services/repositoryService', 'app/repositories/passwordRepository'], function () {
  var app = require('app');

  app.register.service('categoryRepository', ['repositoryService', 'passwordRepository', '$q', CategoryRepository]);

  function CategoryRepository(repositoryService, passwordRepository, $q) {
    this.save = save;
    this.all = all;
    this.byUUID = byUUID;
    this.byIndex = byIndex;
    this.removeByUUID = removeByUUID;
    this.actives = actives;

    function validate(entity) {
      var errors = [];
      if(!entity.name) {
        errors.push({
          'field': '/name',
          'message': i18n.t('name') + ' ' + i18n.t('required')
        });
      }

      /*
      var entities = all().then(function() { });

      for(var i = 0; i < entities.length; i++) {
        if(entities[i].name == entity.name) {
          errors.push({
            'field': '/name',
            'message': i18n.t('name') + ' ' + i18n.t('already_exists')
          });
          break;
        }
      }
      */

      return {
        'errors': errors,
        'passes': errors.length == 0,
        'fails': errors.length > 0
      }
    }

    function save(entity) {
      return $q(function(resolve, reject) {
        var validator = validate(entity);
        if(validator.passes) {
          entity._sync_status = 0;
          repositoryService.save('categories', entity).then(function(entity) {
            resolve(entity);
          }, function() {
            reject([{
              'field': '/',
              'message': 'error'
            }]);
          });
        } else {
          reject(validator.errors);
        }
      });
    }

    function all(query) {
      return repositoryService.all('categories', query);
    }

    function actives() {
      var categoryFilter = {
        deleted: {$not: true}
      };
      return all(categoryFilter);
    }

    function byUUID(uuid) {
      return repositoryService.byUUID('categories', uuid);
    }

    function byIndex(name, value, query) {
      return repositoryService.byIndex('categories', name, value, query);
    }

    function removeByUUID(uuid) {
      var defer = $q.defer();
      return byUUID(uuid).then(function(category) {
        category.deleted = true;
        save(category).then(function() {

          // remove the passwords
          passwordRepository.byCategory(uuid, {
            deleted: {$not: true}
          }).then(function(passwords) {
            var passwordPromises = [];
            angular.forEach(passwords, function(password) {
              passwordPromises.push(
                passwordRepository.removeByUUID(password.uuid)
              );
            });
            $q.all(passwordRepository).then(function() {
              defer.resolve();
            });
          });

        });
      });
      return defer.promise;
    }
  }
});