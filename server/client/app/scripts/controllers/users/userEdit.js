angular
    .module('app')
    .controller('userEditController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'authService',
        'userService',
        'vendorService',
        'FormHelper',
        'CommonInterface',
        function($rootScope, $scope, $location, $routeParams, Auth, User, Vendor, FormHelper, CommonInterface) {

            $scope.modelObject = User;
            $scope.buttonText = '';

            var watch = $scope.$watch('user._id', function(newValue) {
                $scope.buttonText = 'Send Welcome Email To ' + $scope.user.fullname;
                //watch();
            });

            Auth.canUserDoAction('edit-users');

            // Options you can set user roles
            $scope.roles = [{
                value: 'salesRep',
                label: 'Sales Rep'
            }, {
                value: 'vendorRep',
                label: 'Vendor Rep'
            }, {
                value: 'admin',
                label: 'Admin'
            }];

            $scope.canChangeRole = function() {
                if ($scope.user._id === Auth.getCurrentUser()._id && $scope.user.role === 'admin') {
                    return false;
                } else {
                    return true;
                }
            };

            /**
             * SENDS A WELCOME EMAIL TO USER
             *
             */
            $scope.welcomeEmail = function() {

                $scope.processing = true;

                User.sendWelcomeEmail($scope.user._id).then(function(response) {
                    $scope.processing = false;
                    $scope.buttonText = 'Email sent!';
                }, function() {
                    $scope.processing = false;
                });
            };

            $scope.canDeleteUser = function() {
                if ($scope.user._id !== Auth.getCurrentUser()._id) {
                    return true;
                } else {
                    return false;
                }
            };

            // empty user object
            $scope.user = {};
            var user = {};

            // filepicker settings
            // @todo move to global config
            filepicker.setKey('AJNc7mfA3SCxs3gRjg7EBz');

            // pick avatar function
            // simple callback assigns to user logo when complete
            $scope.pickImage = function() {

                // set default options
                var options = {
                    fit: 'crop',
                    width: 600,
                    height: 600,
                    quality: 100
                };

                filepicker.pick(function(InkBlob) {
                    filepicker.convert(InkBlob, options, function(new_InkBlob) {
                        $scope.user.avatar.original = new_InkBlob.url;
                        $scope.$apply();
                    });
                });
            };

            // utility function to go back to the user list
            // @todo this function is used in many places, find a way to streamline it
            $scope.cancel = function() {
                $location.url('/dashboard/users');
            };

            // get user ID for edit pages
            var userId = $routeParams.id;
            $scope.formAction = 'Add';


            // get and store the user 
            if (userId) {
                // get the user
                User.getById(userId).then(function(response) {
                    $scope.user = response;

                    $scope.initialRole = $scope.user.role;

                    // get vendors for this user
                    // @todo this will now save when we udate the vendors, so we need to fix this! 
                    refreshVendors();
                });
                
                $scope.formAction = 'Update';
            }


            function updateVendorRelationships() {

                // process each program, checking if its active for the vendor
                _.each($scope.vendors, function(item, key) {

                    // API saves an array of _ids
                    if (item.active) {

                        // now set their proper role
                        item[$scope.user.role] = $scope.user._id;

                    } else {

                        // check if the user is currently the sales or vendor rep for this vendor
                        if (item.salesRep && item.salesRep._id == $scope.user._id) item.salesRep = null;
                        if (item.vendorRep && item.vendorRep._id == $scope.user._id) item.vendorRep = null;
                    }

                    Vendor.update(item);

                });
            }

            $scope.showGlobalErrorMsg = function(form) {
                var showError = false;
                _.each(form, function(val, key) {
                    if (val !== null) {
                        showError = true;
                    }
                });
                return showError;
            };

            var formTabMap = [
                'basicForm',
                'usersVendors',
                'passwordForm'
            ];

            // activated when user clicks the save button
            $scope.save = function(doRedirect) {
                CommonInterface.save({
                    Model: User,
                    instance: $scope.user,
                    id: userId,
                    form: $scope.$$childTail[formTabMap[$scope.activeTab]],
                    redirectUrl: '/dashboard/users',
                    doRedirect: doRedirect,
                    preSaveHook: function() {
                        // if we are updating user relationships
                        // we make a mega set of calls to the api,
                        // where for each vendor this user was associated with, we set their rep
                        // to null and save this vendor
                        // @todo move to API
                        //
                        if ($scope.initialRole !== $scope.user.role) {
                            if (confirm('Changing a users role will remove all their vendor associations. Are you sure you wish to continue?')) {
                                _.each($scope.vendors, function(item, key) {
                                    // check if the user is currently the sales or vendor rep for this vendor
                                    if (item.active) {
                                        if (item.salesRep && item.salesRep._id == $scope.user._id) item.salesRep = null;
                                        if (item.vendorRep && item.vendorRep._id == $scope.user._id) item.vendorRep = null;
                                        item.active = false;
                                    }
                                    Vendor.update(item);
                                });
                            }
                        }

                        // called to update vendor connections as sales rep and vendor rep
                        // for vendors. This works by iterating through vendors, checking for active status, 
                        // and then making and API call to update this vendor
                        updateVendorRelationships();

                    },
                    postSaveHook: function() {

                        // call auth service to udpate user
                        Auth.updateCurrentUser($scope.user);

                        // update user role
                        // to prevent dialog 
                        $scope.initialRole = $scope.user.role;

                    }
                });
            };

            /**
             * Gets all the programs, making two calls and merging the results
             * In our view we sort and filter so the active programs appear first
             *
             */
            $scope.vendors = [];

            function refreshVendors() {

                User.getUsersNonVendors($scope.user._id).then(function(response) {
                    $scope.vendors = $scope.vendors.concat(response);
                });

                User.getUsersVendors($scope.user._id).then(function(response) {
                    _.each(response, function(item) {
                        item.active = true; // set to active for this vendor
                    });
                    $scope.vendors = $scope.vendors.concat(response);
                });

            }

            $scope.toggleActive = function(item) {
                item.active = item.active ? false : true;
            };


            // -------



            /**
             * Adds a sales reps id to the passed vendor
             * @param vendor {object} vendor object
             *
             */
            $scope.addVendor = function(vendor) {

                vendor.salesRepId = $scope.user._id;

                Vendor.update(vendor).then(function(response) {
                    refreshVendors();
                });
            };


            $scope.removeVendor = function(vendor) {

                vendor.salesRepId = '';

                Vendor.update(vendor).then(function(response) {
                    refreshVendors();
                });
            };

            $scope.tabs = ['Basic information', 'Vendors', 'Password'];

            $scope.tabs = [{
                name: 'Basic information',
                active: true,
                permission: 'none'
            }, {
                name: 'Vendors',
                active: true,
                permission: 'changeVendors-users'
            }, {
                name: 'Password',
                active: true,
                permission: 'changePassword-users'
            }];

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
            $scope.changeTab = function(tab) {

                var dataObj = {
                    callback: function() {

                        // @todo, this will need to be more generic if we make into a directive. 
                        $scope.tabs[$scope.activeTab].selected = false;
                        $scope.activeTab = tab;
                        $scope.tabs[$scope.activeTab].selected = true;

                    },
                    form: $scope.$$childTail[formTabMap[$scope.activeTab]]
                };

                $rootScope.$broadcast('$tabChangeStart', dataObj);

            };

            $scope.checkShowVendor = function(item) {

                if ($scope.user.role === 'salesRep' && item.salesRep && item.salesRep._id !== $scope.user._id && item.salesRep != $scope.user._id) {
                    return true;
                } else if ($scope.user.role === 'vendorRep' && item.vendorRep && item.vendorRep._id !== $scope.user._id && item.vendorRep !== $scope.user._id) {
                    return true;
                } else {
                    return false;
                }
            };

        }
    ]);
