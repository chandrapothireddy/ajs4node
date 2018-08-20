angular.module('app').factory('userService', ['$http', 'MARLINAPI_CONFIG',
    function($http, MARLINAPI_CONFIG) {

        var url = MARLINAPI_CONFIG.base_url;

        // create and expose service methods
        var exports = {};

        
		
		// get all items
        exports.getAll = function() {

            var params = {};

            //opts.params =JSON.stringify(params);
            

            return $http.get(url + 'users', {
                params: params
            }).then(function(response) {
                return response.data;
            });
        };

        exports.getRoleAll = function(role) {

     return $http.get(url + 'users/all/'+ role).then(function(response) {
                return response;
            });
        };

        // get one item by id
        exports.getById = function(id) {
            return $http.get(url + 'users/' + id).then(function(response) {
                return response.data;
            });
        };
		exports.searchUser = function(role,searchTerm,pageno){
			return $http.get(url + 'users/searchUser/' + role+'/'+searchTerm+'/'+pageno).then(function(response) {
                return response;
            });
		};
		exports.pagination = function(role,pageno) {
            return $http.get(url + 'users/pagination/' + role+'/'+pageno).then(function(response) {
                return response;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.update = function(newItem) {
            var id = newItem._id;
            newItem = _.omit(newItem, '_id');
            return $http.put(url + 'users/' + id, newItem).then(function(response) {
                return response.data;
            });
        };

        // add a new item
        exports.add = function(item) {
            return $http.post(url + 'users', item).then(function(response) {
                return response.data;
            });
        };

        // remove item by item
        exports.remove = function(id) {
            return $http({
                method: 'DELETE',
                url: url + 'users/' + id
            }).then(function(response) {
                return response.data;
            });
        };

        // add a new item
        exports.login = function(item) {
            return $http.post(url + 'auth/login', item).then(function(response) {
                return response.data;
            });
        };

        // get one item by id
        exports.logout = function(id) {
            return $http.get(url + 'auth/logout' + id).then(function(response) {
                return response.data;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.updatePassword = function(newItem) {
            var id = newItem._id;
            return $http.put(url + 'users/' + id + '/password', newItem).then(function(response) {
                return response.data;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.sendWelcomeEmail = function(id) {
            return $http.get(url + 'users/' + id + '/welcome_user').then(function(response) {
                return response.data;
            });
        };



        // --------

        // @todo are we using this, if not remove.
        exports.getOneBy = function(key, value) {
            var str = {};
            str[key] = value;

            var params = {
                query: JSON.stringify(str),
                limit: 1
            };
            return $http.get(url + 'users', {
                params: params
            }).then(function(response) {
                return response.data[0];
            });
        };

        // @todo this is used to validate users email as existing, 
        // we need to refactor this so it's only checking one email for true / false, 
        // instead of returning a whole list
        //
        exports.find = function(obj) {
            return $http.get(url + 'users', {
                params: obj
            }).success(function(response) {
                return response[0];
            }).error(function(response) {
                return response.data;
            });
        };

        /**
         * This works for now but is slow if your getting for a lot of items,
         * IE: we are using it to get the sales rep for the vendor list. So it makes 25 extra calls
         * if there are 25 vendors
         *
         */
        exports.getOneWhereIn = function(key, value) {
            var str = {};
            str[key] = {
                "$in": [value]
            };

            var params = {
                query: JSON.stringify(str),
                limit: 1
            };

            return $http.get(url + 'users', {
                params: params
            }).then(function(response) {
                return response.data[0];
            });
        };



        /**
         * Gets vendors for a user
         *
         */
        exports.getUsersVendors = function(id) {
            return $http.get(url + 'users/' + id + '/vendors').then(function(response) {
                return response.data;
            });
        };

        /**
         * Gets vendors not associated to user
         *
         */
        exports.getUsersNonVendors = function(id) {
            return $http.get(url + 'users/' + id + '/non_vendors').then(function(response) {
                return response.data;
            });
        };


        /**
         * Add a vendorId to a users VendorIds array
         *
         */
        exports.addVendorToSalesRep = function(vendorId, salesRepId) {

            return exports.getById(salesRepId).then(function(response) {
                response.vendorIds.push(vendorId);
                return exports.update(response).then(function(response) {
                    return response;
                });
            });

        };

        /**
         * Add a vendorId to a users VendorIds array
         *
         */
        exports.removeVendorFromSalesRep = function(vendorId, salesRepId) {

            return exports.getById(salesRepId).then(function(response) {
                response.vendorIds.splice(response.vendorIds.indexOf(vendorId), 1);
                return exports.update(response).then(function(response) {
                    return response;
                });
            });

        };


        return exports;

    }
]);
