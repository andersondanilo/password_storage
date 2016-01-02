define(['app', 'app/services/userService', ], function() {
    var app = require('app');

    app.register.controller(
        'SignupController',
        ['$scope', '$ionicLoading', 'userService', SignupController]
    );

    function SignupController($scope, $ionicLoading, userService) {
        vm = this;
        vm.name = '';
        vm.email = '';
        vm.password = '';
        vm.repeatPassword = '';
        vm.successMessage = null;
        vm.errorMessage = null;

        vm.register = register;

        function register() {   
            vm.errorMessage = null;
            vm.successMessage = null;

            if(vm.password != vm.repeatPassword) {
                vm.errorMessage = "Repeat the password";
                return;
            }

            $ionicLoading.show({
              template: 'Loading...'
            });

            userService.register({
                'name': vm.name,
                'email': vm.email,
                'password': vm.password
            }).then(function(data) {
                $ionicLoading.hide();
                showSuccess(data);
            }, function(data) {
                $ionicLoading.hide();
                showError(data);
            }); 
        }

        function showSuccess(data) {
            vm.successMessage = i18n.t("registered_successfully");
        }

        function showError(data) {
            vm.errorMessage = data.errors[0].detail;
        }
    };
});