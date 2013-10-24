'use strict';

var chroma = require('chroma-js');


function generateColorMap (colors, steps) {
	var scale = chroma.scale(colors);
	var output = [];
	var stepSize = 1 / steps;
	for (var s = 0; s < steps; s++) {
		var color = scale(s * stepSize).toString();
		output.push(color.substr(1,7));
	}
	return output;
}

function touchTest (controller, tixel) {


	var colors = generateColorMap(['navy','lightyellow'], 25);
	var reverseColors = generateColorMap(['lightyellow','navy'], 25);
	tixel.selectAll().setSelectedPixels(colors[0]);

	controller.events.on('touch.touch', function (e) {
		tixel.reset();
		e.buttonsPressedNew.forEach(function (position) {
			tixel.selectLine([0,0], position);
		});
        var fade = ['111111','222222','333333','444444','555555','666666','777777','888888',
        '999999','AAAAAA','BBBBBB','CCCCCC','EEEEEE','FFFFFF']
		tixel.setSelectedPixels(colors);
	});

	controller.events.on('touch.release', function (e) {
		tixel.reset();
		e.buttonsReleased.forEach(function (position) {
			tixel.selectAt(position);
		});
        var fade = ['FFFFFF','EEEEEE','DDDDDD','CCCCCC','BBBBBB','AAAAAA','999999','888888',
        '777777','666666','555555','444444','333333','222222','111111','000000']
		tixel.setSelectedPixels(reverseColors);
	});
}

module.exports = touchTest;