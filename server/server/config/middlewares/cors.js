module.exports = function(corsConfig) {

    // set defaults
    var defaultMethods = 'GET,HEAD,PUT,POST,DELETE';

    // provide middleware
    return function(req, res, next) {

        // check for whitelist config
        if (!corsConfig.whitelist) {
            throw new Error('Must provide acceptiable origins for this request. Check config.whitelist which should be an array');
        }

        // check for user set methods
        // set default if not present
        if (!corsConfig.methods) {
            corsConfig.methods = defaultMethods;
        }

        // turn METHODS into a string if needed
        if (corsConfig.methods.join) {
            // .methods is an array, so turn it into a string
            methods = corsConfig.methods.join(',');
        } else {
            // methods is just a string, use as is
            methods = corsConfig.methods;
        }

        // for the public api, lets limit the cors to POST and GET
        console.log('Request origin is %s', req.header('Origin'));

        // next we check if origin is in our array of allowed origins
        if (corsConfig.whitelist.indexOf('*') !== -1) {

            res.header('Access-Control-Allow-Origin', req.header('Origin'));
            res.header('Access-Control-Allow-Methods', corsConfig.methods);
            next();

            // included in whitelist    
        } else if (corsConfig.whitelist.indexOf(req.header('Origin')) !== -1) {

            res.header('Access-Control-Allow-Origin', req.header('Origin'));
            res.header('Access-Control-Allow-Methods', corsConfig.methods);
            next();

            // not included    
        } else {

            return res.failure('This origin is blocked', 401);

        }

    };
};
