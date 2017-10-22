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

var http = require('http');

var https = require('https');

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
var port = process.env.PORT || 3000;
config.port = port; // store for later because we cant get port fro req. object :(
//var ip = '127.0.0.1';

db.once('open', function(err) { 
  if(err) throw err;
  http.createServer(app).listen(80, function () {
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
