angular
    .module('app')
    .controller('passwordResetController', [
        '$scope',
        'userService',
        '$http',
        function($scope, User, $http) {
            $scope.isProcessing = false;
            $scope.email = "";
            $scope.status = "";

            $scope.passwordReset = function() {
                $scope.isProcessing = true;

                User.find({
                    email: $scope.email
                }).then(function(response) {
                    user = response.data[0];
                    if (user && user.email) {
                        $http({
                            method: 'PUT',
                            url: '/api/v1/users/' + user._id + '/reset_password'
                        }).success(function(data) {
                            $scope.message = "An email has been sent to " + $scope.email + " containing login instructions.";
                            $scope.status = 'success';
                        }).error(function(data) {
                            $scope.message = "There was an error resetting your password. Please try again.";
                            $scope.status = 'error';
                        });
                    } else {
                        $scope.message = "We didn't find that email address in our system. Double check the spelling and try again";
                        $scope.status = 'error';
                    }
                    $scope.isProcessing = false;
                });
            };
        }
    ]);
