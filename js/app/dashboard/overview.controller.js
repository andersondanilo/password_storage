define(['app/repositories/categoryRepository'], function () {
  var app = require('app');

  app.register.controller(
    'OverviewController',
    ['$scope', OverviewController]
  );

  function OverviewController($scope) {
    var vm = this;
  };
});