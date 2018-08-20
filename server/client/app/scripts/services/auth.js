/**
 * A modular authenication service, which can be dropped into any project to provide basic auth
 *
 * @note this is a good exmaple of a modular pattern for Faculty development. Especially in the way it provides
 *       directives, as well as functions, to the entire app.
 *
 * Provides:
 * - Login / logout
 * - persisnant user storage with cookies
 *
 * In addition, it provides basic permissions
 * - Resource-action based permission strategy
 * - Controller method for checking permissions
 * - Direcitve for showing / hiding elements based on permissions
 
 * @note we should consider specifiying a "resource" path for the service to call to refrech 
 * data and then having it call this reosurce when we call refreshUser() method.
 * this would eliminate the need to always call updateCurrentUser() in controllers.
 *
 * @todo this could be namespaced since it has a number of directive and configs.  
 *
 */

angular.module('app').factory('authService', ['$http', '$rootScope', 'userService', '$location', '$cookieStore',
    function($http, $rootScope, User, $location, $cookieStore) {

        // dummy data
        var userData = {
            userId: null,
            isAuth: false,
            currentUser: null,
            authLevel: false
        };


        /**
         * Define the allows action-resource patterns for each role type
         *
         * @note we don't define any limitations for adnin, allowing them to do anything!
         *
         * @todo this needs to be signifigantly refactored to clean up inconsistancies. Mainly:
         *       - follow resource-action pattern
         *       - avoid overlap / duplication of code from API by returning allowed actions with user?
         *
         */

        // define inital object
        var allowedActionsByAuthLevel = {};

        // define Marlin Sales Rep actions
        allowedActionsByAuthLevel.salesRep = [
            'list-applications',
            'view-applications',
            'edit-applications',
            'list-quotes',
            'edit-quotes',
            'list-vendors',
            'edit-vendors',
            'edit-users',
            'changePassword-users',
            'changeAvatar',
            'changeApiOptions-vendor',
            'viewGuarantor',
            'email-credit'
        ];

        // define Vendor Sales Rep actions
        allowedActionsByAuthLevel.vendorRep = [
            'list-applications',
            'view-applications',
            'edit-applications',
            'list-quotes',
            'edit-quotes',
            'view-vendors',
            'edit-vendors',
            'edit-users',
            'changeAvatar',
            'changePassword-users',
            'changeApiOptions-vendor'
        ];

        /**
         * Provide Auth service methods, mainly login and logout.
         *
         * @note these leverage the User service to perform the user relaated
         *       actions of login and logout,
         *       while adding additional functionality such as storing user in cookie,
         *       clearing user, granting permissions, getting current user, etc.
         *
         *
         */

        // create and expose service methods
        var exports = {};

        /**
         * Method to login a user given email and password
         *
         * @todo better handling of login failure
         *
         */
        exports.login = function(email, password) {

            return User.login({
                email: email,
                password: password
            }).then(function(response) {

                var attemptingUser = response;

                // no user found!
                if (!attemptingUser) return false;

                // we have a user, store the data
                // these props can be updated with updateUser() method
                userData.currentUser = attemptingUser;
                userData.authLevel = attemptingUser.role;

                // these items should not change even if user updates their info
                userData.userId = attemptingUser._id;
                userData.isAuth = true;


                // store in cookie
                $cookieStore.put('userData', userData);

                // return success
                return true;

            });

        };

        /**
         * Method to logout a user, cleaing their cookie data and variables
         *
         */
        exports.logout = function() {

            // clear user data
            var userData = {
                userId: null,
                isAuth: false,
                currentUser: null,
                authLevel: false
            };

            // clear cookue
            $cookieStore.remove('userData');

        };

        /**
         * Method to check if user is authenticated
         *
         * @return {bool} True if use if authenticated, false if not
         *
         */
        exports.isAuthenticated = function() {
            return userData.isAuth;
        };

        /**
         * Method to return current user
         *
         * @example var userId = Auth.getCurrentUser()._id   // returns user id
         * @example var user = Auth.getCurrentUser()         // gets entire user object
         * @example var userBinding = Auth.getCurrentUser    // better binding. Try to see how this works
         *
         */
        exports.getCurrentUser = function() {
            if (!userData.currentUser) {
                userData = $cookieStore.get('userData');
            }

            if(!userData) {
                $location.url('/login');
                return;
            }

            return userData.currentUser;
        };


        /**
         * Method to update a logged user, can be called by outside controllers
         * @note currently this replaces the entire logged in user, rather then extending it.
         *
         *
         */
        exports.updateCurrentUser = function(newUser) {

            // check to make sure this user is the current logged in user 
            // this can be eliminated if we have a watch on resource alls to the user._id 
            // endpoint on API 

            // only update the user if the object passed mathces the current user ID
            if (newUser._id == userData.userId) {

                userData.currentUser = newUser;
                userData.authLevel = newUser.role;

                // update cookie
                $cookieStore.put('userData', userData);

            }

        };

        /**
         * Method to get the current user Role
         *
         * @note this is not being used
         *
         */
        exports.getAuthLevel = function() {
            return userData.authLevel;
        };


        /**
         * Method to use in controller to limit access. Prevents controller function from running by redirecting
         *
         * @example
         *
         *    $scope.listQuotes = function() {
         *
         *       // attempt to authenticate user, if not allowed a redirect will occur
         *       Auth.canUserDoAction('list-quotes');
         *
         *       // if we get to here, we know user is authenticated for the a resource-action
         *       $scope.quotes = Quotes.list();
         *    }
         *
         */
        exports.canUserDoAction = function(action) {

           

            if (!checkLevelForAction(action)) {
                doRedirect();
            } else {
                return true;
            }

        };

        /**
         * Method which masks our canUserDoAction method for use in our directive
         * @todo refactor and remove this dup.
         *
         */
        exports.showIfUserCanDoAction = function(action) {

            return checkLevelForAction(action);
        };

        /**
         * Private Helper Functions
         *
         */

        /**
         * Redirects user based on login status
         *
         * - logged in users to dashboard
         * - logged out users to login screen
         *
         */

        function doRedirect() {

            var storedUser = $cookieStore.get('userData');

            if (storedUser) {
                $location.url('/dashboard');
            } else {
                $location.url('/login');
            }
        }

        /**
         * Helper to validate auth level for current user as stored in cookie
         *
         * @param checkAction {string} Action to check against
         * @return {bool} True to allow action, false if denied
         *
         */

        function checkLevelForAction(checkAction) {

            // attempt to get session data
            // @todo refactor to use currentUser() ?
            var storedUser = $cookieStore.get('userData');

            // if we have a stored user, lets load them to userData
            // @note this should prob be done in some sort of "construct" style function 
            // that runs on each page load
            if (storedUser) {
                userData = storedUser;
            }

            // if no stored user, or stored user has no role, deny
            if (!storedUser || !storedUser.authLevel) return false;

            // if there is no actions array set
            // case of admin
            if (!allowedActionsByAuthLevel[storedUser.authLevel]) {

                return true;

                // if action is in the array    
            } else if (_.contains(allowedActionsByAuthLevel[storedUser.authLevel], checkAction)) {

                return true;

                // user can't do this! redirect them               
            } else {

                return false;

            }
        }

        return exports;
    }
]);


/**
 * Directive which sets elements visibility based on action-resource persmissions
 *
 * @note this can conflict with other ng-show / ng-hide declerations on the same element. Be warned!
 * @note this is for presentation only! Ovbiously things need to be locked down on the API side to be secure.
 *
 * @exmaple <button ng-click="delete()" can-do-action="delete-quote">Delete This Quote</button>
 *
 */
angular.module('app').directive("canDoAction", ['authService',
    function(authService) {
        return {
            replace: false,
            restrict: 'A',
            link: function(scope, element, attr) {

                attr.$observe('canDoAction', function() {

                    if (attr.canDoAction === 'none') {
                        return true;
                    }

                    var showIf = authService.showIfUserCanDoAction(attr.canDoAction);

                    if (!showIf) {
                        element[0].style.display = 'none';
                    } else {
                        element[0].style.display = 'inherit';
                    }

                });

            }
        };
    }
]);
