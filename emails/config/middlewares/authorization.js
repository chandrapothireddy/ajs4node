/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    /*
    console.log('CHECKING IF request is authenticated');
    console.log(req.roles);
    
    if (req.roles && !req.roles.isAuthenticated) {
        
        var responseObj = {
            meta: {
                status: 'error',
                message: 'Not authorized, please login to continue.'
            }
        }
        
        return res.json(responseObj, 401);
    }
    next();
*/
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.redirect('/users/' + req.profile.id);
        }
        next();
    }
};

/**
 * Article authorizations routing middleware
 */
exports.article = {
    hasAuthorization: function(req, res, next) {
        if (req.article.user.id != req.user.id) {
            return res.redirect('/articles/' + req.article.id);
        }
        next();
    }
};
