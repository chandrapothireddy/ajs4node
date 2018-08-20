angular
    .module('app')
    .factory('apiService', [
        '$http',
        function($http) {
            return {
                changelog: function() {
                    return $http.get('/api/changelog').then(function(response) {
                        return response;
                    });
                },
                ping: function() {
                    return $http.get('/api/ping').then(function(response) {
                        return response;
                    });
                }
            };
        }
    ]);
