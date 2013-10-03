var assert = require('assert')
var TixelSelection = require('../TixelSelection.js');

describe('construct TixelSelection object', function () {
    it('should create a TixelSelection object with correct defaults', function () {
        var expectedSize = [10,10];
        var expectedSelection = require('ndarray')(new Array(expectedSize[0]*expectedSize[1]), expectedSize);
        require('ndarray-ops').assigns(expectedSelection, 0);
        var expectedSelectionCoordinates = [];

        var ts = new TixelSelection();
        assert.deepEqual(ts.size, expectedSize);
        assert.deepEqual(ts.selection, expectedSelection);
        assert.deepEqual(ts.selectionCoordinates, expectedSelectionCoordinates);
    });

    it('should create a TixelSelection object with configuration', function () {
        var expectedSize = [5,3];
        var expectedSelection = require('ndarray')(new Array(expectedSize[0]*expectedSize[1]), expectedSize);
        require('ndarray-ops').assigns(expectedSelection, 0);
        var expectedSelectionCoordinates = [];

        var ts = new TixelSelection({size: expectedSize});
        assert.deepEqual(ts.size, expectedSize);
        assert.deepEqual(ts.selection, expectedSelection);
        assert.deepEqual(ts.selectionCoordinates, expectedSelectionCoordinates);
    });
});

describe('TixelSelection util methods', function () {
    it('updateCoordinates(): should write coordinates to this.selectionCoordinates', function () {
    	var size = [10,10];
    	var expectedCoordinates = [ [0,0], [5,5], [9,9] ];

    	var ts = new TixelSelection({size: size});
    	expectedCoordinates.forEach(function (value, index) {
    		ts.selection.set(value[0], value[1], 1);
    	});
    	ts.updateCoordinates();

    	assert.deepEqual(ts.selectionCoordinates, expectedCoordinates);
    });

    it('isInRange(): should tell correctly if points are in range', function () {
    	var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	assert.equal(ts.isInRange([-1,0]), false);
    	assert.equal(ts.isInRange([0,0]), true);
    	assert.equal(ts.isInRange([5,5]), true);
    	assert.equal(ts.isInRange([9,9]), true);
    	assert.equal(ts.isInRange([10,9]), false);
    	assert.equal(ts.isInRange([100,10]), false);

    });
});

describe('TixelSelection basic selectors', function () {
	it('selectAt() and unselectAt(): Should select pixels correctly', function () {
		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	ts.selectAt([-5,0]);
    	ts.selectAt([0,0]);
    	ts.selectAt([9,9]);
    	ts.selectAt([10,10]);

    	assert.equal(ts.selection.get(0,0), 1);
    	assert.equal(ts.selection.get(9,9), 1);

    	assert.equal(ts.selectionCoordinates.length, 2);
	
    	ts.unselectAt([-5,0]);
    	ts.unselectAt([0,0]);
    	ts.unselectAt([9,9]);
    	ts.unselectAt([10,10]);    

    	assert.equal(ts.selection.get(0,0), 0);
    	assert.equal(ts.selection.get(9,9), 0);

    	assert.equal(ts.selectionCoordinates.length, 0);	
	});

	it('selectAll()', function () {
		var size = [10,10];
    	var ts = new TixelSelection({size: size});
    	ts.selectAll();

    	assert.equal(ts.selectionCoordinates.length, 100);
	});


	it('invert()', function () {
		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	ts.selectAt([0,0]);
    	assert.equal(ts.selectionCoordinates.length, 1);

    	ts.selectionInvert();

    	assert.equal(ts.selectionCoordinates.length, 99);
    	assert.equal(ts.selection.get(0,0), 0);
	});
});

describe('TixelSelection shapes', function () {
	it('should create correct streight line shape', function () {

		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	var line = ts.createLineSelection([1,0], [5,0]);

    	assert.equal(line.get(0,0), 0);
    	assert.equal(line.get(1,0), 1);
    	assert.equal(line.get(2,0), 1);
    	assert.equal(line.get(3,0), 1);
    	assert.equal(line.get(4,0), 1);
    	assert.equal(line.get(5,0), 1);
    	assert.equal(line.get(6,0), 0);

	});

	it('should create correct diagonal line shape', function () {

		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	var line = ts.createLineSelection([0,0], [2,2]);

    	assert.equal(line.get(0,0), 1);
    	assert.equal(line.get(1,0), 0);
    	assert.equal(line.get(0,1), 0);
    	assert.equal(line.get(1,1), 1);
    	assert.equal(line.get(2,2), 1);
    	assert.equal(line.get(3,3), 0);
    	assert.equal(line.get(2,3), 0);

	});

	it('should create a box with point2 > point1', function () {

		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	var box = ts.createBoxSelection([1,1], [3,3]);
    	//console.log(require('ndarray-unpack')(box));
    	assert.equal(box.get(0,0), 0);
    	assert.equal(box.get(1,0), 0);
    	assert.equal(box.get(0,1), 0);
    	assert.equal(box.get(1,1), 1);
    	assert.equal(box.get(2,1), 1);
    	assert.equal(box.get(2,2), 1);
    	assert.equal(box.get(3,3), 1);
    	assert.equal(box.get(4,4), 0);
    	assert.equal(box.get(4,3), 0);
	});


	it('should create a box with point2 < point1', function () {

		var size = [10,10];
    	var ts = new TixelSelection({size: size});

    	var box = ts.createBoxSelection([3,3], [1,1]);
    	//console.log(require('ndarray-unpack')(box));
    	assert.equal(box.get(0,0), 0);
    	assert.equal(box.get(1,0), 0);
    	assert.equal(box.get(0,1), 0);
    	assert.equal(box.get(1,1), 1);
    	assert.equal(box.get(2,1), 1);
    	assert.equal(box.get(2,2), 1);
    	assert.equal(box.get(3,3), 1);
    	assert.equal(box.get(4,4), 0);
    	assert.equal(box.get(4,3), 0);
	});

	it('should create a circle', function () {
		var size = [10,10];
    	var ts = new TixelSelection({size: size});
    	var circle = ts.createCircleSelection([5,5], 4);

    	// TODO: Add asserts
    	//console.log(require('ndarray-unpack')(circle));
	});
});