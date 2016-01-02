define(['app/repositories/categoryRepository'], function () {
  var app = require('app');

  app.register.controller(
    'FormCategoryController',
    ['$scope', '$state', '$stateParams', 'categoryRepository', FormCategoryController]
  );

  function FormCategoryController($scope, $state, $stateParams, categoryRepository) {
    var vm = this;
    vm.successMessage = null;
    vm.errorMessage = null;
    vm.loaded = false;
    vm.entity = {};
    vm.save = save;
    vm.isNew = true;

    if($stateParams['category']) {
      vm.isNew = false;
      categoryRepository.byUUID($stateParams['category']).then(loadEntity);
    } else {
      loadEntity({'name': ''});
    }

    function loadEntity(entity) {
      vm.entity = entity;
      vm.loaded = true;
    }

    function save() {
      vm.successMessage = null;
      vm.errorMessage = null;

      categoryRepository.save(vm.entity).then(function(entity) {
        vm.successMessage = i18n.t('category')+ ' '+i18n.t('registered_successfully');
        $state.go('dashboard.category', {
          'category': entity.uuid
        });
      }, function(errors) {
        vm.errorMessage = errors[0].message;
      });
    }
  };
});