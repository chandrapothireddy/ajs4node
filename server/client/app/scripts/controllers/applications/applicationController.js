	angular
	  .module('app')
	  .controller('applicationController', [
		  '$rootScope',
		  '$scope',
		  '$location',
		  '$routeParams',
		  'authService',
		  'applicationService',
		  'vendorService',
		  'stateService',
		  'CommonInterface',
		  function($rootScope, $scope, $location, $routeParams, Auth, Application, Vendor, States, CommonInterface) {
  
			  
			  
	$scope.myConfig = {
    quartz: false,
	allowMultiple: true
}
			

			  
			  $scope.cronJ = function(){
				  
				  var cronM = $scope.myOutput;
				  alert(cronM);
				  //$scope.myOutput = encodeURIComponent($scope.myOutput);
				  Application.cronData({cronM:cronM,outdata:$scope.outdata}).then(function(response) {
							  
							  $scope.crondas = response;
					 
						  });
				  
			  }
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  var applicationId;
			  $scope.application = {};
			  $scope.applications = [];
  
			  // get states arrays for forms
			  $scope.states1 = States.states();
			  $scope.states2 = States.states();
  
			  // Define possible statuses for our application.
			  // Note this is not the most robust, and can 
			  // easily get out of sync with the database,
			  // but for now it works. 
			  var statuses = [{
				  value: 'new',
				  label: 'New'
			  }, {
				  value: 'inProgress',
				  label: 'In Progress'
			  }, {
				  value: 'complete',
				  label: 'Completed'
			  }, {
				  value: 'draft',
				  label: 'Draft'
			  }];
  
			  //////////////////////////////////////////////////////////////////////////////
			  /////////////////////////////// Index Action ////////////////////////////////
			  ////////////////////////////////////////////////////////////////////////////
  $scope.perpage = ["10","20","100","ALL"];
			  $scope.perpagenum = $scope.perpage[0];
			  $scope.sortVarData = function()
			  {
			  $scope.sortproplessee = true;
				  $scope.sortpropvendor = true;
				  $scope.sortpropstatus = true;
				  $scope.sortpropcost = true;
				  if($scope.sortName == "fullLegalBusinessName")
				  {
					  if($scope.fullLegalBusinessName)
					  {
						  $scope.sortOrderType = -1;
						  $scope.lesseedesc = true;
						  $scope.lesseeasc = false;
						  $scope.sortproplessee = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropvendor = true;
						  $scope.sortpropstatus = true;
						  $scope.sortpropcost = true;
						  
					  }
					  else
					  {
						  $scope.sortOrderType = 1;
						  $scope.lesseeasc = true;
						  $scope.lesseedesc = false;
						  $scope.sortproplessee = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropvendor = true;
						  $scope.sortpropstatus = true;
						  $scope.sortpropcost = true;
						  
					  }
				  }
				  else
				  {
				  $scope.sortName = '3';
				  $scope.sortOrderType = '3';
				  }
			  };
			  
			  $scope.index = function() {
				  Auth.canUserDoAction('list-applications');
				  if($scope.perpagenum !="ALL")
						  {
						  $scope.displayCount = $scope.perpagenum;
						  }
						  if($scope.perpagenum =="ALL")
						  {
						  $scope.displayCount = '1';
						  }
				  
				  $scope.sortVarData();
				  
				  if($scope.searchBusiness && $scope.searchVendor)
				  {
					  Application.searchBusinessVendor($scope.searchBusiness, 1,$scope.searchVendor,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
				  });
				  }
			  
				  else if ($scope.searchBusiness && (!$scope.searchVendor)) {
						  Application.searchBusiness($scope.searchBusiness, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  
							  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
						  });
					  } else if ($scope.searchVendor && (!$scope.searchBusiness)) {
						  Application.searchVendor($scope.searchVendor, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							 
							  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
						  });
					  } else if(!($scope.searchBusiness && $scope.searchVendor)){
						  Application.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
				  });	
					  }
				  
				  // Gets all the Applications
				 $scope.formatStatus = function(status) {
					  var display = _.filter(statuses, {
						  value: status
					  });
					  return display.length ? display[0].label : '';
				  };
  
				  // Expose private methods on the scope object in certain controller
				  // actions if we want them to be accessible
				  $scope.editItem = privates.editItem;
				  $scope.deleteItem = privates.deleteItem;
  
			  };
			  
			  
			  // R2 #1 and #2 changes, May 2016.
			  $scope.minPages2Disp = 1;
			  $scope.maxPages2Disp = 5;
			  $scope.searchBusinessActive = false;
			  $scope.searchVendorActive = false;
			  
			  // Set scope variables
			  $scope.setScopeVars = function(pageNumber, response,dashboard) {
					  if(dashboard == "1")
					  {
					  $scope.applicationsnew = response.data.applications;
					  $scope.resdatacountnew = response.data.count;
					  $scope.maxItemsPerPage = 10;
							  
					  $scope.currentPageNum = pageNumber;
  
					  $scope.maxPageNum = Math.max(1, Math.ceil($scope.resdatacountnew / $scope.maxItemsPerPage));
  
					  $scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.resdatacountnew);
					  }
					  else if(dashboard == "2")
					  {
					  $scope.applicationsopen = response.data.applications;
					  $scope.resdatacountopen = response.data.count;
					  $scope.maxItemsPerPage = 10;
					  $scope.currentPageNum = pageNumber;
  
					  $scope.maxPageNum = Math.max(1, Math.ceil($scope.resdatacountopen / $scope.maxItemsPerPage));
  
					  $scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.resdatacountopen);
					  }
					  else
					  { 
						  if($scope.perpagenum !="ALL")
						  {
						  $scope.maxItemsPerPage = $scope.perpagenum;
						  }
						  if($scope.perpagenum =="ALL")
						  {
						  $scope.maxItemsPerPage = response.data.count;
						  }
						  $scope.applicationstotal = response.data.applications;
						  $scope.applicationstotalCount = response.data.count;
						  $scope.currentPageNum = pageNumber;
						  $scope.maxPageNum = Math.max(1, Math.ceil($scope.applicationstotalCount / $scope.maxItemsPerPage));
						  $scope.pageNums2Disp = $scope.genPageNums($scope.currentPageNum, $scope.applicationstotalCount);
						  
					  }
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
  
			  // Get application for corresponding page
			  $scope.getPage = function(pageNumber,dashboard) {
			  $scope.dashboard = dashboard;
			  if($scope.perpagenum !="ALL")
			  {
			  $scope.displayCount = $scope.perpagenum;
			  }
			  if($scope.perpagenum =="ALL")
			  {
			  $scope.displayCount = '1';
			  }
			  $scope.sortVarData();
			  if(dashboard === "")
			  {
				  if ($scope.currentPageNum != pageNumber) {
					  
					  if($scope.searchBusiness && $scope.searchVendor)
					  {
					  
						  Application.searchBusinessVendor($scope.searchBusiness, pageNumber,$scope.searchVendor,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.setScopeVars(pageNumber, response,'');
				  });
									  
					  }
				  
					  else if ($scope.searchBusiness && (!$scope.searchVendor)) {
						  Application.searchBusiness($scope.searchBusiness, pageNumber,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  $scope.setScopeVars(pageNumber, response,dashboard);
						  });
					  } else if ($scope.searchVendor && (!$scope.searchBusiness)) {
						  Application.searchVendor($scope.searchVendor, pageNumber,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  $scope.setScopeVars(pageNumber, response,dashboard);
						  });
					  } else if(!($scope.searchBusiness && $scope.searchVendor)){
						  Application.pagination(pageNumber,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  $scope.setScopeVars(pageNumber, response,dashboard);
						  });
					  }
				  }
			  }
			  else if(dashboard !== "")
			  {
			  if ($scope.currentPageNum != pageNumber) {
			  Application.paginationfind(dashboard,pageNumber).then(function(response) {
					  $scope.setScopeVars(pageNumber, response,dashboard);
				  });
				  }
			  }
			  };
  
			  // Get first page
			  $scope.first = function(dashboard) {
				  if(dashboard === "")
				  {
				  $scope.getPage(1,"");
				  }
				  else if(dashboard !== "")
				  {
				  $scope.getPage(1,dashboard);
				  }
			  };
  
			  // Get previous page
			  $scope.previous = function(dashboard) {
			  if(dashboard === "")
			  {
				  if ($scope.currentPageNum > 1) {
					  $scope.getPage($scope.currentPageNum - 1,'');
				  }
				  
			  }
			  else if(dashboard !== "")
			  {
				  if ($scope.currentPageNum > 1) {
					  $scope.getPage($scope.currentPageNum - 1,dashboard);
				  }
			  }
				  
			  };
  
			  // Get next page
			  $scope.next = function(dashboard) {
			  if(dashboard === "")
			  {
				  if ($scope.currentPageNum < $scope.maxPageNum) {
					  $scope.getPage($scope.currentPageNum + 1,"");
				  }
			  }
			  if(dashboard !== "")
			  {
				  if ($scope.currentPageNum < $scope.maxPageNum) {
					  $scope.getPage($scope.currentPageNum + 1,dashboard);
				  }
			  }
			  };
  
			  // Get last page
			  $scope.last = function(dashboard) {
				  $scope.getPage($scope.maxPageNum,dashboard);
			  };
  
			  //searching business
			  $scope.searchBusinessFn = function() {
				  
				  $scope.searchBusinessActive = true;
				  $scope.searchVendorActive = false;
				  
				  $scope.searchBusiness = $scope.searchBusiness;
				  //$scope.searchVendor = '';
			  if($scope.searchBusiness)
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
								  
				  if ($scope.searchBusiness === '' && $scope.searchVendor === '') {				
					  $scope.searchBusinessActive = false;
					  $scope.searchVendorActive = false;
										  
					  Application.getAll($scope.displayCount,'','').then(function(response) {
						  $scope.setScopeVars(1, response,'');
					  });
					  return;
				  }
								  
				  if ($scope.searchVendor) {				
						  
						  Application.searchBusinessVendor($scope.searchBusiness, 1,$scope.searchVendor,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.setScopeVars(1, response,'');
				  });
					  return;
				  }
				  
				  else
				  {
				  Application.searchBusiness($scope.searchBusiness, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.setScopeVars(1, response,'');
				  });
				  }
			  }
			  else
			  {
			  $scope.listAllBusinessApp();
			  }
			  };
		  
				$scope.listAllBusinessApp = function()
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
				if ($scope.searchVendor && (!$scope.searchBusiness)) {				
				  
						  Application.searchVendor($scope.searchVendor, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
  
					  $scope.setScopeVars(1, response,'');
				  });
				  }
				  else if(!$scope.searchBusiness)
				  {
				  
				 Application.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
  
						  $scope.setScopeVars(1, response,'');
					  });
						  }
						  return true;
				};
				$scope.sortOrder = function(sortWord)
				{
				  $scope.sortName = sortWord;
				   if(sortWord == "fullLegalBusinessName")
					  {
						  if($scope.fullLegalBusinessName)
						  {
						  $scope.fullLegalBusinessName = 0;
						  $scope.sortOrderType = 1;
						  $scope.lesseeasc = true;
						  $scope.lesseedesc = false;
						  $scope.sortproplessee = false;
					      $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropstatus = true;
						  $scope.sortpropvendor = true;
						  $scope.sortpropcost = true;
						  }
						  else
						  {
						  $scope.fullLegalBusinessName = 1;
						  $scope.sortOrderType = -1;
						  $scope.lesseedesc = true;
						  $scope.lesseeasc = false;
						  $scope.sortproplessee = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropstatus = true;
						  $scope.sortpropvendor = true;
						  $scope.sortpropcost = true;
						  }
				  
					  }
					  else if(sortWord == "vendor")
					  {
					  
					  if($scope.vendor)
						  {
						  $scope.vendor = 0;
						  $scope.sortOrderType = 1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.sortpropvendor = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = true;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropstatus = true;
				  		  $scope.sortpropcost = true;
						  $scope.sortproplessee = true;
						  }
						  else
						  {
						  $scope.vendor = 1;
						  $scope.sortOrderType = -1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.vendordesc = true;
						  $scope.vendorasc = false;
						  $scope.sortpropvendor = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropstatus = true;
				 		  $scope.sortpropcost = true;
						  $scope.sortproplessee = true;
						  }
								  
					  }
					  else if(sortWord == "status")
					  {
										  
					  if($scope.status)
						  {
						  $scope.status = 0;
						  $scope.sortOrderType = 1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.sortpropstatus = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = true;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropvendor = true;
				 		  $scope.sortpropcost = true;
						  $scope.sortproplessee = true;
  
						  }
						  else
						  {
						  $scope.status = 1;
						  $scope.sortOrderType = -1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.sortpropstatus = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  
						  $scope.statusdesc = true;
						  $scope.statusasc = false;
						  $scope.costdesc = false;
						  $scope.costasc = false;
						  $scope.sortpropvendor = true;
				  		  $scope.sortpropcost = true;
	   					  $scope.sortproplessee = true;
  
						  }
					  
					  
					  }
					  else if(sortWord == "cost")
					  {
								  
					  
						  if($scope.cost)
						  {
						  $scope.cost = 0;
						  $scope.sortOrderType = 1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.sortpropcost = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  
						  $scope.costdesc = false;
						  $scope.costasc = true;
						  $scope.sortpropstatus = true;
						  $scope.sortpropvendor = true;
						  $scope.sortproplessee = true;
					  }
						  else
						  {
						  $scope.cost = 1;
						  $scope.sortOrderType = -1;
						  $scope.lesseedesc = false;
						  $scope.lesseeasc = false;
						  $scope.sortpropcost = false;
						  $scope.vendordesc = false;
						  $scope.vendorasc = false;
						  $scope.statusdesc = false;
						  $scope.statusasc = false;
						  $scope.costdesc = true;
						  $scope.costasc = false;
						  $scope.sortpropstatus = true;
				 		  $scope.sortpropvendor = true;
						  $scope.sortproplessee = true;
						  }
					  
					  }
					  if($scope.perpagenum !="ALL")
						  {
						  $scope.displayCount = $scope.perpagenum;
						  }
						  if($scope.perpagenum =="ALL")
						  {
						  $scope.displayCount = '1';
						  }
				  
				  if($scope.searchBusiness && $scope.searchVendor)
				  {
					  Application.searchBusinessVendor($scope.searchBusiness, 1,$scope.searchVendor,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
				  });
				  
				  }
				  
				  else if ($scope.searchBusiness && (!$scope.searchVendor)) {
						  Application.searchBusiness($scope.searchBusiness, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
						  });
						  
						  
					  } else if ($scope.searchVendor && (!$scope.searchBusiness)) {
						  Application.searchVendor($scope.searchVendor, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
							  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
						  });
					  } else {
						  Application.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.applications = response;
					  $scope.setScopeVars(1, response,'');
				  });	
					  }
				  
				  // Gets all the Applications
							  
				  $scope.formatStatus = function(status) {
					  var display = _.filter(statuses, {
						  value: status
					  });
					  return display.length ? display[0].label : '';
				  };
  
				  // Expose private methods on the scope object in certain controller
				  // actions if we want them to be accessible
				  $scope.editItem = privates.editItem;
				  $scope.deleteItem = privates.deleteItem;
			  
				};
						  
			  //searching vendor
			  $scope.searchVendorFn = function() {
				  
				  $scope.searchVendorActive = true;
				  $scope.searchBusinessActive = false;
							  
				  $scope.searchVendor = $scope.searchVendor;
				  //$scope.searchBusiness = '';  
	  
			  if($scope.searchVendor)
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
					if ($scope.searchVendor === '' && $scope.searchBusiness === '') {				
					  $scope.searchVendorActive = false;
					  $scope.searchBusinessActive = false;	
						  
					  
					  Application.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
  
						  $scope.setScopeVars(1, response,'');
					  });
					  return;
					}
				  
				  if ($scope.searchBusiness) {				
				  
						  Application.searchBusinessVendor($scope.searchBusiness, 1,$scope.searchVendor,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.setScopeVars(1, response,'');
				  });
					  return;
				  }
				  
				  else
				  {		
				  // descriptionSearch
				  Application.searchVendor($scope.searchVendor, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
  
					  $scope.setScopeVars(1, response,'');
				  });
				  }
				  
			  }
			  else
			  {
			  $scope.listAllVendorApp();
			  }
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
				  
				
				  if($scope.searchBusiness && (!$scope.searchVendor))
				  {
				  	  Application.searchBusiness($scope.searchBusiness, 1,$scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
					  $scope.setScopeVars(1, response,'');
				  });
				  }
				  else if(!$scope.searchVendor)
						  {
				 Application.getAll($scope.displayCount,$scope.sortName,$scope.sortOrderType).then(function(response) {
  
						  $scope.setScopeVars(1, response,'');
					  });
						  }
						  return true;
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
			  
			  //////////////////////////////////////////////////////////////////////////////
			  //////////////////////////////// Edit Action ////////////////////////////////
			  ////////////////////////////////////////////////////////////////////////////
  
			  $scope.edit = function() {
  
				  Auth.canUserDoAction('edit-applications');
				  $scope.modelObject = Application;
				  $scope.statuses = statuses;
				  $scope.application = {};
				  var application = {};
				  $scope.application.logo = {};
  
				  // filepicker settings
				  // @todo move to global config
				  filepicker.setKey('AJNc7mfA3SCxs3gRjg7EBz');
  
				  // pick logo function
				  // simple callback assigans to application logo when complete
				  $scope.pickImage = function() {
					  filepicker.pick(function(FPFile) {
						  $scope.application.logo.original = FPFile.url;
						  $scope.$apply();
					  });
				  };
  
				  $scope.showAppEmail = function() {
					  if (!$scope.application) return false;
					  if (Auth.showIfUserCanDoAction('email-credit') && $scope.application.status == 'inProgress') return true;
					  return false;
				  };
  
				  $scope.cancel = privates.viewApplicationList;
  
				  // get application ID for edit pages
				  applicationId = $routeParams.id;
				  $scope.formAction = 'Add';
  
				  // get and store the application 
				  if (applicationId) {
					  // get the application
					  Application.getById(applicationId).then(function(response) {
						  $scope.application = response;
  
						  // if the Application is new, set it to pending after it is initially looked at
						  if ($scope.application.status === 'new') {
							  $scope.application.status = 'inProgress';
							  Application.update($scope.application);
						  }
  
						  // if no state is set, set default 
						  if (!$scope.application.company.businessAddress.state) {
							  $scope.application.company.businessAddress.state = $scope.states1[0].abbreviation;
						  }
  
						  if (!$scope.application.guarantor.homeAddress.state) {
							  $scope.application.guarantor.homeAddress.state = $scope.states2[0].abbreviation;
						  }
  
					  });
  
					  $scope.formAction = 'Update';
				  }
  
				  // activated when user clicks the save button
				  $scope.save = privates.save;
  
				  // activated when the user clickes the complete button
				  $scope.complete = privates.complete;
  
				  /**
				   * Tab functions.
				   * @todo make into a direct
				   *
				   */
				  $scope.activeTab = 0;
				  $scope.isActiveTab = privates.isActiveTab;
				  $scope.changeTab = privates.changeTab;
				  $scope.showGlobalErrorMsg = privates.showGlobalErrorMsg;
  
				  $scope.setStatus = function(newStatus) {
					  // this is a hack??? or not, for some reason the unsavedChanges directive moves the form
					  // into a child scope, so we need to access it here, or create a function to call
					  // which will set the directive dirty and workaround the scope issues
					  if ($scope.$$childTail && $scope.$$childTail.applicationForm) {
						  $scope.$$childTail.applicationForm.$setDirty();
					  }
					  // set our application status
					  $scope.application.status = newStatus;
				  };
  
			  };
  
			  //////////////////////////////////////////////////////////////////////////////
			  ////////////////////////////// Dashboard Action /////////////////////////////
			  ////////////////////////////////////////////////////////////////////////////
  
			  $scope.getNewApps = function() {
				  privates.find({
					  'status': 'new'
				  });
			  };
  
			  $scope.getActiveApps = function() {
				  privates.find({
					  'status': {
						  '$nin': ['new', 'approved', 'denied', 'complete', 'draft']
					  }
				  });
			  };
  
			  //////////////////////////////////////////////////////////////////////////////
			  ////////////////////////////// Private Methods //////////////////////////////
			  ////////////////////////////////////////////////////////////////////////////
  
			  var privates = {};
  
			  // Flexible find method
			  privates.find = function(query) {
				  Application.find(query).then(function(response) {
					  if(query.status == "new")
					  {
					  $scope.setScopeVars(1, response,"1");
					  }
					  else
					  {
					  $scope.setScopeVars(1, response,"2");
					  }
				  });
			  };
  
			  // sends user to url based on item id
			  privates.editItem = function(itemId) {
				  $location.url('dashboard/applications/' + itemId);
			  };
  
			  // deletes an item and then gets the list again to reflect the deleted item.
			  privates.deleteItem = function(id) {
				  Application.remove(id);
				  Application.getAll().then(function(response) {
					  $scope.applications = response;
				  });
			  };
  
			  // utility function to go back to the application list
			  // @todo this function is used in many places, 
			  // find a way to streamline it
			  privates.viewApplicationList = function() {
				  $location.url('/dashboard/applications');
			  };
  
			  // activated when user clicks the save button
			  privates.save = function(doRedirect) {
				  CommonInterface.save({
					  Model: Application,
					  instance: $scope.application,
					  id: applicationId,
					  form: $scope.$$childTail.applicationForm,
					  redirectUrl: '/dashboard/applications',
					  doRedirect: doRedirect
				  });
			  };
  
			  // activated when user clicks the complete button
				privates.complete = function() {
				  $scope.application.status = 'complete';
				  privates.save();
			  };
  
			  // used for active class
			  privates.isActiveTab = function(id) {
				  return $scope.activeTab == id ? true : false;
			  };
  
			  // used to set active tab
			  privates.changeTab = function(tab) {
				 
				  if (!$scope.application._id) return false;
					$scope.activeTab = tab;
			  };
  
			  privates.showGlobalErrorMsg = function(form) {
				  var showError = false;
				  _.each(form, function(val, key) {
					  if (val !== null) {
						  showError = true;
					  }
				  });
				  return showError;
			  };
  
		  }
	  ]);