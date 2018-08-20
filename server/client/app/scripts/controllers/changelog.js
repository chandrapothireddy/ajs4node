angular
    .module('app')
    .controller('changelogController', [
        '$rootScope',
        '$scope',
        'apiService',
        function($rootScope, $scope, api) {

            api.changelog().then(function(response) {
                $scope.changelog = response.data;
            });

        }
    ]);
