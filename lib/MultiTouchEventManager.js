'use strict';

var EventHandler = require('events').EventHandler;

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
 * @example
 *   var eventHandler = new EventHandler();
 *   eventHandler.on('touch.touch', function (status) {
 *       // do something with status
 *   });
 *   var touchEvent = new MultiTouchEventManager({
 *       size: [6,8],
 *       eventHandler: eventHandler
 *   });
 *   // Call update on any input update to trigger events
 *   touchEvent.update(touchDataUpdate);
 *
 * @constructor
 * @this {MultiTouchEventManager}
 * @param {object}       config       - Configuration object
 * @param {array}        config.size  - Matrix size in format [x,y], default: [10,10]
 * @param {EventHandler} eventHandler - Pass event handler 
 */
function MultiTouchEventManager(config) {
    this.size = (type(config.size) === 'array' &&
                  type(config.size[0]) === 'number' &&
                  type(config.size[1]) === 'number') ? [config.size[0], config.size[1]] : [10,10];
    this.events = (type(config.eventHandler) === 'object') ? config.eventHandler : new EventHandler();

    this.status = {
        touchMatrix: [],
        buttonsPressed: [],
        buttonsPressedNew: [],
        buttonsReleased: []
    };

    // TODO: Check if this.size[0] and this.size[1] are used correctly
    for (var r = 0; r < this.size[0]; r++) {
        this.status.touchMatrix[r] = [];
        for (var c = 0; c < this.size[1]; c++) {
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
    console.log('UPDATE');
    this.status = this.evaluateTouchMatrix(touchMatrix);
    this.triggerEvents(this.status);
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
            var buttonCoordinates = [x, y];
            
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
 * 
 * @param  {Object} status Status, e.g. current this.getStatus()
 */
MultiTouchEventManager.prototype.triggerEvents = function (status) {
    /**
     * Trigger event in for every loop update
     * @event touch.update
     */
    this.events.emit('touch.update', status);

    if (status.buttonsPressedNew.length > 0 ) {
        /** 
         * Triggered if there are any buttons newly touched
         * @event touch.touch
         */
        this.events.emit('touch.touch', status);
    }
    
    if (status.buttonsReleased.length > 0) {
        /** 
         * Triggered if there are any buttons released
         * @event touch.release
         */
        this.events.emit('touch.release', status);
    }
};

module.exports = MultiTouchEventManager;