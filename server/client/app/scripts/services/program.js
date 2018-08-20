angular.module('app').factory('programService', ['$http', 'MARLINAPI_CONFIG',
    function($http, MARLINAPI_CONFIG) {

        var url = MARLINAPI_CONFIG.base_url;

        // create and expose service methods
        var exports = {};

        // get all items
        exports.getAll = function(displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'programs/all/'+displayperpage+'/'+sortName+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };
		
  
        // get one item by id
        exports.getById = function(id) {
            return $http.get(url + 'programs/' + id).then(function(response) {
                return response.data;
            });
        };
       exports.pagination = function(pageno,displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'programs/pagination/' + pageno+'/'+displayperpage+'/'+sortName+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };
		exports.searchProgram = function(searchTerm, pageno,displayperpage,sortName,sortOrderType) {
		
			//searchvendorTerm = JSON.stringify(searchvendort);
            return $http.get(url + 'programs/programSearch/' + searchTerm + '/' + pageno+ '/' + displayperpage + '/'+sortName+ '/'+ sortOrderType).then(function(response) {
                return response;
            });
        };
        // update one item by item 
        // @note we figure out id from item
        exports.update = function(newItem) {
            var id = newItem._id;
            newItem = _.omit(newItem, '_id');
			
			stritem = JSON.stringify(newItem, null, 4);
							
			
            return $http.put(url + 'programs/' + id, stritem).then(function(response) {
                return response.data;
            });
        };

        // add a new item
        exports.add = function(item) {
				strreq = JSON.stringify(item, null, 4);
							
		
		
		   return $http.post(url + 'programs', strreq).then(function(response) {
                return response.data;
            });
        };

        // remove item by item
        exports.remove = function(id) {
            return $http({
                method: 'DELETE',
                url: url + 'programs/' + id
            }).then(function(response) {
                return response.data;
            });
        };

        // --------

        /**
         * Gets all programss for a given vendorId
         */
        exports.getAllForVendorId = function(id) {

            return $http.get(url + 'vendors/' + id + '/programs').then(function(response) {
                return response.data;
            });

        };

        /**
         * Gets all programss not currenly used by vendorId
         */
        exports.getAllNotIn = function(id) {

            /*
// get all programss, where programs _id is not in the values array

            var str = {};
            str._id = {
                "$nin": values
            };

            var params = {
                query: JSON.stringify(str)
            };

           

            return $http.get(url + 'programs', {
                params: params
            }).then(function(response) {
                return response.data;
            });
*/

            return $http.get(url + 'vendors/' + id + '/available_programs').then(function(response) {
                return response.data;
            });

        };

        /**
         * Add a vendor to a programs using the id of each
         * @param int vendorId ID of the vendor
         * @param int programsId ID of the programs
         * @return array Updated array of programss for the vendor
         */
        exports.addVendorToProgram = function(vendorId, programsId) {
            var theId = _.findIndex(itemList, function(item) {
                return item._id == programsId;
            });

            // just in case this vendor has no ids array yet! 
            if (!itemList[theId].vendorIds) itemList[theId].vendorIds = [];

            itemList[theId].vendorIds.push(vendorId);

            return exports.getAllForVendorId(vendorId);
        };

        /**
         * Removes vendor from programs the id of each
         *
         * @param int vendorId ID of the vendor
         * @param int programsId ID of the programs
         * @return array Updated array of programss for the vendor
         */
        exports.removeVendorFromProgram = function(vendorId, programsId) {
            var theId = _.findIndex(itemList, function(item) {
                return item._id == programsId;
            });

            itemList[theId].vendorIds = _.reject(itemList[theId].vendorIds, function(item) {
                return vendorId !== item._id;
            });

            return exports.getAllForVendorId(vendorId);
        };

        /**
         * Gets all programss that match an array of IDs
         *
         * @param array idArray Array of programs ids
         * @return array programss that match the idArray
         */
        exports.getManyByIds = function(idArray) {
            var programss = [];
            _.each(idArray, function(id) {
                var match = _.find(itemList, function(subItem) {
                    return subItem._id == id;
                });
                if (match) programss.push(match);
            });
            return _.clone(programss, true);
        };


        exports.getManyByNotIds = function(idArray) {
            var returnItems = [];
            _.each(itemList, function(item) {
                var match = _.find(idArray, function(vendorId) {
                    return vendorId == item._id;
                });
                if (!match) {
                    returnItems.push(item);
                }
            });
            return _.clone(returnItems, true);
        };

        exports.template = function() {
            return {
                name: "",
                termPeriod: "Month",
                rateSheet: {
                    buyoutOptions: [{
                        costs: [{
                            rates: [0, 0, 0],
                            max: "",
                            min: ""
                        }],
                        terms: [0, 0, 0],
                        name: "$1.00 Buy Out"
                    }]
                }
            };
        };

        return exports;

    }
]);
