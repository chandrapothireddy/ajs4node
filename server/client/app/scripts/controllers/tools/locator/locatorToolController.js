/**
 * Controller that handles logic for dealer locator
 *
 * @todo is there a function to getLocation (like getLat and Lng) from the google map returned query?
 *       if yes, then message the user when they serach for a location
 *
 * @note all distances displayed to users are miles
 *       while distances returned from google and needed to calculate distance are degrees and radians
 *
 */
angular
    .module('app')
    .controller('locatorToolController', [
        '$rootScope',
        '$scope',
        '$location',
        '$routeParams',
        'vendorService',
        'googleMapsService',
        '$timeout',
        function($rootScope, $scope, $location, $routeParams, Vendor, googleMaps, $timeout) {

            /**
             * Setup some vars
             * --------------------------------------------
             *
             */

            // set the active tab to show the intital page
            $scope.activeTab = 1;

            // initialize vendors to empty array
            $scope.vendors = [];

            // markers will be vendors that match our search
            $scope.markers = [];

            // will be true any time there is a specific location search happening
            // ie: use has geolocated, or searched by text.
            // this allows us to show distance from, etc. 
            $scope.hasLocation = false;

            /**
             * Create our map object
             * --------------------------------------------
             *
             */

            // the map object
            $scope.map = {};

            // current setting: USA center
            // @note this is a bit confusing because user doesnt know where '233 miles from here' is
            //       however when new flow us implimented this should be resolved
            //       since user will never arrive at map without entering a location
            $scope.map.center = {
                latitude: 40.4230,
                longitude: -98.7372
            };

            // flag that center has changed, fired on map dragging? 
            $scope.map.centerHasChanged = false;

            // default map zoom level
            $scope.map.zoom = 4;

            /**
             * Events passed to map
             *
             * @note events on markers dont register here!
             *
             */
            $scope.map.events = {
                click: function(mapModel, eventName, originalEventArgs) {
                    // 'this' is the directive's scope
                    
                },
                zoom_changed: function() {
                    
                },
                drag: function() {
                    
                    $scope.map.centerHasChanged = true;
                }
            };

            /**
             * Load our vendors
             * --------------------------------------------
             *
             */

            // perform the initial filter when vendors are loaded
            // @note this is needed because vendors are loaded async
            // will also update any time vendor change, ie: 
            // we can hook this into a tag / name search
            $scope.$watch('$scope.vendors', filterMarkers, true);

            /**
             * Load all of the Industry Tags
             * --------------------------------------------
             *
             */

            $scope.industries = [];
            $scope.currentIndustry = '';

            Vendor.getIndustryCounts().then(function(industryCounts) {
                $scope.industries = industryCounts;
            });

            $scope.setIndustry = function(industry) {

                if (industry) {
                    Vendor.getVendorByIndustry(industry).then(function(response) {
                        $scope.vendors = response;
                        $scope.currentIndustry = industry;

                        // set the active tab to show the filtered map results

                        $scope.activeTab = 2;

                        $timeout(function() {
                            $scope.mapActive = true;
                        }, 0);

                        filterMarkers();
                    });
                } else {
                    $scope.mapActive = false;
                    $scope.vendors = [];
                    $scope.activeTab = 1;
                }
            };

            /**
             * TAG SEARCH
             * --------------------------------------------
             * @note we simply set the text here, the filterMarkers() function
             *       handles the logic of spliting and matching the tags
             *
             */

            // empty search text
            $scope.searchText = '';
            var searchTags = [];

            // search button, user must click when they are done entering text
            // @todo hook into enter key, which currenty triggere geo location
            $scope.searchByText = function() {

                // process term
                searchTextToArray();

                // filter markers
                filterMarkers();
            };

            // clears the text, thus 
            $scope.clearText = function() {
                $scope.searchText = '';
                filterMarkers();
            };


            /**
             * HTML5 GEO LOCATION SEARCH
             * --------------------------------------------
             *
             */

            // check for geo location support on html5 devices
            // does this always remain enabled on re-visit? 
            $scope.geolocationAvailable = navigator.geolocation ? true : false;

            // button to set map center based on geolocation
            // @todo we should add a marker here
            // @todo should not be visible if browser doesn't support this feature
            // 
            $scope.findMe = function() {

                // check for support
                if (!$scope.geolocationAvailable) return false;

                // html5 async location call
                // will prompt user to accept the first time
                navigator.geolocation.getCurrentPosition(function(position) {

                    $scope.map.center = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };

                    $scope.hasLocation = true;
                    $scope.$apply();

                    // refilter the markers based on new center
                    filterMarkers();
                });
            };

            /**
             * FILTER BY DISTANCE FROM USER LOCATION
             * --------------------------------------------
             *
             */

            // distances in miles
            $scope.distanceOptions = [100, 500, 1000, 2000, 'Any'];

            // input to set distance from user for results
            $scope.distanceFrom = 'Any';

            // trigger the search
            $scope.setDistanceFrom = function(newDistance) {
                $scope.distanceFrom = newDistance;

                // @note what is this for? 
                //
                $scope.distanceFromInMeters = newDistance * 1000;
                filterMarkers(); // refilter the markers based on new location
            };


            /**
             * TEXT LOCATION SEARCH
             * --------------------------------------------
             *
             * @todo add failure callback for lookup
             *
             */

            // input to serach by Industry
            $scope.locationSearch = null;

            // function that calls async geo location call to google
            $scope.findMyLocation = function() {
                
                googleMaps.geo($scope.locationSearch, 'locationSearch');
            };

            // callback from the geo lookup
            var listener1 = $rootScope.$on('event:geo-location-success', function(event, data, type) {
                // update center based on search 
                if (type && type === 'locationSearch') {

                    $scope.map.center = {
                        latitude: data.lat,
                        longitude: data.lng
                    };

                    $scope.hasLocation = true;
                    filterMarkers();
                    $scope.$apply();
                }
            });

            // we need to remove the call on route change success
            $rootScope.$on('$routeChangeSuccess', function() {
                listener1();
            });


            /**
             * FILTER MARKERS LOGIC
             * --------------------------------------------
             *
             * Main filtering logic that considers distance, location, and tags
             *
             * Called whenever an event happens that needs to update markers, ie:
             *  - Center changes from location search or geo location success
             *  - Tags search changes
             *  - Filter by distance changes
             *
             */

            $scope.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ];

            function filterMarkers() {

                // close the currently open window, if any
                closeCurrentWindow();

                if (!$scope.vendors) {
                    
                    return;
                }

                $timeout(function() {

                    $scope.markers = [];
                    $scope.tempMarkers = [];
                    $scope.currentVendor = 0;

                    // forces an apply which prevents sync issues with sidebar
                    // when a user updates their location text search
                    $scope.$apply();

                    

                    _.each($scope.vendors, function(item, index) {

                        // if we have more results than letters in the alphabet
                        if ($scope.currentVendor > 25) return false;

                        // first check for text based search
                        // if this doesn't match, we dont care how close the vendor is!
                        // @todo this could be refactored to query api

                        if ($scope.searchText && !checkForTagMatch(item)) {
                            return;
                        }

                        // check if vendor has geo data!
                        if (!item.geo.latitude || !item.geo.longitude) {
                            return;
                        }

                        // check if distance is withing range
                        // @note that users can set "unlimited" distance
                        item.geo.distance = isMarkerWithinDistanceFromCenter($scope.map.center, item.geo, $scope.distanceFrom);

                        if ($scope.distanceFrom !== 'Any' && item.geo.distance === false) return;

                        // we need to create the marker from the vendor
                        var newMarker = {
                            icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + $scope.letters[$scope.currentVendor] + '|005DAB|EEEEEE',
                            latitude: item.geo.latitude,
                            longitude: item.geo.longitude,
                            label: item.name,
                            email: item.contactPerson.email,
                            phone: item.contactPerson.phone,
                            website: item.website,
                            distance: item.geo.distance, // gets miles
                            logo: item.logo.original,
                            businessAddress: item.businessAddress,
                            infoWindow: '<img class="img-medium" src="' + item.logo.original + '" />',
                            name: item.name,
                            showWindow: false,
                            destAddress: 'http://maps.google.com/maps?q=' + genereateSingleLineAddress(item.businessAddress)
                        };

                        // increment the current vendor count
                        $scope.currentVendor = $scope.currentVendor + 1;

                        // bind any marker functions
                        newMarker.closeClick = function() {
                            

                            // keeps in sync with sidebar
                            this.model.showWindow = false;
                        };

                        newMarker.openClick = function() {
                            

                            this.model.showWindow = true;
                            trackOpenWindow(this.model);
                        };

                        // push to markers array
                        $scope.markers.push(newMarker);
                    });

                    

                    /*
                    // @note this articically expands the search radius to show 3 vendors
                    // needs to be integrated with above vendor loop to be used
                    // since we refactored the code
                    // 
                    if($scope.tempMarkers.length < 3) {
                        
                        if($scope.distanceFrom !== 'Any') {
                            var currentIndex = $scope.distanceOptions.indexOf($scope.distanceFrom);
                            var nextIndex = currentIndex + 1;
                            if((nextIndex in $scope.distanceOptions) ) {
                                $scope.distanceFrom = $scope.distanceOptions[nextIndex];
                            }
                        } else {
                            $scope.searchText = '';
                            
                        }
                        
                        filterMarkers();
                    }
                    */

                }, 50);
            }

            /**
             * Tracks the open windows and closes the previous, ensuring only 1 is open per time
             * --------------------------------------------
             *
             */
            var currentOpenWindow = null;

            // @note we need to call this whenever a marker's showWindow state is changed to true

            function trackOpenWindow(open) {


                // if we are re-opening the same marker
                // prenvets issue with clicking the same item in sidebar multiple times
                if (open === currentOpenWindow) return;

                // close the current window
                // if we have one (will == null on first window open)
                closeCurrentWindow();

                // update our tracking ref
                currentOpenWindow = open;

            }

            // call when we need to close current window

            function closeCurrentWindow() {
                if (currentOpenWindow) {
                    currentOpenWindow.showWindow = false;

                    // a $digest is needed to close windows that were opened by clicking on a marker
                    // while this same $digest will throw error if clicking on sidebar
                    // this is a 'safe' way to prevent digest errors
                    $timeout(function() {
                        $scope.$apply();
                    }, 0);
                }
            }


            /**
             * SIDEBAR VENDOR LISTING
             * --------------------------------------------
             *
             */

            // Toggles window for this vendors marker
            $scope.remoteOpenWindow = function(item) {

                item.showWindow = item.showWindow !== true ? true : false;

                if (item.showWindow === true) {
                    trackOpenWindow(item);
                }
            };

            /**
             * PRIVATE HELPER METHODS
             * --------------------------------------------
             *
             */

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
             * checks if marker is a distance from the center
             *
             * @returns {bool} True if within distance, false if not within distance
             *
             */

            function isMarkerWithinDistanceFromCenter(center, marker, distance) {
                var checkDsitance = kmToMiles(getDistanceFromLatLonInKm(center.latitude, center.longitude, marker.latitude, marker.longitude));
                return checkDsitance <= distance ? checkDsitance : false;
            }


            /**
             * Gets distance in km between a pair of lat and lngs
             *
             * @note that lat and lngs should be in KM, this function returns KM
             *
             */

            function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {

                lat1 = parseFloat(lat1);
                lon1 = parseFloat(lon1);
                lat2 = parseFloat(lat2);
                lon2 = parseFloat(lon2);

                var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2 - lat1); // deg2rad below
                var dLon = deg2rad(lon2 - lon1);
                var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km

                return d;
            }


            /**
             * Convert KM to Miles
             *
             */

            function kmToMiles(km) {
                return km * 0.62137;
            }


            /**
             * Converts degrees to radians for google maps
             *
             */

            function deg2rad(deg) {
                return deg * (Math.PI / 180);
            }

            /**
             * Check items tags against array of search terms generated by
             * splitting user search into an array at " ".
             *
             */

            function checkForTagMatch(item) {

                // check for no tags
                if (!item.searchString || !item.searchString.length) return false;


                // for each search tag that user has entered, check if 
                // it exists in the items tags array.
                // @note that we check against item.searchString which is a string
                // assembled on save from the tags
                // this save a lot in performance since we dont need to iternate though arrays
                var isValid = false;

                _.each(searchTags, function(tag) {
                    if (item.searchString.toLowerCase().indexOf(tag) !== -1) {
                        isValid = true;
                    }
                });

                return isValid;
            }

            /**
             * process search term for matching in filtering logic
             *
             */

            function searchTextToArray() {

                var originalSearch = '';
                var vendorSearchTags = [];

                if ($scope.searchText !== '') {
                    // convert to lowercase and split at space
                    originalSearch = $scope.searchText.toLowerCase();
                    vendorSearchTags = originalSearch.split(" ");
                    searchTags.push(originalSearch);
                }
            }
        }
    ]);
