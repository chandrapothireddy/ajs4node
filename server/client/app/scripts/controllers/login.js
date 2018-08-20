angular
    .module('app')
    .controller('loginController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        '$timeout',
        '$routeParams',
        'userService',
        function($rootScope, $scope, $location, Auth, $timeout, $routeParams, User) {

            // declare variables
            $scope.email = '';
            $scope.password = '';

            // we use this to set credentials for demo on initial page screen
            var demoCredentials = {
                admin: {
                    email: 'bwalsh@marlinfinance.com',
                    password: 'bwalsh'
                },
                salesRep: {
                    email: 'jdelong@marlinfinance.com',
                    password: 'jdelong'
                },
                vendorRep: {
                    email: 'vrep@gmail.com',
                    password: 'vrep'
                }
            };

            /**
             * Check for email which will be present in reset password links
             *
             */
            if ($routeParams.email) {
                $scope.email = $routeParams.email;
            }

            /**
             * This allows us to pass credentials into the controller to prefill the login form fields
             * This is useful for demos and dev.
             *
             */
            if ($routeParams.demo) {
                $scope.email = demoCredentials[$routeParams.demo].email;
                $scope.password = demoCredentials[$routeParams.demo].password;
            }


            /**
             * Runs on success, useful for redirecting etc.
             *
             */

            function loginSuccessCallback() {
                // clear any demo params as needed
                $location.search('demo', null);
                // go to daahboard
                $location.url('/dashboard');
            }

            // sets message and removes after timeout
            var setMessage = function(message) {
                $scope.message = message;
            };


            // used to provide a button specific activity spinner 
            // @todo eliminate this in favor of the namespaced "activity" spinners
            // @see https://github.com/ajoslin/angular-promise-tracker
            $scope.isProcessing = false;

            $scope.login = function() {

                $scope.isProcessing = true;
				//alert($scope.email);
				//alert($scope.password);
                Auth.login($scope.email, $scope.password).then(function(response) {
					//alert("response"+response);
                    // @todo make this more robust! 
                    $scope.isProcessing = false;
                    loginSuccessCallback();

                }, function(err, message) {
				    setMessage("There was an error logging you in: " + err.data.meta.message + ".");
					
					
                    $rootScope.Validator.validateForm($scope.loginForm);
                    $scope.isProcessing = false;

                });

            };

        }
    ]);
