'use strict';

function touchTest (controller, tixel) {
	controller.events.on('touch.touch', function (e) {
		e.buttonsPressedNew.forEach(function (position) {
			tixel.selectAt(position);
		});
		tixel.setSelectedPixels('FFFFFF');
	});

	controller.events.on('touch.release', function (e) {
		e.buttonsReleased.forEach(function (position) {
			tixel.selectAt(position);
		});
		tixel.setSelectedPixels('000000');
	});
}

module.exports = touchTest;