/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;





/**
 * Application Schema
 */
var AgendajobSchema = new Schema({});

mongoose.model('Agendajob', AgendajobSchema);
