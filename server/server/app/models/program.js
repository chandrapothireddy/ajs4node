/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

// Will add the Currency type to the Mongoose Schema types
//require('mongoose-currency').loadType(mongoose);
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;

/**
 * Program Schema
 */
var ProgramSchema = new Schema({
    autoIndex: false,
    "created": {
        type: Date,
        "default": Date.now
    },
    name: {
        type: String,
        "default": ''
    },
    publicNotes: String,
    privateNotes: String,
    displayName: String,
    rateSheet: {
        termPeriod: {
            type: String,
            "default": ''
        },
        buyoutOptions: [{
            name: {
                type: String,
                "default": ''
            },
            terms: [],
            costs: [{
                min: {
                    type: Currency,
                    "default": 0
                },
                max: {
                    type: Currency,
                    "default": 0
                },
                rates: [Number]
            }]
        }]
    }
});

/**
 * Statics
 */
ProgramSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).exec(cb);
    }
};

ProgramSchema.pre('init', function(next, data) {
    next();
});

mongoose.model('Program', ProgramSchema);
