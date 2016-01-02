describe("authService", function() {
  beforeEach(module('passwordStorage'));

  var authService, $rootScope, $httpBackend;

  beforeEach(inject(function(_authService_, _$rootScope_, _$httpBackend_){
    authService = _authService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;

    mockRequests($httpBackend);

    autoDigest($rootScope, $httpBackend);
  }));

  it("can login using access token", function(done) {
    var session, requested;

    var remoteCategories = [];

    whenPostCategories($httpBackend, remoteCategories);
    whenGetCategoriesWithResult($httpBackend, remoteCategories);

    $httpBackend
      .whenGET(requestBaseUrl + '/users/current')
      .respond({
        "data": {
          "type": "users",
          "attributes": {
            "name": "test1",
            "email": "test1@test.com",
            "salt": "test"
          }
        }
      });

    authService.logout().then(function() {
      expect(authService.isLogged()).toBeFalsy();
      authService.loginUsingAccessToken({'access_token': 'abc'}).then(function() {
        session = authService.getSession();
        expect(session['access_token']).toEqual('abc');
        expect(authService.isLogged()).toBeTruthy();
        done();
      });

    });    
  });
});