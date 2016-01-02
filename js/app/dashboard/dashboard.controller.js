define(['app/repositories/categoryRepository', 'app/services/authService'], function () {
  var app = require('app');

  app.register.controller(
    'DashboardController',
    ['$scope', '$state', '$window', 'authService', 'categoryRepository',
    '$rootScope',
    DashboardController]
  );

  function DashboardController($scope, $state, $window, authService, categoryRepository, $rootScope) {
    var vm = this;
    vm.logout = logout;
    vm.categories = [];

    var categoryFilter = {
      deleted: {$not: true}
    };

    authService.configureSyncronize();

    refreshCategoriesList();

    $rootScope.$on('database.categories.insert', refreshCategoriesList);
    $rootScope.$on('database.categories.update', refreshCategoriesList);
    $rootScope.$on('database.categories.delete', refreshCategoriesList);

    function logout() {
      authService.logout().then(function() {
        $state.go('default');
      });
    }

    function refreshCategoriesList() {
      categoryRepository.all(categoryFilter).then(function(categories) {
        vm.categories = categories;
      });
    }
  };
});