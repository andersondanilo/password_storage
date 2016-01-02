define(['app/repositories/categoryRepository'], function() {
  var app = require('app');
  app.register.controller('IndexCategoryController', ['$stateParams', '$ionicActionSheet', '$ionicLoading', '$state', 'categoryRepository', IndexCategoryController]);

  function IndexCategoryController($stateParams, $ionicActionSheet, $ionicLoading, $state, categoryRepository) {
    var vm = this;
    var categoryUUID = $stateParams['category'];

    vm.title = i18n.t('loading');
    vm.loaded = false;
    vm.category = null;
    vm.manageCategory = manageCategory;
    if (categoryUUID) categoryRepository.byUUID(categoryUUID).then(loadCategory);

    function loadCategory(category) {
      vm.category = category;
      vm.name = vm.category.name;
      vm.loaded = true;
    }

    function manageCategory() {
      // Show the action sheet
      var hideSheet;
      hideSheet = $ionicActionSheet.show({
        buttons: [{
          text: i18n.t('edit')
        }],
        destructiveText: i18n.t('remove'),
        titleText: i18n.t('category'),
        cancelText: i18n.t('cancel'),
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          $state.go('dashboard.edit_category', {
            'category': categoryUUID
          });
          return true;
        },
        destructiveButtonClicked: function() {
          $ionicLoading.show({
            template: i18n.t('loading')
          });

          categoryRepository.removeByUUID(categoryUUID).then(function() {
            $state.go('dashboard.overview');  
            $ionicLoading.hide();
          });
          return true;
        }
      });
    }

  };
});