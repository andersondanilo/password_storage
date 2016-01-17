

define(['app/services/apiService'], function () {
  var app = require('app');

  app.register.service(
    'userService',
    ['$http', '$q', 'apiService', UserService]
  );

  function UserService($http, $q, apiService) {
    this.register = register;
    this.current = current;
    this.updateInformations = updateInformations;

    /**
     * Register a new user
     * @param {object} input - name, email and password
     * @return {promise}
     */
    function register(input) {
      return apiService.doApiRequestBasic('POST', 'users', {
        'data': {
          'type': "users",
          'attributes': {
            'name': input.name,
            'email': input.email,
            'password': input.password
          }
        }
      });
    }

    function updateInformations(input) {
      return apiService.doApiRequest('POST', 'users/current/update_informations', {
        'data': {
          'type': "users",
          'attributes': {
            'name': input.name,
            'old_password': input.old_password,
            'new_password': input.new_password
          }
        }
      });
    }

    /**
     * Return information about current user
     * @return {promise}
     */
    function current() {
      return apiService.doApiRequest('GET', 'users/current');
    }
  }
});