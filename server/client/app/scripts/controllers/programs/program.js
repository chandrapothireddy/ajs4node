angular
    .module('app')
    .controller('programListController', [
        '$rootScope',
        '$scope',
        '$location',
        'authService',
        'programService',
        function($rootScope, $scope, $location, Auth, Program) {

            Auth.canUserDoAction('list-programs');
			$scope.searchProgramActive = false;
			
			$scope.sortVarData = function(){
			$scope.sortPropName = true;
			$scope.ProgramNameDesc = false;
			$scope.ProgramNameAsc = false;
			
			if($scope.sortName == "ProgramName"){
			if($scope.ProgramName){
			$scope.sortOrderType = -1;
			$scope.ProgramNameDesc = true;
			$scope.ProgramNameAsc = false;
			$scope.sortPropName = false;
			
			}
			else{
			$scope.sortOrderType = 1;
			$scope.ProgramNameDesc = false;
			$scope.ProgramNameAsc = true;
			$scope.sortPropName = false;
			}
		  }else{
		  $scope.sortName = '3';
		  $scope.sortOrderType = '3';
		  //$scope.sort = true;
		  }		
		};
			
			$scope.perpage = ["10","20","100","ALL"];
			$scope.perpagenum = $scope.perpage[0];
			
			
			$scope.index = function() {
				//$scope.searchTerm = '';
				if($scope.perpagenum !="ALL"){
					$scope.displayCount = $scope.perpagenum;
				 }
				if($scope.perpagenum =="ALL"){
					$scope.displayCount = '1';
				 }
				
				$scope.sortVarData();
				
				
				if($scope.searchTermhidden){
				Program.searchProgram($scope.searchTermhidden,1, $scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
				$scope.programs = response;
				$scope.setScopeVars(1, response);
				});
				}else{
				
				Program.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
                $scope.programs = response;
				$scope.setScopeVars(1, response);
               });
			   
			   }
			};	
			
			$scope.sortBy = function(sortWord) {
			$scope.sortName = sortWord;
			
			if(sortWord == "ProgramName"){
			if($scope.ProgramName){
			$scope.ProgramName = 0;
			$scope.sortOrderType = 1;
			$scope.ProgramNameDesc = false;
			$scope.ProgramNameAsc = true;
			$scope.sortPropName = false;
			}
			else{
			$scope.ProgramName = 1;
			$scope.sortOrderType = -1;
			$scope.ProgramNameDesc = true;
			$scope.ProgramNameAsc = false;
			$scope.sortPropName = false;
			
			 }
			 }
			  if($scope.perpagenum !="ALL"){
					$scope.displayCount = $scope.perpagenum;
				 }
				if($scope.perpagenum =="ALL"){
					$scope.displayCount = '1';
				 }
				 if($scope.searchTermhidden){
				Program.searchProgram($scope.searchTermhidden,1, $scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
				$scope.programs = response;
				$scope.setScopeVars(1, response);
				});
				}else{
				
				Program.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
                $scope.programs = response;
				$scope.setScopeVars(1, response);
               });
			   
			   }
				
			 
			};
			
			$scope.searchFn = function() {
			$scope.searchTerm =$scope.searchTerm;
			var strdata = $scope.searchTerm;
			$scope.searchProgramActive = true;
			if($scope.perpagenum !="ALL"){
					$scope.displayCount = $scope.perpagenum;
				 }
				if($scope.perpagenum =="ALL"){
					$scope.displayCount = '1';
				 }
				
				$scope.sortVarData();
				
				if ($scope.searchTerm) {
				//var outydata = strdata.replace(/[%]/g, '%25');
				//var outydata1 = outydata.replace(/[#]/g, '%23');
				
				
				
				$scope.searchTermhidden = encodeURIComponent(strdata);
				
				Program.searchProgram($scope.searchTermhidden,1, $scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
				$scope.programs = response;
				$scope.setScopeVars(1, response);
				});
				
				}
				else {
				$scope.searchProgramActive = false;
				Program.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
                $scope.programs = response;
				$scope.setScopeVars(1, response);
               });
				}
			};
			$scope.listAllProgram = function()
			  {
			  if($scope.perpagenum !="ALL"){
				 $scope.displayCount = $scope.perpagenum;
				}
			  if($scope.perpagenum =="ALL"){
				$scope.displayCount = '1';
			    }
			  $scope.sortVarData();
			  	if(!$scope.searchTerm){
						//alert($scope.displayCount);
               Program.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
                $scope.programs = response;
				$scope.setScopeVars(1, response);
               });
						}
						
			  };

            $scope.maxItemsPerPage = 10;
			$scope.minPages2Disp = 1;
			$scope.maxPages2Disp = 5;
			
			// Set scope variables
			$scope.setScopeVars = function(pageNumber, response) {
			
			if($scope.perpagenum !="ALL"){
					$scope.maxItemsPerPage = $scope.perpagenum;
				 }
				if($scope.perpagenum =="ALL"){
					$scope.maxItemsPerPage = response.data.count;
				 }
				$scope.programs = response.data.programs;
				$scope.programsCount = response.data.count;
				$scope.currentPageNum = pageNumber;

				$scope.maxPageNum = Math.max(1, Math.ceil($scope.programsCount / $scope.maxItemsPerPage));

				$scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.programsCount);
				
				$scope.clickEnabled = $scope.click($scope.programsCount);
				
			};
   
			$scope.click = function(count) {
			
			$scope.clickEnabled = false;
			if(count >= 0){
			var check = (count < 2) ;
			if(!check){
			$scope.clickEnabled = false;
			}
			else{
			$scope.clickEnabled = true;
			$scope.ProgramNameDesc = false;
			$scope.ProgramNameAsc = false;
			$scope.sortPropName = false;
			}
			}
			return $scope.clickEnabled;
			};
			
   
			// Generate page numbers
			$scope.genPageNums = function(currentPageNum, count) {
				var min = Math.max($scope.minPages2Disp, currentPageNum - Math.ceil($scope.maxPages2Disp / 2) + 1);
				var max = Math.max($scope.maxPages2Disp, currentPageNum + Math.ceil($scope.maxPages2Disp / 2) - 1);
				if (max > $scope.maxPageNum) {
					max = $scope.maxPageNum;
				}
				
				var pageNums2Disp = [];
				if(count)
				{
				for (var i = min; i <= max; i++) {
					pageNums2Disp.push(i);
				}
				}

				return pageNums2Disp;
				
				
			};
			
			

			$scope.getPage = function(pageNumber) {
			if($scope.perpagenum !="ALL"){
				$scope.displayCount = $scope.perpagenum;
				}
				if($scope.perpagenum =="ALL")
						{
						$scope.displayCount = '1';
						}
			$scope.sortVarData();
			
			if($scope.searchTermhidden)
			{			
			Program.searchProgram($scope.searchTermhidden,pageNumber, $scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
				$scope.programs = response;
				$scope.setScopeVars(pageNumber, response);
				});
			
			}else
			{
				Program.pagination(pageNumber,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
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
			
            // sends user to url based on item id
            $scope.editItem = function(itemId) {
                $location.url('dashboard/programs/' + itemId);
            };
	

            // deletes an item and then gets the list again to reflect the deleted item.
            $scope.deleteItem = function(id) {
                Program.remove(id);
                Program.getAll().then(function(response) {
                    $scope.programs = response;
                });

            };

        }
    ]);
