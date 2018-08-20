angular
    .module('app')
    .controller('programEditController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'authService',
        'programService',
        'CommonInterface',
        '$anchorScroll',
        function($rootScope, $scope, $location, $routeParams, Auth, Program, CommonInterface, $anchorScroll) {

            var program = {};
            var programId = $routeParams.id;
            var formTabMap;

            ////////////////////////////////////////////////////////////////
            /// Logic to handle Rate Sheet Serialization/Deserialization ///
            ////////////////////////////////////////////////////////////////

            var SerializationStrategies = {
                deserialize: function(array) {
                    return array.map(function(str) {
                        return {
                            value: str
                        };
                    });
                },
                serialize: function(object) {
                    return object.map(function(obj) {
                        return obj.value;
                    });
                }
            };

            function prepareRateSheetView() {
                if (rateSheetExists()) {
                    transformBuyoutOptions("deserialize");
                }
            }

            function prepareRateSheetModel() {
                if (rateSheetExists()) {
                    transformBuyoutOptions("serialize");
                }
            }

            function rateSheetExists() {
                return $scope.program.rateSheet !== undefined &&
                    $scope.program.rateSheet.buyoutOptions;
            }

            function transformBuyoutOptions(strategy) {
                $scope.program.rateSheet.buyoutOptions.forEach(function(opt) {
                    opt.terms = SerializationStrategies[strategy](opt.terms);
                    opt.costs.forEach(function(cost) {
                        cost.rates = SerializationStrategies[strategy](cost.rates);
                    });
                });
            }

            // basic auth protection for this route
            // @todo can we create a global route change auth service? 
            Auth.canUserDoAction('edit-programs');

            // available term options
            $scope.termPeriodOptions = ['Month', 'Year', 'Quarter', 'Bi-Annual'];

            // empty program object
            $scope.program = Program.template();
            $scope.program.rateSheet.termPeriod = $scope.termPeriodOptions[0];
            prepareRateSheetView();

            $scope.newOption = {};

            // button text
            $scope.formAction = 'Add';

            // needed for form unsaves changes? 
            $scope.modelObject = Program;

            // utility function to go back to the program list
            // @todo this function is used in many places, find a way to streamline it
            $scope.cancel = function() {
                $location.url('/dashboard/programs');
            };

            ////////////////////////////////////////////////////////////////
            //// Logic to handle showing/hiding messages on form save  /////
            ////////////////////////////////////////////////////////////////
            $scope.showGlobalErrorMsg = function(form) {
                var showError = false;
                _.each(form, function(val, key) {
                    if (val !== null) {
                        showError = true;
                    }
                });
                return showError;
            };

            ////////////////////////////////////////////////////////////////
            ///////////// Logic to handle initial page setup ///////////////
            ////////////////////////////////////////////////////////////////

            // get and store the program 
            if (programId) {
                // get the program
                Program.getById(programId).then(function(response) {
                    $scope.program = response;
                    $scope.termLength = $scope.program.rateSheet.termLength;

                    // Map the rates on each buyoutOption to an object.
                    // Since our intent is to loop through each buyoutOption using
                    // ng-repeat, we need objects in order to maintain proper
                    // parent-child update flow. In Javascript's prototypal inheritance,
                    // primitive types are value data, not reference data. They
                    // do not maintain a single pointer to a value on the heap,
                    // they perform a copy of the primitive data, and refer to different
                    // values entirely. Without mapping to an object, the parent scope
                    // would not update when the child is typed into. 

                    prepareRateSheetView();
                });

                $scope.formAction = 'Update';
            }

            $scope.saveAlert = false;

            // activated when user clicks the save button
            $scope.save = function(doRedirect) {

                formTabMap = [
                    $scope.$$childTail.basicForm,
                    $scope.$$childTail.formBuyoutOptions
                ];

				
                CommonInterface.save({
                    Model: Program,
                    instance: $scope.program,
                    id: programId,
                    form: formTabMap,
                    redirectUrl: '/dashboard/programs',
                    doRedirect: doRedirect,
                    preSaveHook: function() {
                        // Map the rates back to a string val to save to the db, since that's
                        // what we have in the model. In the future, we should straight up
                        // change the model to use an object. 
                        prepareRateSheetModel();
                        $scope.saveAlert = true;
                    },
                    postSaveHook: function() {
                        $scope.saveAlert = false;
                    }
                });
                $anchorScroll();
                prepareRateSheetView();

            };


            /**
             * TABBY
             * --------------------------------------
             *
             */
            $scope.tabs = ['Basic Information'];

            /**
             * Tab functions.
             * @todo make into a direct
             *
             */
            $scope.activeTab = 0;

            // used for active class
            $scope.isActiveTab = function(id) {
                return $scope.activeTab == id ? true : false;
            };

            // used to set active tab
            $scope.changeTab = function(tab) {

                if (!$scope.user._id) return false;

                $scope.activeTab = tab;
            };


            /**
             * ADDS A COST BUCKET ROW TO OPTION
             * --------------------------------------
             * by finding last cash max, and incrementing it by 1 dollar. So if the previous
             *  range was 1000 - 5000, this would create a new cost range (and blank row
             *  of rates) with a min of 5001.
             *
             */
            $scope.addRowToOption = function(theProgram) {

                var newMin;
                if (_.last(theProgram.costs).max) {
                    newMin = parseInt(_.last(theProgram.costs).max, 10) + 1;
                    // parse this back to a string so it will be properly converted to currency on the server
                    newMin = newMin.toString();
                } else {
                    newMin = '';
                }

                theProgram.costs.push({
                    min: newMin,
                    max: '',
                    rates: []
                });

                

                _.each(theProgram.terms, function(item) {
                    _.last(theProgram.costs).rates.push({
                        value: 0
                    });
                });

                $rootScope.Validator.setDirty($scope.$$childTail.formBuyoutOptions);

            };

            /**
             * ADD column to rate sheet
             * --------------------------------------
             *
             */
            $scope.addColumnToOption = function(theProgram) {

                theProgram.terms.push({
                    value: 0
                });

                _.each(theProgram.costs, function(item) {
                    item.rates.push({
                        value: 0
                    });
                });

                $rootScope.Validator.setDirty($scope.$$childTail.formBuyoutOptions);

            };


            /**
             * ???
             * --------------------------------------
             *
             */
            $scope.adjustValues = function($program, $value, $currentIndex) {
                if ($program.costs[$currentIndex + 1] && $value) {
                    $value = $value.toString().replace(/\,/g, "");
                    $program.costs[$currentIndex + 1].min = parseInt($value, 10) + 1;
                }
            };


            $scope.getValue = function(program, key, minOrMax) {

                var value = (minOrMax === 'min' && key > 0) ? 10000000000000 : 0;

                if (program.costs && program.costs[key] && program.costs[key][minOrMax]) {
                    value = program.costs[key][minOrMax].toString().replace(/\,/g, "");
                    value = parseInt(value, 10);
                }

                return value;

            };


            /**
             * ADDS A NEW OPTION TO A RATE SHEET
             * --------------------------------------
             *
             */
            $scope.makeNewOption = function() {

                if ($scope.$$childTail.newOptionForm.$valid) {
                    successCallback();
                } else {
                    $rootScope.Validator.validateForm($scope.$$childTail.newOptionForm);
                }

                function successCallback() {

                   // $rootScope.Validator.setPristine($scope.$$childTail.newOptionForm);
                   // $rootScope.Validator.setDirty($scope.$$childTail.formBuyoutOptions);

                    $scope.newOption.columns = 3;

                    var newBuyOut = {
                        name: '',
                        terms: [],
                        costs: [{
                            min: '',
                            max: '',
                            rates: []

                        }]
                    };


                    newBuyOut.name = $scope.newOption.name;
                    newBuyOut.costs[0].min = $scope.newOption.minCost;

                    for (var i = 0; i < $scope.newOption.columns; i++) {
                        newBuyOut.terms.push({
                            value: 0
                        });
                    }

                    for (i = 0; i < $scope.newOption.rows - 1; i++) {
                        newBuyOut.costs.push({
                            min: '',
                            max: '',
                            rates: []
                        });
                    }

                    _.each(newBuyOut.costs, function(cost) {
                        _.each(newBuyOut.terms, function() {
                            cost.rates.push({
                                value: 0
                            });
                        });
                    });

                    // needed when creating new rate sheet. 
                    if (!$scope.program.rateSheet) $scope.program.rateSheet = {
                        buyoutOptions: []
                    };
                    // @todo, this can be removed when the API is mongoose. 
                    if (!$scope.program.rateSheet.buyoutOptions) $scope.program.rateSheet.buyoutOptions = [];
                    $scope.program.rateSheet.buyoutOptions.push(newBuyOut);
                    $scope.newOption = {};

                    // force the form to be dirty, which triggers our unsavedChanges module
                    // this will cause a check if the user navigates away from this page             
                    //$scope.formBuyoutOptions.$setDirty();

                }

            };


            /**
             * DELETE A ROW OR COLUMN FROM RATE SHEET
             * --------------------------------------
             *
             * @param {type} String, Either row|column to indicate if we are removing a row or column!
             * @param {index} Int, Index from the ngRepeat
             * @param {options} Object, Options object we are manipulating stuff from
             *
             */
            $scope.remove = function(type, index, options) {

               

                if (type === 'column' && options.terms.length > 1) {

                   

                    // remove costs at this index
                    _.each(options.costs, function(item) {
                        item.rates.splice(index, 1);
                    });

                    // remove label
                    options.terms.splice(index, 1);

                } else if (type === 'row' && options.costs.length > 1) {

                    // remove costs at this index
                    options.costs.splice(index, 1);

                }

                $rootScope.Validator.setDirty($scope.$$childTail.formBuyoutOptions);

            };


            /**
             * Remove an entire buyout option from program
             * --------------------------------------
             *
             * @param {option} Buyout option to remove
             *
             */
            $scope.removeOption = function(option) {

                // save shortcut reference
                var bPs = $scope.program.rateSheet.buyoutOptions;

                bPs.splice(bPs.indexOf(option), 1);

                // force the form to be dirty, which triggers our unsavedChanges module
                // this will cause a check if the user navigates away from this page             
                $rootScope.Validator.setDirty($scope.$$childTail.formBuyoutOptions);

            };

        }
    ]);
