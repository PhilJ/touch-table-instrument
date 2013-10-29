'use strict';

var chroma = require('chroma-js'),
	TixelElement = require('../lib/Tixel/TixelElement.js'),
	fill = require('ndarray-fill');


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

function pong (controller, tixel) {


	tixel.colorMap =  generateColorMap(['black','green'], 100);
	var redToGreen = generateColorMap(['red','green'], 3);

	var black = tixel.colorMap[ 0 ];
	var green = tixel.colorMap[ tixel.colorMap.length - 1 ];
	redToGreen.push(green);

	tixel.selectAll().setSelectedPixels(black);
	tixel.reset();

	var ball = new TixelElement({
		size: [1,1],
		defaultColor: green
	});
	ball.position = [4,3];
	ball.selectAll().setSelectedPixels(green);

	var pad1 = new TixelElement({
		size: [1,3],
		defaultColor: green
	});
	pad1.position = [0,2];
	pad1.selectAll().setSelectedPixels(green);

	var pad2 = new TixelElement({
		size: [1,3],
		defaultColor: green
	});
	pad2.position = [7,2];
	pad2.selectAll().setSelectedPixels(green);


	tixel.children.push(ball);
	tixel.children.push(pad1);
	tixel.children.push(pad2);

	var ballDirectionX = 'to1';
	var ballDirectionY = 'none';

	controller.events.on('touch.touch', function (e) {
		e.buttonsPressedNew.forEach(function (position) {
			if (position[0] === 0) {
				pad1.position[1] = position[1] - 1;
			}
			if (position[0] === 7) {
				pad2.position[1] = position[1] - 1;
			}
		});
	});

	controller.events.on('touch.update', function (e) {
		if (ballDirectionX === 'to1') {
			ball.position[0]--;
		} else {
			ball.position[0]++;
		}
		if (ballDirectionY === 'top') {
			ball.position[1]--;
		}
		if (ballDirectionY === 'down') {
			ball.position[1]++;
		}
		if (ball.position[1] === 0) ballDirectionY = 'down';
		if (ball.position[1] === 5) ballDirectionY = 'up';

		if (ball.position[0] === 1) {
				ballDirectionX = 'to2';
			if (pad1.position[1] === ball.position[1] || pad1.position[1] === ball.position[1] - 1 || pad1.position[1] === ball.position[1] - 2) {
				if (pad1.position[1] === ball.position[1]) ballDirectionY = 'top';
				if (pad1.position[1] === ball.position[1] - 2) ballDirectionY = 'down';
				// touching pad1
			} else {
				ball.setSelectedPixels(redToGreen);
				pad1.setSelectedPixels(redToGreen);
			}
		}

		if (ball.position[0] === 6) {
				ballDirectionX = 'to1';
			if (pad2.position[1] === ball.position[1] || pad2.position[1] === ball.position[1] - 1 || pad2.position[1] === ball.origin[1] - 2) {
				// touching pad1
				if (pad1.position[1] === ball.position[1]) ballDirectionY = 'down';
				if (pad1.position[1] === ball.position[1] - 2) ballDirectionY = 'top';
			} else {
				ball.setSelectedPixels(redToGreen);
				pad2.setSelectedPixels(redToGreen);
			}
		}
	});
}

module.exports = pong;