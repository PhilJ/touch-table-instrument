'use strict';

function touchTest (controller, tixel) {
	controller.events.on('touch.touch', function (e) {
		e.touchedPixelsNew.forEach(function (position) {
			tixel.selectAt(position);
		});
		// fade value from 0 to 1 in 25 steps
		tixel.fadeValue(0,1,25);
	});
}

module.exports = touchTest;