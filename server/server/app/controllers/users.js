/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    _ = require('underscore'),
    pw = require('../helpers/passwordGenerator/passwordGenerator'),
    emailer = require('./../emails/init');

/**
 * Show login form
 */
exports.signin = function(req, res, next, passport) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.failure(info.message, 401);
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }

            req.theUser = user;
            exports.show(req, res, next);

        });
    })(req, res, next);

};


/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.send('success, you are now logged out!');
};


/**
 * Create user
 */
exports.create = function(req, res) {

    var theUser = new User(req.body);

    // generates a new random password
    theUser.password = pw.generate(15);

    theUser.save(function(err) {

        if (err) {
            res.failure(err);
        } else {
            res.send(theUser);
        }
    });

};

/**
 * Welcome a user with an email containing their password
 * @note this is exactly the same as reset password but with a different email sent
 */
exports.welcomeUser = function(req, res) {

    var theUser = req.theUser;

    // Generate a 15-character random password
    theUser.password = pw.generate(15);

    theUser.save(function(err, newUser) {
        if (err) {
            return res.failure(err);
        } else {
            emailer.sendWelcome(req, res);
            return res.send(200);
        }
    });

};


// get vendor model
var Vendor = mongoose.model('Vendor');


/**
 * Show an application
 */
exports.show = function(req, res) {

    // if the user is a vendorRep, get the id of their vendor
    // this will be useful in the app
    if (req.theUser.role === 'vendorRep') {

        Vendor.findOne({
            'vendorRep': req.theUser._id
        }).exec(function(err, vendor) {
            if (err) {
                res.send(req.theUser);
            } else {
                // add vendor reference and send res
                if (vendor && vendor._id) {
                    req.theUser.vendorId = vendor._id;
                    req.theUser.vendor = vendor;
                }
                res.send(req.theUser);
            }
        });

        // send the user right away    
    } else {
        res.send(req.theUser);
    }

};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.send(req.theUser || null);
};


/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, theUser) {
            if (err) return next(err);
            if (!theUser) return res.failure('Failed to load User ' + id);
            req.theUser = theUser;
            next();
        });
};



/**
 * Delete an user
 */
exports.destroy = function(req, res) {
    var theUser = req.theUser;

    // check for the logged in user trying to delete themselves!
    if (theUser._id.toString() == req.user._id.toString()) {

        res.failure("You can't delete yourself!", 401);

    } else {

        theUser.remove(function(err) {
            if (err) {
                res.failure(err);
            } else {
                res.send(theUser);
            }
        });
    }

};

/**
 * List of Users
 */
exports.all = function(req, res) {
    var query = req.query || {};
    var select = '';

    // limit quotes to sales rep only. 
    if (req.userHasRole('guest')) {
        select = 'email';
    }

    User.find(query).select(select).sort('-fullname').populate('programIds').exec(function(err, users) {
        if (err) {
            res.failure(err);
        } else {
            res.send(users);
        }
    });
};

exports.RoleAll = function(req, res) {
	var role = req.param('role');
	var where;
    var select = '';
	if(role !='none'){
	where = {
		'role': role
	};
	}else{
    
	where = {};
	}
    // limit quotes to sales rep only. 
    if (req.userHasRole('guest')) {
        select = 'email';
    }
	var perPage = 10;
	
    User
		.find(where)
		.select(select)
		.limit(perPage)
		.sort({'_id':-1})
		.populate('programIds')
		.exec(function(err, users) {
	
	User.count(where).exec(function(err, count) {	
        if (err) {
            res.failure(err);
        } else {
            var result={users:users,count:count};
			res.send(result);
        }
		});
    });
};

exports.pagination = function(req, res) {

var role = req.param('role');
var where;

if(role !='none'){
	where = {
		'role': role
	};
	}else{
    
	where = {};
	}
	
  var perPage = 10;
  var page = req.param('pageno') - 1;
  var skip = page * perPage;
	
	if (page <= 1) {
		skip = 0;
	}
    User
        .find(where)
		.limit(perPage)
		.skip(perPage * page)
        .sort({'_id':-1})
        .exec(function(err,users) {
           User.count(where).exec(function(err, count) {	
        if (err) {
            res.failure(err);
        } else {
            var result={users:users,count:count};
			res.send(result);
        }
		});
        });
};

exports.searchUser = function(req, res) {

 var userName = new RegExp(req.params.searchTerm, "i");
 var role = req.param('role');
 var where;
 
 if(role != 'none'){
	where = {
		'role': role,
		'fullname' :userName
	};
	}else{
    where = {
	  'fullname' :userName
	};
	}
	
  var perPage = 10;
  var page = req.param('pageno') - 1;
  var skip = page * perPage;
	
	if (page <= 1) {
		skip = 0;
	}
    User
        .find(where)
		.limit(perPage)
		.skip(perPage * page)
        .sort({'_id':-1})
        .exec(function(err,users) {
           User.count(where).exec(function(err, count) {	
        if (err) {
            res.failure(err);
        } else {
            var result={users:users,count:count};
			res.send(result);
        }
		});
        });
};

/**
 * Update a vendor
 */
exports.update = function(req, res) {
    var theUser = req.theUser;

    // we don't want anyone updating roles from here... 
    // this is because users can update them selves
    // note we should also remove other things here, like password, etc. 

    // prevents non admin users from deleting role
    if (!req.userHasRole('admin')) {
        delete req.body.role;
    }

    // prevents password from changing
    // we have a seperate controller for that
    if (req.body.password) {
        delete req.body.password;
    }

    theUser = _.extend(theUser, req.body);

    theUser.save(function(err) {
        res.send(theUser);
    });
};

/**
 * Update a user password
 *
 * @note we are not sending a confirm_password param, this should be done on the front end.
 * @todo admin should not need to confirm the password!
 *
 * @param current_password {stirng} Current password for user, we authenticate before updating
 * @param new_password {string} New password for the user
 *
 */
exports.updatePassword = function(req, res) {

    var theUser = req.theUser;

    // require new password
    // @Note we don't need to do this here because when we set the password to be req.body.new_password
    // below, even its its null there are no errors, and the model validation will handle the null value
    // Compare this to php, its soooo LEAN! no need for this: 
    //if(!req.body.new_password) {
    //return res.failure('A new password is required');
    //}

    if (theUser.authenticate(req.body.current_password)) {

        // set new password from param
        // @Note this will be set to null if non-existant
        theUser.password = req.body.new_password;

        theUser.save(function(err, newUser) {
            if (err) {
                return res.failure(err);
            } else {
                return res.send('Password updated!');
            }
        });

    } else {
        return res.failure('Current password is incorrect', 400);
    }

};

exports.resetPassword = function(req, res) {

    var theUser = req.theUser;

    // Generate a 15-character random password
    theUser.password = pw.generate(15);

    theUser.save(function(err, newUser) {
        if (err) {
            return res.failure(err);
        } else {
            emailer.resetPassword(req, res);
            return res.send(200);
        }
    });
};


/**
 * Update a user role
 * @note this will only update a user role! no other data even if its passed.
 *
 */
exports.updateRole = function(req, res) {
    var newRole = req.body.role;
    var userId = req.theUser._id;

    User.findById(userId, function(err, doc) {
        if (err) return next(err);
        doc.role = newRole;
        doc.save(function() {
            res.send(doc);
        });
    });
};
