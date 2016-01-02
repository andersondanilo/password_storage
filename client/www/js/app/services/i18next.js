define([], function() {
  angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
    $i18nextProvider.options = {
      useCookie: false,
      defaultLoadingValue: '...',
      useLocalStorage: false,
      fallbackLng: 'en',
      resGetPath: 'js/app/locales/__lng__/__ns__.json',
      defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
    };
  }]);
});