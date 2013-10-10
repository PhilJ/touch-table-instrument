'use strict';

var TouchTableController = require('./lib/TouchTableController.js');

var touchTable = new TouchTableController({
	size: [6,8], 
	fps: 25,
	port: 3000
});