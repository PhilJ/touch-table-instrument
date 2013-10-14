'use strict';

var TouchTableController = require('./lib/TouchTableController.js');

var touchTable = new TouchTableController({
	size: [8,6], 
	fps: 25,
	port: 3000
});