/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
    _ = require('lodash'),
    numeral = require('numeral');

var customNameSchema = new Schema({
    type: Schema.ObjectId,
    displayName: String
});

var defaultTerms = 'Financing is for equipment that is to be used solely for business purposes, and is calculated using two (2) payments in advance (10% for the 10% Security Deposit purchase option) held as a Security Deposit. Quoted payments do not include Taxes or Insurance. Quotes are subject to credit approval by Marlin Leasing Corporation and may change without notice. Rates are for companies in business 2+ years. Programs available for newer businesses. Please call for rates over $50,000.';


/**
 * Vendor Schema
 * @todo refactor tools to be use slug as keys? is this possible?
 */
var VendorSchema = new Schema({
    autoIndex: false,
    "created": {
        type: Date,
        "default": Date.now
    },
    "searchString": {
        type: String,
        "default": ''
    },
    "name": {
        type: String,
        "default": '',
        trim: true
    },
    "slug": {
        type: String,
        "default": '',
        trim: true,
        index: true
    },
    "contactPerson": {
        "name": {
            type: String,
            "default": '',
            trim: true
        },
        "email": {
            type: String,
            "default": '',
            trim: true
        },
        "phone": {
            type: String,
            "default": '',
            trim: true
        }
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
    "logo": {
        "original": {
            type: String,
            "default": '',
            trim: true
        }
    },
    "website": {
        type: String,
        "default": '',
        trim: true
    },
    "legalTerms": {
        type: String,
        "default": '',
        trim: true
    },
    "whiteLabel": {
        type: Boolean,
        "default": false,
        trim: true
    },
    "businessPhone": {
        type: String,
        "default": '',
        trim: true
    },
    "range": {},
    "businessAddress": {
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
    },
    "geo": {
        "latitude": {
            type: Number,
            "default": null
        },
        "longitude": {
            type: Number,
            "default": null
        }
    },
    "tools": {
        'locator': {
            'enabled': {
                type: Boolean,
                "default": false
            },
            'display': String
        },
        'quoter': {
            'enabled': {
                type: Boolean,
                "default": false
            },
            'display': String
        },
        'api': {
            'enabled': {
                type: Boolean,
                "default": false
            },
            'display': String
        }
    },
    "programs": [{
        type: Schema.ObjectId,
        ref: 'Program'
    }],
    "programCustomNames": [customNameSchema],
    "customField": {
        required: {
            type: Boolean,
            "default": false
        },
        enabled: {
            type: Boolean,
            "default": false
        },
        displayName: {
            type: String,
            "default": '',
            trim: true
        }
    },
    "apiKey": {
        type: String,
        "default": null,
        index: true
    },
    "creditEmailAddress": {
        type: String,
        "default": '',
        trim: true
    }
});

/* var troop = require('mongoose-troop');
VendorSchema.plugin(troop.merge); */

 var troop = require('mongoose-merge-plugin');
VendorSchema.plugin(troop); 

var taggable = require('mongoose-taggable');
VendorSchema.plugin(taggable, {
    'path': 'tags'
});
VendorSchema.plugin(taggable, {
    'path': 'industryTags'
});

/**
 * Statics
 */
VendorSchema.statics = {

    // this gets called when a vendorId is present in the req.params
    // its a clever way to be able to access req.vendor in the next middlewares
    //
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('programs salesRep vendorRep').exec(cb);
    }
};

/**
 * Runs similar to "after get" callback
 *
 */
VendorSchema.pre('init', function(next, data) {

    // iterate through each program and replace its name with custom name if set
    // @todo not the most effecient
    // attempts to just "merge" the 2 datasets failed, and replaced all the props
    // of programs with custom name
    _.each(data.programs, function(item) {
        var customName = _.filter(data.programCustomNames, {
            _id: item._id
        });
        item.displayName = customName.length ? customName[0].displayName : null;
    });

    next();
});

function convertToSlug(Text) {
    return Text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w\-]+/g, '');
}

/**
 * Runs similar to "after get" callback
 *
 */
VendorSchema.post('init', function() {

    // set display name for tools
    // seems silly to save this within the vendor
    // however the model objects needs these props anyway for it to work
    // so its redundent then to set here. 
    if (this.tools) {
        this.tools.locator.display = 'Vendor Locator';
        this.tools.quoter.display = 'Quoter';
        this.tools.api.display = 'API';
    }

    if (!this.legalTerms || this.legalTerms === '') {
        this.legalTerms = defaultTerms;
    }

});


/**
 * ----------------------------------------
 * Formats and rounds currecny
 * ----------------------------------------
 */
var formatPayment = function(payment) {

    return numeral(payment).format('$0,0.00');

};

// function that returns high and low program value given an array of program object
// 
var getProgramRange = function(programs) {

    var sheets = _.map(programs, 'rateSheet');

    var range = {};
    response = {};

    _.each(sheets, function(item) {
        _.each(item.buyoutOptions, function(item) {
            var costs = item.costs;
            range.min = _.min(_.map(costs, 'min'));
            range.max = _.max(_.map(costs, 'max'));
        });
    });

    _.each(range, function(item, key) {

        response[key] = {
            display: formatPayment(item / 100),
            value: item / 100
        };

    });

    return response;
};



VendorSchema.pre('save', function(next) {

    /**
     * Process tags from dashboard
     * --------------------------------
     *
     * @note tags are sent as vendorTags which are then saved into vendor.tags
     * @todo refactor with fulltext mondules that @pickle was looking into
     * @note when calling addTag() and removeTag() without a callback, it happens in memory
     *       only and thus will not be refrected in vendor.tags until vendor.save() is complete
     *
     */
    var vendor = this;
    vendor.searchString = '';

    // the tags that are present on the vendor model
    var tagTypes = {
        'tags': 'vendorTags',
        'industryTags': 'vendorIndustryTags'
    };

    _.each(tagTypes, function(type, path) {

        var vendorTags = [];
        var newTags = [];
        var removeTags = [];

        // create a unified array of current vendor tags
        // from dashboard
        if (vendor[type]) {

            _.each(vendor[type], function(item) {
                vendorTags.push(item.text);
            });

            // from seed data
        } else {

            _.each(vendor[path], function(item) {
                vendorTags.push(item);
            });

        }


        newTags = _.difference(vendorTags, vendor[path]);
        removeTags = _.difference(vendor[path], vendorTags);

        _.each(removeTags, function(item) {
            vendor[path] = _.chain(vendor[path]).map(function(tag) {
                if (!_.contains(removeTags, tag)) {
                    return tag;
                }
            }).compact().value();
        });

        _.each(newTags, function(item) {
            vendor[path].push(item);
        });

        /**
         * A nice way to create a search string that we can use on the dealer locator
         * --------------------------------
         *
         * @todo refactor with fulltext mondules that @pickle was looking into
         *       with a fultext search in place, we could just send tag searches as get queries
         *       and let the server do all the work.
         *
         */

        // will be present when updating from dashboard
        if (vendor[type]) {
            _.each(vendor[type], function(tag) {
                vendor.searchString += tag.text + ' ';
            });

            // on seed data
        } else {
            _.each(vendor[path], function(tag) {
                vendor.searchString += tag + ' ';
            });
        }
    });

    /**
     * Standardize tool slugs
     *
     */
    /*
    _.each(vendor.tools, function(item) {
        item.slug = convertToSlug(item.name);
    });
*/

    /**
     * Always generate an API key even if a vendor is not using it currently
     *
     * @todo in the future we should have a function to recreate an API key if admin needs to
     *
     */
    if (!this.apiKey || this.apiKey === '') {
        var key = require('node-uuid')();
        this.apiKey = key;
    }


    // find a range, min and max value, for this program
    // we'll use this to quickly check if a quote value is within range
    //

    if (vendor.programs) {

        mongoose.models.Program
            .find({
                _id: {
                    $in: vendor.programs
                }
            })
            .exec(function(err, data) {

                if (data) {
                    vendor.range = getProgramRange(data);
                }

                next();

            });

    } else {
        next();
    }

    // check for http:// prefixed to website and if not add it
    if (vendor.website) {
        if (!vendor.website.match(/^[a-zA-Z]+:\/\//)) {
            vendor.website = 'http://' + vendor.website;
        }
    }

    // generate a slug from the vendor name
    // we use this to create unique URL for their dealer locator
    //
    if (!vendor.slug) vendor.slug = vendor.name;

    // sluggify it! 
    vendor.slug = convertToSlug(vendor.slug);


});

VendorSchema.statics = {

    getCurrentReps: function(vendorId, cb) {

        // attempt to get the sales rep, which we save with the quote
        // for easy geting from the database 
        return this.findOne({
            _id: vendorId
        }).populate('vendorRep').exec(function(err, result) {
            if (err) return cb(err);
            if (result && result._id) {
                return cb(null, result);
            } else {
                return cb(new Error(vendorId + ' is Not a valid vendor id'));
            }
        });
    },
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).populate('programs salesRep vendorRep').exec(cb);
    }
};

mongoose.model('Vendor', VendorSchema);
