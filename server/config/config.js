var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost/newmarlin',
        root: rootPath,
        whitelist: ['*'],
        protocol: 'http://',
        secureProtocol: 'https://',
        //host: 'testleaserep.com',
        //port: '443',
        //siteUrl: 'https://testleaserep.com',
        redis: {
		host: 'localhost',
            port: 6379
            //auth_pass : 'Vxv9soUqzmxBEUWD',
            //host: 'pub-redis-17789.us-east-1-4.2.ec2.garantiadata.com'
        },
        email: {
            // mailcatcher settings, must have mailcatcher installed and running
            type: 'SMTP',
            settings: {
                host: "172.16.10.176",
                port: 25
            },
            templatesDir: path.join(rootPath, 'app/emails/'),
            from: {
                fullName: 'LeaseRep Test',
                email: 'LeaseRepTest@marlinleasing.com'
            },
			testingEmails: 'MGiordano@marlinleasing.com,KZiegler@marlinfinance.com,marlinloansps@hcl.com'
			//testingEmails: 'jyothirmayi.k@hcl.com,pothireddy.b@hcl.com'
        },
        app: {
            name: 'MEAN - A Modern Stack - Development'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    },
    test: {

        db: 'mongodb://facultymatt:scrapple1@ds049868.mongolab.com:49868/heroku_app18580843',
        root: rootPath,
        whitelist: ['http://marlinquoter.herokuapp.com', 'http://marlin-dev.herokuapp.com'],
        siteUrl: 'https://learningcities.com',
        redis: {
            port: 17789,
            auth_pass : 'Vxv9soUqzmxBEUWD',
            host: 'pub-redis-17789.us-east-1-4.2.ec2.garantiadata.com'
        },
        email: {
            // mailcatcher settings, must have mailcatcher installed and running
            type: 'SMTP',
            settings: {
                service: 'Mandrill',
                auth: {
                    user: "bwalsh@marlinfinance.com",
                    pass: "fyIHw6K-xAdYgs0PLjRbbA"
                }
            },
            templatesDir: path.join(rootPath, 'app/emails/'),
            from: {
                fullName: 'Leaserep',
                email: 'quote@leaserep.com'
            }
        },
        app: {
            name: 'MEAN - A Modern Stack - Production'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    },
    production: {
		//mongodb://facultymatt:scrapple1@ds049868.mongolab.com:49868/heroku_app18580843
		
        db: 'mongodb://leasere16:leasere16204562@ds059340-a0.mongolab.com:59340/heroku_app31912500',
        root: rootPath,
        whitelist: ['http://marlinquoter.herokuapp.com', 'http://leaserep16.herokuapp.com'],
        siteUrl: 'https://www.leaserep.com',
        redis: {
            port: 17789,
            auth_pass : 'Vxv9soUqzmxBEUWD',
            host: 'pub-redis-17789.us-east-1-4.2.ec2.garantiadata.com'
        },
        email: {
            // mailcatcher settings, must have mailcatcher installed and running
            type: 'SMTP',
            settings: {
                service: 'Mandrill',
                auth: {
                    user: "quote@marlinfinance.com",
                    pass: "fyIHw6K-xAdYgs0PLjRbbA"
                }
            },
            templatesDir: path.join(rootPath, 'app/emails/'),
            from: {
                fullName: 'Leaserep',
                email: 'quote@marlinfinance.com'
            }
        },
        app: {
            name: 'MEAN - A Modern Stack - Production'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        }
    }
};
