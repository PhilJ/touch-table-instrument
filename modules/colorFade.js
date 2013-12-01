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

function colorFade (controller, tixel) {
	tixel.colorMap = generateColorMap(['orange','yellow','aqua','blue','navy','indigo','red','darkred','orange'], 100);
	tixel.selectAll().setSelectedValues(0).reset();

	// var fadeStatus = [ 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0], 
	// 	[0,0,0,0,0,0]
	// ];

	// controller.events.on('touch.touch', function (e) {
	// 	e.buttonsPressedNew.forEach(function (position) {
	// 			fadeStatus[position[0],position[1]] = 1;
	// 		}	
	// });
	var frames;
	setInterval(function () {
		console.log("Frames per second", frames);
		frames = 0;
	}, 1000);
	controller.events.on('touch.update', function (e) {
		frames++;
		var currentColor, newColor;
		e.buttonsPressed.forEach(function (position) {
			//tixel.reset();
			//tixel.selectAt(position);
			currentColor = tixel.valueCanvas.get(position[0],position[1]);
			newColor = currentColor + 0.01;			

			if (currentColor >= 1) {
				newColor = 0;
			}
			//tixel.setSelectedValues(newColor);
			//tixel.setSelectedPixels('FFFFFF');
			tixel.valueCanvas.set(position[0],position[1],newColor)
		});
	});

	// controller.events.on('touch.release', function (e) {
	// 	e.buttonsPressedNew.forEach(function (position) {
	// 			fadeStatus[position[0],position[1]] = 0;
	// 		}	
	// });

}

module.exports = colorFade;