describe("dataService", function() {
  beforeEach(module('passwordStorage'));

  var dataService;

  beforeEach(inject(function(_dataService_){
    dataService = _dataService_;
  }));
   
  it("can write and read variables by key", function() {
    dataService.set('name', 'Test');
    var result = dataService.get('name');
    expect(result).toEqual('Test');
  });
});