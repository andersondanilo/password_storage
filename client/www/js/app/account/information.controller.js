define(['app/services/userService'], function() {
  var app = require('app');

  app.register.controller(
    'InformationController',
    ['$scope', 'userService', '$ionicLoading', InformationController]
  );

  function InformationController($scope, userService, $ionicLoading) {
    var vm = this;

    vm.entity = {};
    vm.loaded = false;
    vm.save = save;
    vm.successMessage = null;
    vm.errorMessage = null;

    userService.current().then(loadUserInformation);

    function save() {
      vm.successMessage = null;
      vm.errorMessage = null;

      if(vm.entity.new_password != vm.entity.repeat_password) {
        vm.errorMessage = "Repeat the password";
        return;
      }

      $ionicLoading.show({
        template: 'Loading...'
      });

      userService.updateInformations(vm.entity).then(function(data) {
          $ionicLoading.hide();
          showSuccess(data);
      }, function(data) {
          $ionicLoading.hide();
          showError(data);
      }); 
    }

    function loadUserInformation(user) {
      vm.loaded = true;
      vm.entity.name = user.data.attributes.name;
    }

    function showSuccess() {
      vm.successMessage = i18n.t('password')+ ' '+i18n.t('registered_successfully');
    }

    function showError(data) {
      vm.errorMessage = data.errors[0].detail;
    }
  };
});