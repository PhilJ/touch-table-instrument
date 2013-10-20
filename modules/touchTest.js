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
        var fade = ['FFFFFF','EEEEEE','DDDDDD','CCCCCC','BBBBBB','AAAAAA','999999','888888',
        '777777','666666','555555','444444','333333','222222','111111','000000']
		tixel.setSelectedPixels(fade);
	});
}

module.exports = touchTest;