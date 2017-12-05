var async = require('async');
var util = require('util');
var express = require('express');
var session = require('express-session');
var router = express.Router();

module.exports = function(app, passport, auth, config, acl, public_api) {

    var vendors = require('../app/controllers/vendors');

    /**
     * Middleware authentication using vergin-acl
     * -------------------------
     *
     * Function accepts action and resource params. Uses req.user.role to perform a check
     * assigns quest role if no other roles exist
     *
     * @see config/acl_roles.js for roles
     *
     * @note vergin-acl doesn't support middleware out of the box, so we wrap its check in our own middleware
     *
     * @todo move to middleware... !
     *
     */
 var users = require('../app/controllers/users');
	var express = require('express');
    function isUserAllowed(action, resource) {
        return function(req, res, next) {
			if(!req.session){
				router.post('/api/v1/auth/logout', users.signout);
				
			}
			
				
            // add quest role for non-logged in users. 
            if (!req.user || !req.user.role) {
                req.user = {
                    role: 'guest'
                };
				
            }
			
            console.info(util.format('Can user role %s %s %s?', req.user.role, action, resource));

            // perform acl query on resource + action
            // responds with 401 and message if user doesn't have permissions
            acl.query(req.user.role, resource, action, function(err, allowed) {
                if (err) console.log("pothierr"+err);
                if (allowed) {
                    next();
                } else {
                    return res.failure(util.format('You are not authorized to %s %s', action, resource), 401);
                }
            });
        };
    }
	
	


    /**
     * USERS / AUTH routes
     * -------------------------
     */
   
	//var app = express();
	//var router = express.Router();
    router.post('/api/v1/auth/login', function(req, res, next) {
        // here we fun a function which calls another function... this gives us access to req, res, and next
        // however there must be a cleaner way to do this
        // @todo refactor
        users.signin(req, res, next, passport);
    });
    router.get('/api/v1/auth/logout', users.signout);
    router.post('/api/v1/auth/logout', users.signout); // makes testing easier with postman


    /**
     * USERS / GENERAL routes
     * -------------------------
     */
    //var users = require('../app/controllers/users');
	router.get('/api/v1/users', isUserAllowed('list', 'users'), users.all);
    router.get('/api/v1/users/all/:role', isUserAllowed('list', 'users'), users.RoleAll);
	
	router.get('/api/v1/users/pagination/:role/:pageno',users.pagination);
	
	router.get('/api/v1/users/searchUser/:role/:searchTerm/:pageno', isUserAllowed('list', 'users'), users.searchUser);

    router.post('/api/v1/users', isUserAllowed('create', 'users'), users.create);
    // @todo check for vendor, is this their approved sales rep?
    router.get('/api/v1/users/:userId', isUserAllowed('view', 'users'), users.show);

    // sales rep and vendor = edit their own info
    router.put('/api/v1/users/:userId', isUserAllowed('update', 'users'), users.update);
    router.delete('/api/v1/users/:userId', isUserAllowed('delete', 'users'), users.destroy);

    // update user role
    router.put('/api/v1/users/:userId/role', isUserAllowed('updateRole', 'users'), users.updateRole);

    // update user password
    router.put('/api/v1/users/:userId/password', isUserAllowed('updatePassword', 'users'), users.updatePassword);
    router.put('/api/v1/users/:userId/reset_password', users.resetPassword);

    router.get('/api/v1/users/:userId/welcome_user', isUserAllowed('sendWelcomeEmail', 'users'), users.welcomeUser);

    // get users vendors
    router.get('/api/v1/users/:userId/vendors', isUserAllowed('list', 'vendors'), vendors.listForUser);
    router.get('/api/v1/users/:userId/non_vendors', isUserAllowed('list', 'vendors'), vendors.listNotForUser);

    router.param('userId', users.user);



    /**
     * QUOTES routes
     * -------------------------
     */
    var quotes = require('../app/controllers/quotes');

    router.get('/api/v1/quotes/all/:displayperpage/:sortOrderType', isUserAllowed('list', 'quotes'), quotes.all);
    router.get('/api/v1/quotes/pagination/:pageno/:displayperpage/:sortOrderType', isUserAllowed('list', 'quotes'), quotes.pagination); // R2 #1 and #2 changes, May 2016.
    router.get('/api/v1/quotes/descriptionSearch/:searchDesc/:pageno/:displayperpage/:sortOrderType', isUserAllowed('list', 'quotes'), quotes.searchDescription); // R2 #1 and #2 changes, May 2016.
    router.get('/api/v1/quotes/vendorSearch/:searchVendor/:pageno/:displayperpage/:sortOrderType', isUserAllowed('list', 'quotes'), quotes.searchVendor); // R2 #1 and #2 changes, May 2016.
	 router.get('/api/v1/quotes/searchDescVendor/:searchDesc/:pageno/:searchVendor/:displayperpage/:sortOrderType', isUserAllowed('list', 'quotes'), quotes.searchDescVendor);
	 
    router.post('/api/v1/quotes', isUserAllowed('create', 'quotes'), function(req, res, next) {

        console.info('INTERNAL QUOTE API accessed....');
        next();

    }, vendors.findByBodyOrParams, quotes.validateQuoteRequest, quotes.createOrUpdate);
    router.get('/api/v1/quotes/:quoteId', isUserAllowed('view', 'quotes'), quotes.show);
    router.put('/api/v1/quotes/:quoteId', isUserAllowed('update', 'quotes'), vendors.findByBodyOrParams, quotes.validateQuoteRequest, quotes.update);
    router.delete('/api/v1/quotes/:quoteId', isUserAllowed('delete', 'quotes'), quotes.destroy);

    router.post('/public_api/v1/quotes', function(req, res, next) {

        console.info('PUBLIC QUOTE API accessed');
        next();

    }, public_api.validateApiKey, public_api.throttle, quotes.validateQuoteRequest, quotes.createOrUpdate);

    router.post('/public_api/v1/quotes2', function(req, res, next) {

        console.info('PUBLIC QUOTE API accessed');
        next();

    }, public_api.validateApiKey, public_api.throttle, quotes.validateQuoteRequest, quotes.createOrUpdate);


    var webshot = require('../app/controllers/webshot')(app, config);

    // @todo Adjust function when we send webshot to pdf
    // @see https://www.pivotaltracker.com/story/show/57533434
    // @note we should prob be using something like uploadfs to allow our app to send to amazon... 
    // currently we are only storing files locally. 
    router.get('/api/v1/quotes/:quoteId/download', webshot.getWebshotFromUrl);
    router.get('/quotes/:quoteId/download', webshot.getWebshotFromUrl);
    router.param('quoteId', quotes.quote);


    /**
     * APPLICATIONS routes
     * -------------------------
     */
    var applications = require('../app/controllers/applications');
    //router.get('/applications', user.is('admin'), user.is('salesRep'), user.is('vendor'), applications.all);
	router.get('/api/v1/applications/paginationfind/:dashboard/:pageno', isUserAllowed('list', 'applications'), applications.paginationfind);
    router.get('/api/v1/applications/all/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'applications'), applications.all);	
    router.get('/api/v1/applications/pagination/:pageno/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'applications'), applications.pagination); // R2 #1 and #2 changes, May 2016.
    router.get('/api/v1/applications/businessSearch/:searchBusiness/:pageno/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'applications'), applications.businessSearch); // R2 #1 and #2 changes, May 2016.
	
	
	router.get('/api/v1/applications/searchBusinessVendor/:searchBusiness/:pageno/:searchVendor/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'applications'), applications.searchBusinessVendor); 
	
	
    router.get('/api/v1/applications/vendorSearch/:searchVendor/:pageno/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'applications'), applications.vendorSearch); // R2 #1 and #2 changes, May 2016.

	
    /* router.post('/api/v1/applications/find',function(req,res){
	console.log("dashboard route success");
	console.log("count "+res.count);
   applications.find;
	}); */
	router.post('/api/v1/applications/cron', applications.cron);
    router.post('/api/v1/applications/find', applications.find);
    router.post('/api/v1/applications', isUserAllowed('create', 'applications'), applications.create);
    router.get('/api/v1/applications/:applicationId', isUserAllowed('view', 'applications'), applications.show);
    router.put('/api/v1/applications/:applicationId', isUserAllowed('update', 'applications'), applications.update);
    router.delete('/api/v1/applications/:applicationId', isUserAllowed('delete', 'applications'), applications.destroy);

    router.param('applicationId', applications.application);



    /**
     * VENDORS routes
     * -------------------------
     *
     */

    //router.get('/vendors', user.is('admin'), vendors.all);
    // show all vendors, or just users vendors based on role
	router.get('/api/v1/vendors/all/:displayperpage', isUserAllowed('list', 'vendors'), vendors.all);
    router.get('/api/v1/vendors/allsearchvendor/:displayperpage/:searchvendorTerm', isUserAllowed('list', 'vendors'), vendors.allsearchvendor);
	router.get('/api/v1/vendors/download', isUserAllowed('list', 'vendors'), vendors.downloadall);
    router.post('/api/v1/vendors', isUserAllowed('create', 'vendors'), vendors.create);
    router.get('/api/v1/vendors/find', vendors.find);
    router.get('/api/v1/vendors/pagination/:pageno/:displayperpage',vendors.pagination);
    router.get('/api/v1/vendors/tags/:tagType', vendors.getDistinctTags);
    router.get('/api/v1/vendors/industryCounts', vendors.getIndustryCounts);
    router.get('/api/v1/vendors/getVendorByIndustry/:industry', vendors.getVendorByIndustry);

    // @todo this technically works for now, but needs to be locked down with different show functions per role
    router.get('/api/v1/vendors/:vendorId', isUserAllowed('view', 'vendors'), vendors.show);
    router.put('/api/v1/vendors/:vendorId', isUserAllowed('update', 'vendors'), vendors.update);
    router.delete('/api/v1/vendors/:vendorId', isUserAllowed('delete', 'vendors'), vendors.destroy);
	router.get('/api/v1/vendors/vendorSearch/:searchvendorTerm/:pageno/:displayperpage', isUserAllowed('list', 'vendors'), vendors.vendorSearch);

    // get programs for a vendor
    // @todo replace when we get a proper children setup

    router.get('/api/v1/vendors/:vendorId/salesRep', isUserAllowed('view', 'users'), vendors.getSalesRep);
    router.get('/api/v1/vendors/:vendorId/programs', vendors.getCurrentVendorPrograms);
    router.get('/api/v1/vendors/:vendorId/available_programs', isUserAllowed('updatePrograms', 'vendors'), vendors.getAvailableVendorPrograms);

    router.param('vendorId', vendors.vendor);


    /**
     * PROGRAMS routes
     * -------------------------
     *
     * Current Rules
     * - Logged in = view all programs, view single program
     * - Admin = CRUD programs
     *
     * @todo vendors should only be able to view their programs
     *
     */
    var programs = require('../app/controllers/programs');
    router.get('/api/v1/programs/all/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'programs'), programs.all);
	//router.get('/api/v1/programs/sort/:pageno', isUserAllowed('list', 'programs'), programs.getsortAll);
	//router.get('/api/v1/programs/sort1/:pageno', isUserAllowed('list', 'programs'), programs.getsortAll1);
    router.post('/api/v1/programs', isUserAllowed('create', 'programs'), programs.create);
    router.get('/api/v1/programs/:programId', isUserAllowed('view', 'programs'), programs.show);
    router.put('/api/v1/programs/:programId', isUserAllowed('update', 'programs'), programs.update);
    router.delete('/api/v1/programs/:programId', isUserAllowed('delete', 'programs'), programs.destroy);
	router.get('/api/v1/programs/pagination/:pageno/:displayperpage/:sortName/:sortOrderType',programs.pagination);
	router.get('/api/v1/programs/programSearch/:searchTerm/:pageno/:displayperpage/:sortName/:sortOrderType', isUserAllowed('list', 'programs'), programs.programSearch);
	

    router.param('programId', programs.program);



return router;   
};