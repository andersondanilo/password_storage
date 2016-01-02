define(['app', 'app/services/authService', ], function() {
    var app = require('app');

    app.register.controller(
        'LoginController',
        [
            '$scope', '$ionicLoading', '$state', 'authService',
            LoginController
        ]
    );

    function LoginController($scope, $ionicLoading, $state, authService) {
        var vm = this;
        vm.email = '';
        vm.password = '';
        vm.login = login;
        vm.successMessage = null;
        vm.errorMessage = null;

        function login() {
            $ionicLoading.show({
              template: i18n.t('loading')
            });

            vm.successMessage = null;
            vm.errorMessage = null;

            authService.login({
                'email': vm.email,
                'password': vm.password,
            }).then(function(data) {
                $ionicLoading.hide();
                showSuccess(data);
            }, function(data) {
                $ionicLoading.hide();
                showError(data);
            }); 
        }

        function showSuccess(data) {
            vm.successMessage = i18n.t('success');
            $state.go('dashboard.overview');
        }

        function showError(data) {
            vm.errorMessage = i18n.t('invalid_password');
        }

        function messagesToText(messages) {
            for(var k in messages) {
                return messages[k][0];
            }
        }
    }
});