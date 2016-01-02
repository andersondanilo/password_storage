define([
    'app/repositories/categoryRepository',
    'app/repositories/passwordRepository'
], function() {
  var app = require('app');

  app.register.controller(
    'FormPasswordController',
    ['$scope', '$stateParams', '$state', 'categoryRepository', 'passwordRepository', FormPasswordController]
  );

  function FormPasswordController($scope, $stateParams, $state, categoryRepository, passwordRepository) {
    var vm = this;
    vm.categories = [];
    vm.save = save;
    vm.refreshInformations = refreshInformations;
    vm.loaded = false;
    vm.isNew = true;

    vm.entity = {
      'category': $stateParams['category'] || null,
      'informations': [
        {'name': '', 'value': ''}
      ]
    };

    categoryRepository.all().then(loadCategories);

    if($stateParams['password']) {
      vm.isNew = false;
      passwordRepository.byUUID($stateParams['password']).then(loadPassword);
    } else {
      vm.loaded = true;
    }

    function save() {
      vm.successMessage = null;
      vm.errorMessage = null;

      passwordRepository.save(vm.entity).then(function(entity) {
        vm.successMessage = i18n.t('password')+ ' '+i18n.t('registered_successfully');
        $state.go('dashboard.category', {
          'category': vm.entity.category
        });
      }, function(errors) {
        vm.errorMessage = errors[0].message;
      });
    }

    function loadCategories(categories) {
        vm.categories = categories;
    }

    function loadPassword(password) {
      vm.entity = password;
      vm.loaded = true;
      if(vm.entity.informations.length == 0) {
        vm.entity.informations.push({'name': '', 'value': ''});
      }
    }

    function refreshInformations() {
      // remove empty fields
      for(var i = vm.entity.informations.length - 1; i >= 0; i--) {
        (function() {
          if(vm.entity.informations.length > 1) {
            var information = vm.entity.informations[i];
            if(information.name.length == 0 && information.value.length == 0) {
              vm.entity.informations.splice(i, 1);
            }
          }
        })();
      }

      // verify need of more fields
      var lastInformation = vm.entity.informations[
        vm.entity.informations.length - 1
      ];

      if(lastInformation.name.length > 0 && lastInformation.value.length > 0) {
        vm.entity.informations.push({'name': '', 'value': ''})
      }
    }
  };
});