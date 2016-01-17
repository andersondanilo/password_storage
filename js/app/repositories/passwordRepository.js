

define(['app/services/repositoryService', 'app/services/cryptService'], function () {
  var app = require('app');

  app.register.service('passwordRepository', ['$q', 'repositoryService', 'cryptService', PasswordRepository]);

  function PasswordRepository($q, repositoryService, cryptService) {
    this.save = save;
    this.all = all;
    this.byUUID = byUUID;
    this.allByIndex = allByIndex;
    this.byCategory = byCategory;
    this.removeByUUID = removeByUUID;

    function validate(entity) {
      var errors = [];

      if(!entity.title) {
        errors.push({
          'field': '/title',
          'message': i18n.t('title') + ' ' + i18n.t('required')
        });
      }

      if(!entity.username) {
        errors.push({
          'field': '/username',
          'message': i18n.t('username') + ' ' + i18n.t('required')
        });
      }

      if(!entity.password) {
        errors.push({
          'field': '/password',
          'message': i18n.t('password') + ' ' + i18n.t('required')
        });
      }

      if(!entity.category) {
        errors.push({
          'field': '/category',
          'message': i18n.t('category') + ' ' + i18n.t('required')
        });
      }

      return {
        'errors': errors,
        'passes': errors.length == 0,
        'fails': errors.length > 0
      }
    }

    function entityToDocument(entity) {
      var result = JSON.parse(JSON.stringify(entity));
      result.username = cryptService.encrypt(entity.username);
      result.password = cryptService.encrypt(entity.password);
      result.informations = [];
      if(entity.informations.length > 0) {
        angular.forEach(entity.informations, function(information, key) {
          if(information.value && information.value.length > 0) {
            result.informations.push({
              'name': information.name,
              'value': cryptService.encrypt(information.value)
            });
          }
        });
      }
      return result;
    }

    function documentToEntity(doc) {
      if(!doc)
        return doc;
      var result = JSON.parse(JSON.stringify(doc));
      result.username = cryptService.decrypt(result.username);
      result.password = cryptService.decrypt(result.password);
      if(result.informations.length > 0) {
        angular.forEach(result.informations, function(information, key) {
          if(information.value && information.value.length > 0)
            information.value = cryptService.decrypt(information.value);
        });
      }
      return result;
    }

    function save(entity) {
      return $q(function(resolve, reject) {
        var validator = validate(entity);
        if(validator.passes) {
          var resultDocument = entityToDocument(entity);
          resultDocument._sync_status = 0;
          repositoryService.save('passwords', resultDocument).then(function(entity) {
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
      return repositoryService.all('passwords', query).then(function(passwords) {
        return passwords.map(documentToEntity);
      });
    }

    function byUUID(uuid) {
      return repositoryService.byUUID('passwords', uuid).then(function(password) {
        return documentToEntity(password);
      });
    }

    function byCategory(category_uuid, query) {
      return allByIndex('category_idx', category_uuid, query);
    }

    function allByIndex(name, value, query) {
      return repositoryService.allByIndex('passwords', name, value, query).then(function(passwords) {
        return passwords.map(documentToEntity);
      });
    }

    function removeByUUID(uuid) {
      var defer = $q.defer();
      return byUUID(uuid).then(function(password) {
        password.deleted = true;
        save(password).then(function() {
          defer.resolve(password);
        });
      });
      return defer.promise;
    }
  }
});
