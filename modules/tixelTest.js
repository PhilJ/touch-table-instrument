'use strict';

var TixelElement = require('../lib/Tixel/TixelElement.js');

function tixelTest (controller, tixel) {

	tixel.selectAll().setSelectedPixels('000000');

	var block = new TixelElement({
		size: [2,2],
		defaultColor: 'B700F1'
	});
	block.position = [1,1];
	block.mask.set(0,0,0.5);

	tixel.children.push(block);

	var line = new TixelElement({
		size: [1,5],
		defaultColor: '0AFF00'
	});
	line.position = [2,0];
	line.mask.set(0,0,0.2);
	line.mask.set(0,1,0.4);
	line.mask.set(0,2,0.6);
	line.mask.set(0,3,0.8);

	tixel.children.push(line);

	/*var direction = 0;
	controller.events.on('touch.update', function (e) {
		if (direction === 0) child.origin[0]++;
		if (direction === 1) child.origin[0]--;


		if (child.origin[0] == 0) direction = 0;
		if (child.origin[0] == tixel.size[0] - 1) direction = 1;
	});*/



	/*var colors = generateColorMap(['navy','lightyellow'], 25);
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
	});*/
}

module.exports = tixelTest;