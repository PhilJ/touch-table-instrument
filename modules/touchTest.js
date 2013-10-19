'use strict';

function touchTest (controller, tixel) {
	controller.events.on('touch.touch', function (e) {
		tixel.reset();
		e.buttonsPressedNew.forEach(function (position) {
			tixel.selectAt(position);
		});
        var fade = ['111111','222222','333333','444444','555555','666666','777777','888888',
        '999999','AAAAAA','BBBBBB','CCCCCC','EEEEEE','FFFFFF']
		tixel.setSelectedPixels(fade);
	});

	controller.events.on('touch.release', function (e) {
		tixel.reset();
		e.buttonsReleased.forEach(function (position) {
			tixel.selectAt(position);
		});
		tixel.setSelectedPixels('000000');
	});
}

module.exports = touchTest;