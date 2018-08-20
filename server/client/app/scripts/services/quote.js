angular.module('app').factory('quoteService', ['$http', 'MARLINAPI_CONFIG',
    function($http, MARLINAPI_CONFIG) {

        var url = MARLINAPI_CONFIG.base_url;

        // create and expose service methods
        var exports = {};

        // get all items
        exports.getAll = function(displayperpage,sortOrderType) {
            return $http.get(url + 'quotes/all/'+ displayperpage+'/'+sortOrderType).then(function(response) {                
                return response;
            });
        };

        // get one item by id
        exports.getById = function(id) {
            return $http.get(url + 'quotes/' + id).then(function(response) {
			    
                return response.data;
            });
        };

		// R2 #1 and #2 changes, May 2016.
        // pagination
        exports.pagination = function(pageno,displayperpage,sortOrderType) {
            return $http.get(url + 'quotes/pagination/' + pageno+'/'+displayperpage+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };
		
		// R2 #1 and #2 changes, May 2016.
		// description search
        exports.descriptionSearch = function(searchDesc, pageno ,displayperpage,sortOrderType) {
            return $http.get(url + 'quotes/descriptionSearch/' + searchDesc + '/' + pageno+'/'+ displayperpage+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };

		// R2 #1 and #2 changes, May 2016.
		// description search
        exports.vendorSearch = function(searchVendor, pageno,displayperpage,sortOrderType) {
            return $http.get(url + 'quotes/vendorSearch/' + searchVendor + '/' + pageno+'/'+displayperpage+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };
		
		exports.searchDescVendor = function(searchDesc, pageno,searchVendor,displayperpage,sortOrderType) {
            return $http.get(url + 'quotes/searchDescVendor/' + searchDesc +'/'+ pageno + '/' + searchVendor+'/'+displayperpage+'/'+sortOrderType).then(function(response) {
                return response;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.update = function(newItem) {
            var id = newItem._id;
            newItem = _.omit(newItem, '_id');
            return $http.put(url + 'quotes/' + id, newItem).then(function(response) {
                return response.data;
            });
        };

        // add a new item
        exports.add = function(item) {
            return $http.post(url + 'quotes', item).then(function(response) {
                return response.data;
            });
        };

        // remove item by item
        exports.remove = function(id) {
            return $http({
                method: 'DELETE',
                url: url + 'quotes/' + id
            }).then(function(response) {
                return response.data;
            });
        };

        return exports;

    }
]);