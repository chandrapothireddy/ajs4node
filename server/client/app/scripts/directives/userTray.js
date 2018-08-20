angular
    .module('app')
    .directive('userTray', ['authService', '$location',
        function(Auth, $location) {

            return {
                templateUrl: 'app/templates/directives/userTray.html',
                link: function($scope, element, attrs) {
                    $scope.isLoggedIn = Auth.isAuthenticated;

                    $scope.currentUser = Auth.getCurrentUser;

                    $scope.goToProfile = function() {
                        $location.url('/dashboard/users/' + Auth.getCurrentUser()._id);
                    };

                    $scope.logout = function() {
                        Auth.logout();
                        $location.url('/login');
                    };

                }
            };

        }
    ]);
