angular
    .module('app')
    .controller('quoteListController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        'quoteService',
        'vendorService',
        function($rootScope, $scope, $location, Auth, Quote, Vendor, $filter) {
            Auth.canUserDoAction('list-quotes');

			//$scope.maxItemsPerPage = 10;
            $scope.minPages2Disp = 1;
            $scope.maxPages2Disp = 5;

            // Gets the quotes for loading page
           /*  Quote.getAll().then(function(response) {
                $scope.setScopeVars(1, response);
            }); */
			
			$scope.perpage = ["10","20","100","500","ALL"];
			$scope.perpagenum = $scope.perpage[0];
			
			$scope.sortVarData = function(){
				
				$scope.sortDate = true;
				$scope.dateAsc = false;
				$scope.dateDesc = false;
				
				if($scope.sortEnabled){
					if($scope.date){
						$scope.sortOrderType = 1;
						$scope.dateAsc = true;
						$scope.dateDesc = false;
						$scope.sortDate = false;
					}else{
						$scope.sortOrderType = -1;
						$scope.dateAsc = false;
						$scope.dateDesc = true;
						$scope.sortDate = false;
					}	
				}else{
				$scope.sortEnabled = false;
				$scope.sortOrderType = 'dateorder';
				}
			
			};
			$scope.sortOrder = function(sort) {
				$scope.sortEnabled = sort;
				//if($scope.sortEnabled ="sortEnabled"){
				if($scope.sortEnabled){
					if($scope.date){
					$scope.date = 0;
					$scope.sortOrderType = 1;
					$scope.dateDesc = false;
					$scope.dateAsc = true;
					$scope.sortDate = false;
					}else{
					$scope.date = 1;
					$scope.sortOrderType = -1;
					$scope.dateDesc = true;
					$scope.dateAsc = false;
					$scope.sortDate = false;
					}
				}else{
				
				}
				if($scope.perpagenum !="ALL"){
					$scope.displayCount = $scope.perpagenum;
				 }
				if($scope.perpagenum =="ALL"){
					$scope.displayCount = '1';
				 }
				$scope.sortVarData();
				if($scope.searchDesc && $scope.searchVendor){
			Quote.searchDescVendor($scope.searchDesc, 1, $scope.searchVendor,$scope.displayCount,$scope.sortOrderType).then(function(response) {
			$scope.quotes = response;
				$scope.setScopeVars(1, response);
			   });
			}else if ($scope.searchDesc && (!$scope.searchVendor)) {
                Quote.descriptionSearch($scope.searchDesc, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
				$scope.quotes = response;
                    $scope.setScopeVars(1, response);
                });
             } else if ($scope.searchVendor && (!$scope.searchDesc)) {
                 Quote.vendorSearch($scope.searchVendor,1 ,$scope.displayCount,$scope.sortOrderType).then(function(response) {
				 $scope.quotes = response;
                     $scope.setScopeVars(1, response);
					 });
             }else{
			Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {
			$scope.quotes = response;
                $scope.setScopeVars(1, response);
				});
				}
			
			
			};
			
			
			$scope.index = function() {
			if($scope.perpagenum !="ALL"){
				$scope.displayCount = $scope.perpagenum;
			}
			if($scope.perpagenum =="ALL"){
				$scope.displayCount = '1';
			}
			
			$scope.sortVarData();
			
			if($scope.searchDesc && $scope.searchVendor){
			Quote.searchDescVendor($scope.searchDesc, 1, $scope.searchVendor,$scope.displayCount,$scope.sortOrderType).then(function(response) {
			$scope.quotes = response;
				$scope.setScopeVars(1, response);
			   });
			}else if ($scope.searchDesc && (!$scope.searchVendor)) {
                Quote.descriptionSearch($scope.searchDesc, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
				$scope.quotes = response;
                    $scope.setScopeVars(1, response);
                });
             } else if ($scope.searchVendor && (!$scope.searchDesc)) {
                 Quote.vendorSearch($scope.searchVendor,1 ,$scope.displayCount,$scope.sortOrderType).then(function(response) {
				 $scope.quotes = response;
                     $scope.setScopeVars(1, response);
					 });
             }else if(!($scope.searchDesc && $scope.searchVendor)){
			Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {
			$scope.quotes = response;
                $scope.setScopeVars(1, response);
				});
				}
			
			};
            // Set scope variables
            $scope.setScopeVars = function(pageNumber, response) {
			
			
			if($scope.perpagenum !="ALL"){
					$scope.maxItemsPerPage = $scope.perpagenum;
				}
			if($scope.perpagenum =="ALL"){
				$scope.maxItemsPerPage = response.data.count;
				}
				
                $scope.quotes = response.data.quotes;
                $scope.quotesCount = response.data.count;
				
				

                $scope.currentPageNum = pageNumber;

                $scope.maxPageNum = Math.max(1, Math.ceil($scope.quotesCount / $scope.maxItemsPerPage));

                $scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.quotesCount);
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


            // Get quotes for corresponding page
            $scope.getPage = function(pageNumber) {
			
			if($scope.perpagenum !="ALL"){
				$scope.displayCount = $scope.perpagenum;
			}
			if($scope.perpagenum =="ALL"){
				$scope.displayCount = '1';
			}
			$scope.sortVarData();
				
				  if($scope.searchDesc && $scope.searchVendor){
					Quote.searchDescVendor($scope.searchDesc, pageNumber, $scope.searchVendor,$scope.displayCount,$scope.sortOrderType).then(function(response) {
					$scope.quotes = response;
					$scope.setScopeVars(pageNumber, response);
				      });
					}else if ($scope.searchDesc && (!$scope.searchVendor)) {
                        Quote.descriptionSearch($scope.searchDesc, pageNumber,$scope.displayCount,$scope.sortOrderType).then(function(response) {
						$scope.quotes = response;
                            $scope.setScopeVars(pageNumber, response);
                        });
                    } else if ($scope.searchVendor && (!$scope.searchDesc)) {
                        Quote.vendorSearch($scope.searchVendor, pageNumber,$scope.displayCount,$scope.sortOrderType).then(function(response) {
						$scope.quotes = response;
                            $scope.setScopeVars(pageNumber, response);
                        });
					} else if(!($scope.searchVendor && $scope.searchDesc)){
						Quote.pagination(pageNumber,$scope.displayCount,$scope.sortOrderType).then(function(response) {
						$scope.quotes = response;
						var outdata = JSON.stringify(response.data);
						
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


            //searching description
            $scope.searchDescFn = function() {
				$scope.searchDesc = $scope.searchDesc;
				
				if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
						$scope.sortVarData();
				
                if ($scope.searchDesc === '' && $scope.searchVendor === '') {				
                    $scope.searchDescActive = false;
					$scope.searchVendorActive = false;
					
                    Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {
                        

                        $scope.setScopeVars(1, response);
                    });
                    return;
                }
                if ($scope.searchVendor) {				
				
						Quote.searchDescVendor($scope.searchDesc, 1,$scope.searchVendor,$scope.displayCount,$scope.sortOrderType).then(function(response) {
					$scope.setScopeVars(1, response);
				});
					return;
				}
				
				else
				{
				// descriptionSearch
                Quote.descriptionSearch($scope.searchDesc, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
                    

                    $scope.setScopeVars(1, response);
                });
				}
            };
			
			
			//searching vendor
            $scope.searchVendorFn = function() {
				
				$scope.searchVendor = $scope.searchVendor;   
					if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
						$scope.sortVarData();				
				
                if ($scope.searchVendor === '' && $scope.searchDesc === '') {				
                    $scope.searchVendorActive = false;
					$scope.searchDescActive = false;					
					
                    Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {
                        $scope.setScopeVars(1, response);
                    });
                    return;
                }
				if ($scope.searchDesc) {				
				
					Quote.searchDescVendor($scope.searchDesc, 1, $scope.searchVendor,$scope.displayCount,$scope.sortOrderType).then(function(response) {
					$scope.setScopeVars(1, response);
				});
					return;
				}
				
				else
				{
                
				// descriptionSearch
                Quote.vendorSearch($scope.searchVendor, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
                    

                    $scope.setScopeVars(1, response);
                });
				}
            };
            //Keyup
			$scope.listAllDesc = function()
			  {
			  	  if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
						$scope.sortVarData();
			  if ($scope.searchVendor && (!$scope.searchDesc)) {				
				
						Quote.vendorSearch($scope.searchVendor, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
                    

                    $scope.setScopeVars(1, response);
                });
				}
			  	else if(!$scope.searchDesc && !$scope.searchVendor)
				{
			   Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {

						$scope.setScopeVars(1, response);
					});
						}
						return true;
			  };
					
			  $scope.listAllVendorApp = function()
			  {
			  if($scope.perpagenum !="ALL")
						{
						$scope.displayCount = $scope.perpagenum;
						}
						if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
						$scope.sortVarData();
				if($scope.searchDesc && (!$scope.searchVendor))
				{
					Quote.descriptionSearch($scope.searchDesc, 1,$scope.displayCount,$scope.sortOrderType).then(function(response) {
                    $scope.setScopeVars(1, response);
                });
				}
				else if(!$scope.searchVendor && !$scope.searchDesc)
						{
			   Quote.getAll($scope.displayCount,$scope.sortOrderType).then(function(response) {

						$scope.setScopeVars(1, response);
					});
						}
						return true;
			  };
				//Keyup

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


            // sends user to url based on item id
            $scope.editItem = function(itemId) {
                $location.url('dashboard/quotes/' + itemId);
            };


        }
    ]);


// filter