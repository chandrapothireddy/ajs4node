/**
 * This file is where we define all the emails the system sends.
 * - Each function can be accessed in our app controllers by calling `req.app.emailer.sendFuntionName(req, item)`
 * - The function should then handle all logic, formatting, setting variables, etc.
 * - Finally the function should call `req.app.emailer.send('path/to-email', locals);`
 *   where `path/to-email` is a path to a template folder and `locals` is an object
 *   with to, from, subject and other variables as required by the template
 *
 */
var mongoose = require('mongoose'),
    Quote = mongoose.model('Quote'),
    Vendor = mongoose.model('Vendor'),
    Application = mongoose.model('Application'),
    User = mongoose.model('User'),
    moment = require('moment'),
    formatFactory = require('format-number'),
	ejs = require('ejs'),
    url = require('url');
    var nodemailer = require('nodemailer');
	var smtpTransport = require('nodemailer-smtp-transport');
	var EmailTemplate = require('email-templates').EmailTemplate;

	var transporter = nodemailer.createTransport(smtpTransport({
    host: "172.16.10.176",
    port: 25
}));

	// our formatting for moment.js
var dateTimeFormat = "dddd, MMMM Do YYYY, h:mm:ss a";

// our number formatting function
var format = formatFactory({
    prefix: '$'
});

// fallback addres in cases where salesRep or vendorRep email is not set. 
//var fallbackAddress = 'marketing@marlinfinance.com';
var fallbackAddress = 'pothireddy.b@hcl.com,jyothirmayi.k@hcl.com';

// format SS number
var formatSocial = function(social) {
    if (!social) return;
    social = social.replace(/[^0-9]/g, '');
    social = social.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
    return social;
};

// function to check for missing resource association, for example
// salesRep or VendorRep, returns false if anything is missing
// @todo this would be more robust if we just got a default sentTo user
//       for the database and sent email to them
var checkForMissingAssociations = function(type, resource) {

    if (!resource.salesRep) {
        // @todo send a default email to system admin!
        console.warn('A %s was generated for a vendor with no Marlin Sales Rep', type);
        resource.salesRep = new User();
    }

    if (!resource.salesRep.email) {
        console.warn('A %s was generated for Sales Rep %s who has no email, ', type, resource.salesRep.fullname);
        resource.salesRep.email = fallbackAddress;
    }

    if (!resource.vendorRep) {
        // @todo send a default email to system admin!
        console.warn('A %s was generated for a vendor with no Vendor Rep', type);
        resource.vendorRep = new User();
    }

    if (!resource.vendorRep.email) {
        console.warn('A %s was generated for Vendor Rep %s who has no email, ', type, resource.vendorRep.fullname);
        resource.vendorRep.email = fallbackAddress;
    }

    return resource;

};

// ---------------------------------------
// 
// NEW QUOTE
//
// ---------------------------------------

// sent to end user   
exports.newQuoteEndUser = function(req, quote) {

    // check for valid email
    // @todo this check is in the email.js module, but it throws an error. Should 
    // we change that and eliminate the check here? 
    if (!quote.company.contactPerson.email) return false;

    // checks for missing emails and replaces with fallbacks to prenvet 
    // notifications for going un heard.
    quote = checkForMissingAssociations('quote', quote);

    var vendorName = quote.vendorId.name || '';
	var newquoteenduser = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/quotes/new-endUser'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  newquoteenduser({
  to : quote.company.contactPerson.email, 
     subject: 'Your Quote'
    }, 
    {
    link: quote.quoterToolLink, // a virtual property of quote model
    fullName: quote.company.contactPerson.name
    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 

};


// sent to sales rep on new quote
exports.newQuoteSalesRep = function(req, quote) {

    // checks for missing emails and replaces with fallbacks to prenvet 
    // notifications for going un heard.
    quote = checkForMissingAssociations('quote', quote);
var newquotesalesrep = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/quotes/new-salesRep'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  newquotesalesrep({
to : quote.salesRep.email, 
     subject: 'A quote was generated'
    }, 
    {
           link: quote.dashboardLink, // a virtual property of quote model
            dateTime: moment(quote.created).format(dateTimeFormat),

            vendorName: quote.vendorId.name,
            salesRepName: quote.salesRep.fullname || "Sales Rep",

            quoteCompany: quote.company.fullLegalBusinessName,
            quoteMethod: quote.company.contactPerson.contactMethod,
            quoteContact: quote.company.contactPerson.name,
            quotePhone: quote.company.contactPerson.phone,
            quoteEmail: quote.company.contactPerson.email,
            quoteAmount: format(quote.totalCost),
            quoteDesc: quote.description
    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 
};


// sent to vendor rep on new quote
exports.newQuoteVendorRep = function(req, quote) {

    // checks for missing emails and replaces with fallbacks to prenvet 
    // notifications for going un heard.
    quote = checkForMissingAssociations('quote', quote);
var newquotevendorrep = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/quotes/new-salesRep'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  newquotevendorrep({
to : quote.vendorRep.email, 
     subject: 'A quote was generated'
    }, 
    {
           link: quote.dashboardLink, // a virtual property of quote model
            dateTime: moment(quote.created).format(dateTimeFormat),

            vendorName: quote.vendorId.name,
            salesRepName: quote.salesRep.fullname || "Sales Rep",

            quoteCompany: quote.company.fullLegalBusinessName,
            quoteMethod: quote.company.contactPerson.contactMethod,
            quoteContact: quote.company.contactPerson.name,
            quotePhone: quote.company.contactPerson.phone,
            quoteEmail: quote.company.contactPerson.email,
            quoteAmount: format(quote.totalCost),
            quoteDesc: quote.description
    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 
};


// ---------------------------------------
// 
// NEW APPLICATION
//
// ---------------------------------------

exports.completeAppCredit = function(req, app) {

var  customFieldName = app.customField.displayName;
  var CustomFieldValue =  app.customField.value;
  if(!customFieldName)
  {
  customFieldName = "N/A";
  CustomFieldValue = "N/A";
  }else{
customFieldName = app.customField.displayName;
CustomFieldValue =  app.customField.value;

  }

    // make a call to get the vendor
    Application.findOne({
        _id: app._id
    }).populate('vendorId salesRep vendorRep').exec(function(err, app) {

        // send to the custom credit emaiil address if there is one set
        var sendTo = (app.vendorId.creditEmailAddress &&
            app.vendorId.creditEmailAddress !== '') ? app.vendorId.creditEmailAddress :
            'pothireddy.b@hcl.com,jyothirmayi.k@hcl.com';

        // checks for missing emails and replaces with fallbacks to prevent 
        // notifications for going un heard.
        app = checkForMissingAssociations('app', app);

        // format ss number
        app.guarantor.socialSecurityNumber = formatSocial(app.guarantor.socialSecurityNumber);

		var completeapp = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/apps/complete-credit'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  completeapp({ 
    to : sendTo, 
     subject: 'This Application is Complete'
    }, 
    {
    appVendorName: app.vendorId.name,
        appSalesRep: app.salesRep.fullname || "Sales Rep",
        appVendorRep: app.vendorRep.fullname || "Vendor Rep",

        appTotalCost: app.totalCostDisplay,
        appDesc: app.description,

        appCustomFieldName: app.customField.displayName,
        appCustomFieldValue: app.customField.value,

        appPaymentTerm: app.payment.term,
        appPayment: app.payment.paymentDisplay,
        appBuyoutOption: app.payment.buyoutOption,
        appBuyoutProgramName: app.payment.programName,

        appCompanyName: app.company.fullLegalBusinessName,
        appCompanyAddress1: app.company.businessAddress.address1,
        appCompanyAddress2: app.company.businessAddress.address2,
        appCompanyCity: app.company.businessAddress.city,
        appCompanyState: app.company.businessAddress.state,
        appCompanyZip: app.company.businessAddress.zip,

        appCompanySoleProp: app.soleProp,
        appCompanyYearsInBusiness: app.yearsInBusiness,

        appContactName: app.company.contactPerson.name,
        appContactEmail: app.company.contactPerson.email,
        appContactPhone: app.company.contactPerson.phone,
        appContactMethod: app.company.contactPerson.contactMethod,

        appGuarantorName: app.guarantor.contactPerson.name,

        appGuarantorContactSocial: app.guarantor.socialSecurityNumber,
        appGuarantorContactEmail: app.guarantor.contactPerson.email,
        appGuarantorContactPhone: app.guarantor.contactPerson.phone,
        appGuarantorContactAddress1: app.guarantor.homeAddress.address1,
        appGuarantorContactAddress2: app.guarantor.homeAddress.address2,
        appGuarantorContactCity: app.guarantor.homeAddress.city,
        appGuarantorContactState: app.guarantor.homeAddress.state,
        appGuarantorContactZip: app.guarantor.homeAddress.zip

    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 

    });

};

exports.newAppSalesRep = function(req, app) {

    // make a call to get the vendor
    Application.findOne({
        _id: app._id
    }).populate('vendorId salesRep vendorRep').exec(function(err, app) {

        // checks for missing emails and replaces with fallbacks to prevent 
        // notifications for going un heard.
        app = checkForMissingAssociations('app', app);

        // send to the custom credit email address if there is one set
        var sendTo = app.salesRep.email;

        // format ss number
        app.guarantor.socialSecurityNumber = formatSocial(app.guarantor.socialSecurityNumber);

        /* var locals = {
            to: {
                email: sendTo,
                fullName: app.salesRep.fullname
            },
            variables: getAppToEmailMapping(app)
        };

        req.app.emailer.send('apps/new-salesRep', locals);
 */
   var newAppsalesrep = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/apps/new-salesRep'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  newAppsalesrep({
    to : sendTo, 
     subject: 'An application was generated'
    }, 
    {
    appVendorName: app.vendorId.name,
        appSalesRep: app.salesRep.fullname || "Sales Rep",
        appVendorRep: app.vendorRep.fullname || "Vendor Rep",

        appTotalCost: app.totalCostDisplay,
        appDesc: app.description,

        appCustomFieldName: app.customField.displayName,
        appCustomFieldValue: app.customField.value,

        appPaymentTerm: app.payment.term,
        appPayment: app.payment.paymentDisplay,
        appBuyoutOption: app.payment.buyoutOption,
        appBuyoutProgramName: app.payment.programName,

        appCompanyName: app.company.fullLegalBusinessName,
        appCompanyAddress1: app.company.businessAddress.address1,
        appCompanyAddress2: app.company.businessAddress.address2,
        appCompanyCity: app.company.businessAddress.city,
        appCompanyState: app.company.businessAddress.state,
        appCompanyZip: app.company.businessAddress.zip,

        appCompanySoleProp: app.soleProp,
        appCompanyYearsInBusiness: app.yearsInBusiness,

        appContactName: app.company.contactPerson.name,
        appContactEmail: app.company.contactPerson.email,
        appContactPhone: app.company.contactPerson.phone,
        appContactMethod: app.company.contactPerson.contactMethod,

        appGuarantorName: app.guarantor.contactPerson.name,

        appGuarantorContactSocial: app.guarantor.socialSecurityNumber,
        appGuarantorContactEmail: app.guarantor.contactPerson.email,
        appGuarantorContactPhone: app.guarantor.contactPerson.phone,
        appGuarantorContactAddress1: app.guarantor.homeAddress.address1,
        appGuarantorContactAddress2: app.guarantor.homeAddress.address2,
        appGuarantorContactCity: app.guarantor.homeAddress.city,
        appGuarantorContactState: app.guarantor.homeAddress.state,
        appGuarantorContactZip: app.guarantor.homeAddress.zip

    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 
   
    });

};

exports.newAppVendorRep = function(req, app) {

    // make a call to get the vendor
    Application.findOne({
        _id: app._id
    }).populate('vendorId salesRep vendorRep').exec(function(err, app) {

        // checks for missing emails and replaces with fallbacks to prevent 
        // notifications for going un heard.
        app = checkForMissingAssociations('app', app);

        // send to the custom credit email address if there is one set
        var sendTo = app.vendorRep.email;

        // format ss number
        app.guarantor.socialSecurityNumber = formatSocial(app.guarantor.socialSecurityNumber);
   
   var newAppvendorrep = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/apps/new-vendorRep'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
  newAppvendorrep({
     to : sendTo, 
     subject: 'An application was generated'
    }, 
    {
    appVendorName: app.vendorId.name,
        appSalesRep: app.salesRep.fullname || "Sales Rep",
        appVendorRep: app.vendorRep.fullname || "Vendor Rep",

        appTotalCost: app.totalCostDisplay,
        appDesc: app.description,

        appCustomFieldName: app.customField.displayName,
        appCustomFieldValue: app.customField.value,

        appPaymentTerm: app.payment.term,
        appPayment: app.payment.paymentDisplay,
        appBuyoutOption: app.payment.buyoutOption,
        appBuyoutProgramName: app.payment.programName,

        appCompanyName: app.company.fullLegalBusinessName,
        appCompanyAddress1: app.company.businessAddress.address1,
        appCompanyAddress2: app.company.businessAddress.address2,
        appCompanyCity: app.company.businessAddress.city,
        appCompanyState: app.company.businessAddress.state,
        appCompanyZip: app.company.businessAddress.zip,

        appCompanySoleProp: app.soleProp,
        appCompanyYearsInBusiness: app.yearsInBusiness,

        appContactName: app.company.contactPerson.name,
        appContactEmail: app.company.contactPerson.email,
        appContactPhone: app.company.contactPerson.phone,
        appContactMethod: app.company.contactPerson.contactMethod,

        appGuarantorName: app.guarantor.contactPerson.name,

        appGuarantorContactSocial: app.guarantor.socialSecurityNumber,
        appGuarantorContactEmail: app.guarantor.contactPerson.email,
        appGuarantorContactPhone: app.guarantor.contactPerson.phone,
        appGuarantorContactAddress1: app.guarantor.homeAddress.address1,
        appGuarantorContactAddress2: app.guarantor.homeAddress.address2,
        appGuarantorContactCity: app.guarantor.homeAddress.city,
        appGuarantorContactState: app.guarantor.homeAddress.state,
        appGuarantorContactZip: app.guarantor.homeAddress.zip

    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('mail sent');
    }
}); 
   
    });

};

// ---------------------------------------
// 
// RESET PASSWORD EMAIL
//
// ---------------------------------------
exports.resetPassword = function(req, app) {
   console.log("transporter "+transporter);
    
    var resetpassword = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/account/password-reset'), {
    from: 'LeaseRepTest@marlinleasing.com'
});   

resetpassword({
     // to: 'jyothirmayi.k@hcl.com',
     to : req.theUser.email, 
     subject: 'Marlin Password Reset'
    }, 
    {
    fullName: req.theUser.fullname || req.theUser.name.first || "User",
    link: req.protocol + '://' + req.headers.host + "/#/login?email=" + req.theUser.email,
    password: req.theUser.password
    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('reset password mail sent');
    }
});
};



// ---------------------------------------
// 
// SEND WELCOME EMAIL TO USER
//
// ---------------------------------------
exports.sendWelcome = function(req, app) {
  console.log("transporter "+transporter);
    
    var sendwelcome = transporter.templateSender(new EmailTemplate('/root/leaserep/leaserep16/server/app/emails/account/welcome-user'), {
    from: 'LeaseRepTest@marlinleasing.com'
  }); 
 sendwelcome({
     to : req.theUser.email, 
     subject: 'Welcome to Marlin Apps'
    }, 
    {
    fullName: req.theUser.fullname || req.theUser.name.first || "User",
    link: req.protocol + '://' + req.headers.host + "/#/login?email=" + req.theUser.email,
    password: req.theUser.password
    }, 
	function(err, info){
    if(err){
       console.log('Error '+err);
    }else{
        console.log('welcome password mail sent');
    }
}); 
};
