angular
    .module('app', [
		'angularUtils.directives.dirPagination',
        'unsavedNew',
        'uiHelpers',
        'ui.validate',
        'ui.mask',
        'ngCookies',
        'angular-markdown',
        'mb.spinner',
        'ajoslin.promise-tracker',
        'angulartics',
        'ngRoute',
        'truncate',
        'ui.select2',
		'ngSanitize', // R2 #6 change, May 2016.
		'ngCsv', // R2 #6 change, May 2016.
		'uiGmapgoogle-maps',
		'ui.utils',
		'angular-cron-jobs'
	])

/**
 * Configure angular app
 *
 * @note we dont yet have access to $rootScope, and a few other things
 *
 */
.config([
    '$httpProvider',
    '$compileProvider',
    function(
        $httpProvider,
        $compileProvider,
        promiseTracker
    ) {

        /**
         * Standard CORS Configuration
         *
         */
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        /**
         * Configure ngSanitize directive
         * Here we add 'mailto' 'callto' etc. which prevents links with href='mailto:' from
         * being flagged as 'unsafe' by angular sanitizer
         *
         */
       // $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|callto):/);
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
])

/**
 * Define constants using Angulars .constant() method
 *
 * @note you need to adjust base_url when developing locally. Don't commit any changes to this since
 *       master is setup alreay to work with heroku
 *
 */
.constant('MARLINAPI_CONFIG', {
    base_url: '/api/v1/'
})

/**
 * Define routes
 *
 * @note for this app we set all routes here in the app file. An alternate (any maybe more modular)
 *       is to set routes in the controllers as needed.
 *
 */
.config(['$routeProvider', 'MARLINAPI_CONFIG',
    function($router, MARLINAPI_CONFIG) {

        // find the base url, without any subdomains
        baseUrl = function() {
            return MARLINAPI_CONFIG.base_url.replace('api/v1/', '');
        };


        // this is a controller. It doesn't do much besides provide a namespace for the resolve method below

        function MyCtrl($scope, datasets) {

            // each key from resolve {} will be available to inject as key name
            // for example, if we had a ctrl.resolve = {item1: function() {}, item2: function() {}}
            // we could access these resolved items in our controller by injecting item1 and item2
            // just like we inject $location, $rootScope, etc. 
            // @note that because our datasets are all promise objects, we'll wait for all
            // of them to resolve before returning
            $scope.datasets = datasets;
        }

        MyCtrl.noVendorSubDomain = {
            resolveCheck: ['$location',
                function($location) {
                    // get slug from $location
                    var slug = $location.host().split('.')[0];

                    // in development, ip will be 127.0.0.1 which
                    // will resolve slug to 127. On production
                    // the slug will be leaserep
                    //if(slug !== '127' && slug !== 'leaserep' && slug !== 'www') {
                    //    window.location = 'https://www.leaserep.com';
                   // }

                    return true;
                }
            ]
        };

        MyCtrl.resolve = {
            resolvedVendor: ['$q', '$route', 'vendorService', '$rootScope', '$location', 'authService',
                function($q, $route, vendorService, $rootScope, $location, authService) {

                    var deferred = $q.defer();

                    // called on success by lookup()
                    var lookupVendorCb = function(result) {
                        if (!result) {
                            deferred.reject("Vendor Lookup Failed");

                            if (authService.isAuthenticated()) {
                                window.location = baseUrl();
                            } else {
                                window.location = baseUrl();
                            }

                        } else {
                            deferred.resolve(result);
                        }
                    };

                    // get slug from $location
                    var slug = $location.host().split('.')[0];
                  

                    if (slug) {
                        // checks for vendorName, or preforms api query if not set
                        vendorService.lookupBySlug(slug, lookupVendorCb);
                    } else {
                        window.location = baseUrl() + 'tools/quoter';
                    }

                    return deferred.promise;
                }
            ]
        };

        $router

        // general routes
        .when('/demo', {
            controller: 'homeController',
            templateUrl: 'app/templates/home.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        .when('/changelog', {
            controller: 'changelogController',
            templateUrl: 'app/templates/changelog.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        // general routes
        .when('/login', {
            templateUrl: 'app/templates/authenticate.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        // general routes
        .when('/logout', {
            controller: 'logoutController',
            templateUrl: 'app/templates/logout.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        .when('/tools/api', {
            controller: 'apiController',
            templateUrl: 'app/templates/tools/api/documentation.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        .when('/password_reset', {
            templateUrl: 'app/templates/authenticate.html',
            resolve: MyCtrl.noVendorSubDomain
        })

        // Quoter tool!  
        .when('/tools/quoter', {
            controller: 'quoterToolController',
            templateUrl: 'app/templates/tools/quoter/quoterTool.html',
            resolve: MyCtrl.resolve
        })
            .when('/tools/quoter/:id/print', {
                controller: 'quoterToolController',
                templateUrl: 'app/templates/tools/quoter/quoterToolPrint.html',
                resolve: MyCtrl.resolve
            })
            .when('/tools/quoter/:id', {
                controller: 'quoterToolController',
                templateUrl: 'app/templates/tools/quoter/quoterTool.html',
                resolve: MyCtrl.resolve
            })


        // Application tool! 
        .when('/tools/application', {
            controller: 'applicationToolController',
            templateUrl: 'app/templates/tools/application/applicationTool.html',
            resolve: MyCtrl.resolve
        })
            .when('/tools/application/:id', {
                controller: 'applicationToolController',
                templateUrl: 'app/templates/tools/application/applicationTool.html',
                resolve: MyCtrl.resolve
            })

        // Locator tool! 
        .when('/tools/locator', {
            controller: 'locatorToolController',
            templateUrl: 'app/templates/tools/locator/locatorTool.html',
            resolve: MyCtrl.noVendorSubDomain
        })

		.when('/corn', {
            controller: 'applicationController',
            templateUrl: 'app/templates/corn.html',
            resolve: MyCtrl.noVendorSubDomain
        })
		
		
        // Auth user dashboards
        .when('/dashboard', {
            controller: 'applicationController',
            templateUrl: 'app/templates/dashboard/index.html',
            resolve: MyCtrl.noVendorSubDomain
        })


        // vendor routes
        .when('/dashboard/vendors', {
            controller: 'vendorController',
            templateUrl: 'app/templates/vendors/vendorList.html',
            resolve: MyCtrl.noVendorSubDomain
        })
            .when('/dashboard/vendors/new', {
                controller: 'vendorEditController',
                templateUrl: 'app/templates/vendors/vendorEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })
            .when('/dashboard/vendors/:id', {
                controller: 'vendorEditController',
                templateUrl: 'app/templates/vendors/vendorEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })


        // program routes
        .when('/dashboard/programs', {
            controller: 'programListController',
            templateUrl: 'app/templates/programs/programList.html',
            resolve: MyCtrl.noVendorSubDomain
        })
            .when('/dashboard/programs/new', {
                controller: 'programEditController',
                templateUrl: 'app/templates/programs/programEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })
            .when('/dashboard/programs/:id', {
                controller: 'programEditController',
                templateUrl: 'app/templates/programs/programEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })


        // quote routes
        .when('/dashboard/quotes', {
            controller: 'quoteListController',
            templateUrl: 'app/templates/quotes/quoteList.html',
            resolve: MyCtrl.noVendorSubDomain
        })
            .when('/dashboard/quotes/new', {
                controller: 'quoteEditController',
                templateUrl: 'app/templates/quotes/quoteEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })
            .when('/dashboard/quotes/:id', {
                controller: 'quoteEditController',
                templateUrl: 'app/templates/quotes/quoteEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })


        // application routes
        .when('/dashboard/applications', {
            controller: 'applicationController',
            templateUrl: 'app/templates/applications/applicationList.html',
            resolve: MyCtrl.noVendorSubDomain
        })
            .when('/dashboard/applications/new', {
                controller: 'applicationController',
                templateUrl: 'app/templates/applications/applicationEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })
            .when('/dashboard/applications/:id', {
                controller: 'applicationController',
                templateUrl: 'app/templates/applications/applicationEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })


        // user routes
        .when('/dashboard/users', {
            controller: 'userListController',
            templateUrl: 'app/templates/users/userList.html',
            resolve: MyCtrl.noVendorSubDomain
        })
            .when('/dashboard/users/new', {
                controller: 'userEditController',
                templateUrl: 'app/templates/users/userEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })
            .when('/dashboard/users/:id', {
                controller: 'userEditController',
                templateUrl: 'app/templates/users/userEdit.html',
                resolve: MyCtrl.noVendorSubDomain
            })

        .when('/', {
            redirectTo: function(url, path) {
                var welcomeUrl = 'https://www.leaserep.com/welcome';
				//var welcomeUrl = 'https://leaserep16.herokuapp.com/welcome';
                // just in case we have a hash, we want to remove this
                // because we want to target a route that our server will
                // specifically server the welcome page.
                window.location.href = welcomeUrl;
            }
        });
    }
])

/**
 * Runs one time when our app is finally bootstrapped
 *
 * @note Now we have access to $rootScope.
 *
 * @note Functions defined here run only one time, unless they observe or bind to a variable
 *       in which case the funtions will run as expected when said variables updates.
 *
 * @todo Most of these should be added to our facultyUI repo, however is there an easier way
 *       to add them? IE instead of needing to put in .run() can we leave them in a seperate module
 *       but include them in our app?
 *
 */
.run(['$rootScope', '$location', 'authService', '$document', '$http', 'promiseTracker', 'apiService', 'Validator',
    function($rootScope, $location, Auth, $document, $http, promiseTracker, api, Validator) {

        // PING the server to check for current status and get XSFR cookie
        // @todo this could be expanded to check for API down etc.
        api.ping().then(function() {});

        // define our version
        // @todo this should be set in package.json, and an api call should be made
        //       to get the version number, rather then setting it here. 
        $rootScope.version = '1.0.0';


        // @note this is related to experimental promisetracker module
        $rootScope.apiTracker = promiseTracker('api');

        $rootScope.Validator = Validator;
        /**
         * Helper functions, which are accessiable anywhere in our app using $rootScope.functionName()
         *
         */

        /**
         * goto a url. This allows us to easily change hash / no-hash method
         * without having to change many links site-wide
         *
         */
        $rootScope.goTo = function(urlToGoTo) {
            $location.url(urlToGoTo);
        };

        /**
         * Returns a link to a slugified vendor tool
         *
         */
        $rootScope.linkToTool = function(slug, tool, itemId) {

            // get the base url by replacing the current absolute url with the current path
            var base = $location.absUrl().replace($location.path(), '').replace('www.', '');

            // remove http 
            base = base.replace('https://', '').replace('http://', '');

            // build base url to tool
            var url = window.location.protocol + '//' + slug + '.' + base + '/tools/' + tool;

            // append item id if we have it
            if (itemId) url += '/' + itemId;

            return url;
        };
	$rootScope.linkToToolPrint = function(slug, tool, itemId) {

            // get the base url by replacing the current absolute url with the current path
            var base = $location.absUrl().replace($location.path(), '').replace('www.', '');

            // remove http 
            base = base.replace('https://', '').replace('http://', '');

            // build base url to tool
            var url = window.location.protocol + '//' + slug + '.' + base + '/tools/' + tool;

            // append item id if we have it
            if (itemId) url += '/' + itemId + '/print';

            return url;
        };
        /**
         * Sets active class on a link based on current url / location
         *
         * @example <a ng-class="getClass('/path')" href="/path">Path</a> // adds active class
         *
         */
        $rootScope.getClass = function(path) {
            var cur_path = $location.path();

            // do some counting
            var splitCurPath = cur_path.split('/').length;
            var splitPath = path.split('/').length;

           
            if (cur_path == path) {
                return "active";
            } else if ($location.path().indexOf(path) > -1 && path.split('/').length === 3) {
                // this check prevents 'dashboard' from being active when user is viewing quotes
                return "active active-trail";
            } else {
                return "";
            }
        };


        /**
         * Function that returns true / false if location matches variable
         * @note you must pass a full path, with a leading slash
         *
         * @example isPage('/login') === $location.url('/login')
         * @example isPage('login') !== $location.url('/login')
         *
         */
        $rootScope.isPage = function(slug) {
            return $location.path() === slug;
        };

        /**
         * Helper function that masks auth.showIfUserCanDoAction() method
         *
         * @todo refactor this, to remove from rootScope
         *
         */
        $rootScope.showIfUserCanDoAction = function(action) {
            return Auth.showIfUserCanDoAction(action);
        };


        /**
         * Generate a string of classes which are generally added to document.body
         * This allows us to target specific pages within css
         *
         * @note this will bound to all successful route changes
         *
         * @note it might be useful to expand this function to add prefixes to the class, ie: page-pageName
         *       Wordpress does this and its one of the more useful features
         *
         */
        $rootScope.$on('$routeChangeSuccess', function($event, $route, $previousRoute) {

            // variable we use on body, @example ng-class="{{pageSlug}}"
            $rootScope.pageSlug = "";

            // get the location and split into an array
            var pageSlug = $location.path().split('/');

            // remove the first element, which is always ""
            pageSlug.shift();

            // special case for home page
            if (pageSlug.length === 1 && pageSlug[0] === "") {

                $rootScope.pageSlug = 'home';

                // create string from each slug item   
            } else {

                _.each(pageSlug, function(item) {
                    $rootScope.pageSlug += item + " ";
                });

            }

        });

    }
])
.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});