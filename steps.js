//html

<input type="text" name="cronM" ng-model="cronM" />
<input type="submit" ng-click="cronJ()" />


//js

 $scope.cronJ = function(){
				  
				  var cronM = [
					  "1","2","3","4"
					  ]
				  alert(cronM);
				  //$scope.myOutput = encodeURIComponent($scope.myOutput);
				  Application.cronData({cronM:cronM}).then(function(response) {
							  
							  $scope.crondas = response;
					 
						  });
				  
			  }
        
        
   //service
   
   
    exports.cronData = function(query1) {

          //query1 = JSON.stringify(query1);
			//alert(query1);
			//console.log("query1"+query1);
            return $http.post(url + 'applications/cron', query1).then(function(response) {
                return response;
            });
        };
        
        //routes
        
        router.post('/api/v1/applications/cron', applications.cron);
        
        
        //server
        
        var schedule = require('node-schedule');
 var Promise = require('promise');
 
exports.cron = function(req, res) {

var j = schedule.scheduleJob('* * * * * *', function(){
 
 
  //strreq = JSON.stringify(req.body.cronM, null, 4);
  console.log("welcome "+ req.body.cronM);
  
  var cou = req.body.cronM;
  
  
  var items = cou;
var fn = function asyncMultiplyBy2(v){ // sample async action
    return new Promise(resolve => setTimeout(() => resolve(v * 2), 100));
};
// map over forEach since it returns

var actions = items.map(fn); // run the function over all items

// we now have a promises array and we want to wait for it

var results = Promise.all(actions); // pass array of promises

results.then(data => // or just .then(console.log)
    //console.log(data)
res.send("ok")	// [2, 4, 6, 8, 10]
);
 
  
 
 
});
 
};
        
        
        
        
        
        
