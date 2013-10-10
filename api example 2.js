

// index.js

var controller = TableController({
	size: [8,6],
	module: 'touchDemo',
	fps: 25
});

// TouchTableController.js
function TouchTableController (config) {

	// Init input (server, touch) and output (server, leds)
	var server = TableServerView({
		size: size,
		port: 9000
	});

	var leds = TableLedView({
		size: size,
		device: ''
	});

	var touchController = TableTouchInput({
		device: ''
	});


	// Init pixel controller
	var tixelController = new TixelController({
		fps: config.fps,
		size: config.size,
		input: touchController
	});

	// Update LEDs and web clients on render
	tixelController.events.on('render',function (data) {
		server.update(data);
		led.update(data);
	});


	// allow one module to load another by triggering event
	tixelController.events.on('loadModule', function (name) {
		tixelController.startModule(name);
	});

	// start first module
	tixelController.startModule(config.module);
}


// modules/touchDemo.js
// 
// Events:
//  - touch.update               { touchMatrix: [ [ 0, 1, 0 ... ], ...], 
//  							   buttonsPressed: [], 
//  							   buttonsPressedNew: [], 
//  							   buttonsReleased: [] 
//  							 }
//  							   
//  - touch.touch                { buttonsPressedNew: [ [x, y], ... ] }
//  - touch.touch.button.x-y
//  - touch.touch.row.y
//  - touch.touch.column.x
//  - touch.release              { buttonsReleased: [ [x, y], ... ] }
//  - touch.release.button.x-y
//  - proximity.update
//  - proximity.update.button.x-y
//  - input.events.trigger
//  
function touchDemo (controller, tixel) {
	controller.events.on('touch.touch', function (e) {
		e.touchedPixelsNew.forEach(function (position) {
			tixel.selectAt(position);
		});
		// fade value from 0 to 1 in 25 steps
		tixel.fadeValue(0,1,25);
	});
}