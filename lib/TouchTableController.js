'use strict';

var TixelServer = require('./TixelServer/TixelServer.js'),
//	LedView = require('./LedView.js'),
//	MultiTouchInput = require('./MultiTouchInput.js'),
	TixelController = require('./Tixel/TixelController.js'),
	touchTest = require('../modules/touchTest.js');

/**
 * This controller wires up touch input with led and web view by
 * binding them to a tixel controller. Initialize this controller
 * with a tixel module in order to use the touch table.
 * 
 * @param {object} config      - Configuration object
 * @param {array}  config.size - Size of matrix as [x,y]
 * @param {number} config.fps  - Frames per second
 * @param {number} config.port - Server port
 */
function TouchTableController (config) {
	this.size = config.size;
	this.fps  = config.fps;
	this.port = config.port;

	// Init pixel controller
	var tixelController = new TixelController({
		fps: this.fps,
		size: this.size
	});

	// Init input (server, touch) and output (server, leds)
	var server = new TixelServer({
		size: this.size,
		port: this.port,
		eventHandler: tixelController.events
	});

	/*var leds = new LedView({
		size: this.size,
		device: '/dev/spidev0.0',
		wireing: {
			startX: 'left',
			startY: 'right',
			direction: 'vertical'
		},
		eventHandler: tixelController.events
	});
	// add 2 pixels at beginning of mapping for unused pixels at beginning of chain
	leds.mapping = leds.mapping.unshift([0,0],[0,0]);

	var touchController = new MultiTouchInput({
		device: '/dev/ttyAMA0',
		delimiter: "\n\n\n",
		eventHandler: tixelController.events
	});*/

	// allow one module to load another by triggering event
	tixelController.events.on('loadModule', function (name) {
		tixelController.startModule(name);
	});

	// start first module
	tixelController.startModule(touchTest);

}

module.exports = TouchTableController;