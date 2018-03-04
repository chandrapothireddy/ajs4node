/**
 * Module dependencies.
 */
var express = require('express'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    path = require('path'),
    helpers = require('view-helpers'),
    env = process.env.NODE_ENV || 'development',
    fs = require('graceful-fs'),
    cors = require('cors');

var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
//var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var helmet = require('helmet');

var ONE_YEAR = 31536000000;


module.exports = function(app, config, passport, acl,standardReponse) {

       var router = express.Router();
	 // Middleware to force https:// on non-secure requests
    // -------------
    // @note we ignore this redirect on development, since it's tricky to setup SSL with localhost
    //       This means on testing we might need to accept a self signed SSL
    // 
	
	 app.enable('trust proxy');
	app.use(helmet.hsts({
    maxAge: ONE_YEAR,
    includeSubdomains: true,
    force: true
}));
    app.set('showStackError', true);
	
    var requireHTTPS = function(req, res, next) {

        if (req.protocol !== 'https' && env !== 'development') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        next();
    };
    // cache buster! 
    // @todo this would typically be inplimented with eTag, which would check for new versions of content
    // else serve the cached content. 
    var cacheBuster = function(req, res, next) {

        // do cache fonts because not caching them causes problems with older
        // IE on SSL connections. 
        if (req.url.indexOf("/font/") !== -1) {

            res.setHeader("Cache-Control", "public, max-age=345600"); // 4 days
            res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());

            // don't cache any api content
        } else {

            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);

        }
        next();

    };
    // Basic CORS middleware example
    // @todo make this more robust. We should only allow POST and PUT for subdomains
    // and allow all for out private api requests. 
    //
    // @note we needed to add this to allow quoter subdomains to work, 
    // such as: http://bearcom-operating-llc.127.0.0.1:3000/
    // because technically this is on another domain (the subdomain part) 
    //
    var corsOptions = {
        origin: '*'
    };
	var auth = require('../config/middlewares/authorization');
    var public_api = require('../config/middlewares/public_api');
    var Acl = require("virgen-acl").Acl;
	var routes = require('../config/routes')(app, passport, auth, config, acl, public_api);
    //Should be placed before express.static
    app.use(compression({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    app.use(requireHTTPS);
   // @todo isolate to api routes...
    app.use(cacheBuster);
    app.use(cors(corsOptions));
  // standardize our API response with meta, result json. 
    app.use(standardReponse.middleware());
 //Setting the fav icon and static folder
    //app.use(express.favicon());
    app.use(express.static(config.root + '/public'));
 // PORT from genesis
    //app.use(express.static(config.root + '/build'));
    app.use("/downloads", express.static(config.root + '/tmp'));
    app.use(express.static(path.join(__dirname, '../../build')));
    //app.use("/downloads", express.static(path.join(__dirname, '../../tmp')));

    // end port
 //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }

    //Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');
    //app.set('views', __dirname + '/views');

    //Enable jsonp
    app.enable("jsonp callback");
	console.log("In express");
        //cookieParser should be above session
       // app.use(cookieParser());

        //bodyParser should be above methodOverride
        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(bodyParser.json());

        app.use(methodOverride());

        //express/mongo session storage
        app.use(session({
            secret: 'MEAN',
            resave: true,
            saveUninitialized: true,
			cookie: {maxAge:500},
            store: new mongoStore({
                url: config.db,
                collection: 'newsessions'
            })
        }));
		

        //connect flash for flash messages
        // @todo remove and test, remove instance where flash messages are set..
        app.use(flash());

        //dynamic helpers
        app.use(helpers(config.app.name));

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());
		
			 
		 app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.use(bodyParser.json());
             app.use('/',routes);
        app.use(router); 
	  
        app.use(errorHandler());

        // welcome message for API
        app.all('/api', function(req, res, next) {
            res.send('Hello world!');
        });

        app.all('/api/ping', function(req, res, next) {
            res.send('PONG');
        });

        // get changelog
        // @todo make seperate mean resource? Or, all projects should have this so leave in place? 
        router.get('/api/changelog', function(req, res) {
            var clog = path.join(config.root, '../changelog.md');
            res.send(fs.readFileSync(clog));
        });

        // Standardize error responses
        app.use(standardReponse.errorResponse());
	
       //app.configure(function() {
      if ('development' === env) {
        /**
         * catch all for api endpoints
         * that are not offical. They get a not found response
         *
         * @note that by putting app.all() inside app.use() we ensure its run after
         *       the regular routing. if we just called app.all() it would override all the other routes.
         *
         */
       app.use(function(req, res, next) {
            router.all('/api*', function(req, res, next) {
			     console.log("I am in app.all function");
                return res.failure('Resource not found', 404);
                
            });
               next(); // needed or the calls below will never happen
        });

        /**
         * --------------------------------------------
         * Load an external url site and return the html
         * --------------------------------------------
         *
         */

        var request = require('request');
        // https://github.com/mikeal/request

        var getExternalSite = function(url, callback) {
            request.get(url, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    return callback(null, body);
                }
                return callback(error);
            });
        };

        var maskWithLeaseRepPage = function(req, res) {
            getExternalSite('https://www.marlinfinance.com/leaserep/index.html', function(error, html) {
                html = html.replace(/\="(css|images|js)/g, '="https://www.marlinfinance.com/leaserep/$1');
                res.send(html);
            });
        };

        router.get('/welcome', maskWithLeaseRepPage);

        // ------------------------------
        // END
        // ------------------------------


        // send all non-api requests to our main index.html page, which starts our app
        // this is a nice way to support non hash links on single page apps... and why we started using
        // angular and genesis in the first place <3
        app.use(function(req, res, next) {
            router.get('*', function(req, res, next) {
                res.redirect('/#' + req.url);
           });
        });

    }
};
