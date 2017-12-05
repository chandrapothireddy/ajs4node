/**
 * Extend res with custom response formats, that we can use in our controllers.
 * @todo more to middleware folders
 *
 */

exports.middleware = function() {

    return function(req, res, next) {
        res.ok = function(data, message) {

            // create default response object
            var resultObj = {
                meta: {
                    code: 200
                },
                result: data
            };

            // optionally add a message
            if (message) resultObj.meta.message = message;

            // respond, ending this request
            //res.json(resultObj, 200);
			res.status(200).json(resultObj);
        };

        res.failure = function(message, code) {
            code = code || 500;

            // create default template
            var responseObj = {
                meta: {
                    code: code,
                    message: message
                }
            };

            // add the message. We check if "message" key is already set
            // because in some cases, such as validation failure, a detailed message object is already 
            // returned, so we don't want message.message as part of our return

            if (typeof message === 'object' && message.message) {
                responseObj.meta = message;
                responseObj.meta.code = code;
            }

            //res.json(responseObj, code);
			res.status(code).json(responseObj);
        };

        next();
    };
};

exports.errorResponse = function() {

    return function(err, req, res, next) {

        //Log it
        console.error('ERROR');
        console.error(err);
        console.error(err.stack);

        if (err && err.msg) {
            // respond with 'bad request' ie: this will never work
            // dont try this request again!                 
            return res.failure(err.msg, 401);
        }

        if (err && err.message && ~err.message.indexOf('CastError')) {
            // respond with 'bad request' ie: this will never work
            // dont try this request again!                 
            return res.failure('Invalid object id.', 400);
        }

        //Treat as 404
        if (~err.message.indexOf('not found')) {
            console.error('NOT FOUND....!!!!'); // debug to figure out when this is happening
            return next();
        }

        //return res.failure('Error! ' + err);

        next(); // needed or the calls after will never happen
    };
};
