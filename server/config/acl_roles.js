module.exports = function(app, config, passport, acl) {


    /**
     * Middlewares which make our roles module easier to use
     *
     *
     */
    app.use(function(req, res, next) {
        req.userHasRole = function(role) {
            return req.user && req.user.role == role;
        };
        next();
    });


    /**
     * ------------
     * https://github.com/djvirgen/virgen-acl
     * ------------
     */

    // Set up roles
    acl.addRole("guest"); // guest user, inherits from no one
    acl.addRole("rep", "guest");
    acl.addRole("salesRep", "rep");
    acl.addRole("vendorRep", "rep");
    acl.addRole("admin"); // Admin inherits from no one


    // Set up resources
    acl.addResource("vendors");
    acl.addResource("quotes");
    acl.addResource("applications");
    acl.addResource("users");
    acl.addResource("programs");


    // Set up access rules (LIFO)
    // first deny all. This will protect all routes that call the middleware
    // @note using this caused issues with children inheriting permissions from parents
    //acl.deny();


    // admin can do all!  
    acl.allow("admin");


    /**
     * Guests
     * ----------
     */
    acl.allow("guest", "vendors", ["view", "list"]);
    // needed for the quoter tool to work
    acl.allow("guest", "quotes", ["view", "create", "update"]);
    acl.allow("guest", "applications", ["view", "create", "update"]);
    // @todo restrict this when quote calculation is done on the API site
    acl.allow("guest", "programs", ["view"]);

    // @todo we need this for email checking to work, but we need to refactor this 
    // because guest should not be able to list all users
    acl.allow("guest", "users", ["list"]);


    /*
     * Reps (which vendorRep and salesRep will extend)
     * ----------
     */
    acl.allow("rep", "vendors", ["update"]);
    acl.allow("rep", "quotes", ["list"]);
    acl.allow("rep", "applications", ["list"]);
    acl.allow("rep", "users", ["view", "update", "updatePassword"]);


    /**
     * vendorRep (vendors sales reps)
     * ----------
     */
    acl.allow("salesRep", "vendors", ["list"]);
    acl.allow("salesRep", "programs", ["list"]);
    //acl.allow("salesRep", "quotes");


    /**
     * Custom Assertion example
     * ----------
     */

    /*
    acl.allow("guest", "quotes", "view", function(var1, role, resource, action, result, next) {
      // Use next() if unable to determine permission based on provided arguments
      // if (!(role instanceof User) || !(resource instanceof Blog))
      // return next(); 
    
      console.log(role);
      console.log(resource);
      console.log(action);
      console.log(result);
      console.log(next);
    
      if (!resource) {
        // resource belongs to this role, allow editing
        result(null, true);
      } else {
        // resource does not belong to this role, do not allow editing
        result(null, false);
      }

    });
    */


};
