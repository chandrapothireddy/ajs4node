/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Application = mongoose.model('Application'),
    Vendor = mongoose.model('Vendor'),
    emailer = require('./../emails/init'),
    _ = require('underscore'),
    currency = require('./../helpers/currency');

	





/**
 * Application Schema
 */

	
	
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
 
 var Agenda = require("agenda");

var mongoConnectionString = 'mongodb://localhost:27017/newmarlin';

var agenda = new Agenda({db: {address: mongoConnectionString}}); 



const humanInterval = require('human-interval');
const CronTime = require('cron').CronTime;

var parser = require('cron-parser');

var prettyCron = require('prettycron');



exports.cron = function(req, res) {


var out1 = req.body.cronM;

var data = out1.split(" ");

if(data[3]!='*')
{
var dats = data[3];
var datap = dats.split(",");
var out=[];
for(var i=0;i<datap.length;i++){
var out2=parseInt(datap[i])+1;
out.push(out2);

}



var out1 = data[0]+' '+data[1]+' '+data[2]+' '+''+' '+out+' '+data[4];
}



console.log('interval: ',prettyCron.toString(out1));
	
 programName = req.body.cronM;
 
 //var mongoConnectionString = 'mongodb://localhost/newmarlin';
 var business = programName.replace(/[?]/g, '*');
//var business = new RegExp("0 * * * * *", "i");
 var some = "job"+req.body.outdata;
 console.log("some"+some);
//agenda.database(config.db.host + ':' + config.db.port + '/' + config.db.name, 'jobs')
var i=0;
agenda.define(some, function(job,done) {
	i++;
console.log(" Run at "+i+" : " + new Date().getMinutes() + ":" + new Date().getSeconds() + "req.body.outdata"+req.body.outdata);
done();
});
agenda.every(business, some,{});
agenda.start();
res.send("ok"); 






 /* var graceful;

graceful = function() {
  return agenda.cancel({
    repeatInterval: {
      $exists: true,
      $ne: null
    }
  }, function(err, numRemoved) {
    return agenda.stop(function() {
      return process.exit(0);
    });
  });
};

graceful(); */



 
};
 
 
 
 
 
 
 
exports.find = function(req, res, next) {
var perPage = 10;
    var query = req.body;
    if (req.userHasRole('salesRep')) {
        query.salesRep = req.user._id;
    } else if (req.userHasRole('vendorRep')) {
        query.vendorRep = req.user._id;
    }
    Application
        .find(query)
		.limit(perPage)
        .populate('vendorId')
		.sort('-status -created')
        .exec(function(err, applications) {
            Application.count(query).exec(function(err, count) {
                if (err) {
                    res.failure(err);
                } else {
                    var result = {
                        applications: applications,
                        count: count
                    };
                    res.send(result);
                }
            });
        });
};


exports.paginationfind = function(req, res) {
	var queryfind = {};
	if(req.params.dashboard == "1")
	{	
		queryfind = {
                    'status': 'new'
                };
	}
	else if(req.params.dashboard == "2")
	{ 
		queryfind = {
                    'status': {
                        '$nin': ['new', 'approved', 'denied', 'complete', 'draft']
                    }
                };
	}
	 if (req.userHasRole('salesRep')) {
        queryfind.salesRep = req.user._id;
    } else if (req.userHasRole('vendorRep')) {
        queryfind.vendorRep = req.user._id;
    }
    var perPage = 10,
        page = req.params.pageno - 1;	
    Application
        .find(queryfind)
        .limit(perPage)
        .skip(perPage * page)
        .populate('vendorId')
		.sort('-status -created')
        .exec(function(err, applications) {
            Application.count(queryfind).exec(function(err, count) {
                if (err) {
                    res.failure(err);
                } else {
                    var result = {
                        applications: applications,
                        count: count
                    };
                    res.send(result);
                }
            });
        });
};

/**
 * Find application by id
 */
exports.application = function(req, res, next, id) {

    Application.load(id, function(err, application) {
        if (err) return res.failure(err);
        if (!application) return res.failure('No application was found', 404);
        req.application = application;
        next();
    });
};

/**
 * Create a application
 */
exports.create = function(req, res) {

    // format total cost toCents, supporting error callback if conversion fails
    // @todo move this into a model middleware? for now it allows us to pass same totalCost 
    // from quote (whose conversion is handled in validateQuoteRequest middleware. 
    currency.toCents(req.body.totalCost, function(err, result) {
        if (err) return res.failure(err, 400);
        req.body.totalCost = result / 100;
    });
    var application = new Application(req.body);
    application.save();
    res.send(application);

};

/**
 * Update a application
 */
exports.update = function(req, res) {
    var application = req.application;

    // format total cost toCents, supporting error callback if conversion fails
    currency.toCents(application.totalCost, function(err, result) {
        if (err) return res.failure(err, 400);
        application.totalCost = result / 100;
    });

    application = _.extend(application, req.body);

    // If application is complete check is JUST completed.
    // If so send email to credit department.
    if (application.isModified('status') && application.status === 'complete') {
        emailer.completeAppCredit(req, application);
    }

    var changeToNew = application.status === 'draft' ? true : false;

    if (changeToNew) {
        application.status = 'new';
    }

    application.save(function(err) {
        res.send(application);
        if (changeToNew) {
            // email vendor rep and sales reps
            emailer.newAppSalesRep(req, application);
            emailer.newAppVendorRep(req, application);
        }
    });
};

/**
 * Delete an application
 */
exports.destroy = function(req, res) {
    var application = req.application;

    application.remove(function(err) {
        if (err) {
            res.faulure(err);
        } else {
            res.send(application);
        }
    });
};

/**
 * Show an application
 */
exports.show = function(req, res) {
    res.send(req.application);
};

/**
 * List of Applications
 */
exports.all = function(req, res) {

    var where = {};
    var select = '';

    // limit quotes to sales rep only. 
    if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
        select = '-guarantorInfo';
    }
	 var displaypage = req.params.displayperpage;
	 var perPage = parseInt(displaypage);  
	 page = (req.params.pageno) - 1;
	
	 var skip = page * perPage;
	 /* if (page <= 1) {
		skip = 0;
	 } */
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortOrderVendor = {};
	var sortOrder = {};
	if(sortName!="3")
	{
		if(sortName == "fullLegalBusinessName")
		{	
		sortOrder = {
	'company.fullLegalBusinessName' : sortOrderType
	};
			
		}
		else if(sortName == "status")
		{
			sortOrder = {
	'status' : sortOrderType
	};
		}
		
	}
	else
	{
	sortOrder={
	'created': '-1'

	};
	}

    Application
        .find(where)
        .select(select)
        .limit(perPage)
		.populate({
            path: 'vendorId',
            select: 'name logo',
			options: { sort: sortOrderVendor }
        })
		.sort(sortOrder)
        .exec(function(err, applications) {
			// Fixed with R2 #1 and #2 changes, May 2016.
            Application.count(where).exec(function(err, count) {
                if (err) {
                    res.failure(err);
                } else {
                    var result = {
                        applications: applications,
                        count: count
                    };
                    res.send(result);
                }
            });
        });
};

// R2 #1 and #2 changes, May 2016.
exports.pagination = function(req, res) {
    var where = {};
    var select = '';
    // limit quotes to sales rep only. 
    if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
        select = '-guarantorInfo';
    }
	
   var displaypage = req.params.displayperpage;
	var perPage = parseInt(displaypage);  
	 page = req.params.pageno - 1;
	
	var skip = page * perPage;
	/* if (page <= 1) {
		skip = 0;
	} */
	
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortVendorOrder = "";
	var sortOrder = {};
	if(sortName!="3")
	{
		if(sortName == "fullLegalBusinessName")
		{		
		sortOrder = {
	'company.fullLegalBusinessName' : sortOrderType
	};		
		}		
	}
	else
	{
	sortOrder={
	'created': '-1'
	};
	}

    Application
        .find(where)
        .select(select)
        .limit(perPage)
        .skip(skip)
        .populate('vendorId', 'logo name', sortVendorOrder)
        .sort(sortOrder)
        .exec(function(err, applications) {
            Application.count(where).exec(function(err, count) {
                if (err) {
                    res.failure(err);
                } else {
                    var result = {
                        applications: applications,
                        count: count
                    };
                    res.send(result);
                }
            });
        });
};

// R2 #1 and #2 changes, May 2016.
//searching business details
exports.businessSearch = function(req, res) {

    var where = {};
    var select = '';
    var businessName = new RegExp(req.params.searchBusiness, "i");
    // limit quotes to sales rep only. 
    if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id,
            'company.fullLegalBusinessName': businessName
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id,
            'company.fullLegalBusinessName': businessName
        };
        select = '-guarantorInfo';
    } else {
        where = {
            'company.fullLegalBusinessName': businessName
        };
    }	
     var displaypage = req.params.displayperpage;
	 var perPage = parseInt(displaypage);  
	 page = req.params.pageno - 1;
	
	var skip = page * perPage;
	/* if (page <= 1) {
		skip = 0;
	} */
	//var perPage = 10,
	
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortVendorOrder = "";
	var sortOrder = {};

	if(sortName!="3")
	{
		if(sortName == "fullLegalBusinessName")
		{	
		sortOrder = {
	'company.fullLegalBusinessName' : sortOrderType
	};
				}

	}
	else
	{
	 sortOrder={
	'created': '-1'
	};
	}
    Application
        .find(where)
        .select(select)
        .limit(perPage)
        .skip(perPage * page)
        .populate('vendorId', 'logo name',sortVendorOrder)
        .sort(sortOrder)
        .exec(function(err, applications) {
            Application.count(where).exec(function(err, count) {
                if (err) {
                    res.failure(err);
                } else {
                    var result = {
                        applications: applications,
                        count: count
                    };
                    res.send(result);
                }
            });
        });
};

exports.searchBusinessVendor = function(req, res) {
    var where = {};
	var select = '';
    var vendorName = new RegExp(req.params.searchVendor, "i");
	var businessName = new RegExp(req.params.searchBusiness, "i");

    // limit quotes to sales rep only. 
    if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id,
            'company.fullLegalBusinessName': businessName
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id,
            'company.fullLegalBusinessName': businessName
        };
        select = '-guarantorInfo';
    } else {
        where = {
            'company.fullLegalBusinessName': businessName
        };
    }

     var displaypage = req.params.displayperpage;
	var perPage = parseInt(displaypage);  
	 page = req.params.pageno - 1;
	
	if(perPage == 1)
	{
	var skip = 0;
	perPage = 0;
	page = 0;
	}
	
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortVendorOrder = { sort: { _id: 1 } };
	var sortOrder = {};
	if(sortName!="3")
	{
		if(sortName == "fullLegalBusinessName")
		{	
		sortOrder = {
	'company.fullLegalBusinessName' : sortOrderType
	};		
		}
	}
	else
	{
	sortOrder={
	'created': '-1'
	};
	}
    Application
        .find(where)
		.sort(sortOrder)
		.select(select)
        .populate({
            path: 'vendorId',
            match: { name: vendorName },
            select: 'name logo',
			options: sortVendorOrder
        })
		.exec(function(err, applications) {
			if (err) {
				res.failure(err);
			} else {
				var appsMatchingVendorName = [];
				var limited = [];
				var i = 0;
				
				for(i = 0; i < applications.length; i++) {
					if(applications[i].vendorId) {
						appsMatchingVendorName.push(applications[i]);
					}
				}
				var endcount = '';
				if(perPage === 0)
				{
				endcount = appsMatchingVendorName.length;
				}
				else
				{
				endcount = perPage;
				}
				var start = perPage * page;
				var end = Math.min(((perPage * page) + endcount), appsMatchingVendorName.length);
							
				for(i = start; i < end; i++) {
					limited.push(appsMatchingVendorName[i]);
				}
				
				var result = {
					applications: limited,
					count: appsMatchingVendorName.length
				};
				res.send(result);
			}		
		});
};

// R2 #1 and #2 changes, May 2016.
//search vendors
exports.vendorSearch = function(req, res) {
    var where = {};
	var select = '';
    var vendorName = new RegExp(req.params.searchVendor, "i");

    // limit quotes to sales rep only. 
    if (req.userHasRole('salesRep')) {
        where = {
            salesRep: req.user._id
        };
    } else if (req.userHasRole('vendorRep')) {
        where = {
            vendorRep: req.user._id
        };
		select = '-guarantorInfo';
    }

      var displaypage = req.params.displayperpage;
	  var perPage = parseInt(displaypage);  
	  page = req.params.pageno - 1;
	
	var skip = page * perPage;
	/* if (page <= 1) {
		skip = 0;
	} */
	if(perPage == 1)
	{
	skip = 0;
	perPage = 0;
	page = 0;
	}

	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortVendorOrder = { sort: { _id: 1 } };
	var sortOrder = {};
	if(sortName!="3")
	{
		if(sortName == "fullLegalBusinessName")
		{
		sortOrder = {
	'company.fullLegalBusinessName' : sortOrderType
	};
			
		}
	}
	else
	{
	sortOrder={
	'created': '-1'

	};
	}
	
    Application
        .find(where)
		.select(select)
		.sort(sortOrder)
        .populate({
            path: 'vendorId',
            match: { name: vendorName },
            select: 'name logo',
			options: sortVendorOrder
        })
		.exec(function(err, applications) {
			if (err) {
				res.failure(err);
			} else {
				var appsMatchingVendorName = [];
				var limited = [];
				var i = 0;
				
				for(i = 0; i < applications.length; i++) {
					if(applications[i].vendorId) {
						appsMatchingVendorName.push(applications[i]);
					}
				}
				var endcount = '';
				if(perPage === 0)
				{
				endcount = appsMatchingVendorName.length;
				}
				else
				{
				endcount = perPage;
				}
				var start = perPage * page;
				var end = Math.min(((perPage * page) + endcount), appsMatchingVendorName.length);
							
				for(i = start; i < end; i++) {
					limited.push(appsMatchingVendorName[i]);
				}
				
				var result = {
					applications: limited,
					count: appsMatchingVendorName.length
				};
				res.send(result);
			}		
		});
};

/**
 * Get applications for a sales rep.
 *
 * @note This can be used to limit quotes when a user is logged in, or
 *       it can be used for a resource/:id/children instance (if we modify the way we get user id)
 *
 */
exports.getAllForSalesRep = function(req, res) {

    // First get all vendors for this sales rep.
    Vendor
        .where('salesRep')
        .equals(req.user._id)
        .find()
        .select('_id')
        .exec(function(err, vendors) {
            if (err) {
                res.failure(err, 500);
            } else {

                // extract the vendor ids from the results
                // this will be all vendors the user is associated with NOW! 
                // @note we don't store user ids with the quotes... because if at any point the vendor gets
                // a new sales rep, things would be out of sync. 
                var vendorIds = [];
                _.each(vendors, function(item) {
                    vendorIds.push(item._id);
                });
                getApplications(vendorIds);

            }
        });

    var getApplications = function(vendorIds) {

        Application
            .find()
            .where('vendorId')
            . in (vendorIds)
            .sort('-status -created')
            .exec(function(err, quotes) {
                if (err) {
                    res.failure(err);
                } else {
                    res.send(quotes);
                }
            });
    };
};