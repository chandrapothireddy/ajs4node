

exports.cron = function(req, res) {


	 
	
	
  console.log("welcome "+ req.body.cronM);

 programName = req.body.cronM;
 
 //var mongoConnectionString = 'mongodb://localhost/newmarlin';
 var business = programName.replace(/[?]/g, '*');
//var business = new RegExp("0 * * * * *", "i");
 var some = "job"+req.body.outdata;
 console.log("some"+some);
//agenda.database(config.db.host + ':' + config.db.port + '/' + config.db.name, 'jobs')
var i=0;
agenda.define(some, function(job) {
	i++;
console.log(" Run at " + new Date().getMinutes() + ":" + new Date().getSeconds() + "req.body.outdata"+req.body.outdata);
});
agenda.every(business, some);
agenda.start();

res.send("ok");
 
};
