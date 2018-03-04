var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Vendor = mongoose.model('Vendor'),
    Throttle = require('redis-throttle'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config')[env];


/**
 * Validate API key
 * -----------------------------------------
 * Validates api key by getting key from header, looking up vendor with matching key, and then
 *  saving vendorId within req.body.vendorId. This allows us to access the vendor in our quote
 *  controller.
 *
 * @todo move out of auth and into api file.
 *
 * -----
 *
 * @note we might consider saivng the vendor
 * @todo this could be a great 'api-module' for NPM, if we add throttle, access count, etc.
 * @note module could automatically add fields to mongoose model, as a plugin.
 *
 */
exports.validateApiKey = function(req, res, next) {

    // get key from the header
    var key = req.header('MARLIN-API-KEY');

    // require an API key
    if (!key) {
        return res.failure("An API key is required. Please include 'MARLIN-API-KEY' in your header.", 400);
    }

    // lookup vendor by API key
    Vendor
        .findOne({
            apiKey: key,
            'tools.api.enabled': true
        })
        .populate('programs')
        .exec(function(err, vendor) {

            // check for error or no vendor found
            if (err) return res.failure(err);
            if (!vendor) return res.failure('Not a valid API key', 400);

            // @note this should be hooked up to an api access log at some point
            console.info("%s successfully authenticated public API with key '%s'", vendor.name, vendor.apiKey);

            req.vendor = vendor;

            // save vendor for access in quote controller
            req.body.vendorId = vendor._id;

            // move on to next middleware
            next();

        });
};


/**
 * API THROTTLING using redis
 * -----------------------------------------
 *
 * This method usese a redis server to store connection counts per api key
 *
 * @note all attempts to connect are counted, even if over limit
 *
 * limits are reset as defined by `accuracy` where `span` is the time range to check
 * within. This means that a 1 minute span, with an accuracy of 10 seconds
 *
 * -----------------------------------------
 */

// load connection info from config
var connection = config.redis;
var redisConnected = false;
var pass = null;
if (!connection) {
    throw Error('REDIS connection details must be included in config.');
}

console.log(connection);

// create our Throttle
Throttle.configure(connection);

// current setting is 2 requests per minute
var rateLimit = 100;
var rateLimitMessage = 'Exceeded limit of 100 requests per minute, try again later';
var rateSpan = 1 * 60 * 1000; // 1 minute
var rateAccuracy = 1 * 60 * 1000; // 1 minute span should be divisible by accuracy

exports.throttle = function(req, res, next) {

    // api key from req.vendor
    var key = req.vendor.apiKey;

    // create throttle instance for this api key
    var throttle = new Throttle(key, {
        span: rateSpan,
        accuracy: rateAccuracy
    });

    throttle.increment(1, function(err, count) {
        if (err) throw err;

        console.info('vendor %s with api key %s has accessed api %s times within %s',
            req.vendor.name,
            throttle.key,
            count, (throttle.span / 60 / 1000) + ' mins'
        );

        if (count > rateLimit) {
            return res.failure(rateLimitMessage, 503);
        } else {
            next();
        }

    });

};
