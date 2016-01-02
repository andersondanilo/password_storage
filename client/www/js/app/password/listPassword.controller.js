define(['app/repositories/passwordRepository'], function () {
  var app = require('app');

  app.register.controller(
    'ListPasswordController',
    ['$scope', '$stateParams', '$ionicPopup', 'passwordRepository', ListPasswordController]
  );

  function ListPasswordController($scope, $stateParams, $ionicPopup, passwordRepository) {
    var vm = this;
    var categoryUUID = $stateParams['category'];
    var query = {
      deleted: {$not: true}
    };

    vm.passwords = [];
    vm.filteredPasswords = [];
    vm.loaded = false;
    vm.categoryUUID = $stateParams['category'];
    vm.showRemovePassword = showRemovePassword;
    vm.filterText = '';

    $scope.$watch(function() {
      return vm.filterText;
    }, function(newValue, oldValue) {
      filterPassword();
    });

    refreshList();

    function refreshList() {
      if(categoryUUID) {
        passwordRepository.byCategory(categoryUUID, query).then(loadPasswords);
      } else {
        passwordRepository.all(query).then(loadPasswords);
      }
    }

    function filterPassword() {
      vm.filteredPasswords = [];
      if(vm.filterText) {
        var findText = vm.filterText.toLowerCase();
        angular.forEach(vm.passwords, function(password) {
          if(password.title.toLowerCase().indexOf(findText) >= 0) {
            vm.filteredPasswords.push(password);
          }
        });
      } else {
        angular.forEach(vm.passwords, function(password) {
          vm.filteredPasswords.push(password);
        });  
      }
    }

    function loadPasswords(passwords) {
      vm.loaded = true;
      vm.passwords = passwords;
      vm.filteredPasswords = [];
      angular.forEach(vm.passwords, function(password) {
        vm.filteredPasswords.push(password);
      });
    }

    function showRemovePassword(password) {
      var confirmPopup = $ionicPopup.confirm({
        title: i18n.t('remove_password'),
        template: i18n.t('are_you_sure_remove_password'),
        cancelText: i18n.t('cancel'),
        okText: i18n.t('yes')
      });
      confirmPopup.then(function(res) {
        if(res) {
          var reFilterQuery = {
            uuid: {$not: password.uuid}
          };

          vm.passwords = sift(reFilterQuery, vm.passwords);
          vm.filteredPasswords = sift(reFilterQuery, vm.filteredPasswords);

          passwordRepository.removeByUUID(password.uuid);
        }
      });
    }
  };
});