var express = require('express');
var router = express.Router();
var path = require('path');
var http = require('http');

var async = require('async');
var fs = require('fs');

var mysql=require('mysql');
var connectionString = require('../connection_string')(process.env.NODE_ENV);

console.log(process.env.NODE_ENV);
console.log(connectionString);

console.log("Start BlackList");

router.get('/', function(req, res, next){
	console.log(req.baseUrl);
	console.log(req.orignalUrl);
	console.log(req.path);
});

router.get('/reg', function(req, res, next) {
	console.log("Requst Register BlackList IP " + req.query['blacklist']);
	if(!req.query['blacklist']){
		console.log("blacklist is null!" + req.query['blacklist']);
		res.redirect('/xpromo');
	} else {
		console.log("blacklist is not null!" + req.query['blacklist']);
		var conn=mysql.createConnection(connectionString);
		var query = "insert into dom_pc_blacklists (clientIp) value ('" + req.query['blacklist'] + "')";
	
		conn.query(query, function(err, rows, fields){
			if(err) console.error(err);
			else console.log("Success Insert");
			conn.end();
			res.redirect('/xpromo');
		});
	}
});

router.get('/del', function(req, res, next) {
	console.log("Request Delete BlackList IP "+ req.query['blacklistdel']);
	if(!req.query['blacklistdel']){
		console.log("blacklistdel is null!" + req.query['blacklistdel']);
		res.redirect('/xpromo');
	} else {
		var conn=mysql.createConnection(connectionString);
		console.log("blacklistdel is not null " + req.query['blacklistdel']);
		var query = "delete from dom_pc_blacklists where clientIp = '" + req.query['blacklistdel'] + "'";
		conn.query(query, function(err, rows, fields){
			if(err) console.error(err);
			else console.log("Success Delete");
			conn.end();
			res.redirect('/xpromo');
		});	
	}
});


module.exports = router;