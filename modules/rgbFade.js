'use strict';

var chroma = require('chroma-js'),
	TixelSelection = require('../lib/Tixel/TixelSelection.js'),
	Easing = require('easing');


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

function rgbFade (controller, tixel) {

	tixel.colorMap = generateColorMap(['navy','lightyellow'], 25);
	var redfade = generateColorMap(['orangered','darkred','navy'], 100);
	tixel.selectAll().setSelectedPixels('AAAAAA');
	var quartic = Easing(6, 'quartic');
	var cubic = Easing(6, 'cubic');
	var quadratic = Easing(6,'quadratic');
	var red = 255;
	var green = 255;
	var blue = 255; 

	controller.events.on('touch.touch', function (e) {
		var newColor;
		var previewColor;
		var currentColor;
		
		//tixel.selectAll().setSelectedValues([0.1,0.2,0.3,0.4,0.5]);
		//console.log(tixel.valueCanvas);
		e.buttonsPressedNew.forEach(function (position) {
			var previewRed, previewGreen, previewBlue;
			tixel.reset();

			if (position[0] <= 2) {
				currentColor = tixel.canvas.get(0,0);
				red = cubic[position[1]]*255;
				previewColor = chroma.rgb(red,0,0).hex().slice(1,7);
				var selection = new TixelSelection(tixel.size);
				tixel.selection = selection.createBoxSelection([0,0],[2,5]);
				tixel.updateCoordinates();
				tixel.setSelectedPixels(generateColorMap([currentColor,previewColor], 20));
			}
			else if (position[0] <= 4) {
				currentColor = tixel.canvas.get(3,0);
				blue = cubic[position[1]]*255;
				previewColor = chroma.rgb(0,0,blue).hex().slice(1,7);
				var selection = new TixelSelection(tixel.size);
				tixel.selection = selection.createBoxSelection([3,0],[4,5]);
				tixel.updateCoordinates();
				tixel.setSelectedPixels(generateColorMap([currentColor,previewColor], 20));
			}
			else  {
				green = quadratic[position[1]]*255;
				currentColor = tixel.canvas.get(5,0);
				previewColor = chroma.rgb(0,green,0).hex().slice(1,7);
				var selection = new TixelSelection(tixel.size);
				tixel.selection = selection.createBoxSelection([5,0],[7,5]);
				tixel.updateCoordinates();
				tixel.setSelectedPixels(generateColorMap([currentColor,previewColor], 20));
			}
		});
	});

	controller.events.on('touch.release', function (e) {
		if (e.buttonsPressed.length === 0) {
			var currentColor = (e.buttonsReleased[0][0] <= 2) ? tixel.canvas.get(3,0) : tixel.canvas.get(0,0);
			var	newColor = chroma.rgb(red,green,blue).hex().slice(1,7);
			tixel.selectAll().setSelectedPixels(generateColorMap([currentColor,newColor], 20));
		}
		
	});


}

module.exports = rgbFade;