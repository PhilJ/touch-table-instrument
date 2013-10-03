

// index.js
var size = [8,6]

var controller = TableController({
	size: size,
	modules: ['touchDemo'],
	fps: 25
});

// TouchTableController.js
function TouchTableController () {
	this.controller = new TixelController();

	// Init input (server, touch) and output (server, leds)
	this.server = TableServerView({
		size: size,
		port: 9000
	});

	this.leds = TableLedView({
		size: size,
		device: ''
	});

	this.touch = TableTouchInput({
		device: ''
	});

	// Wire up rendering
	this.controller.events.on('render',function (data) {
		server.update(data);
		led.update(data);
	});

	// Wire up touch
	this.server.onTouch(function (data) {
		this.controller.events.emit('touch', data);
	});
	this.touch.onTouch(function (data) {
		this.controller.controller.emit('touch', data);
	});
}

// TixelController.js: Provides input und render listeners for Tixel
function TixelController () {
	this.events = EventEmitter();
}

TableController.prototype.startModule = function (name) {
	// make sure module is loaded an accessible
	this.tixel = new TixelElement(size);
	try {
		var currentModule = require('name');
		this.module = new currentModule(this, tixel);
	} catch (e) {
		console.log('Failed loading module ' + name);
	}
	
}

TableController.prototype.loop = function () {
	var pixels = this.tixel.render();
	this.events.emit('render', pixels);
	var time = this.timeToNextLoop();
	var self = this;
	setTimeout(function () {
		self.loop();
	}, time);
};

// modules/touchDemo.js
function touchDemo (controller, tixel) {
	controller.onTouch(function (e) {
		e.touchedPixelsNew.forEach(function (position) {
			tixel.selectAt(position);
		});
		// fade value from 0 to 1 in 25 steps
		tixel.fadeValue(0,1,25);
	});
}
touchDemo.prototype = new TableModule();