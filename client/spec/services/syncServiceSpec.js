describe("syncService", function() {
  beforeEach(module('passwordStorage'));

  var authService, syncService, repositoryService, $rootScope, $httpBackend, digestConfig;

  beforeEach(inject(function(_authService_, _syncService_, _repositoryService_, _$rootScope_, _$httpBackend_){
    authService = _authService_;
    syncService = _syncService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    repositoryService = _repositoryService_;

    mockRequests($httpBackend);

    autoDigest($rootScope, $httpBackend);
  }));

  it("download news contents", function(done) {
    var session, requested;

    fakePasswordRequests($httpBackend);

    whenPostCategories($httpBackend);

    whenGetCategoriesWithResult($httpBackend);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        repositoryService.all('categories').then(function(categories) {
          expect(categories.length).toEqual(2);

          expect(categories[0].deleted).toEqual(true);

          expect(categories[1].name).toEqual("remote category 1");
          expect(categories[1].uuid).toEqual("my id");
          expect(categories[1]._rev).toEqual("rev1");
          done();
        });
      });    
    });
  });


  it("upload news contents", function(done) {
    var session, requested;

    fakePasswordRequests($httpBackend);

    whenPostCategories($httpBackend);

    whenGetCategoriesWithNoResult($httpBackend);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        repositoryService.all('categories').then(function(categories) {
          expect(categories.length).toEqual(1);
          expect(categories[0].name).toEqual("Default");
          expect(categories[0]._sync_status).toEqual(1);
          expect(categories[0]._rev).toEqual("test-rev");
          done();
        });
      });
    });
  });

  it("delete local content that are deleted remote", function(done) {
    var session, requested;

    $httpBackend.flush();

    fakePasswordRequests($httpBackend);

    whenPostCategories($httpBackend);

    var data = [
      {
        "type": "categories",
        "id": "my id",
        "attributes": {
          "uuid": "my id",
          "rev": "rev1",
          "name": "remote category temporary"
        }
      }
    ];

    whenGetCategoriesWithResult($httpBackend, data);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        repositoryService.all('categories').then(function(categories) {
          expect(categories.length).toEqual(2);
          expect(categories[1].name).toEqual("remote category temporary");
          expect(categories[1].uuid).toEqual("my id");
          expect(categories[1]._rev).toEqual("rev1");

          data.splice(0,1);

          syncService.syncronize().then(function() {
            repositoryService.all('categories').then(function(categories) {
              expect(categories.length).toEqual(2);
              expect(categories[1].name).toEqual("remote category temporary");
              expect(categories[1].uuid).toEqual("my id");
              expect(categories[1]._rev).toEqual("rev1");
              expect(categories[1].deleted).toEqual(true);

              done();
            });
          });
        });

      });
    });
  });

  it("delete remote content that are deleted local", function(done) {
    var session, requested;

    $httpBackend.flush();

    fakePasswordRequests($httpBackend);

    whenPostCategories($httpBackend);

    var data = [
      {
        "type": "categories",
        "id": "my id",
        "attributes": {
          "uuid": "my id",
          "rev": "rev1",
          "name": "remote category temporary"
        }
      }
    ];

    whenGetCategoriesWithResult($httpBackend, data);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        repositoryService.all('categories').then(function(categories) {
          expect(categories.length).toEqual(2);
          expect(categories[1].name).toEqual("remote category temporary");
          expect(categories[1].uuid).toEqual("my id");
          expect(categories[1]._rev).toEqual("rev1");

          // delete local
          categories[1].deleted = true;

          repositoryService.save('categories', categories[1]).then(function() {

            whenDeleteCategory($httpBackend, data);

            syncService.syncronize().then(function() {
              repositoryService.all('categories').then(function(categories) {
                expect(categories.length).toEqual(2);
                expect(categories[1].name).toEqual("remote category temporary");
                expect(categories[1].uuid).toEqual("my id");
                expect(categories[1]._rev).toEqual("rev1");
                expect(categories[1].deleted).toEqual(true);

                expect(data.length).toEqual(0);

                done();
              });
            });

          });
        });

      });
    });
  });

  it("update remote content", function(done) {
    var session, requested;

    var remoteCategories = [];

    fakePasswordRequests($httpBackend);
    whenPostCategories($httpBackend, remoteCategories);
    whenPatchCategories($httpBackend, remoteCategories);
    whenGetCategoriesWithResult($httpBackend, remoteCategories);
    whenDeleteCategory($httpBackend, remoteCategories);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        expect(remoteCategories.length).toEqual(1);

        var remoteCategory = remoteCategories[0];
        var newName = remoteCategory.attributes.name + ' new name';

        repositoryService.byUUID('categories', remoteCategory.id).then(function(localCategory) {
          localCategory.name = newName;

          repositoryService.save('categories', localCategory).then(function() {
            syncService.syncronize().then(function() {
              expect(remoteCategories.length).toEqual(1);
              expect(remoteCategory.attributes.name).toEqual(newName);

              done();
            });
          });
        });
      });    
    });
  });

  it("update local category content with success", function(done) {
    var session, requested;

    var remoteCategories = [];

    fakePasswordRequests($httpBackend);
    whenPostCategories($httpBackend, remoteCategories);
    whenGetCategoriesWithResult($httpBackend, remoteCategories);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        expect(remoteCategories.length).toEqual(1);

        var remoteCategory = remoteCategories[0];
        var newName = remoteCategory.attributes.name + ' new name';
        remoteCategory.attributes.name = newName;
        remoteCategory.attributes.rev = 'rrev2';

        syncService.syncronize().then(function() {
          repositoryService.byUUID('categories', remoteCategory.id).then(function(localCategory) {
            expect(remoteCategories.length).toEqual(1);
            expect(localCategory.name).toEqual(newName);
            done();
          });
        });
      });
    });
  });

  it("update local category content only where rev changes", function(done) {
    var session, requested;

    var remoteCategories = [];

    fakePasswordRequests($httpBackend);
    whenPostCategories($httpBackend, remoteCategories);
    whenGetCategoriesWithResult($httpBackend, remoteCategories);

    repositoryService.seedDatabase().then(function() {
      syncService.syncronize().then(function() {
        expect(remoteCategories.length).toEqual(1);

        var remoteCategory = remoteCategories[0];
        var oldName = remoteCategory.attributes.name;
        remoteCategory.attributes.name = remoteCategory.attributes.name + ' new name';

        syncService.syncronize().then(function() {
          repositoryService.byUUID('categories', remoteCategory.id).then(function(localCategory) {
            expect(remoteCategories.length).toEqual(1);
            expect(localCategory.name).toEqual(oldName);
            done();
          });
        });
      });
    });
  });

});