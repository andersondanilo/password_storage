var requestBaseUrl = 'http://127.0.0.1:9292/api/v1';

function mockRequests($httpBackend) {
    mockTemplateRequests($httpBackend);
}

function mockTemplateRequests($httpBackend) {
    var templates = [
      'password/formPassword.view.html',
      'category/indexCategory.view.html',
      'category/formCategory.view.html',
      'dashboard/dashboard.view.html',
      'dashboard/overview.view.html',
      'default/default.view.html',
      'default/default.view.html',
      'account/information.view.html'
    ];

    angular.forEach(templates, function(template) {
      $httpBackend.whenGET('../www/js/app/' + template).respond('sample template');
    });
}

function autoDigest($rootScope, $httpBackend, config) {
    if(!config)
      config = {};
    setInterval(function() {
      try {
        if($httpBackend && !config.disableAutoFlush) {
          $httpBackend.flush();
        } else {
          $rootScope.$digest();
        }
      } catch(e) {
        if(e.message.indexOf('No pending request') >= 0 ||
            e.message.indexOf('$digest already in progress') >= 0) {
          // do nothing
        } else {
          console.error(e.stack);
        }
      }
    }, 10);
}

function whenPostCategories($httpBackend, remoteCategories) {
  $httpBackend
    .whenPOST(requestBaseUrl + '/categories')
    .respond(function(method, url, data) {
      if(!data)
        throw new Error("No data");

      var attributes = angular.fromJson(data).data.attributes;

      attributes['rev'] = 'test-rev';

      delete attributes['_rev'];
      delete attributes['_sync_status'];

      var result = {
        "type": "categories",
        "id": attributes.uuid,
        "attributes": attributes
      };

      if(remoteCategories) {
        remoteCategories.push(result);
      }

      return [200, {
        "data": result
      }, {}];
    });
}

function whenPatchCategories($httpBackend, remoteCategories) {
  var expr = /.+\/categories\/(.+)/;
  $httpBackend
    .whenPATCH(expr)
    .respond(function(method, url, data) {
      if(!data)
        throw new Error("No data");

      var uuid = expr.exec(url)[1];

      var attributes = angular.fromJson(data).data.attributes;

      var oldCategory = null;

      angular.forEach(remoteCategories, function(auxCategory) {
        if(auxCategory.id == uuid) {
          oldCategory = auxCategory;
        }
      });

      if(!oldCategory)
        return [404, {"data": null}, {}];

      attributes['rev'] = 'test-rev';

      delete attributes['_rev'];
      delete attributes['_sync_status'];

      for(var k in attributes) {
        oldCategory.attributes[k] = attributes[k];
      }

      return [200, {
        "data": oldCategory
      }, {}];
    });
}

function whenGetCategoriesWithResult($httpBackend, data) {
  if(!data) {
    data = [
      {
        "type": "categories",
        "id": "my id",
        "attributes": {
          "uuid": "my id",
          "rev": "rev1",
          "name": "remote category 1"
        }
      }
    ];
  }
  $httpBackend
    .whenGET(requestBaseUrl + '/categories')
    .respond({
      "data": data
    });
}

function whenDeleteCategory($httpBackend, data) {
  var expr = /.+\/categories\/(.+)/;

  $httpBackend
    .whenDELETE(expr)
    .respond(function(method, url) {

      var uuid = expr.exec(url)[1];
      var categoryKey;
      var category;
      angular.forEach(data, function(category, key) {
        if(category.id == uuid) {
          categoryKey = key;
        }
      });

      if(categoryKey >= 0) {
        category = data.splice(categoryKey, 1)[0];

        return [200, {
          "data": category
        }];
      } else {
        return [404, {
          "data": null
        }];
      }
    });
}

function whenGetCategoriesWithNoResult($httpBackend) {
  $httpBackend
    .whenGET(requestBaseUrl + '/categories')
    .respond({
      "data": []
    });
}







function fakePasswordRequests($httpBackend) {
  var remotePasswords = [];

  whenPostPasswords($httpBackend, remotePasswords);
  whenPatchPasswords($httpBackend, remotePasswords);
  whenGetPasswordsWithResult($httpBackend, remotePasswords);
  whenDeletePassword($httpBackend, remotePasswords);
}

function whenPostPasswords($httpBackend, remotePasswords) {
  var expr = /.+\/categories\/(.+)\/passwords/;
  $httpBackend
    .whenPOST(expr)
    .respond(function(method, url, data) {
      if(!data)
        throw new Error("No data");

      var attributes = angular.fromJson(data).data.attributes;

      attributes['rev'] = 'test-rev';

      delete attributes['_rev'];
      delete attributes['_sync_status'];

      var result = {
        "type": "passwords",
        "id": attributes.uuid,
        "attributes": attributes
      };

      if(remotePasswords) {
        remotePasswords.push(result);
      }

      return [200, {
        "data": result
      }, {}];
    });
}

function whenPatchPasswords($httpBackend, remotePasswords) {
  var expr = /.+\/categories\/(.+)\/passwords\/(.+)/;
  $httpBackend
    .whenPATCH(expr)
    .respond(function(method, url, data) {
      if(!data)
        throw new Error("No data");

      var uuid = expr.exec(url)[2];

      var attributes = angular.fromJson(data).data.attributes;

      var oldPassword = null;

      angular.forEach(remotePasswords, function(auxPassword) {
        if(auxPassword.id == uuid) {
          oldPassword = auxPassword;
        }
      });

      if(!oldPassword)
        return [404, {"data": null}, {}];

      attributes['rev'] = 'test-rev';

      delete attributes['_rev'];
      delete attributes['_sync_status'];

      for(var k in attributes) {
        oldPassword.attributes[k] = attributes[k];
      }

      return [200, {
        "data": oldPassword
      }, {}];
    });
}

function whenGetPasswordsWithResult($httpBackend, data) {
  if(!data) {
    data = [
      {
        "type": "passwords",
        "id": "my id",
        "attributes": {
          "uuid": "my id",
          "rev": "rev1",
          "name": "remote password 1"
        }
      }
    ];
  }

  var expr = /.+\/categories\/(.+)\/passwords/;

  $httpBackend
    .whenGET(expr)
    .respond({
      "data": data
    });
}

function whenDeletePassword($httpBackend, data) {
  var expr = /.+\/categories\/(.+)\/passwords\/(.+)/;

  $httpBackend
    .whenDELETE(expr)
    .respond(function(method, url) {

      var uuid = expr.exec(url)[2];
      var passwordKey;
      var password;
      angular.forEach(data, function(password, key) {
        if(password.id == uuid) {
          passwordKey = key;
        }
      });

      if(passwordKey >= 0) {
        password = data.splice(passwordKey, 1)[0];

        return [200, {
          "data": password
        }];
      } else {
        return [404, {
          "data": null
        }];
      }
    });
}

function whenGetPasswordsWithNoResult($httpBackend) {
  var expr = /.+\/categories\/(.+)\/passwords/;

  $httpBackend
    .whenGET(expr)
    .respond({
      "data": []
    });
}
