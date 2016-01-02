define([], function() {
  var app = angular.module('passwordStorage');
  app.directive('psSelectAll', function() {
    return {
      'restrict': 'A',
      'compile': function($element, attr) {
        return function(scope, element) {
          element.attr('title', i18n.t('click_to_select'));
          element.on('click', function() {
            this.select();
          });
        }
      }
    }
  })
});