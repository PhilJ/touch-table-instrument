
/* type helper */

var toString = Object.prototype.toString;
var regex = /\[object (.*?)\]/;
var type = function (o) {
	if (o && o.nodeType === 1) {
		return 'element';
	}
	var match = toString.call(o).match(regex);
	var _type = match[1].toLowerCase();
	if (_type === 'number' && isNaN(o)) {
		return 'nan';
	}
	return _type;
};

/**
 * Creates an event manager for a matrix of multi touch data
 *
 * @constructor
 * @this {MultiTouchEventManager}
 * @param {number} config.rows    Rows of matrix
 * @param {number} config.columns Columns of matrix
 */
function MultiTouchEventManager(config) {
	this.rows    = config && config.rows && type(config.rows)    === 'number' ? config.rows    : 6;
	this.columns = config && config.columns && type(config.columns) === 'number' ? config.columns : 8;

	this.touchListeners = [];
	this.releaseListeners = [];

	this.status = {
		touchMatrix: [],
		buttonsPressed: [],
		buttonsPressedNew: [],
		buttonsReleased: []
	};

	for (var r = 0; r < this.rows; r++) {
		this.status.touchMatrix[r] = [];
		for (var c = 0; c < this.columns; c++) {
			this.status.touchMatrix[r][c] = 0;
		}
	}
}

/**
 * Set touch status manually (e.g. for testing)
 * @param {Object} status
 * @param {Array}  status.touchMatrix       2-D Matrix of current status of touched buttons of 1 and 0
 * @param {Array}  status.buttonsPressed    List of buttons which a currently pressed
 * @param {Array}  status.buttonsPressedNew List of buttons which are newly pressed for last update
 * @param {Array}  status.buttonsReleased   List of buttons which were released in last 
 */
MultiTouchEventManager.prototype.setStatus = function (status) {
	this.status = status;
}

/**
 * Get current status
 * @return {Object} status
 * @return {Array}  status.touchMatrix       2-D Matrix of current status of touched buttons of 1 and 0
 * @return {Array}  status.buttonsPressed    List of buttons which a currently pressed
 * @return {Array}  status.buttonsPressedNew List of buttons which are newly pressed for last update
 * @return {Array}  status.buttonsReleased   List of buttons which were released in last 
 */
MultiTouchEventManager.prototype.getStatus = function () {
	return this.status;
}

/**
 * Parses input touch data and triggers touch events if required
 * @param {array} touchMatrix Matrix of touch info
 */
MultiTouchEventManager.prototype.update = function (touchMatrix) {
	this.status = this.evaluateTouchMatrix(touchMatrix);
	this.triggerEvents(this.status);
	// TODO: trigger events
};


/**
 * Compare new touch matrix with old status
 * @param  {array} touchMatrix
 */
MultiTouchEventManager.prototype.evaluateTouchMatrix = function (touchMatrix) {
	var lastTouchMatrix = this.status.touchMatrix;
	var newStatus = {
		touchMatrix: touchMatrix,
		buttonsPressed: [],
		buttonsPressedNew: [],
		buttonsReleased: []	
	};
	// Iterate over rows
	touchMatrix.forEach(function (row, y) {
		// Iterate over buttons
		row.forEach(function (button, x) {
			var newButtonStatus = button;
			var oldButtonStatus = lastTouchMatrix[ y ][ x ];
			var buttonCoordinates = {x:x, y:y};
			
			if (oldButtonStatus === 0) {
				// button was not pressed last round
				if (newButtonStatus === 1) {
					newStatus.buttonsPressedNew.push(buttonCoordinates);
					newStatus.buttonsPressed.push(buttonCoordinates);
				}
			} else {
				// button was pressed last round
				if (newButtonStatus === 0) {
					newStatus.buttonsReleased.push(buttonCoordinates);
				} else {	
					newStatus.buttonsPressed.push(buttonCoordinates);
				}
			}
		});
	});

	return newStatus;
};

/**
 * Trigger events based on status
 * @param  {Object} status Status, e.g. current this.getStatus()
 */
MultiTouchEventManager.prototype.triggerEvents = function (status) {
	if (status.buttonsPressedNew.length > 0 && this.touchListeners.length > 0) {
		this.touchListeners.forEach(function (element, index) {
			element.callback(status);
		});
	}
	
	if (status.buttonsReleased.length > 0 && this.releaseListeners.length > 0) {
		this.releaseListeners.forEach(function (element, index) {
			element.callback(status);
		});
	}
};

MultiTouchEventManager.prototype.subscribeAll = function () {};

/**
 * Subscribe to press and release events for buttons or areas, subscribes to whole table on default
 * 
 * @param  {Object}  config 
 * @param  {Number}  config.x      X-Coordinate of watched button (or x start value for watched area)
 * @param  {Number}  config.y      Y-Coordinate of watched button (or y start value for watched a)
 * @param  {Number}  config.width  Width of watched area
 * @param  {Number}  config.height Height of watched area
 * @param  {Boolean} config.all    Listen to all, default option
 */
MultiTouchEventManager.prototype.subscribe = function (config, touchCallback, releaseCallback) {
	if ( type(config.x) === 'undefined' || type(config.y) === 'undefined' ) {
		// reset config to all detection if x or y coordinate is missing
		config = { all: true };
	}
	if (type(touchCallback) === 'function') {
		this.touchListeners.push({config: config, callback: touchCallback});
	}
	if (type(releaseCallback) === 'function') {
		this.releaseListeners.push({config: config, callback: releaseCallback});
	}
};

module.exports.MultiTouchEventManager = MultiTouchEventManager;