'use strict';

var EventEmitter = require('events').EventEmitter,
    TixelElement = require('./TixelElement.js');


/**
 * TixelController provides a loop for TixelElement rendering
 * and events to bind input events (e.g. touch) and render events
 * which can be bound to a view (e.g. led matrix or website).
 *
 * The loop keeps input events, like touch in sync with rendering.
 * At the beginning of each loop the event 'input.events.trigger' is triggered on 
 * to notifiy input controller to trigger their events, e.g. 'touch', at the 
 * passed EventEmitter. In case the state of the input controller, e.g.
 * the touch controller was changed multiple times since last loop, these states
 * get evaluated not before 'input.events.trigger' is triggered. When notified the
 * input controller triggeres its touch events at this.events and can
 * be subscribed to by the tixel modules. 
 *
 * @example
 *   // Initialize and start loop of pixel controller with 30 frames
 *      var controller = new TixelController({
 *          fps: 30
 *      });
 *      controller.startModule('touchDemo');
 *
 * @constructor
 * @param {object}   config        Configuration object
 * @param {number}   config.fps    Frames per second, default: 30

 * @property {number}       fps    Frames per second which is achived for rendering
 * @property {boolean}      run    Is true, when loop is currently running
 * @property {EventEmitter} events EventEmitter for render and touch events
 * @property {object}       inputControllers Array of input controllers, which are triggered each loop to update their state
 * @property {object}       output Cached output of the last render event
 * @property {TixelElement} tixel  Tixel element which is changed by module and used for rendering
 */
function TixelController (config) {
    this.fps = (typeof config.fps === 'number') ? config.fps : 30;
    this.size = (Array.isArray(config.size) &&
                  typeof config.size[0] === 'number' &&
                  typeof config.size[1] === 'number') ? [config.size[0], config.size[1]] : [10,10];

    this.run = false;
    this.events = new EventEmitter();
    this.inputs  = {};
    this.output = null;
    this.tixel = null;
}

/**
 * Start tixel module, which will listen to input events and changes
 * the passed tixel element, which is used for rendering. 
 *
 * The module must be a function, which receives this object
 * as the first, and a plain TixelElement as second parameter.
 * The element can listen to input events at the passed instance of
 * this object and change the TixelElement based on this events. 
 * 
 * @param  {function} module Module function
 */
TixelController.prototype.startModule = function (module) {
    // make sure module is loaded an accessible
    this.tixel = new TixelElement(this.size);
    try {
        module(this, this.tixel);
        this.start();
    } catch (e) {
        console.log('Failed starting module');
        console.log(e);
    }
    
};

/**
 * Main loop, retriggers automatically by given frame rate. 
 * Call start() to start and stop() to stop loop
 *
 * @fires TixelController#render
 */
TixelController.prototype.loop = function () {
    if (this.run !== true) return;

    var time = this.timeToNextLoop();
    var self = this;
    // schedule rendering at end of loop
    setTimeout(function () {
        this.output = self.tixel.render();
        /** 
         * @event TixelController#render
         * @type {object}
         * @property {array of strings} matrix Pixel matrix  
         */
        self.events.emit('render', {pixels: this.output});
        self.loop();
    }, time);

    // tell input controllers, to trigger their input events
    this.events.emit('input.events.trigger', {});
};

TixelController.prototype.timeToNextLoop = function () {
    var loopTime = 1000 / this.fps;
    var currentTime = new Date().getTime();
    var timeToNextLoop = this.lastLoopStart + loopTime - currentTime;
    this.lastLoopStart = currentTime;
    return timeToNextLoop;
}

/**
 * Stops loop
 */
TixelController.prototype.stop = function () {
    this.run = false;
};

/**
 * Starts loop
 */
TixelController.prototype.start = function () {
    this.run = true;
    this.loop();
};


module.exports = TixelController;