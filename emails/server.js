/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    //emailer = require('mean-emailer'),
    logger = require('mean-logger');
	var nodemailer = require('nodemailer');
	var router = express.Router();
const Configstore = require('configstore');
var schedule = require('node-schedule');
 
/* var j = schedule.scheduleJob('2 * * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
}); */
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    standardReponse = require('./config/middlewares/response'),
    mongoose = require('mongoose');

	var Agendash = require('agendash');
	
	var Agenda = require("agenda");
	
	
	var mongoConnectionString = 'mongodb://localhost:27017/newmarlin';

var agenda = new Agenda({db: {address: mongoConnectionString}});
	

 

 
 
 



 
 
 
 
 
 //var mongoConnectionString = 'mongodb://localhost/newmarlin';


 
 
 
 
 
	
	
	
	
	
	
	
	
	
	
	
	
	
	
var http = require('http');

var https = require('https');
var privateKey = fs.readFileSync(config.root + '/ssl/testleaserep.com-key.pem');
var certificate = fs.readFileSync(config.root + '/ssl/4bd8600939045488.crt');
var certAuth = fs.readFileSync(config.root + '/ssl/gd_bundle-g2-g1.crt');
// R2 #9 change, May 2016.
var opt = {
	key: privateKey,
	cert: certificate,
	ca: certAuth,
	ciphers: [
		"ECDHE-RSA-AES128-GCM-SHA256",
		"ECDHE-ECDSA-AES128-GCM-SHA256",
		"ECDHE-RSA-AES256-GCM-SHA384",
		"ECDHE-ECDSA-AES256-GCM-SHA384",
		"DHE-RSA-AES128-GCM-SHA256",
		"ECDHE-RSA-AES128-SHA256",
		"DHE-RSA-AES128-SHA256",
		"ECDHE-RSA-AES256-SHA384",
		"DHE-RSA-AES256-SHA384",
		"ECDHE-RSA-AES256-SHA256",
		"DHE-RSA-AES256-SHA256",		
		"HIGH",
		"!aNULL",
		"!eNULL",
		"!EXPORT",
		"!DES",
		"!RC4",
		"!MD5",
		"!PSK",
		"!SRP",
		"!CAMELLIA"].join(':'),
	honorCipherOrder: true
	//secureProtocol: "TLSv1_method"
};
//Bootstrap db connection
//var db = mongoose.connect(config.db);

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } }; 
mongoose.Promise = global.Promise;      
mongoose.connect(config.db, options);
var db = mongoose.connection;             
 
 
 
db.on('error', console.error.bind(console, 'connection error:'));  


/*var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/marlindb', function (err, db) {
  if (err) throw err;

  db.collection('users').find().toArray(function (err, result) {
    if (err) throw err;

    console.log(result);
  });
});*/
// initialize and configure the emailer
//var emailer = require('./config/emails');

// accesss control!
// Load library
var Acl = require("virgen-acl").Acl,
    acl = new Acl();
var path = require("path")
//Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
});


//bootstrap passport config
require('./config/passport')(passport, config);

var app = express();

// @todo verify this practice is OK and best. This gives us easy access to emailer without having to 
//       inject it into every controller and router
// @note this is shared accross the app, see caution notes below.
//app.emailer = emailer;

// easy access to config variables. Locals are shared across the app. 
// @note since this is stored within the app, every req has access to it. 
//       so, we'd want to avoid setting something like: app.locals.userName = 'Matt'
//       But, saving app.locals.siteName = 'Site' is OK>
app.locals.config = config;

var auth = require('./config/middlewares/authorization');
var public_api = require('./config/middlewares/public_api');

//Define user roles
require('./config/acl_roles')(app, config, passport, acl);

//express settings
require('./config/express')(app, config, passport, acl, standardReponse);

//Bootstrap routes
var routes = require('./config/routes')(app, passport, auth, config, acl, public_api);
app.use('/',routes);
app.use(router); 

//app.use();

//Start the app by listening on <port>
var port = process.env.PORT || 9000;
config.port = port; // store for later because we cant get port fro req. object :(
//var ip = '127.0.0.1';
//ip = '10.1.10.100';

 var Agenda = require("agenda");
	
	
	var mongoConnectionString = 'mongodb://localhost:27017/newmarlin';

var agenda = new Agenda({db: {address: mongoConnectionString}});
var resdata = [];

db.once('open', function(err) { 
  if(err) throw err;
  http.createServer(app).listen(80, function () {
	  
	/* db.collection('agendaJobs').update({
  lockedAt: {
    $exists: true
  }
}, {
  $set: {
    lockedAt: null
  }
}, function(e, numUnlocked) {
  if (e) {
    console.log(e);
  }
  return console.log(`Unlocked ${numUnlocked} jobs.`);
}); */



	
/* var jobTypes;

 db.collection('agendaJobs').find({}).toArray(function (err, result) {
    if (err) throw err;
    //console.log("resul"+result);
	
	result.forEach(function(dat) {
    
	agenda.define(dat.name);
});
	
	
	
  
  });
  
  
var agenn = function(dtat) {
	console.log(dtat);
} */
  
  
  
  
  
  
  
  
  
	 //console.log("resdatalengths"+datay);
	  
	  /*  for(var i=0;i<datay.length;i++)
	 {
		var repint = datay[i].repeatInterval;
		var some = datay[i].name;
		agenda.define(some, function(job,done) {
		console.log(" Run at " + new Date().getMinutes() + ":" + new Date().getSeconds() + "name "+datay[i].name);
		done();
		});
		agenda.every(repint, some);
		agenda.start(); 

	 } */
	  
	  
	  
	  
	  
	  
	  
	  
	  
	  
	  
   console.log('HTTP server started on port : 80');
  });
 /*  https.createServer(opt, app).listen(port, function () {
   console.log('HTTPS server started on port : ' + port);
  }); */
  app.listen(port);
  //console.log('Express app started on port ' + port);
});
//Initializing logger 
logger.init(app, passport, mongoose);

// Initialize emailer
// @note emailer will be accessiable using app.emailer
//emailer.init(app, config.email);

//expose app
exports = module.exports = app;
