/**
 * This controller is very picky for a number of reasons, be careful when editing anything here!
 * @note the following list should be considered in a major refactor
 * - Tabs are set in two different arrays
 * - Tool order is decided by api load order, but must match expected pattern below. If the api
 *   were ever to return tools sorted in a different order, things would get ugly.
 * - The google map must be re-rendered on tab focus, but this happens based on active tab number
 *   and not the tab map.
 * - tabs! overall just as hard to debug as modals.
 *
 */
angular
    .module('app')
    .controller('vendorEditController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'authService',
        'vendorService',
        'programService',
        'stateService',
        'userService',
		'googleMapsService',
        '$timeout',
        '$window',
        'CommonInterface',
        function($rootScope, $scope, $location, $routeParams, Auth, Vendor, Program, States, User, googleMaps, $timeout, $window, CommonInterface) {

            $scope.modelObject = Vendor;
            $scope.mapActive = false;

            Auth.canUserDoAction('edit-vendors');

            $scope.tabs = [{
                name: 'Basic information',
                active: true,
                permission: 'none'
            }, {
                name: 'Marlin Sales Rep',
                active: true,
                permission: 'changeSalesRep-vendors'
            }, {
                name: 'Vendor Sales Rep',
                active: true,
                permission: 'changeVendorRep-vendors'
            }, {
                name: 'Rate Sheets',
                active: true,
                permission: 'changeRateSheets-vendors'
            }, {
                name: 'Tools',
                active: true,
                permission: 'changeToolOptions-vendors'
            }];

            $scope.salesName = '';
            $scope.vendorName = '';

            // empty vendor object
            $scope.vendor = {};
            $scope.vendor.salesRepId = '';
            var vendor = {};
            // empty logo object, or filepicker gets mad :)
            $scope.vendor.logo = {};

            //States picker
            $scope.states = States.states();
            $scope.vendor.state = $scope.states[0].abbreviation;

            // options for vendor tags
            //$scope.vendorTags = [{'id':'tag1', 'text':'tag1'}, {'id':'tag2', 'text':'tag2'}];

            // get all of the previosuly used vendor tags to populate auto suggest
            Vendor.getAllVendorTags().then(function(tags) {
                $scope.vendorTagsOptions = {
                    'tags': tags, // populate this with tag suggestions
                    'width': 'element'
                };
            });

            // get all of the previosuly used vendor industry tags to populate auto suggest
            Vendor.getAllVendorTags('industryTags').then(function(tags) {
                $scope.vendorIndustryTagsOptions = {
                    'tags': tags, // populate this with tag suggestions
                    'width': 'element'
                };
            });

            // get all the reps
            User.getAll().then(function(response) {
                $scope.allReps = response;
            });

            // filepicker settings
            // @todo make a global service
            // service should have a global config for setting the key
            // and chainable methods
            filepicker.setKey('AJNc7mfA3SCxs3gRjg7EBz');

            // pick logo function
            // simple callback assigns to vendor logo when complete
            $scope.pickImage = function() {
                filepicker.pick(function(FPFile) {

                    // convert image to png
                    // this is needed because jpgs that are uploaded in CMYK color space
                    // will break in IE. @see http://stackoverflow.com/questions/1204288/jpeg-shows-in-firefox-but-not-ie8
                    // for detailed discussion
                    // the solve is to convert the image and then save
                    // convert and store the image
                    // @note we are saving to s3, but we don't have s3 setup on filepicker... where do images go? 
                    // @todo make sure file exists after 24 hours. 
                    filepicker.convert(FPFile, {
                        format: 'png'
                    }, {
                        location: 'S3'
                    }, function(new_InkBlob) {

                        // remove the orginal picked file, since we are storing the converted file
                        filepicker.remove(FPFile, function() {
                        });

                        // check the vendor object to make sure the logo exists.
                        // if we didn't do this, an error would be thrown when creating a new vendor
                        if (!$scope.vendor.logo) {
                            $scope.vendor.logo = {};
                        }

                        // finally we set the objects property to point to url from filepicker
                        $scope.vendor.logo.original = new_InkBlob.url;
                        $scope.$apply();

                    });

                });
            };

            // utility function to go back to the vendor list
            // @todo this function is used in many places, find a way to streamline it
            $scope.cancel = function() {
                $location.url('dashboard/vendors');
            };

            // get vendor ID for edit pages
            var vendorId = $routeParams.id;
            $scope.formAction = 'Add';

            if (vendorId) {

                // get the vendor
                Vendor.getById(vendorId).then(function(response) {
                    $scope.vendor = response;
                    if ($scope.vendor.salesRepId) {
                        $scope.vendor.salesRep = User.getById($scope.vendor.salesRepId);
                    }

                    // Convert tools to tabs
                    _.each($scope.vendor.tools, function(tool) {

                        $scope.tabs.push({
                            name: tool.display,
                            active: tool.enabled
                        });

                    });

                    // assign a permission for each tab
                    $scope.tabs[5].permission = 'changeApiOptions-vendor';
                    $scope.tabs[6].permission = 'changeQuoterOptions-vendor';
                    $scope.tabs[7].permission = 'changeLocationOptions-vendor';

                    $scope.vendor.vendorTags = [];

                    _.each($scope.vendor.tags, function(tag) {
                        tag = tag.toLowerCase();
                        $scope.vendor.vendorTags.push({
                            'id': tag,
                            'text': tag
                        });
                    });

                    $scope.vendor.vendorIndustryTags = [];

                    _.each($scope.vendor.industryTags, function(tag) {
                        tag = tag.toLowerCase();
                        $scope.vendor.vendorIndustryTags.push({
                            'id': tag,
                            'text': tag
                        });
                    });

                    updatePrograms();
                });

                $scope.formAction = 'Update';
            }

            var formTabMap = [
                'basicForm',
                'MarlinRepForm',
                'VendorSalesRepForm',
                'rateForm',
                'toolForm',
                'apiForm',
                'customizeForm',
                'locationForm'
            ];

            // Code to automatically make save updates
            // _.each(formTabMap, function(form) {
            //     $scope.$watch(function() { return $scope.vendor; },
            //         function() {
            //             $timeout(function() {
            //                 $scope.save(false);
            //             }, 10000);
            //         }, true);
            // });

            $scope.showGlobalErrorMsg = function(form) {
                var showError = false;
                _.each(form, function(val, key) {
                    if (val !== null) {
                        showError = true;
                    }
                });
                return showError;
            };

            // get current form, using tab map and activeTab
            // because of a number of isolate scopes created by our directive (unsaved warning, I suspect)
            // we have forms in different scopes. 
            // so, we basically check each place a form could be, and if the form is undefined 
            // we check the next. 
            var setFormFromActiveTab = function() {
                var form = $scope.$$childTail.$$childTail.locationForm;

                if (!form) {
                    form = $scope.$$childTail[formTabMap[$scope.activeTab]];
                }
                return form;
            };

            // updates the sidebar with new vendor logo and/ or name

            function updateSidebar() {
                // get current user from auth service
                var theUser = Auth.getCurrentUser();

                // check if the user is a vendor
                // for vendor reps, we store the vendor with the user obejct
                // for easy return from the api to populate the sitebar
                // @todo refactor this logic and the sidebar logic completely 
                //       the vendor object should never be stored in the user
                //       Instead provide a directive that retrieves information
                //       for a particular resource given a path and then display it
                if (theUser.role === 'vendorRep') {
                    // reset the vendor to be an object
                    // sometimes is appears as an array? 
                    theUser.vendor = {};

                    // we only need certain information
                    // so grab this from our vendor
                    // @note if we try to save the whole vendor we run out of cookie room! 
                    theUser.vendor._id = $scope.vendor._id;
                    theUser.vendor.logo = $scope.vendor.logo;
                    theUser.vendor.name = $scope.vendor.name;
                }

                // save the update
                Auth.updateCurrentUser(theUser);
            }

            $scope.save = function(doRedirect) {

                CommonInterface.save({
                    Model: Vendor,
                    instance: $scope.vendor,
                    id: vendorId,
                    form: setFormFromActiveTab(),
                    redirectUrl: '/dashboard/vendors',
                    doRedirect: doRedirect,
                    preSaveHook: function() {
                        // clear our variables
                        $scope.vendor.programs = []; // clear the program array
                        $scope.vendor.programCustomNames = []; // where we store custom displayName data

                        // process each program, checking if its active for the vendor
                        _.each($scope.programs, function(item, key) {

                            // API saves an array of _ids
                            if (item.active) $scope.vendor.programs.push(item._id);

                            // if user has set a custom display name
                            // we push the whole object, but API will only save the id and displayName
                            if (item.active && item.displayName) $scope.vendor.programCustomNames.push(item);

                        });

                    },
                    postSaveHook: function() {

                        updateSidebar();

                        $rootScope.Validator.setPristine($scope.$$childTail.basicForm);
                        $rootScope.Validator.setPristine($scope.$$childTail.customizeForm);

                    }
                });
            };

            // activated when user clicks the save button
            // $scope.save = function(doRedirect) {
            $scope.toggleActiveRateSheet = function(item) {
                item.active = item.active ? false : true;
            };

            $scope.toggleActive = function(item) {
                item.enabled = item.enabled ? false : true;
                _.each($scope.tabs, function(tab) {
                    if (tab.name === item.display) {
                        tab.active = item.enabled;
                    }
                });
            };

            $scope.addProgram = function(program) {

                var programs = $scope.vendor.programs || [];
                programs.push(program._id);
                $scope.vendor.programs = programs;
                /*

                var obj = {
                    _id : $scope.vendor._id,
                    programs : programs
                };

                Vendor.update(obj).then(function() {
                    // update programs
                    updatePrograms();
                });
*/

            };


            $scope.removeProgram = function(program) {

                var programs = $scope.vendor.programs || [];
                programs.splice(programs.indexOf(program._id), 1);
                $scope.vendor.programs = programs;

                /*

                var obj = {
                    _id : $scope.vendor._id,
                    programs : programs
                };

                Vendor.update(obj).then(function() {
                    // update programs
                    updatePrograms();
                });
*/

            };


            /**
             * Gets all the programs, making two calls and merging the results
             * In our view we sort and filter so the active programs appear first
             *
             */
            $scope.programs = [];

            function updatePrograms() {

                // get the vendors programs
                Program.getAllForVendorId($scope.vendor._id).then(function(response) {
                    _.each(response, function(item) {
                        item.active = true; // set to active for this vendor
                    });
                    $scope.programs = $scope.programs.concat(response);
                });

                Program.getAllNotIn($scope.vendor._id).then(function(response) {
                    _.each(response, function(item) {
                        item.active = false; // set to active for this vendor
                    });
                    $scope.programs = $scope.programs.concat(response);
                });

            }

            /**
             * Add sales rep to a vendor
             *
             */
            $scope.addSalesRep = function(id) {

                var obj = {
                    _id: $scope.vendor._id,
                    salesRep: id
                };

                Vendor.update(obj).then(function(response) {
                    $scope.vendor.salesRep = response.salesRep;
                });
            };

            /**
             * Removes sales rep from a vendor
             *
             */
            $scope.removeSalesRep = function(id) {

                var obj = {
                    _id: $scope.vendor._id,
                    salesRep: null
                };

                Vendor.update(obj).then(function(response) {
                    $scope.vendor.salesRep = null;
                });
            };

            /**
             * Add sales rep to a vendor
             *
             */
            $scope.addVendorRep = function(id) {


                var obj = {
                    _id: $scope.vendor._id,
                    vendorRep: id
                };

                Vendor.update(obj).then(function(response) {
                    $scope.vendor.vendorRep = response.vendorRep;
                });
            };

            /**
             * Removes sales rep from a vendor
             *
             */
            $scope.removeVendorRep = function() {

                var obj = {
                    _id: $scope.vendor._id,
                    vendorRep: null
                };

                Vendor.update(obj).then(function(response) {
                    $scope.vendor.vendorRep = null;
                });
            };


            /**
             * Tab functions.
             * @todo make into a directive
             * @todo make observe / boardcast so we can watch for changes in this scope
             *
             */

            $scope.activeTab = 0;
            $scope.tabs[$scope.activeTab].selected = true;

            // used for active class
            $scope.isActiveTab = function(id) {
                return $scope.tabs[id] && $scope.tabs[id].selected ? true : false;
            };

            // used to set active tab
            $scope.changeTab = function(tab, name) {

                if (!$scope.vendor._id) return false;

                var dataObj = {
                    callback: function() {

                        $scope.tabs[$scope.activeTab].selected = false;
                        $scope.activeTab = tab;
                        $scope.tabs[$scope.activeTab].selected = true;

                    },
                    form: setFormFromActiveTab()
                };

                $rootScope.$broadcast('$tabChangeStart', dataObj);

            };

            var watchTab = $scope.$watch('activeTab', function(newValue, oldValue) {

                // only make map if user is switching to tab 4, and there is no map made
                if (newValue === 7) {
                    $scope.mapActive = true;
                    if (!$scope.isMapMade) makeMap();
                } else {
                    $scope.mapActive = false;
                }
            });

            var removeFunction = $scope.$on('$locationChangeStart', function(event, next, current) {

                // removes the map
                $scope.mapActive = false;

                // remove watchers for page
                removeFunction();
                watchTab();

                /**
                 * ---------------
                 * BEGIN IE8 FIX
                 * ---------------
                 *
                 * IE8 throws a fit when we try to switch routes
                 *  and the map is on the screen. To get around this, we
                 *  prevent the default location change event, then get the path
                 *  we are navigating to, and use $location.url() to navigate.
                 *
                 * I'm not sure if THIS is what fixes it, OR if its the forced $digest
                 *  that happens by wrapping it in $timeout()
                 *
                 */
                event.preventDefault();

                $timeout(function() {
                    $location.url(relativeUrl(next));
                }, 0);

                /**
                 * ---------------
                 */

            });

            /**
             * Gets a realtive path, given a full path to a page in the app
             *
             * @note this is useful when we want to get a relative path
             *       from a next / prev from $locationChangeStart
             *
             */
            var relativeUrl = function(next) {
                var base = $location.absUrl().replace($location.path(), '');
                return next.replace(base, '');
            };


            /**
             * Variables for map
             *
             */
            $scope.vendorMarker = [];

            $scope.map = {};

            $scope.map.zoom = 4;

            // default center point
            // centers on Marlin Finance HQ!
            $scope.map.center = {
                latitude: 39.947017,
                longitude: -74.950102
            };


            /**
             * Generate map, optionally create a marker for the vendor if they have geo data.
             *
             */

            function makeMap() {

                $scope.isMapMade = true;
                // if vendor has geo set, lets make map center from this
                if ($scope.vendor.geo) {

                    $scope.map.center = {
                        latitude: $scope.vendor.geo.latitude,
                        longitude: $scope.vendor.geo.longitude
                    };

                    makeMarkerFromVendor();
                }
            }

            /**
             * Find geo location for vendor from address
             * On success, a event will be broadcast with geo data
             *
             */
            $scope.findMyLocation = function() {
                var v = $scope.vendor;
                var addr = v.businessAddress.address1 + ' ' + v.businessAddress.address2 + ' ' + v.businessAddress.city + ' ' + v.businessAddress.state + ' ' + v.businessAddress.zip;
                googleMaps.geo(addr, 'locationSearch');
            };


            /**
             * Callback to get deo data and set marker, set vendor geo data
             * @note this should hit the API for an auto save?
             *
             */
            var listener = $rootScope.$on('event:geo-location-success', function(event, data, type) {

                // update center based on search 
                if (type && type === 'locationSearch') {

                    $scope.map.center = {
                        latitude: data.lat,
                        longitude: data.lng
                    };

                    $scope.vendor.geo = {
                        latitude: data.lat,
                        longitude: data.lng
                    };

                    // make a marker from our vendor
                    makeMarkerFromVendor();

                    // force our form to be dirty, showing the save button
                    $scope.$$childTail.basicForm.$setDirty();

                    $scope.$apply();
                }
            });

            $scope.message = {};

            var listener2 = $rootScope.$on('event:geo-location-failure', function(event, data) {
                $scope.message.map = 'Failed to lookup address. Try again later';
                $timeout(function() {
                    $scope.message.map = null;
                }, 2200);
            });

            /**
             * Called to remove the google callback that is called
             * when the address lookup finishes
             *
             */
            $rootScope.$on('$routeChangeSuccess', function() {
                listener();
                listener2();
            });

            function genereateSingleLineAddress(businessAddress) {

                var address = _.filter(businessAddress, function(item) {
                    return item !== undefined && item !== "";
                });

                var addr = '';

                _.each(address, function(item) {
                    addr += item + ' ';
                });

                return addr;
            }


            /**
             * Will generate a marker for a vendor
             * @note assumes geo data is in place to create the marker
             *
             */

            function makeMarkerFromVendor() {

                $scope.mapActive = false;

                // build marker object from vendor info
                // @note this is duplicate code from locator tool, move to service? 
                // we need to create the marker from the vendor
                var newMarker = {
					id: $scope.vendor._id,
                    latitude: $scope.vendor.geo.latitude,
                    longitude: $scope.vendor.geo.longitude,
                    label: $scope.vendor.name,
                    distance: $scope.vendor.geo.distance, // gets miles
                    logo: $scope.vendor.logo.original,
                    businessAddress: $scope.vendor.businessAddress,
                    showWindow: false,
                    closeClick: function() {},
                    infoWindow: '<img class="img-medium" src="' + $scope.vendor.logo.original + '" />',
                    name: $scope.vendor.name,
                    destAddress: 'http://maps.google.com/maps?daddr=' + genereateSingleLineAddress($scope.vendor.businessAddress)
                };

                $scope.map.zoom = 16;
                $scope.vendorMarker = [newMarker];

                // reshow the map so the new marker is displayed
                $timeout(function() {
                    $scope.mapActive = true;
                });
            }

            /**
             * Checks if tool is active given a specific tool slug.
             * @note be careful there's a lot of enabled vs. active going on in this controller
             *
             */
            $scope.isToolActive = function(slug) {
                var isActive = false;
                // this is an easy way to prevent errors before scope.vendors is defined. 
                // instead of having to check each level of the object, we just do a try / catch block
                try {
                    isActive = $scope.vendor.tools[slug].enabled;
                } catch (err) {}
                return isActive;
            };


            /**
             * Used to check the current object, against the original returned object
             * This is useful when you are editing an object outside of a form, where form.$dirty wont work.
             *
             *
             */
            /*
            var existingObject = null;

            $scope.$watch('vendor', function(newValue, oldValue) {

                // if we have an _id, we can assume the object came from the DB.
                // so store a copy of it for comparisions later
                if (newValue._id) {
                    existingObject = angular.copy(newValue, existingObject);
                }

            });

            $scope.userHasEditied = function() {

                // in this case, its likely the user is creating the object from scratch
                // in this case, we'll have another check on the form for valid form, which should make
                // the button still be disabled, even though we are returning true here
                if (existingObject === null) return true;

                var doesMatch = angular.equals(existingObject, $scope.vendor);
                

                return !doesMatch;

            };
*/




        }
    ]);
