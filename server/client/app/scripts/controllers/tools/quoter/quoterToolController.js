/**
 * The quoter tool controller provides a number of functionality around generating quotes
 * --------------------------------------
 *
 * GENERATE A NEW QUOTE, given a totalCost, description, and company information
 *
 * VIEW EXISTING QUOTE, given a quote ID
 *
 * EDIT AN EXISTING QUOTE, if user is still in the generate quote process. This means re-visitng the
 *     quote url will not allow for editing the quote, only viewing and printing.
 *
 * PRINT EXISTING QUOTE AS PDF, given a quote ID
 *
 * START A NEW APPLICATION, by choosing a payment from an existing quote
 *
 *
 */
angular
    .module('app')
    .controller('quoterToolController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'quoteService',
        'programService',
        'vendorService',
        'stateService',
        'applicationService',
        '$anchorScroll',
        'resolvedVendor',
        function($rootScope, $scope, $location, $routeParams, Quote, Program, Vendor, States, Application, $anchorScroll, resolvedVendor) {

		
            // define empty objects
            $scope.quote = {};
            $scope.vendor = {};
            $scope.vendors = [];

            // define variables
            $scope.didQuote = false;
            $scope.buttonText = 'Get Quote';
            $scope.canEdit = true;
            $scope.quoteCost = null;

            // define local store for quote
            var quote = {};

            // Get quoter version
            // @todo this should be replaced with "version directive"
            $scope.version = $rootScope.version;

            // get route params
            var quoteId = $routeParams.id;
            var vendorId = $routeParams.vendor_id;

            // if we don't already have a quote, we need to figure out the vendor
            // lets do some logic to figure this out 
            if (!quoteId && vendorId && !resolvedVendor) {

                // we have a vendor, so hide the dropdown
                // if its not valid, we'll handle that later
                $scope.haveVendor = true;

                // get the vendor from API
                getInitialVendor(vendorId);

            } else if (resolvedVendor) {

                $scope.vendor = resolvedVendor;

            } else if (!quoteId) {

                // gets all the vendors so our user can select one!
                getAllVendors();

            }

            // get a single vendor at set as global vendor

            function getInitialVendor(getId) {
                Vendor.getById(getId).then(function(response) {

                    $scope.vendor = response;
                    // not a valid vendor, redirect
                    if (!$scope.vendor) redirectAndClear();

                }, function() {

                    // API returned failure, redirect
                    redirectAndClear();
                });
            }


            // redirect and clear the params using .search() method

            function redirectAndClear() {
                $location.url('tools/quoter');
                $location.search('vendor_id', null);
            }


            // get all the vendors from API
            // @todo this sould only get vendors with quoter enabled

            function getAllVendors() {
                // get the vendors
                Vendor.getAll().then(function(response) {
                    $scope.vendors = response;
                });
            }


            // utility function to go back to the quote list
            // @todo this function is used in many places, find a way to streamline it
            $scope.cancel = function() {
                $location.url('/tools/quoter');
            };


            // get and store the quote 
            if (quoteId) {
                // get the quote
                Quote.getById(quoteId).then(function(response) {

                    $scope.quote = response;

                }, function(error) {
                    $location.path('/tools/quoter');
                });

                $scope.didQuote = true;
                $scope.buttonText = 'Re-calculate Quote';

                // we create a preview link, removing the print param if present
                $scope.permalink = $location.absUrl().replace('/print', '');
				
                // this line will prevent editing a quote when 
                // visiting the page from a link. 
                //if ($rootScope.previewQuote !== true) $scope.canEdit = false;

            } else {

                //List states in dropdown menu
                // get states list and set default
                $scope.quote.company = {};
                $scope.quote.company.businessAddress = {};
                $scope.states = States.states();
                $scope.quote.company.businessAddress.state = $scope.states[0].abbreviation;

                if ($rootScope.previewQuote === true) $rootScope.previewQuote = false;
            }


            // uncomment to test
            // provides dummy valid quote info
            //
            if (!$scope.quote._id) {
                //$scope.quote = {"company":{"businessAddress":{"state":"NJ","address1":"111 Tree Road","address2":"Apartment 3","city":"Absecon","zip":"19223"},"contactPerson":{"contactMethod":"email","name":"Matt Miller","email":"matt@facultycreative.com","phone":"6093354417"},"fullLegalBusinessName":"Company Name"},"description":"This is some equiptment","totalCost":"3000","vendorId":"51e71518ed32080ffc000023"};
            }


            /**
             * GENERATE A NEW QUOTE
             * --------------------------------------
             * Generates a new quote for given:
             * - totalCost
             * - description
             * - company (not required by api but we provide it with quoter tool)
             *
             * This function works by passing the required info the to API, on success
             * we then redirect user to a page which loads their quote by _id, ie: /tools/quoter/12345
             * This page loads the quote a second time but provides in context editing and viewing
             * for thier quote as they review, print, and update it.
             *
             */
            $scope.generateQuote = function() {

                // check if form is valid
                //   this will trigger any in-valid form items to show 
                //   their validation messages
                // if form is valid, then we call a function to save quote
                //
                if ($scope.QuoterToolForm.$valid) {
                    successCallback();
                } else {
                    $rootScope.Validator.validateForm($scope.QuoterToolForm);
                }

                function successCallback() {

                    $scope.didQuote = false;

                    // save the custom Field with the quote 
                    // this allows the custom field to live on with the quote
                    // even if that gets changed later for this vendor
                    if ($scope.vendor && $scope.vendor.customField.enabled) {

                        // add empty customField object if not present
                        if (!$scope.quote.customField) $scope.quote.customField = {};

                        // set customField value and displayName
                        $scope.quote.customField = {
                            displayName: $scope.vendor.customField.displayName,
                            value: $scope.quote.customField.value
                        };
                    }

                    if (!quoteId) {

                        $rootScope.previewQuote = true;

                        // clear vendorId because its an object and reset
                        $scope.quote.vendorId = null;
                        $scope.quote.vendorId = $scope.vendor._id;

                        // create new quote
                        Quote.add($scope.quote).then(handleReponse);

                    } else {

                        $rootScope.previewQuote = true;

                        // clear out the vendor id
                        $scope.quote.vendorId = null;
                        $scope.quote.vendorId = $scope.vendor._id;

                        // update existing quote 
                        Quote.update($scope.quote).then(handleReponse);

                    }
                }

            };

            // function to set error or quote on response from Quote api call
            var handleReponse = function(response) {
                // if a quote was generated
                if (response._id) {

                    $scope.quote = response;

                    $location.url('/tools/quoter/' + response._id);
                    $scope.didQuote = true;
                    $scope.quoteError = false;


                    // no quote was genereated
                } else {

                    $scope.quoteError = response.meta.message;
                    $scope.didQuote = true;
                    $anchorScroll();

                }
            };


            /**
             * START A NEW APPLICATION
             * --------------------------------------
             * Function which allows user to start application by selectiong a payment
             * when viewing an existing quote.
             *
             * Works by generating a new application, saving specific data from the quote, and then
             * redirecting user to this new application page.
             *
             */
            $scope.chooseRate = function(rateObject) {

                /*
                payment: 516.5
                paymentDisplay: "$516.50"
                rate: 0.1033
                term: "12 Months"
                totalCost: 5000
                totalCostDisplay: "$5,000.00"
                */

                var application = _.clone($scope.quote);

                // clear the application id, which will be the quote id because of clone
                delete application._id;

                // save reference to quote id
                application.quoteId = $scope.quote._id;

                // save the rate object as the selected "payment" 
                application.payment = rateObject;

                // quotes have an 'Open' status by default while apps have 'new'
                // @todo refactor to make consistant 
                application.status = 'draft';

                // clear out the vendor id
                application.vendorId = null;
                application.vendorId = $scope.vendor._id;

                // flag user as coming from a quote
                // if this variable is not true, the application tool currecntly redirects
                // users back home
                // @todo remove this if we open the application tool with "Marlin" as vendor
                //
                $rootScope.fromQuote = true;

                // create new application and redirect on success
                //
                Application.add(application).then(function(response) {

                    // redirec to application tool, which will handle loading the application
                    $location.url('/tools/application/' + response._id);

                });

            };


            /**
             * PRINT EXISTING QUOTE AS PDF
             * --------------------------------------
             * Given a quote id, makes a call to the API which generates a pdf, saves it locally,
             * returns the url of the pdf, and prompts a file download in a cross browser way.
             *
             * @todo If we decide to send the pdf by email, we'd need to refactor this
             *       so that a pdf is generated on quote creation, rather then in this instance.
             *
             */
	$scope.printData = function()
			{
			window.print();
			};
            // default message
            $scope.downloadMessage = "Download as a PDF";

            // function called on ng-click
            $scope.download = function(id) {

                // why are we providing this? 
                id = id || quoteId;

                // message user
                $scope.downloading = true;
                $scope.downloadMessage = "Please wait while we generate your PDF";

                window.location = 'quotes/'+id+'/download';

            };

        }
    ]);
