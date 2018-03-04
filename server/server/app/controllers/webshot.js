var webshot = require('webshot');
var _ = require('underscore');
var express = require('express');
var path = require('path');
var phantom = require('phantomjs');

var join = require('path').join,
    tmpdir = '/tmp';
    

module.exports = function(app, config) {

    return {
        getWebshotFromUrl: function(req, res) {
			
            var id = req.params.quoteId;

            var url = req.quote.quoterToolLink + '/print';
			

            // timestamp appended to the quite id, so each is unique
            var time = new Date().getTime().toString();

            // create a filename from quote id, timestamp, and pdf file extension
            var fileName = id + '_' + time + '.pdf';

            // create path to file
            var file = join(__dirname, '/../../../', tmpdir, fileName);
		
			getWebshot(url,file);
			function getWebshot(url, file) {
			
				
				var options = {
				screenSize: {
					width: 1110,
					height: 768
				},
				shotSize: {
					width: 1110,
					height: 'all'
				},
				timeout: 25000,
				script: function() {
					return {
						title: document.title
					};
				},
				streamType: 'pdf',
				paperSize: {
					format: 'ledger',
					orientation: 'portrait'
				},
				phantomPATH : '/root/leaserep/leaserep16/node_modules/phantomjs-prebuilt/bin/phantomjs',
				//phantomConfig: { "ignoreSslErrors": true },
				phantomConfig: { 'ssl-protocol':'any'},
				//phantomConfig: { 'ignore-ssl-errors': 'yes','ssl-protocol':'any'},
				userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'  + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
				};
   	
				webshot(url, file, options, function(err){
				
				if(err){
				res.redirect(config.siteUrl);
				}
				if(!err){
				
				res.sendFile(file);
				
				}
				});
				

			}
           
        }
    };
};
