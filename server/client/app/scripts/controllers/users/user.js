angular
    .module('app')
    .controller('userListController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        'userService',
        'vendorService',
        function($rootScope, $scope, $location, Auth, User, Vendor) {

            Auth.canUserDoAction('list-users');

            
            //$scope.searchTerm = '';

            // Options you can set user roles
            $scope.roles = [{
                value: 'salesRep',
                label: 'Sales Rep'
            }, {
                value: 'vendorRep',
                label: 'Vendor Rep'
            }, {
                value: 'admin',
                label: 'Admin'
            }];

            $scope.getRoleFormatted = function(role) {
                role = _.filter($scope.roles, function(item) {
                    return item.value === role;
                });

                return role ? role[0].label : '';
            };

            // gets all the users, with their vendors

            function getAllUsersWithVendors() {
				$scope.role ='none';
				//$scope.filterVarData();
                User.getRoleAll($scope.role).then(function(response) {
				$scope.users = response;
				$scope.setScopeVars(1, response);
                });
            }
			getAllUsersWithVendors();
			
			$scope.filterVarData = function(){
			$scope.role = 'none';
			if($scope.admin){
			$scope.role = 'admin';
			}
			if($scope.salesRep){
			$scope.role = 'salesRep';
			}
			if($scope.vendorRep){
			$scope.role = 'vendorRep';
			}
			
			};
			
			
			$scope.maxItemsPerPage = 10;
			$scope.minPages2Disp = 1;
			$scope.maxPages2Disp = 5;
			
			$scope.setScopeVars = function(pageNumber, response) {
				$scope.users = response.data.users;
				$scope.usersCount = response.data.count;			
				
				$scope.currentPageNum = pageNumber;
				
				$scope.maxPageNum = Math.max(1,Math.ceil($scope.usersCount / $scope.maxItemsPerPage));
			
				$scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.usersCount);				
			};
			
			
			// Generate page numbers
			$scope.genPageNums  = function(currentPageNum, count) {				
				var min = Math.max($scope.minPages2Disp, currentPageNum - Math.ceil($scope.maxPages2Disp / 2) + 1);			
				var max = Math.max($scope.maxPages2Disp, currentPageNum + Math.ceil($scope.maxPages2Disp / 2) - 1);
				if(max > $scope.maxPageNum) {
					max = $scope.maxPageNum;
				}
				
				var pageNums2Disp = [];	
				if(count !== 0)
				{
				for(var i = min; i <= max; i++) {
					pageNums2Disp.push(i);
				}
				}
				return pageNums2Disp;
			};
			
			
			// Get quotes for corresponding page
			$scope.getPage = function(pageNumber) {
				
				//$scope.filterVarData();
				if($scope.searchTerm){
				
				User.searchUser($scope.roleFilter,$scope.searchTerm,pageNumber).then(function(response) {
				$scope.users = response;
				$scope.setScopeVars(pageNumber, response);
				});
				
				  }
				  if(!$scope.searchTerm){
					 User.pagination($scope.roleFilter,pageNumber).then(function(response) {
					 //$scope.users = response;
						$scope.setScopeVars(pageNumber, response);				
					});
				}
				
				
			};
			
			$scope.roleFilter = 'none';
			$scope.getFilteredResults = function(role){
			
			
			$scope.roleFilter = role;
			//$scope.filterVarData();
			
			if($scope.searchTerm){
			User.searchUser($scope.roleFilter,$scope.searchTerm, 1).then(function(response){					  
					$scope.setScopeVars(1, response);				
				});	
			}
			if(!$scope.searchTerm){
			User.getRoleAll($scope.roleFilter).then(function(response) {	
					$scope.setScopeVars(1, response);
					});
			}
			};
			
				// Get first page
			$scope.first = function() {
				$scope.getPage(1);
			};
			
			// Get previous page
			$scope.previous = function() {
				if($scope.currentPageNum > 1) {					
					$scope.getPage($scope.currentPageNum - 1);
				}
			};
	
			
			// Get next page
			$scope.next = function() {
				if($scope.currentPageNum < $scope.maxPageNum) {
					$scope.getPage($scope.currentPageNum + 1);
				}
			};			
			
			// Get last page
			$scope.last = function() {
				$scope.getPage($scope.maxPageNum);
			};	
			
				//searching business
			$scope.searchFn= function(){
				$scope.searchTerm =$scope.searchTerm;
				//$scope.filterVarData();
				if(!$scope.searchTerm) {
					User.getRoleAll($scope.roleFilter).then(function(response) {	
					$scope.setScopeVars(1, response);
					});
					return;
				}else if($scope.searchTerm){
				User.searchUser($scope.roleFilter,$scope.searchTerm, 1).then(function(response){					  
					$scope.setScopeVars(1, response);				
				});	
            }				
			};
			$scope.listAllProgram = function(){
			//$scope.filterVarData();
			 if(!$scope.searchTerm){ 
               User.getRoleAll($scope.roleFilter).then(function(response) {
                $scope.users = response;
				$scope.setScopeVars(1, response);
               });
						
				}		
			  };
			
			
			$scope.currDisabled = function(currentPageNum) {
				if($scope.currentPageNum != currentPageNum) {
					return false;
				}
				return true;
			};
			
			$scope.firstDisabled = function() {
				if($scope.currentPageNum != $scope.minPages2Disp) {
					return false;
				}
				return true;
			};
			
				
			$scope.prevDisabled = function() {
				if($scope.currentPageNum > $scope.minPages2Disp) {
					return false;
				}
				return true;
			};
			
				
			$scope.nextDisabled = function() {
				if($scope.currentPageNum < $scope.maxPageNum) {
					return false;
				}
				return true;
			};
			
			$scope.lastDisabled = function() {
				if($scope.currentPageNum != $scope.maxPageNum) {
					return false;
				}
				return true;
			};
			
			

            

            // sends user to url based on item id
            $scope.editItem = function(itemId) {
                $location.url('dashboard/users/' + itemId);
            };

            // deletes an item and then gets the list again to reflect the deleted item.
            $scope.deleteItem = function(id) {
                User.remove(id);
                getAllUsersWithVendors();
            };

        }
    ]);
