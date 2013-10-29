'use strict';

var TixelElement = require('../lib/Tixel/TixelElement.js');

function tixelTest (controller, tixel) {

	tixel.selectAll().setSelectedPixels('000000');

	var block = new TixelElement({
		size: [1,1],
		defaultColor: 'FF0000'
	});

	block.position = [1,1];
	block.mask.set(0,0,1);

	tixel.children.push(block);

	var line = new TixelElement({
		size: [1,6],
		defaultColor: '0AFF00'
	});

	line.position = [2,0];
	line.mask.set(0,0,0.2);
	line.mask.set(0,1,0.4);
	line.mask.set(0,2,0.6);
	line.mask.set(0,3,0.8);
	line.mask.set(0,4,0.8);
	tixel.children.push(line);

	var line2 = new TixelElement({
		size: [1,6],
		defaultColor: 'FF0000'
	});

	line2.position = [5,0];
	line2.mask.set(0,0,0.2);
	line2.mask.set(0,1,0.4);
	line2.mask.set(0,2,0.6);
	line2.mask.set(0,3,0.8);
	line2.mask.set(0,4,0.8);
	line2.mask.set(0,5,0.9);

	tixel.children.push(line2);

	tixel.selectAll().setSelectedPixels('0000AA');

	controller.events.on('touch.touch', function (e) {
		var target = e.buttonsPressedNew[0];

		var moveX = target[0] - block.origin[0];
		var moveY = target[1] - block.origin[1];

		move();
		function update (e) {
			if (move() === false) {
				controller.events.removeListener('touch.update', update);
			}
		}
		controller.events.on('touch.update', update);

		function move() {
			if (moveX !== 0 || moveY !== 0) {
				if (moveX < 0) {
					// move left
					block.origin[0]--;
					moveX++;
				}
				if (moveX > 0) {
					// move right
					block.origin[0]++;
					moveX--;
				}

				if (moveY < 0) {
					// move up
					block.origin[1]--;
					moveY++;
				}
				if (moveY > 0) {
					// move down
					block.origin[1]++;
					moveY--;
				}
				return true;
			}
			return false;
		}
		
	});



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