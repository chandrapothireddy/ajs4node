angular.module('app').factory('applicationService', ['$http', 'MARLINAPI_CONFIG',
    function($http, MARLINAPI_CONFIG) {

        var url = MARLINAPI_CONFIG.base_url;

        // create and expose service methods
        var exports = {};

        // Generic find functionality
        exports.find = function(query) {

            query = JSON.stringify(query);

            return $http.post(url + 'applications/find', query).then(function(response) {
                return response;
            });
        };
		
		 exports.cronData = function(query1) {

          //query1 = JSON.stringify(query1);
			//alert(query1);
			//console.log("query1"+query1);
            return $http.post(url + 'applications/cron', query1).then(function(response) {
                return response;
            });
        };
		
		
		
		
		exports.paginationfind = function(dashboard,pageno) {

            //dashboard = JSON.stringify(dashboard);
            
			
			
			return $http.get(url + 'applications/paginationfind/' + dashboard + '/' + pageno).then(function(response) {
                return response;
            });
			
			
			
			
        };
		
		
		
		
		
		
		
		
		
		

        // get all items
        exports.getAll = function(displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'applications/all/' + displayperpage + '/' + sortName + '/' + sortOrderType).then(function(response) {
                
                return response;
            });
        };

		// R2 #1 and #2 changes, May 2016.
        exports.searchBusiness = function(searchBusiness, pageno,displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'applications/businessSearch/' + searchBusiness + '/' + pageno + '/' + displayperpage + '/' + sortName + '/' + sortOrderType).then(function(response) {
                return response;
            });
        };
		
		
		
		
		
		
		  exports.searchBusinessVendor = function(searchBusiness, pageno,searchVendor,displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'applications/searchBusinessVendor/' + searchBusiness + '/' + pageno + '/' + searchVendor + '/' + displayperpage + '/' + sortName + '/' + sortOrderType).then(function(response) {
                return response;
            });
        };
		
		
		
		// R2 #1 and #2 changes, May 2016.
        exports.searchVendor = function(searchVendor, pageno,displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'applications/vendorSearch/' + searchVendor + '/' + pageno + '/' + displayperpage + '/' + sortName + '/' + sortOrderType).then(function(response) {
                return response;
            });
        };
		
		// R2 #1 and #2 changes, May 2016.
        //pagination for application
        exports.pagination = function(pageno,displayperpage,sortName,sortOrderType) {
            return $http.get(url + 'applications/pagination/' + pageno + '/' + displayperpage + '/' + sortName + '/' + sortOrderType).then(function(response) {
                return response;
            });
        };


        // get one item by id
        exports.getById = function(id) {
            return $http.get(url + 'applications/' + id).then(function(response) {
                return response.data;
            });
        };

        // update one item by item 
        // @note we figure out id from item
        exports.update = function(newItem) {
            var id = newItem._id;
            newItem = _.omit(newItem, '_id');
            return $http.put(url + 'applications/' + id, newItem).then(function(response) {
                return response.data;
            });
        };

        // add a new item
        exports.add = function(item) {
            return $http.post(url + 'applications', item).then(function(response) {
                return response.data;
            });
        };

        // remove item by item
        exports.remove = function(id) {
            return $http({
                method: 'DELETE',
                url: url + 'applications/' + id
            }).then(function(response) {
                return response.data;
            });
        };

        // --------

        return exports;

    }
]);