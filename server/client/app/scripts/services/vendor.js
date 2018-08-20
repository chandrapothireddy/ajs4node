angular.module('app').factory('vendorService', ['$http', 'MARLINAPI_CONFIG', 'userService', '$location',
    function($http, MARLINAPI_CONFIG, User, $location) {

        var url = MARLINAPI_CONFIG.base_url;


        // create and expose service methods
        var exports = {};

        // Generic find functionality
        exports.find = function(str) {


            var params = {
                query: JSON.stringify(str)
            };

            return $http.get(url + 'vendors/find', {
                params: params
            }).then(function(response) {
                return response.data;
            });
        };

        // get all items
        exports.getAllsearchvendor = function(displayperpage,searchvendorTerm) {
		
            return $http.get(url + 'vendors/allsearchvendor/' + displayperpage + '/' + searchvendorTerm).then(function(response) {
                return response;
            });
        };
		
		
		 exports.getAll = function(displayperpage) {
		
            return $http.get(url + 'vendors/all/' + displayperpage).then(function(response) {
                return response;
            });
        };
		
		
		
		
		 exports.getDowload = function() {
            return $http.get(url + 'vendors/download').then(function(response) {
                return response;
            });
        };
		
		
        exports.pagination = function(pageno,displayperpage) {
            return $http.get(url + 'vendors/pagination/' + pageno + '/' + displayperpage).then(function(response) {
                return response;
            });
        };
		exports.searchVendor = function(searchvendorTerm, pageno,displayperpage) {
		
			//searchvendorTerm = JSON.stringify(searchvendort);
            return $http.get(url + 'vendors/vendorSearch/' + searchvendorTerm + '/' + pageno + '/' + displayperpage).then(function(response) {
                return response;
            });
        };
        // get one item by id
        exports.getById = function(id) {
            return $http.get(url + 'vendors/' + id).then(function(response) {
                return response.data;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.update = function(newItem) {
            var id = newItem._id;
            newItem = _.omit(newItem, '_id');
            return $http.put(url + 'vendors/' + id, newItem).then(function(response) {
                return response.data;
            });
        };
		
        // add a new item
        exports.add = function(item) {
            return $http.post(url + 'vendors', item).then(function(response) {
                return response.data;
            });
        };
		exports.searchBusiness = function(searchBusiness, pageno) {
            return $http.get(url + 'applications/businessSearch/' + searchBusiness + '/' + pageno).then(function(response) {
                return response;
            });
        };

        // remove item by item
        exports.remove = function(id) {
            return $http({
                method: 'DELETE',
                url: url + 'vendors/' + id
            }).then(function(response) {
                return response.data;
            });
        };

        // get one item by id
        exports.getSalesRep = function(vendorId) {
            return $http.get(url + 'vendors/' + vendorId + '/salesRep').then(function(response) {
                return response.data;
            });
        };

        exports.lookupBySlug = function(slug, callback) {
            // Private function that will execute callback if its valid
            function doCallback(result) {
                result = result || null;
                if (callback && typeof callback === 'function') {
                    callback(result);
                }
            }

            // attempt to find vendor by slug
            exports.find({
                'slug': slug
            }).then(function(response) {
                if (response && response.length === 1) {
                    callback(response[0]);
					
                } else {
                    callback();
					
                }

            });



        };

        /**
         * Add a vendor to a program using the id of each
         * @param int vendorId ID of the vendor
         * @param int programId ID of the program
         * @return array Updated array of programIds associated with vendor
         */
        exports.addProgramToVendor = function(programId, vendorId) {

            // gets array key for this vendor
            var theId = _.findIndex(itemList, function(item) {
                return item._id == vendorId;
            });

            

            // just in case this vendor has no ids array yet! 
            if (!itemList[theId].programIds) itemList[theId].programIds = [];

            itemList[theId].programIds.push(programId);

            return itemList[theId].programIds;
        };


        /**
         * Removes vendor from program the id of each
         *
         * @param int vendorId ID of the vendor
         * @param int programId ID of the program
         * @return array Updated array of programs for the vendor
         */
        exports.removeProgramFromVendor = function(programId, vendorId) {
            // gets array key for this vendor
            var theId = _.findIndex(itemList, function(item) {
                return item._id == vendorId;
            });

            itemList[theId].programIds = _.reject(itemList[theId].programIds, function(item) {
                return programId == item;
            });

         

            return itemList[theId].programIds;
        };


        /**
         * Reduces the itemList to those where ID is in values array
         *
         * If ID exists multiple times, will only return item one time
         *
         */
        exports.getManyWhereIn = function(values) {
            var str = {};
            str._id = {
                "$in": values
            };

            var params = {
                query: JSON.stringify(str)
            };

          

            return $http.get(url + 'vendors', {
                params: params
            }).then(function(response) {
                return response.data;
            });
        };

        /**
         * Reduces the itemList to those where ID is in values array
         *
         * If ID exists multiple times, will only return item one time
         *
         */
        exports.getManyWhereNotIn = function(values) {
            var str = {};
            str._id = {
                "$nin": values
            };

            var params = {
                query: JSON.stringify(str)
            };

         

            return $http.get(url + 'vendors', {
                params: params
            }).then(function(response) {
                return response.data;
            });
        };


        exports.getAllWithoutSalesReps = function() {

            return $http.get(url + 'vendors').then(function(response) {

                var vendorIds = [];

                // get all the vendor ids
                _.each(response.data, function(item) {
                    if (item.vendorIds) vendorIds = vendorIds.concat(item.vendorIds);
                });

                // ensure they are unique
                vendorIds = _.uniq(vendorIds);

                

                return exports.getManyWhereNotIn(vendorIds);

            });

        };

        /**
         * Returns a list of all unique tags used across all vendors
         *
         * tagType will be the DB field name of the tags field
         *
         */
        exports.getAllVendorTags = function(tagType) {

            var type = tagType || 'tags';

            return $http.get(url + 'vendors/tags/' + type).then(function(response) {
                return _.sortBy(response.data);
            });
        };

        /**
         * Returns an array of industry/counts for all industry tags used
         *
         */
        exports.getIndustryCounts = function() {
            return $http.get(url + 'vendors/industryCounts').then(function(response) {
                return response.data;
            });
        };

        exports.getVendorByIndustry = function(industry) {
            return $http.get(url + 'vendors/getVendorByIndustry/' + industry).then(function(response) {
                return response.data;
            });
        };

        return exports;

    }
]);