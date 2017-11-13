var path = require('path');
var http = require('http');
var express = require('express');
var crypto = require('crypto');
var request = require('request');
var config = require('../config/default.js');

var router = express.Router();
var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=' + config.weixin.granttype + '&appid=' + config.weixin.appID + '&secret=' + config.weixin.appSecret;

// POST /signup 用户注册
router.all('/', function(req, res, next) {
	try {
		var token = config.weixin.token;
		console.log(token);
		var signature = req.query.signature;
		var timestamp = req.query.timestamp;
		var nonce = req.query.nonce;
		var echostr = req.query.echostr;
	} catch(e) {
		console.log(e.message);
	}

	/*  加密/校验流程如下： */
	//1. 将token、timestamp、nonce三个参数进行字典序排序
	var array = new Array(token, timestamp, nonce);
	array.sort();
	var str = array.toString().replace(/,/g, "");

	//2. 将三个参数字符串拼接成一个字符串进行sha1加密
	var sha1Code = crypto.createHash("sha1");
	var code = sha1Code.update(str, 'utf-8').digest("hex");

	console.log(code);
	//3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	if(code === signature) {
		res.send(echostr);
	} else {
		res.send("error");
	}
});

router.all('/wx_config', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	// 获取access_token
	var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=' + config.weixin.granttype + '&appid=' + config.weixin.appid + '&secret=' + config.weixin.appsecret;
	request(tokenUrl, function(error, response, body) {
		if(response.statusCode === 200) {
			console.log("body: ", body)
			// 这里我缓存到了global
			body = JSON.parse(body);
			getTicket(req, res, body.access_token);
		}
	})
})

function getTicket(req, res, access_token) {
	var ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';
	request(ticketUrl, function(err, response, content) {
		content = JSON.parse(content);
		console.log("content: ", content)
		if(content.errcode == 0) {
			var wxConfig = sign(content.ticket,req.headers.referer);
			console.log(wxConfig);
			res.send(wxConfig);
		}
	})
}

// 随机字符串
var createNonceStr = function() {
	return Math.random().toString(36).substr(2, 15);
};

// 时间戳
var createTimestamp = function() {
	return parseInt(new Date().getTime() / 1000) + '';
};

// 排序拼接
var raw = function(args) {
	console.log("args: ", args)
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});
	var string = '';
	for(var k in newArgs) {
		string += '&' + k + '=' + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

/**
 * @synopsis 签名算法 
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns
 */
var sign = function(jsapi_ticket, url) {
	var timestamp = createTimestamp();
	var nonceStr = createNonceStr();
	var ret = {
		jsapi_ticket: jsapi_ticket,
		nonceStr: nonceStr,
		timestamp: timestamp,
		url: url
	};
	var string = raw(ret);
	var sha1 = crypto.createHash("sha1");
	var signature = sha1.update(string, 'utf-8').digest("hex");
	return {
		code: 0,
		appId: config.weixin.appid,
		timestamp: timestamp,
		nonceStr: nonceStr,
		signature: signature,
	};
};

module.exports = router;