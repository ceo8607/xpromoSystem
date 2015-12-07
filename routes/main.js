var express = require('express');
var router = express.Router();
var http = require('http');

var async = require('async');
var fs = require('fs');
var path = require('path');

var mysql = require('mysql');

var dateformat=require('dateformat');
var now = new Date();
var datetime = dateformat(now, "yyyy-mm-dd_HH").toString();
console.log(datetime);

var json2csv=require('json2csv');
var fields=['couponName', 'couponCode', 'npsn', 'clientIp', 'updateDatetime'];

var connectionString = require('../connection_string')(process.env.NODE_ENV);

console.log(process.env.NODE_ENV);
console.log(connectionString);

var Main = function() {};

// ユーザー発行クーポン Graph機能
Main.Index = function(req, res, next) {
	// DB Connection生成(Requestが入ったらConnection生成)
	var conn=mysql.createConnection(connectionString);
	// Sync処理
	async.series([
		function task1(callback){
			conn.query('select count(couponId) cnt100all, count(uuid) cnt100 from dom_pc_coupons where conditionNo=1', function(err, rows, fields){
				if(err) callback(err, null);
				console.log(rows);
				var data1 = JSON.stringify(rows);
				callback(null, data1);
			});
		},
		function task2(callback){
			conn.query('select count(couponId) cnt900all, count(uuid) cnt900 from dom_pc_coupons where conditionNo=2', function(err, rows, fields){
				if(err) callback(err, null);
				console.log(rows);
				var data2 = JSON.stringify(rows);
				callback(null, data2);
			});
		},
		function task3(callback){
			conn.query('select clientIp from dom_pc_blacklists', function(err, rows, fields){
				if(err) return console.error(err);
				var data3 = JSON.stringify(rows);
				
				callback(null, data3);
			});
		}
	],
	function resultTask(err, result){
		if(err) return console.error(err);
		console.log(result);
		console.log("result[0] : "+result[0]);
		console.log("result[1] : "+result[1]);
		console.log("result[2] : "+result[2]);
	
		var coupon100 = JSON.parse(result[0]);
		console.log(coupon100[0].cnt100all + "/" + coupon100[0].cnt100);
		var coupon900 = JSON.parse(result[1]);
		console.log(coupon900[0].cnt900all + "/" + coupon900[0].cnt900);
		var blacklist = JSON.parse(result[2]);
		// res.renderはViewファイルを読み込む処理(他にもExpressの処理が多い)
		res.render('index', { title: 'Coupons', coupon100 : coupon100[0].cnt100, coupon100all: coupon100[0].cnt100all, coupon900 : coupon900[0].cnt900, coupon900all : coupon900[0].cnt900all, blacklist: blacklist });
		
		conn.end();
	
	});
};

Main.Download = function(req, res, next){

	var conn=mysql.createConnection(connectionString);

	async.series([

		function task1(callback){
			console.log("start task1");
			conn.query("select couponName, couponCode, npsn, clientIp, updateDatetime from dom_pc_coupons where uuid is not null",function(err,rows, fields){
				if(err) callback(err, null);
				console.log("test parser : "+rows[0].couponName);
				var data = JSON.stringify(rows);
				callback(null, data);
			});
		}
	],
	function lastTask(err, result){
		console.log("start lastTask");
		if(err) return console.error(err);
		conn.end();
		async.series([
			function savefile(callback){
				console.log("Start savefile function");
				var obj = JSON.parse(result);
				console.log("obj result : " + obj);
		
				json2csv({ data: obj, fields: fields}, function(err, csv){
					if(err) callback(err, null);
					console.log("not error File Write Start");
					var filename = '[Dominations]Coupons_info_' + datetime + '.csv';
					filepath = path.join(__dirname, filename);
					fs.writeFile(filepath, csv, function(err){
						if(err) throw err;
						console.log(__dirname + ' : file saved');
						callback(null, "Success save File");
					});
				});
			},
			function downloadfile(callback){
				console.log(filepath);
				res.download(filepath, function(err){
					if(err) callback(err, null);
					console.log("Success File Download");
					callback(null, "Success Download Save");
				});
			}
		],
		function deletefile(err, result){
			if(err) console.error("delete function Error : "+err);
			console.log(result);
			fs.unlinkSync(filepath, function(err){
				if(err) return console.error(err);
				console.log("Success delete file : " + filepath);
				res.redirect('/xpromo');
			});
		});
	});
};

module.exports = Main;



