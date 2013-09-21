var assert = require('assert');
var MultiTouchEventManager = require('../MultiTouchEventManager.js').MultiTouchEventManager;

describe('Initialize MultiTouchEventManager', function () {
	it('should return an object with rows and cols', function () {
		var rows = 7, columns = 8;
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});

		assert.equal(manager.rows, rows);
		assert.equal(manager.columns, columns);
	});

	it('should create proper defaults', function () {
		var manager = new MultiTouchEventManager();

		assert.equal(manager.rows, 6);
		assert.equal(manager.columns, 8);
		assert.equal(manager.status.touchMatrix.length, 6);
		assert.equal(manager.status.touchMatrix[0].length, 8);
	});
});

describe('EvaluateTouchMatrix', function () {
	it('should detect a new pressed button', function () {
		var rows = 2, columns = 2;
		var update1 = [[1, 0], [0, 0]];
		var button1Cord = {x:0,y:0};
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});
		var newStatus = manager.evaluateTouchMatrix(update1);

		assert.equal(newStatus.touchMatrix, update1);
		assert.deepEqual(newStatus.buttonsPressedNew, [button1Cord]);
		assert.deepEqual(newStatus.buttonsPressed, [button1Cord]);
		assert.deepEqual(newStatus.buttonsReleased, []);
	});

	it('should detect a hold button', function () {
		var rows = 2, columns = 2;
		var update1 = [[1, 0], [0, 0]];
		var update2 = [[1, 0], [0, 0]];
		var button1Cord = {x:0,y:0};
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});

		manager.setStatus( manager.evaluateTouchMatrix(update1) );
		var newStatus = manager.evaluateTouchMatrix(update2);

		assert.equal(newStatus.touchMatrix, update2);
		assert.deepEqual(newStatus.buttonsPressedNew, []);
		assert.deepEqual(newStatus.buttonsPressed, [button1Cord]);
		assert.deepEqual(newStatus.buttonsReleased, []);
	});

	it('should detect a released button', function () {
		var rows = 2, columns = 2;
		var update1 = [[1, 0], [0, 0]];
		var update2 = [[0, 0], [0, 0]];
		var button1Cord = {x:0,y:0};
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});

		manager.setStatus( manager.evaluateTouchMatrix(update1) );
		var newStatus = manager.evaluateTouchMatrix(update2);

		assert.equal(newStatus.touchMatrix, update2);
		assert.deepEqual(newStatus.buttonsPressedNew, []);
		assert.deepEqual(newStatus.buttonsPressed, []);
		assert.deepEqual(newStatus.buttonsReleased, [button1Cord]);
	});
});

describe('Touch and Release Events', function () {
	it('should trigger a touch event', function (done) {
		var rows = 2, columns = 2;
		var update1 = [[1, 0], [0, 0]];
		var button1Cord = {x:0,y:0};
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});

		var eventConf = { 'all': true };
		var pressCallback = function (status) {
			assert.deepEqual(status.touchMatrix, update1);
			assert.deepEqual(status.buttonsPressedNew, [button1Cord]);
			assert.deepEqual(status.buttonsPressed, [button1Cord]);
			assert.deepEqual(status.buttonsReleased, []);
			done();
		}
		manager.subscribe(eventConf, pressCallback);
		manager.update(update1);
	});

	it('should trigger a release event', function (done) {
		var rows = 2, columns = 2;
		var update1 = [[1, 0], [0, 0]];
		var update2 = [[0, 0], [0, 0]];
		var button1Cord = {x:0,y:0};
		var manager = new MultiTouchEventManager({rows: rows, columns: columns});

		var eventConf = { 'all': true };
		var releaseCallback = function (status) {
			assert.deepEqual(status.touchMatrix, update2);
			assert.deepEqual(status.buttonsPressedNew, []);
			assert.deepEqual(status.buttonsPressed, []);
			assert.deepEqual(status.buttonsReleased, [button1Cord]);
			done();
		}
		manager.update(update1);
		manager.subscribe(eventConf, function () {}, releaseCallback);
		manager.update(update2);
	});
});