/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    Program = mongoose.model('Program'),
    _ = require('underscore');


/**
 * Find program by id
 */
exports.program = function(req, res, next, id) {

    Program.load(id, function(err, program) {
        if (err) return next(err);
        if (!program) return res.failure('Failed to load program ' + id, 404);
        req.program = program;
        next();
    });
};

/**
 * Create a program
 */
exports.create = function(req, res) {

    _.each(req.body.rateSheet.buyoutOptions, function(item) {
        _.each(item.costs, function(cost) {
            cost.min = cost.min.toString();
            cost.max = cost.max.toString();
        });
    });


    var program = new Program(req.body);

    program.save();
    res.send(program);
};

/**
 * Update a program
 */
exports.update = function(req, res) {

    var program = req.program;

    _.each(req.body.rateSheet.buyoutOptions, function(item) {
        _.each(item.costs, function(cost) {
            cost.min = cost.min.toString();
            cost.max = cost.max.toString();
        });
    });

    program = _.extend(program, req.body);

    program.save(function(err) {
        res.send(program);
    });
};

/**
 * Delete an program
 */
exports.destroy = function(req, res) {
    var program = req.program;

    program.remove(function(err) {
        if (err) {
            res.failure(err);
        } else {
            res.send(program);
        }
    });
};

/**
 * Show an program
 */
exports.show = function(req, res) {

    _.each(req.program.rateSheet.buyoutOptions, function(item) {
        _.each(item.costs, function(cost) {
            cost.min = cost.min / 100;
            cost.max = cost.max / 100;
        });
    });

    res.send(req.program);
};

/**
 * List of Programs
 */
exports.all = function(req, res) {

  var displaypage = req.params.displayperpage;
  var perPage = parseInt(displaypage);
  var page = req.params.pageno - 1;
  var skip = page * perPage;
	
	if (page <= 1) {
		skip = 0;
	}
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
    if (page <= 1) {
		skip = 0;
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortOrder;
	if(sortName != "3"){ 
	sortOrder = {'name' : sortOrderType};
	}else{
   sortOrder={'created': -1};
	}
    Program
	.find()
	.limit(perPage)
    .skip(perPage * page)
	.sort(sortOrder)
	.exec(function(err, programs) {
	
	Program.count().exec(function(err, count) {
        if (err) {
            res.failure(error);
        } else {
            var result={programs:programs,count:count};
				res.send(result);
        }
		});
    });
};


exports.programSearch = function(req, res) {

 var programName = req.params.searchTerm;
 var dataout = programName.replace(/[.]/g, '\\.');
 var searchData = dataout.replace(/[$]/g, '\\$');
 
 where = {
            'name': new RegExp(searchData, "i")
        };
  var displaypage = req.params.displayperpage;
  var perPage = parseInt(displaypage);
  var page = req.params.pageno - 1;
  var skip = page * perPage;
	
	if (page <= 1) {
		skip = 0;
	}
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
    if (page <= 1) {
		skip = 0;
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortOrder;
	if(sortName != "3"){ 
	sortOrder = {'name' : sortOrderType};
	}else{
   sortOrder={'created': -1};
	}
    Program
	    .find(where)
		.limit(perPage)
        .sort(sortOrder)
		.skip(perPage * page)
        .exec(function(err, programs) {
           Program.count(where).exec(function(err, count) {
				if (err) {
				res.failure(err);
			} else {			
			  var result={programs:programs,count:count};
				res.send(result);
			}
		});
        });
};
exports.pagination = function(req, res) {
	var displaypage = req.params.displayperpage;
  var perPage = parseInt(displaypage);
  var page = req.params.pageno - 1;
  var skip = page * perPage;
	
	if (page <= 1) {
		skip = 0;
	}
	if(perPage == 1)
	{
	skip = '';
	perPage = '';
	page = '';
	}
    if (page <= 1) {
		skip = 0;
	}
	var sortName = req.params.sortName;
	var sortOrderType = req.params.sortOrderType;
	var sortOrder;
	if(sortName != "3"){ 
	sortOrder = {'name' : sortOrderType};
	}else{
   sortOrder={'created': -1};
	}
    Program
        .find()
		.limit(perPage)
		.skip(perPage * page)
        .sort(sortOrder)
        .exec(function(err,programs) {
           Program.count().exec(function(err, count) {
				if (err) {
				res.failure(err);
			} else {			
			  var result={programs:programs,count:count};
				res.send(result);
			}
		});
        });
};


