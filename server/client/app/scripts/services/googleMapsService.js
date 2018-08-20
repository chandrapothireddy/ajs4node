angular
    .module('app')
    .factory('googleMapsService', ['$rootScope', '$q',
        function($rootScope, $q) {

            var methods = {};

            methods.geo = function(address, type) {

                var geocoder = new google.maps.Geocoder();

                var geoData = {};

                var handleResult = function(results, status) {

                    if (status == google.maps.GeocoderStatus.OK) {

                        var location = results[0].geometry.location;
                        geoData.lng = location.lng();
                        geoData.lat = location.lat();

                        $rootScope.$broadcast('event:geo-location-success', geoData, type);

                    } else {
                        $rootScope.$broadcast('event:geo-location-failure', geoData, type);
                        //alert('Geocode was not successful for the following reason: ' + status);
                    }
                };

                geocoder.geocode({
                    'address': address
                }, handleResult);
            };

            return methods;

        }
    ]);
