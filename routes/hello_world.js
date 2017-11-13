var path = require('path');
var http = require('http');
var express = require('express');

var router = express.Router();

// POST /signup 用户注册
router.all('/', function(req, res, next) {
	res.send("hello,world!");
});

module.exports = router;