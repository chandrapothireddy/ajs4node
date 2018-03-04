/**
 * Module to seed a database.
 *
 * @todo re-write to use async to reduce the nested function, and quit on completion
 * @todo make model loading more effecient
 *
 */

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs');

var async = require('async');


/**
 * Bootstrap our models
 * @note this is the same code as found in server.js
 *
 * @todo we can combine the models require and definintion (below) into one function.
 *
 */
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
});


// Saving in array allows us to call below in doSeed function.
// @todo make dynamic to load models automatically.
var models = {};
models.Quote = mongoose.model('Quote');


/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose');

// create database connection
var db = mongoose.connect(config.db, function() {
    console.info('Connected to ' + env + ' database!');

    doMigrate();

});

var doMigrate = function() {

    var needsMigrate = [];

    models.Quote.find().exec(function(err, quotes) {
        if (err) {
            console.log(err);
            process.exit();
        } else {
            _.each(quotes, function(item) {

                var doThis = function(callback) {

                    var payments = item.payments;

                    if (payments[0] && payments[0].programName) {
                        console.log('Looks like this is already migrated!');
                        callback(null, item);
                    } else {

                        var safeReturn = [];

                        _.each(payments, function(value, key) {
                            safeReturn.push({
                                programName: key,
                                options: value
                            });
                        });

                        item.payments = safeReturn;

                        item.save(function(err, data) {
                            console.log('Quote migrated');
                            if (err) throw (err);
                            callback(null, item);
                        });
                    }

                };

                needsMigrate.push(doThis);

            });
            async.series(needsMigrate, function() {
                process.exit();
            });
        }
    });


    // loop through resources
    // _.each(resources, function(value, key) {

    //     console.info('Registering ' + key + ' collection for migration');

    //     // loop through our resource items
    //     _.each(value, function(contents) {

    //         // carete new Mongoose object
    //         var item = new models[key](contents);

    //         // define our seed function, with references to item 
    //         var doThis = function(callback) {

    //             // save mongo object
    //             item.save(function(err, data) {
    //                 if (err) throw (err);
    //                 console.info(key + ' ' + item._id + ' created.');
    //                 // async serices will pass param whcih is callbacl
    //                 // first param is error, second is result
    //                 callback(null, item);
    //             });

    //         };

    //         // Push to our seeding function array


    //     });

    // });

    // async migration


};
