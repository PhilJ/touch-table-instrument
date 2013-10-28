'use strict';

var assert = require('assert'),
    TixelMatrix = require('../TixelMatrix.js');

describe('TixelMatrix Construction', function () {
    it('should create an empty matrix with correct defaults', function () {
        var defaultValue = 'test';
        var t = new TixelMatrix([3,3], defaultValue);
        assert.equal(t.matrix.length, 3);
        assert.equal(t.matrix[0].length, 3);
        assert.equal(t.matrix[0][0], defaultValue);
    });

    it('should create a matrix filled with default values', function () {
        var input = [
            [1,0,1],
            [0,1,0],
            [1,0,1]
        ];
        var t = new TixelMatrix([3,3], 0, input);
        assert.deepEqual(input, t.matrix);
    });
});

describe('TixelMatrix getter and setter', function () {
    it('should get and set values correctly', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);
        var position = [2,2];
        assert.equal(t.getAt(position), t.matrix[2][2]);
        t.setAt(position, setValue);
        assert.equal(t.matrix[2][2], setValue);
        assert.equal(t.getAt(position), setValue);
    });
});

describe('TixelMatrix buffer', function () {
    it('should add data to the buffer', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);
        var position = [2,2];
        var buffer = [1,1];
        t.setBuffer(position, buffer);
        assert.equal(t.buffer[2][2], buffer);
    });

    it('should write buffer to matrix', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);
        var position1 = [0,0];
        var buffer1 = [1,0];
        t.setBuffer(position1, buffer1);
        var position2 = [1,0];
        var buffer2 = [1];
        t.setBuffer(position2, buffer2);
        var position3 = [2,0];
        var buffer3 = [];
        t.setBuffer(position3, buffer3);
        t.applyBuffer();
        assert.equal(t.getAt(position1), setValue);
        assert.equal(t.getAt(position2), setValue);
        assert.equal(t.getAt(position3), defaultValue);

        assert.deepEqual(t.buffer[0][0], buffer1.slice(1,2));
        assert.equal(t.buffer[1][0], null);
        assert.equal(t.buffer[2][0], null);

        t.applyBuffer();
        assert.equal(t.getAt(position1), defaultValue);
        assert.equal(t.getAt(position2), setValue);
        assert.equal(t.getAt(position3), defaultValue);

        assert.equal(t.buffer[0][0], null);
    });
});

describe('TixelMatrix iterator or iterator based methods', function () {
    it('should iterate over all values', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);
        var called = 0;
        t.forEach(function (x, y, value) {
            assert.equal(value, defaultValue);
            called++;
        });
        assert.equal(called, 9);
    });

    it('should set all values', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);
        t.setForEach(function (x, y, value) {
            return setValue;
        });
        t.forEach(function (x, y, value) {
            assert.equal(value, setValue);
        });
        assert.equal(t.getAt([0,0]), setValue);
    });

    it('should setAll() and reset()', function () {
        var defaultValue = 0;
        var setValue = 1;
        var t = new TixelMatrix([3,3], defaultValue);

        t.setAll(setValue);
        t.forEach(function (x, y, value) {
            assert.equal(value, setValue);
        });

        t.reset();
        t.forEach(function (x, y, value) {
            assert.equal(value, defaultValue);
        });

    });
});

describe('TixelMatrix setMatrix()', function () {
    it('should position small on big matrix', function () {
        var defaultValue = 0;
        var setValue = 1;
        var st = new TixelMatrix([2,2], setValue);
        var bt = new TixelMatrix([4,4], defaultValue);
        var position = [1,1];
        bt.setMatrix(st.matrix, position);
        var expectedMatrix = [
            [0,0,0,0],
            [0,1,1,0],
            [0,1,1,0],
            [0,0,0,0]
        ];
        assert.deepEqual(bt.matrix, expectedMatrix);
    });


    it('should position partly on matrix', function () {
        var defaultValue = 0;
        var setValue = 1;
        var st = new TixelMatrix([4,4], setValue);
        var bt = new TixelMatrix([4,4], defaultValue);
        var position = [-1,-1];
        bt.setMatrix(st.matrix, position);
        var expectedMatrix = [
            [1,1,1,0],
            [1,1,1,0],
            [1,1,1,0],
            [0,0,0,0] 
        ];
        assert.deepEqual(bt.matrix, expectedMatrix);
    });
});