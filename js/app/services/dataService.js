'use strict';

define([], function () {
    var app = require('app');

    app.register.service('dataService', [DataService]);

    function DataService() {
        this.set = set;
        this.get = get;
        this.has = has;
        this.remove = remove;

        function set(key, value) {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);
        };

        function get(key) {
            var result = localStorage.getItem(key);
            if(result)  {
                result = JSON.parse(result);
            }
            return result;
        };

        function has(key) {
            return this.get(key) == null;
        };

        function remove(key) {
            localStorage.removeItem(key);
        };
    }
});