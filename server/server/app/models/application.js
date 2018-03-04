/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;


/**
 * Sub-Schemas
 */
var noteSchema = new Schema({
    "created": {
        type: Date,
        "default": Date.now
    },
    note: String
});


/**
 * Application Schema
 */
var ApplicationSchema = new Schema({
    autoIndex: false,
    created: {
        type: Date,
        "default": Date.now
    },
    totalCost: {
        type: Number,
        required: true
    },
    totalCostDisplay: {
        type: String,
        required: true
    },
    status: {
        type: String,
        "default": 'draft',
        trim: true,
        index: true
    },
    vendorId: {
        type: Schema.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true
    },
    "salesRep": {
        type: Schema.ObjectId,
        ref: 'User',
        index: true
    },
    "vendorRep": {
        type: Schema.ObjectId,
        ref: 'User',
        index: true
    },
    description: {
        type: String,
        "default": '',
        trim: true
    },
    payments: {},
    company: {
        fullLegalBusinessName: {
            type: String,
            "default": '',
            trim: true
        },
        contactPerson: {
            name: {
                type: String,
                "default": '',
                trim: true
            },
            email: {
                type: String,
                "default": '',
                trim: true
            },
            phone: {
                type: String,
                "default": '',
                trim: true
            },
            contactMethod: {
                type: String,
                "default": '',
                trim: true
            }
        },
        businessAddress: {
            "address1": {
                type: String,
                "default": '',
                trim: true
            },
            "address2": {
                type: String,
                "default": '',
                trim: true
            },
            "city": {
                type: String,
                "default": '',
                trim: true
            },
            "state": {
                type: String,
                "default": '',
                trim: true
            },
            "zip": {
                type: String,
                "default": '',
                trim: true
            }
        }
    },
    customField: {
        displayName: String,
        value: String,
        "default": ""
    },


    // before this is direct copy of quote
    //   after this is unique to application
    //   we only copy over for posterarity
    //   in case the quote is ever deleted or 
    //   updated after the application is cretaed
    //
    // @note which status matches quote?
    // @todo change this in email too 
    yearsInBusiness: {
        type: Number
    },
    soleProp: {
        type: Boolean,
        "default": false
    },
    payment: {},
    quoteId: {
        type: Schema.ObjectId,
        ref: 'Quote',
        index: true
    },
    notes: [noteSchema],
    agreeToTerms: {
        type: Boolean,
        "default": false
    },
    guarantor: {
        socialSecurityNumber: {
            type: String,
            "default": '',
            trim: true
        },
        contactPerson: {
            name: {
                type: String,
                "default": '',
                trim: true
            },
            email: {
                type: String,
                "default": '',
                trim: true
            },
            phone: {
                type: String,
                "default": '',
                trim: true
            },
            contactMethod: {
                type: String,
                "default": '',
                trim: true
            }
        },
        homeAddress: {
            "address1": {
                type: String,
                "default": '',
                trim: true
            },
            "address2": {
                type: String,
                "default": '',
                trim: true
            },
            "city": {
                type: String,
                "default": '',
                trim: true
            },
            "state": {
                type: String,
                "default": '',
                trim: true
            },
            "zip": {
                type: String,
                "default": '',
                trim: true
            }
        }
    }

});

/**
 * Statics
 */
ApplicationSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('vendorId').exec(cb);
    }
};

// virtual fields are available anywhere on the server. 
// They are not passes over the API unless explicitly set. 
ApplicationSchema.virtual('applicationToolLink').get(function() {
    return config.siteUrl + '/tools/application/' + this._id;
});

ApplicationSchema.virtual('dashboardLink').get(function() {
    return config.siteUrl + '/dashboard/applications/' + this._id;
});

ApplicationSchema.pre('save', function(next, something) {

    var self = this;

    // attempt to get the sales rep, which we save with the quote
    // for easy geting from the database 
    mongoose.models.Vendor.getCurrentReps(self.vendorId, function(err, result) {
        if (err) {
            next();
        } else {
            self.salesRep = result.salesRep;
            self.vendorRep = result.vendorRep;
            self.vendorId = self.vendorId;
            next();
        }
    });
});


mongoose.model('Application', ApplicationSchema);
