'use strict';

var chroma = require('chroma-js'),
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

function touchTest (controller, tixel) {


	var colors = generateColorMap(['navy','lightyellow'], 25);
	var reverseColors = generateColorMap(['lightyellow','navy'], 25);

	tixel.selectAll().setSelectedPixels('FFFFFF');
	tixel.reset();

	var hashTagSelection = [ 
		[1,1,0,0,0,0], 
		[0,1,1,0,1,0], 
		[0,1,0,1,1,0], 
		[0,1,0,0,1,1],
		[1,1,0,0,1,0],
		[0,1,1,0,1,0], 
		[0,1,0,1,1,0], 
		[0,0,0,0,1,1]
	];

	fill(tixel.selection, function (x,y) {
		return hashTagSelection[x][y];
	});
	tixel.updateCoordinates();

	controller.events.on('touch.touch', function (e) {
		// 
		var fade = generateColorMap(['white','red'], 25);
		tixel.setSelectedPixels(fade);
	});

	controller.events.on('touch.release', function (e) {
		// '#'+tixel.canvas.get(1,1)
		var fade = generateColorMap(['red','white'], 25);
		tixel.setSelectedPixels(fade);
	});
}

module.exports = touchTest;