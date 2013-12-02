'use strict';

var assert = require('assert'),
	TixelElement = require('../TixelElement.js'),
	TixelMatrix = require('../TixelMatrix.js');

describe('TixelElement Construction', function () {
	it('should create a TixelElement with correct defaults', function () {
		var expectedSize = [10,10];
		var expectedOrigin = [0,0];
		var expectedDefaultColor = '000000';

		var expectedValues = new TixelMatrix(expectedSize, null);
		var expectedMask = new TixelMatrix(expectedSize, 1);
		var expectedOutput = new TixelMatrix(expectedSize, expectedDefaultColor);
		var expectedColorMap = [expectedDefaultColor];

		var te = new TixelElement();
		assert.deepEqual(te.size, expectedSize);
		assert.deepEqual(te.origin, expectedOrigin);
		assert.equal(te.defaultColor, expectedDefaultColor);
		assert.deepEqual(te.valueCanvas, expectedValues);
		assert.deepEqual(te.mask, expectedMask);
		assert.deepEqual(te.canvas, expectedOutput);
		assert.deepEqual(te.output, expectedOutput);
		assert.deepEqual(te.colorMap, expectedColorMap);
		assert.deepEqual(te.children, []);
		assert.equal(te.frame, 0);
	});

	it('should create an TixelElement with size shorthand', function () {
		var expectedSize = [5,3];
		var expectedOrigin = [0,0];
		var expectedDefaultColor = '000000';
		var expectedValues = require('ndarray')(new Array(expectedSize[0] * expectedSize[1]), expectedSize);
		
		var expectedValues = new TixelMatrix(expectedSize, null);
		var expectedMask = new TixelMatrix(expectedSize, 1);
		var expectedOutput = new TixelMatrix(expectedSize, expectedDefaultColor);
		var expectedColorMap = [expectedDefaultColor];

		var te = new TixelElement(expectedSize);
		assert.deepEqual(te.size, expectedSize);
		assert.deepEqual(te.origin, expectedOrigin);
		assert.equal(te.defaultColor, expectedDefaultColor);
		assert.deepEqual(te.valueCanvas, expectedValues);
		assert.deepEqual(te.mask, expectedMask);
		assert.deepEqual(te.output, expectedOutput);
		assert.deepEqual(te.colorMap, expectedColorMap);
		assert.deepEqual(te.children, []);	
		assert.equal(te.frame, 0);	
	});



	it('should should create an TixelElement with correct passed params', function () {
		var expectedSize = [5,3];
		var expectedOrigin = [1,1];
		var expectedDefaultColor = 'AAAAAA';
		var expectedValues = require('ndarray')(new Array(expectedSize[0] * expectedSize[1]), expectedSize);
		var expectedValues = new TixelMatrix(expectedSize, null);
		var expectedMask = new TixelMatrix(expectedSize, 1);
		var expectedOutput = new TixelMatrix(expectedSize, expectedDefaultColor);
		var expectedColorMap = ['000000', 'FFFFFF'];

		var tixelConf = {
			size: expectedSize,
			origin: expectedOrigin,
			defaultColor: expectedDefaultColor,
			colorMap: expectedColorMap
		};

		var te = new TixelElement(tixelConf);
		assert.deepEqual(te.size, expectedSize);
		assert.deepEqual(te.origin, expectedOrigin);
		assert.equal(te.defaultColor, expectedDefaultColor);
		assert.deepEqual(te.valueCanvas, expectedValues);
		assert.deepEqual(te.mask, expectedMask);
		assert.deepEqual(te.output, expectedOutput);
		assert.deepEqual(te.colorMap, expectedColorMap);
		assert.deepEqual(te.children, []);	
		assert.equal(te.frame, 0);	
	});

	it('should inherit properties from TixelSelection', function () {
		var expectedSize = [5,3];
		var expectedSelection = new TixelMatrix(expectedSize, 0);
		var expectedSelectionCoordinates = [];

		var te = new TixelElement(expectedSize);
		assert.deepEqual(te.size, expectedSize);
		assert.deepEqual(te.selection, expectedSelection);
		assert.deepEqual(te.selectionCoordinates, expectedSelectionCoordinates);
	});
});

describe('test color mapping', function () {
	it('getMappedColor(): should return the correct color index', function () {
		var colorMap = ['000','AAA', 'FFF'];
		var te = new TixelElement({colorMap: colorMap});

		assert.equal(te.getMappedColor(-100), colorMap[0]);
		assert.equal(te.getMappedColor(0), colorMap[0]);
		assert.equal(te.getMappedColor(0.3), colorMap[0]);
		assert.equal(te.getMappedColor(0.34), colorMap[1]);
		assert.equal(te.getMappedColor(0.65), colorMap[1]);
		assert.equal(te.getMappedColor(0.67), colorMap[2]);
		assert.equal(te.getMappedColor(0.99), colorMap[2]);
		assert.equal(te.getMappedColor(1.0), colorMap[2]);
		assert.equal(te.getMappedColor(100), colorMap[2]);
	});

	it('_renderValues(): should use color mapping to calculate output', function () {
		var size = [2,2];
		var colorMap = ['AAA', '555', '000'];
		var defaultColor = 'FFF';
		var values = new TixelMatrix(size, null, [ [null, 0.2], [0.6, 1] ]);
		var te = new TixelElement({
			size: size,
			colorMap: colorMap,
			defaultColor: defaultColor
		});
		te.valueCanvas = values;
		te._renderValues();
		assert.equal(te.output.get(0,0), defaultColor);
		assert.equal(te.output.get(0,1), colorMap[0]);
		assert.equal(te.output.get(1,0), colorMap[1]);
		assert.equal(te.output.get(1,1), colorMap[2]);

	});
});

describe('TixelElement Manipulation', function () {
	it('setSelectedPixels(): should change color of selected pixels', function () {
		var size = [2,2];
		var defaultColor = '000000';
		var selectedColor = 'FFFFFF';
		var te = new TixelElement({
			size: size,
			defaultColor: defaultColor
		});
		te.selectAt([0,0]).selectAt([1,1]);
		te.setSelectedPixels(selectedColor);

		assert.equal(te.canvas.get(0,0), selectedColor);
		assert.equal(te.canvas.get(1,0), defaultColor);
		assert.equal(te.canvas.get(0,1), defaultColor);
		assert.equal(te.canvas.get(1,1), selectedColor);
	});

	it('setSelectedOpacity(): should change opacity of selected pixels', function () {
		var size = [2,2];
		var defaultOpacity = 1;
		var setOpacity = 0;
		var te = new TixelElement({
			size: size
		});
		te.selectAt([0,0]).selectAt([1,1]);
		te.setSelectedMask(setOpacity);

		assert.equal(te.mask.get(0,0), setOpacity);
		assert.equal(te.mask.get(1,0), defaultOpacity);
		assert.equal(te.mask.get(0,1), defaultOpacity);
		assert.equal(te.mask.get(1,1), setOpacity);
	});

	it('setSelectedValue(): should change value of selected pixels', function () {
		var size = [2,2];
		var defaultValue = null;
		var setValue = 1;
		var te = new TixelElement({
			size: size
		});
		te.selectAt([0,0]).selectAt([1,1]);
		te.setSelectedValues(setValue);

		assert.equal(te.valueCanvas.get(0,0), setValue);
		assert.equal(te.valueCanvas.get(1,0), defaultValue);
		assert.equal(te.valueCanvas.get(0,1), defaultValue);
		assert.equal(te.valueCanvas.get(1,1), setValue);
	});

	it('forEachPixel(): should iterate over all pixels', function () {
		var size = [2,2];
		var te = new TixelElement({
			size: size
		});

		var wasCalled = 0;
		te.forEachPixel(function (position, data) {
			assert.equal(data.color, te.output.get(position[0],position[1]));
			assert.equal(data.mask, te.mask.get(position[0],position[1]));
			assert.equal(data.selected, te.selection.get(position[0],position[1]));
			assert.equal(data.value, te.valueCanvas.get(position[0],position[1]));
			wasCalled++;
		}, true);

		assert.equal(wasCalled, 4);
	});

	it('forEachSelectedPixel(): should iterate over all selected pixels', function () {
		var size = [2,2];
		var te = new TixelElement({
			size: size
		});

		te.selectAt([0,0]).selectAt([1,1]);
		
		var wasCalled = 0;

		te.forEachSelectedPixel(function (position, data) {
			assert.equal(data.color, te.output.get(position[0],position[1]));
			assert.equal(data.mask, te.mask.get(position[0],position[1]));
			assert.equal(data.selected, te.selection.get(position[0],position[1]));
			assert.equal(data.valueCanvas, te.valueCanvas.get(position[0],position[1]));
			wasCalled++;
		}, true);

		assert.equal(wasCalled, 2);
	});
})