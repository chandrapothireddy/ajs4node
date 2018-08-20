/**
 * Service and directive to provide back / forward functioanlity in your app
 * ----------------------------------------
 * In addition we account for the user's initial app visit, when there is no "back"
 * or back is another site (not this app). In these cases we send to the dashboard
 *
 * @note make more robust with default option setter for home
 * @todo impliment similar for forward?
 *
 */
angular
    .module('app')
    .factory('history', ['$location', '$window', '$rootScope', '$route',
        function($location, $window, $rootScope, $route) {
            return {
                pageCount: 0,
                back: function() {
                    if (this.pageCount > 1) {

                        // go back 1 level in history
                        $window.history.back();

                        // On location change success, lets check the new url and 
                        // if it contains /new, meaning the user was creating a new resource
                        // lets go back one more time. 
                        //
                        // This fixes an issue where clicking "add new"
                        // brings you to /resource/new and then 
                        // clicking save brings you to /resource/12345 and then 
                        // clicking "close", the expected behavior is to to 
                        // return to /resource but instead you are taken to /resource/new
                        // because technically that is the previous page.
                        //
                        var removeFn = $rootScope.$on('$locationChangeSuccess', function(event, current, old) {
                            if (current.indexOf('/new') !== -1) {
                                $window.history.back();
                            }
                            removeFn();
                        });
                    } else {
                        $location.url('/dashboard');
                        $rootScope.$apply();
                    }
                },
                forward: function() {
                    $window.history.forward();
                }
            };
        }
    ])
    .run(['history', '$rootScope',
        function(history, $rootScope) {

            // keep track of our page count
            $rootScope.$on('$routeChangeSuccess', function() {
                history.pageCount++;
                //console.log('Page count is ', history.pageCount);
            });

        }
    ])
    .directive('historyBack', ['history',
        function(history) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.on('click', function() {
                        history.back();
                    });
                }
            };
        }
    ])
    .directive('historyForward', ['history',
        function(history) {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.on('click', function() {
                        history.forward();
                    });
                }
            };
        }
    ]);
