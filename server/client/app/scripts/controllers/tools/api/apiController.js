angular
    .module('app')
    .controller('apiController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'authService',
        'MARLINAPI_CONFIG',
        function($rootScope, $scope, $location, $routeParams, Auth, MARLINAPI_CONFIG) {

            $scope.documentationPage = function() {

                $scope.api_base = 'https://www.leaserep.com/public_api/v1/';
				//$scope.api_base = 'https://leaserep16.herokuapp.com/public_api/v1/';
				

            };

        }

    ]);
