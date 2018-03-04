/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Vendor = mongoose.model('Vendor'),
    _ = require('underscore');


/**
 * Find / query function, allows us to pass a mongodb style query over rest
 *
 * @todo change to GET!!! might require querystring module and will def require modifying angular service
 * @todo add to remaining controllers, currently only in application controller.
 *
 * @example { 'status' : 'open' } // gets all with status open
 * @example { 'status' : { '$nin' : ['open', 'archived', 'denied'] } } // gets all where status not in array
 *
 * @note these must be passed through JSON.stringify on the angular app side
 *
 */
exports.find = function(req, res, next) {

    // currently query is just request body
    var query = {};
    if (req.query.query) {
        query = JSON.parse(req.query.query);
    }
   Vendor
        .find(query)
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err);
            } else {
                res.send(vendors);
            }
        });
};

/**
 * Find vendor by id
 */
exports.vendor = function(req, res, next, id) {

    Vendor.load(id, function(err, vendor) {
        if (err) return next(err);
        if (!vendor) {
            return res.failure('No results', 404);
        }
        req.vendor = vendor;
        next();
    });
};

/**
 * Find vendor by req.body.vendorId or req.params.vendorId
 * @todo this should be able to piggy back on exports.vendor by checkig for params and body if
 *    id doesn't exist ad the 4th param. However this was not working and causing errors.
 *
 */
exports.findByBodyOrParams = function(req, res, next) {

    var id = null;

    if (req.body && req.body.vendorId) {
        id = req.body.vendorId;

        // sometimes vendorId might be an object if we've called populate('vendorId') on load
        // in this case we need to get the id only 
        if (id && id._id) id = id._id;

    } else if (req.params && req.params.vendorId) {
        id = req.params.vendorId;
    }

    if (!id) return res.failure('missing vendor id');

    Vendor.load(id, function(err, vendor) {
        if (err) return next(err);
        if (!vendor) {
            return res.failure('No results', 404);
        }
        req.vendor = vendor;
        next();
    });
};

/**
 * Create a vendor
 */
exports.create = function(req, res) {
    var vendor = new Vendor(req.body);

    vendor.save();
    res.send(vendor);
};

/**
 * Update a vendor
 */
exports.update = function(req, res) {
    var vendor = req.vendor;

    vendor = _.extend(vendor, req.body);

    vendor.save(function(err) {
        Vendor.load(vendor._id, function(err, updatedVendor) {
            if (err) return next(err);
            res.send(updatedVendor);
        });
    });
};
exports.vendorSearch = function(req, res) {

    var where = {};
    var populate = 'programIds programs salesRep vendorRep';
    var select = '';
 var vendorName = new RegExp(req.params.searchvendorTerm, "i");
    // limit quotes to sales rep only. 
    if (req.userHasRole('admin')) {
        // nothing, admin can see all!
		where = {
            'name' : vendorName
        };
    } else if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id,
			'name' : vendorName
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id,
			'name' : vendorName
        };
    } else {
		where = {
            'name' : vendorName
        };		
        populate = 'vendorRep';
        select = 'name _id logo customField geo tools tags searchString whiteLabel range website vendorRep legalTerms';
    }
	
	  var displaypage = req.param('displayperpage');
     var perPage = parseInt(displaypage);  
	 page = req.param('pageno') - 1;
	
	var skip = page * perPage;
	if (page <= 1) {
		skip = 0;
	}
	//var perPage = 10,
	
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
	Vendor
        .find(where)
        .select(select)
		.limit(perPage)
		.skip(perPage * page)
        .sort('-name')
        .populate(populate)
        .exec(function(err, vendors) {
           Vendor.count(where).exec(function(err, count) {
				if (err) {
				res.failure(err);
			} else {			
			  var result={vendors:vendors,count:count};
				res.send(result);
			}
		});
        });
};
/**
 * Delete an vendor
 */
exports.destroy = function(req, res) {
    var vendor = req.vendor;

    vendor.remove(function(err) {
        if (err) {
            res.failure(err);
        } else {
            res.send(vendor);
        }
    });
};

/**
 * Show an vendor
 */
exports.show = function(req, res) {
    res.send(req.vendor);
};

exports.pagination = function(req, res) {

    var where = {};
    var populate = 'programIds programs salesRep vendorRep';
    var select = '';

    // limit quotes to sales rep only. 
    if (req.userHasRole('admin')) {
        // nothing, admin can see all!
    } else if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
    } else {
        populate = 'vendorRep';
        select = 'name _id logo customField geo tools tags searchString whiteLabel range website vendorRep legalTerms';
    }

	
	  var displaypage = req.param('displayperpage');
var perPage = parseInt(displaypage);  
	 page = req.param('pageno') - 1;
	
	var skip = page * perPage;
	if (page <= 1) {
		skip = 0;
	}
	//var perPage = 10,
	
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
	Vendor
        .find(where)
        .select(select)
		.limit(perPage)
		.skip(perPage * page)
        .sort('-name')
        .populate(populate)
        .exec(function(err, vendors) {
           Vendor.count().exec(function(err, count) {
				if (err) {
				res.failure(err);
			} else {			
			  var result={vendors:vendors,count:count};
				res.send(result);
			}
		});
        });
};

exports.allForSalesRep = function(req, res) {

    var userId = req.user._id;

    Vendor
        .where('salesRep')
        .equals(userId)
        .find()
        .sort('-created')
        .populate('programIds programs salesRep')
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err);
            } else {
                res.send(vendors);
            }
        });
};

/**
 * List of Vendors
 */
exports.all = function(req, res) {
 
    var where = {};
    var populate = 'programIds programs salesRep vendorRep';
    var select = '';

    // limit quotes to sales rep only. 
    if (req.userHasRole('admin')) {
        // nothing, admin can see all!
    } else if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
    } else {
        populate = 'vendorRep';
        select = 'name _id logo customField geo tools tags searchString whiteLabel range website vendorRep legalTerms';
    }
   
   var displaypage = req.param('displayperpage');
var perPage = parseInt(displaypage);  
if(perPage == 1)
	{
	var skip = '';
	perPage = '';
	page = '';
	} 
   page = req.param('pageno') - 1;
    Vendor
        .find(where)
        .select(select)
		.limit(perPage)
        .sort('-created')
        .populate(populate)
        .exec(function(err, vendors) {
           Vendor.count(where).exec(function(err, count) {
				if (err) {
				
				res.failure(err);
			} else {			
			  var result={vendors:vendors,count:count};
				
				res.send(result);
			}
		});
        });
};

exports.allsearchvendor = function(req, res) {
 
    var where = {};
    var populate = 'programIds programs salesRep vendorRep';
    var select = '';
	
var vendorName = new RegExp(req.params.searchvendorTerm, "i");
    // limit quotes to sales rep only. 
    if (req.userHasRole('admin')) {
		where = {
            'name' : vendorName
        };	
        // nothing, admin can see all!
    } else if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id,
			'name' : vendorName
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id,
			'name' : vendorName
        };
    } else {
		where = {
            'name' : vendorName
        };	
        populate = 'vendorRep';
        select = 'name _id logo customField geo tools tags searchString whiteLabel range website vendorRep legalTerms';
    }
   
   
  
   
   
   var displaypage = req.param('displayperpage');
var perPage = parseInt(displaypage);  
if(perPage == 1)
	{
	var skip = '';
	perPage = '';
	page = '';
	} 
   page = req.param('pageno') - 1;
    Vendor
        .find(where)
        .select(select)
		.limit(perPage)
        .sort('-name')
        .populate(populate)
        .exec(function(err, vendors) {
           Vendor.count(where).exec(function(err, count) {
				if (err) {
				
				res.failure(err);
			} else {			
			  var result={vendors:vendors,count:count};
				
				res.send(result);
			}
		});
        });
};



/**
* Download all vendors
*/
exports.downloadall = function(req, res) {

    var where = {};
    var populate = 'programIds programs salesRep vendorRep';
    var select = '';

    // limit quotes to sales rep only. 
    if (req.userHasRole('admin')) {
        // nothing, admin can see all!
    } else if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
    } else {
        populate = 'vendorRep';
        select = 'name _id logo customField geo tools tags searchString whiteLabel range website vendorRep legalTerms';
    }
    page = req.param('pageno') - 1;
    Vendor
        .find(where)
        .select(select)
        .sort('-name')
        .populate(populate)
        .exec(function(err, vendors) {
           Vendor.count().exec(function(err, count) {
				if (err) {
				res.failure(err);
			} else {			
			  var result={vendors:vendors,count:count};
				res.send(result);
			}
		});
        });
};






/**
 * List of Vendors
 */
exports.listForUser = function(req, res) {

    var where = {};

    var id = req.params.userId;

    if (id) {
        where = {
            $or: [{
                salesRep: id
            }, {
                vendorRep: id
            }]
        };
    }

    Vendor
        .find(where)
        .sort('-name')
        .populate('programIds programs salesRep vendorRep')
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err);
            } else {
                res.send(vendors);
            }
        });
};

/**
 * List of Vendors
 */
exports.listNotForUser = function(req, res) {

    var where = {};

    var id = req.params.userId;

    if (id) {
        where = {
            $nor: [{
                salesRep: id
            }, {
                vendorRep: id
            }]
        };
    }

    Vendor
        .find(where)
        .sort('-name')
        .populate('programIds programs salesRep vendorRep')
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err);
            } else {
                res.send(vendors);
            }
        });
};


/**
 * List of Vendors
 */
exports.getAllNames = function(req, res) {
    Vendor
        .find()
        .select('_id name legalTerms')
        .sort('-created')
        .populate('programIds salesRep programs')
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err);
            } else {
                res.send(vendors);
            }
        });
};

/**
 * Get distinct vendor tags
 *
 */
exports.getDistinctTags = function(req, res) {
    Vendor.distinct(req.params.tagType, {}, function(err, result) {
        if (err) res.failure(err);
        res.send(result);
    });
};

exports.getIndustryCounts = function(req, res) {

    // create the options object
    // @see http://cookbook.mongodb.org/patterns/count_tags/ for more info
    var o = {};

    o.map = function() {
        // in this function, 'this' refers to the current document being
        // processed. Return the (gender, age) tuple using emit()

        if (!this.industryTags) return;

        var allTags = [];

        for (var index in this.industryTags) {
            if (allTags.indexOf(this.industryTags[index].toLowerCase()) === -1) {
                emit(this.industryTags[index].toLowerCase(), 1);
                allTags.push(this.industryTags[index].toLowerCase());
            }
        }

    };


    o.reduce = function(previous, current) {
        var count = 0;

        for (var index in current) {
            count += current[index];
        }

        return count;
    };

    // other options that can be specified

    // o.query = { age : { $lt : 1000 }}; // the query object
    // o.limit = 3; // max number of documents
    // o.keeptemp = true; // default is false, specifies whether to keep temp data
    // function called after reduce
    // o.scope = {}; // the scope variable exposed to map/reduce/finalize
    // o.jsMode = true; // default is false, force execution to stay in JS
    //o.verbose = true; // default is false, provide stats on the job
    //o.out =  {replace: "tags"}; 
    Vendor.mapReduce(o, function(err, results) {
       
        if (err) res.failure(err);
        res.send(results);
    });
};

exports.getVendorByIndustry = function(req, res) {

    var industry = req.params.industry || '';

    Vendor.find({
        industryTags: {
            $regex: new RegExp(industry, "i")
        }
    }).exec(function(err, vendors) {
        if (err) {
            res.failure(err);
        } else {
            res.send(vendors);
        }
    });
};

/**
 * Get programs for a vendor
 *
 */
var Program = mongoose.model('Program');

exports.getCurrentVendorPrograms = function(req, res) {
    res.send(req.vendor.programs);
};


exports.getAvailableVendorPrograms = function(req, res) {
    var theIds = _.pluck(req.vendor.programs, '_id');
    if (!theIds) theIds = [];
    Program.find().where('_id').nin(theIds).sort('-created').exec(function(err, programs) {
        if (err) {
            res.failure(err);
        } else {
            res.send(programs);
        }
    });
};


exports.getSalesRep = function(req, res) {
    res.send(req.vendor.salesRep);
};