angular
    .module('app')
    .controller('applicationToolController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'quoteService',
        'programService',
        'vendorService',
        'applicationService',
        'authService',
        'stateService',
        '$anchorScroll',
        function($rootScope, $scope, $location, $routeParams, Quote, Program, Vendor, Application, Auth, States, $anchorScroll) {

            // empty application object
            $scope.application = {};

            // get states arrays for forms
            $scope.states1 = States.states();
            $scope.states2 = States.states();

            // prevents end user from hitting application tool directly
            // comment out to easily test

            if ($rootScope.fromQuote !== true) {
                //if (!Auth.canUserDoAction('view-applications')) {
                $location.url('/tools/quoter');
                //}
            }


            // utility function to go back to the quote list
            // @todo this function is used in many places, find a way to streamline it
            $scope.cancel = function() {
                $location.url('/tools/quoter');
            };


            // get quote ID for edit pages
            var applicationId = $routeParams.id;


            /**
             * GET APPLICATION BY ID
             * --------------------------------------
             *
             */
            if (applicationId) {

                // get the quote
                Application.getById(applicationId).then(function(response) {
                    $scope.application = response;

                    // if not a valid application, redirect
                    if (!$scope.application) $location.path('/tools/quoter');

                    $scope.vendor = $scope.application.vendorId;

                    // if no state is set, set default 
                    if (!$scope.application.company.businessAddress.state) {
                        $scope.application.company.businessAddress.state = $scope.states1[0].abbreviation;
                    }

                    if (!$scope.application.guarantor.homeAddress.state) {
                        $scope.application.guarantor.homeAddress.state = $scope.states2[0].abbreviation;
                    }

                }, function() {
                    // redirect on no application found
                    $location.url('/tools/quoter');
                });

            }

            $scope.showPG = function() {
                if (Auth.showIfUserCanDoAction('viewGuarantor')) return true;
                if (!Auth.showIfUserCanDoAction('viewGuarantor') && $rootScope.fromQuote === true) return true;
                return false;
            };

            /**
             * LOGIC TO CHECK IF GUARANTOR INFO IS NEEDED
             * --------------------------------------
             *
             */
            $scope.needsMoreInfo = function() {

                if ($scope.application.soleProp === true || ($scope.application.yearsInBusiness !== '' && $scope.application.yearsInBusiness <= 10)) {
                    $scope.message = 'Please provide more information to help ensure timely processing of your applicaiton.';
                    return true;
                } else {
                    $scope.message = false;
                    return false;
                }
            };


            /**
             * SAVE APPLICATION if valid
             * --------------------------------------
             *
             */
            $scope.saveApplication = function() {

                // attempt to validate from
                if ($scope.ApplicationToolForm.$valid) {
                    successCallback();
                } else {
                    $rootScope.Validator.validateForm($scope.ApplicationToolForm);
                }

                // private success callback

                function successCallback() {

                    Application.update($scope.application).then(function(response) {
                        $scope.finished = true;
                        $scope.message = false;

                        // forces scroll to top of page
                        $anchorScroll();
                    });

                }

            };

        }

    ]);
