'use strict';

define(['app/services/authService'], function () {
  var app = require('app');

  app.register.service('cryptService', ['authService', 'clientSalt', CryptService]);

  function CryptService(authService, clientSalt) {
    this.encrypt = encrypt;
    this.decrypt = decrypt;

    function encrypt(value) {
      return CryptoJS.AES.encrypt(value, key()).toString();
    }

    function decrypt(value) {
      return CryptoJS.AES.decrypt(value, key()).toString(CryptoJS.enc.Utf8)
    }

    function key() {
      var session = authService.getSession();
      var serverSalt = session['salt'];
      if(!serverSalt)
        throw new Error("Invalid server salt");
      if(!clientSalt)
        throw new Error("Invalid client salt");
      return 'key' + serverSalt + clientSalt;
    }
  }
});