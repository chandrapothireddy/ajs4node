/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore'),
    authTypes = ['github', 'twitter', 'facebook', 'google'];


/**
 * User Schema
 */
var UserSchema = new Schema({
    autoIndex: false,
    name: {
        first: {
            type: String,
            "default": '',
            trim: true
        },
        last: {
            type: String,
            "default": '',
            trim: true
        }
    },
    fullname: String,
    email: {type: String, index: true, unique: true},
    username: {type: String, index: true},
    userId: String,
    provider: String,
    hashed_password: String,
    salt: String,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    roles: Array,
    vendorId: {type: String, index: true},
    vendor: Object,
    role: {
        type: String,
        "default": 'salesRep',
        trim: true,
        index: true
    },
    phoneNumber: String,
    avatar: {
        original: {
            type: String,
            "default": '',
            trim: true
        }
    },
    status: {
        type: String,
        "default": 'Active',
        trim: true
    }
});


/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
}).get(function() {
    return this._password;
});

/*
UserSchema.virtual('fullName').get(function() {
    return this.name.first + ' ' + this.name.last;
});
*/

UserSchema.virtual('fullName').set(function() {
    return this.name.first + ' ' + this.name.last;
});



/**
 * Validations
 */
var validatePresenceOf = function(value) {
    return value && value.length;
};

// the below 4 validations only apply if you are signing up traditionally
UserSchema.path('name.first').validate(function(name) {
    return name.length;
}, 'First name cannot be blank');

UserSchema.path('name.last').validate(function(name) {
    return name.length;
}, 'Last name cannot be blank');

UserSchema.path('email').validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('username').validate(function(username) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return username.length;
}, 'Username cannot be blank');
/*

UserSchema.path('hashed_password').validate(function(hashed_password) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');
*/


/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next, done) {

    this.fullname = this.name.first + ' ' + this.name.last;

    if(this.isModified('email')) {
        var self = this;
        mongoose.models.User.find({email : self.email},function(err, users) {
            if(users && users.length > 0) {
                self.invalidate("email","email must be unique");
                done(new Error("username must be unique"));
            } else {
                if (!this.isNew) return next();

                if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
                    next(new Error('Invalid password'));
                else
                    next();
            }
        });  

    } else {
        if (!this.isNew) return next();

        if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1)
            next(new Error('Invalid password'));
        else
            next();

    }

});

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    }
};

/**
 * Statics
 */
UserSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            _id: id
        }).exec(cb);
    }
};

mongoose.model('User', UserSchema);
