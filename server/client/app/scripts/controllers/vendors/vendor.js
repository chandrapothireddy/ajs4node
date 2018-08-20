angular
    .module('app')
    .controller('vendorController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        'vendorService',
        'userService',
        function($rootScope, $scope, $location, Auth, Vendor, User) {

            Auth.canUserDoAction('list-vendors');
			$scope.searchVendorActive = false;
		    // sends user to url based on item id
            $scope.editItem = function(itemId) {
                $location.url('dashboard/vendors/' + itemId);
            };
			
			$scope.perpage = ["10","20","100","ALL"];
			$scope.perpagenum = $scope.perpage[0];
			
			$scope.index = function() {
			$scope.downloadButton = true;
					if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
						if($scope.searchvendorTerm)
						{
						//alert($scope.displayCount);
                Vendor.getAllsearchvendor($scope.displayCount,$scope.searchvendorTerm).then(function(response) {
                //$scope.vendors = response;
				$scope.setScopeVars(1, response);
            });
						}
						if(!$scope.searchvendorTerm)
						{
						//alert($scope.displayCount);
                Vendor.getAll($scope.displayCount).then(function(response) {
                //$scope.vendors = response;
				$scope.setScopeVars(1, response);
            });
						}
						
						
				
			
	
				  };
			  
			  
			  
			  $scope.listAllVendor = function()
			  {
			  	if(!$scope.searchvendorTerm)
						{
						//alert($scope.displayCount);
                Vendor.getAll($scope.displayCount).then(function(response) {
                //$scope.vendors = response;
				$scope.setScopeVars(1, response);
            });
						}
						return true;
			  };
			  
			  
			    
			$scope.searchFn = function() {
				$scope.searchVendorActive = true;
				
				$scope.searchvendorTerm = $scope.searchvendorTerm;
					if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
				
				if (!$scope.searchvendorTerm) {				
					$scope.searchVendorActive = false;
				
				
				
				
				
					Vendor.getAll($scope.displayCount).then(function(response) {
						$scope.setScopeVars(1, response);
					});
					return;
				}
				else
				{
				// searchVendor
				Vendor.searchVendor($scope.searchvendorTerm, 1,$scope.displayCount).then(function(response) {
					$scope.setScopeVars(1, response);
				});
				}
			};


            // deletes an item and then gets the list again to reflect the deleted item.
            $scope.deleteItem = function(id) {
                Vendor.remove(id);
                Vendor.getAll().then(function(response) {
                    //$scope.vendors = response;					
                });
            };
            $scope.minPages2Disp = 1;
			$scope.maxPages2Disp = 5;
			
			// Set scope variables
			$scope.setScopeVars = function(pageNumber, response) {
			if($scope.perpagenum !="ALL")
			{
			$scope.maxItemsPerPage = $scope.perpagenum;
			}
			if($scope.perpagenum =="ALL")
			{
			$scope.maxItemsPerPage = response.data.count;
			}
				
				
				$scope.vendors = response.data.vendors;
				
				
				
				
				$scope.vendorsCount = response.data.count;
				
				
				if($scope.vendorsCount)
				{
				$scope.downloadButton = true;
				}
				else
				{
				$scope.downloadButton = false;
				}
				
				$scope.currentPageNum = pageNumber;

				$scope.maxPageNum = Math.max(1, Math.ceil($scope.vendorsCount / $scope.maxItemsPerPage));

				$scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.vendorsCount);
			};


			// Generate page numbers
			$scope.genPageNums = function(currentPageNum, count) {
				var min = Math.max($scope.minPages2Disp, currentPageNum - Math.ceil($scope.maxPages2Disp / 2) + 1);
				var max = Math.max($scope.maxPages2Disp, currentPageNum + Math.ceil($scope.maxPages2Disp / 2) - 1);
				
				if (max > $scope.maxPageNum) {
					max = $scope.maxPageNum;
				}

				var pageNums2Disp = [];
				if(count !== 0)
				{
				for (var i = min; i <= max; i++) {
					pageNums2Disp.push(i);
				}
				}

				return pageNums2Disp;
			};


			// Get application for corresponding page
			$scope.getPage = function(pageNumber) {
			
			if($scope.searchvendorTerm)
			{
			Vendor.searchVendor($scope.searchvendorTerm, pageNumber,$scope.displayCount).then(function(response) {
					$scope.setScopeVars(pageNumber, response);
				});
			}
			else
			{
						$scope.displayCount = $scope.perpagenum;
						Vendor.pagination(pageNumber,$scope.displayCount).then(function(response) {
							//$scope.vendors = response;
							$scope.setScopeVars(pageNumber, response);
						});
					}
				
			};


			// Get first page
			$scope.first = function() {
				$scope.getPage(1);
			};

			// Get previous page
			$scope.previous = function() {
				if ($scope.currentPageNum > 1) {
					$scope.getPage($scope.currentPageNum - 1);
				}
			};


			// Get next page
			$scope.next = function() {
				if ($scope.currentPageNum < $scope.maxPageNum) {
					$scope.getPage($scope.currentPageNum + 1);
				}
			};

			// Get last page
			$scope.last = function() {
				$scope.getPage($scope.maxPageNum);
			};
             $scope.currDisabled = function(currentPageNum) {
				if ($scope.currentPageNum != currentPageNum) {
					return false;
				}
				return true;
			};

			$scope.firstDisabled = function() {
				if ($scope.currentPageNum != $scope.minPages2Disp) {
					return false;
				}
				return true;
			};


			$scope.prevDisabled = function() {
				if ($scope.currentPageNum > $scope.minPages2Disp) {
					return false;
				}
				return true;
			};


			$scope.nextDisabled = function() {
				if ($scope.currentPageNum < $scope.maxPageNum) {
					return false;
				}
				return true;
			};

			$scope.lastDisabled = function() {
				if ($scope.currentPageNum != $scope.maxPageNum) {
					return false;
				}
				return true;
			};	
			// R2 #6 change, May 2016.
            $scope.getArray = function() {
                var resArray = [{
                    "vendorName": "Leaserep Rates",
                    "pgmName": "",
                    "marlinRep": "",
                    "privateNotes": ""
                }, {
                    "vendorName": "today",
                    "pgmName": "",
                    "marlinRep": "",
                    "privateNotes": ""
                }, {
                    "vendorName": "VENDOR",
                    "pgmName": "PROGRAM NAME",
                    "marlinRep": "MARLIN REP",
                    "privateNotes": "PRIVATE NOTES"
                }];

                var date = new Date();
				var vendorObjsCount = 0;
                resArray[1].vendorName = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				
				var vendorObjs = $scope.vendors;
				
				vendorObjsCount = vendorObjs.length;
				
                var jsonObj = null;

                var vendorName = "";
                var pgmName = "NA";
                var marlinRep = "NA";
                var privateNotes = "NA";

                var pgmObjs = null;
                var pgmObjsCount = 0;

                for (var i = 0; i < vendorObjsCount; i++) {
                    vendorName = "";
                    if (vendorObjs[i].name) {
                        vendorName = vendorObjs[i].name.replace(new RegExp(',', 'g'), ' ');
                    }

                    marlinRep = "NA";
					
                    if (vendorObjs[i].salesRep) {
                        marlinRep = vendorObjs[i].salesRep.fullname.replace(new RegExp(',', 'g'), ' ');
                    }
					
                    pgmObjs = vendorObjs[i].programs;
                    pgmObjsCount = pgmObjs.length;
					
					if(pgmObjsCount > 0) {
						for (var j = 0; j < pgmObjsCount; j++) {
							pgmName = "NA";
							if (pgmObjs[j].name) {
								pgmName = pgmObjs[j].name.replace(new RegExp(',', 'g'), ' ');
							}

							privateNotes = "NA";
							if ((pgmObjs[j].privateNotes) && (pgmObjs[j].privateNotes.trim() !== '')) {
								privateNotes = pgmObjs[j].privateNotes.replace(new RegExp(',', 'g'), ' ');
							}
							
							jsonObj = '{ "vendorName": "' + vendorName + '", "pgmName": "' + pgmName + '", "marlinRep": "' + marlinRep + '", "privateNotes": "' + privateNotes + '"}';
							
							resArray.push(JSON.parse(jsonObj));
						}
					} else {
					    pgmName = "NA";
						privateNotes = "NA";
						jsonObj = '{ "vendorName": "' + vendorName + '", "pgmName": "' + pgmName + '", "marlinRep": "' + marlinRep + '", "privateNotes": "' + privateNotes + '"}';

						resArray.push(JSON.parse(jsonObj));						
                    }
                }
                return resArray;
            };
        }
    ]);