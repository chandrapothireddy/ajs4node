/**
 * Service that makes working with standardized API responses easy.
 * ---------------------
 * For example, we often return responses like so: {meta: {code: '', message: ''}, result: []}
 * Other times, an API may return 200 for calls that actually failed, hiding the real code within metadata
 *
 * This service intercepts all API responses, and if successful,
 * returns the 'result' part (this ignoring the meta). If the call failed, the 'meta' part
 * is returned instead.
 *
 * @note if the API uses a format different than 'meta' and 'result', you'll need to adjust below
 *
 * @note This service is compatiable with angular 1.0.8 and below. In 1.2 responseInterceptors() has changed.
 *       There are some good examples of services that support both out there :) We really only need to support
 *       our standard.
 *
 * @note what order do these get called in?
 *
 */
angular
    .module('apiResponse', [])
    .config([
        '$routeProvider',
        '$locationProvider',
        '$httpProvider',
        function($routeProvider, $locationProvider, $httpProvider) {

            // define our interceptor function, which we push into the 
            // $httpProvider.responseInterceptors array
            var interceptor = ['$location', '$q',
                function($location, $q) {

                    /**
                     * SUCCESS callback
                     *
                     */

                    function success(response) {

                        // check for angular templates, which are loaded through ajax
                        // if response is a template, return and go no further. 
                        if (typeof response.data !== 'object') {
                            return response;
                        }

                        // Check for our standard response pattern
                        // we provide the result in a result object or array, depending on singular or
                        // multiple response items. Get by id = object, while list all = array
                        if (response.data.result) {

                            // replace data with result so it can be digetsted by services
                            // this eliminates the need to access response.data.result in each service call
                            // and makes this available as response. 
                            response.data = response.data.result;

                        }

                        // default to resturning the entire response
                        return response;

                    }

                    /**
                     * FAILURE callback
                     *
                     */

                    function error(response) {

                        // meta is our standard response header, and in the case of an error
                        // where result === null, meta contains all the info we need. 
                        if (response.data.meta) {
                            // replace data with meta
                            // again making it easy to access in services
                            response.data = response.data.meta;
                        }

                        // @note we can check for statuses, for example unauthorized (401) 
                        // and do diffenre things, such as broadcast 'login-required' 
                        // which could trigger our auth service to redirect to login. 
                        // an alternative approach would be to add this watcher to the auth service itself
                        if (response.status === 401) {
                            return $q.reject(response);
                        } else {
                            return $q.reject(response);
                        }
                    }

                    /**
                     * Return a promise that will resolve in our success or failure callbacks
                     *
                     */
                    return function(promise) {
                        return promise.then(success, error);
                    };
                }
            ];

            // Angular will process every response with the functions contained in this array
            $httpProvider.responseInterceptors.push(interceptor);
        }
    ]);
