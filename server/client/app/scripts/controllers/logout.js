angular
    .module('app')
    .controller('logoutController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        function($rootScope, $scope, $location, Auth) {

            Auth.logout();
            $location.url('/login');

        }
    ]);
