var express = require('express');
var configs = require('config');
//...
var dbConfig = configs.get('example.configs');
console.log("process.env.NODE_ENV"+process.env.NODE_ENV);

console.log("host "+dbConfig.host);

console.log("port "+dbConfig.port);

console.log("dbName "+dbConfig.db);
console.log("protocol "+dbConfig.protocol);
	
	console.log("secureProtocol "+dbConfig.secureProtocol);
	console.log("siteUrl "+dbConfig.siteUrl);

if (configs.has('optionalFeature.detail')) {
  //var detail = config.get('optionalFeature.detail');
  //...
}
var app = express();


	
//$  export NODE_ENV=uit
