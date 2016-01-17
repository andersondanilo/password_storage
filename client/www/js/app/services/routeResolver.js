

define([], function () {

  var routeResolver = function () {

    this.$get = function () {
      return this;
    };

    this.route = function (routeConfig) {

      var resolve = function (url, resourceName, options) {
        var resourceNameList = resourceName.split('/');
        var resourcePath = 'js/app/' + resourceNameList[0];

        var baseName = resourceNameList.length > 1 ? resourceNameList[1] : resourceNameList[0];

        var routeDef = {'url': url};
        routeDef.templateUrl = resourcePath + '/'+ baseName + '.view.html';
        if(TEST_ENVIRONMENT) {
          routeDef.templateUrl = '../www/' + routeDef.templateUrl;
        }
        routeDef.controller = baseName.substr(0,1).toUpperCase() + baseName.substr(1) + 'Controller';
        if(options) {
          for(name in options) {
            routeDef[name] = options[name];
          }
        }
        if(routeDef.controller) {
          routeDef.resolve = {
            load: ['$q', '$rootScope', function ($q, $rootScope) {
              var dependencies = [resourcePath + '/'+ baseName + '.controller.js'];
              if(routeDef.dependencies) {
                angular.forEach(routeDef.dependencies, function(dependency) {
                  dependencies.push(dependency);
                }); 
              }

              return resolveDependencies($q, $rootScope, dependencies);
            }]
          };
        }

        // the controller should be called in view
        routeDef.controller = null;

        return routeDef;
      },

      resolveDependencies = function ($q, $rootScope, dependencies) {
        var defer = $q.defer();

        if(TEST_ENVIRONMENT) {
          dependencies = dependencies.map(function(dep) {
            return '../www/'+dep;
          });
        }

        require(dependencies, function () {
          defer.resolve();
          $rootScope.$apply();
        });

        return defer.promise;
      };

      return {
        resolve: resolve
      }
    }();

  };

  var servicesApp = angular.module('routeResolverServices', []);

  //Must be a provider since it will be injected into module.config()  
  servicesApp.provider('routeResolver', routeResolver);
});