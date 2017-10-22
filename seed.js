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
models.Application = mongoose.model('Application');
models.User = mongoose.model('User');
models.Program = mongoose.model('Program');
models.Vendor = mongoose.model('Vendor');


/**
 * Get our seed data
 * @note again this is not the most elegant, we should be doing something
 * more automated based on model files... ie: check if seed data exists then add it to our array
 *
 * @note we sould include some type of functionality to automatically pluralize / depluralize names
 * Keep in mind we might need to call in a specific order
 *
 */
var resources = {};
resources.User = require('./seed_data/user').seed();
resources.Program = require('./seed_data/program').seed();
resources.Vendor = require('./seed_data/vendor').seed();
resources.Application = require('./seed_data/application').seed();
resources.Quote = require('./seed_data/quote').seed();


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

    // Drop all our defined collections using async.
    // this prevents from dropping the whole db, which prevents us from logging back in
    // because it drops the high level users collection that mongo uses to register access
    var doDrops = [];

    // here we access the db collections
    // as defined by the database itself. 
    // this is instead of dropping the whole database, which disconnects us from mongolab
    _.each(db.connection.collections, function(collection) {

        var name = collection.name;
        console.info('Prepping ' + name + ' for dropping');

        var dropFunction = function(callback) {
            collection.drop(function(err) {
                console.info('Collection ' + name + ' dropped');
                callback();
            });
        };

        doDrops.push(dropFunction);

    });


    var closeAndReconnect = function(callback) {
        // close our connnection
        db.connection.close(function() {
            console.info('Database connection closed, re-opening now...');

            // reconnect to database
            db = mongoose.connect(config.db, function() {
                console.info('Re-connected');
                callback();
            });
        });
    };

    doDrops.push(closeAndReconnect);

    async.series(doDrops, function() {
        // call seeding function
        doSeed();
    });

});


/**
 * Function to do the actual seed. Will be called once database is dropped,
 * and the connection is closed and re-opened.
 *
 */
var doSeed = function() {

    var needsSeed = [];

    // loop through resources
    _.each(resources, function(value, key) {

        console.info('Registering ' + key + ' collection for seeding');

        // loop through our resource items
        _.each(value, function(contents) {

            // carete new Mongoose object
            var item = new models[key](contents);

            // define our seed function, with references to item 
            var doThis = function(callback) {

                // save mongo object
                item.save(function(err, data) {
                    if (err) throw (err);
                    console.info(key + ' ' + item._id + ' created.');
                    // async serices will pass param whcih is callbacl
                    // first param is error, second is result
                    callback(null, item);
                });

            };

            // Push to our seeding function array
            needsSeed.push(doThis);

        });

    });

    /**
     * Perform the seed, then exit on success
     * async.series() will run an array of functions.
     * Each should have a callback, which will be the first param
     *
     */
    async.series(needsSeed, function() {
        process.exit();
    });

};
