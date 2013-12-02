'use strict';

var express = require('express'),
    socketio = require('socket.io'),
    EventHandler = require('events').EventHandler,
    MultiTouchEventManager = require('../MultiTouchEventManager.js');

/**
 * Creates a web simulation of the touch table, which can
 * be used simultaniously to table, e.g. from an iPad, or
 * stand-alone without the table for testing.
 * 
 * @param {object}       config              - Configuration Object
 * @param {number}       config.port         - Port to run server on
 * @param {array}        config.size         - Size of touch matrix in format [x,y], default: [10,10]
 * @param {EventHandler} config.eventHandler - Event handler, were touch events can be 
 *                                             triggered and render events listened to
 */
function TixelServer (config) {
    this.port = (typeof config.port === 'number') ? config.port : 80;
    this.size = (Array.isArray(config.size) &&
                  typeof config.size[0] === 'number' &&
                  typeof config.size[1] === 'number') ? [config.size[0], config.size[1]] : [10,10];
    this.events = (config.eventHandler !== undefined) ? config.eventHandler : new EventHandler();

    // Initialize web server (for static files, e.g. index.html) and 
    // web socket (to transfer touch and render events)
    this.app = express();
    this.app.use(express.static(__dirname + '/public'));

    this.server = this.app.listen(this.port);
    this.io  = socketio.listen(this.server, {log: false});

    // Initialize MultiTouchEventManager, which triggers events based on client touch input
    this.touchEvents = new MultiTouchEventManager({
        size: this.size,
        eventHandler: this.events
    });
    this.touchBuffer = null;

    // Listen to update state events, which each triggered by TixelController
    // each frame to tell input devices to trigger their input events, e.g. touch
    var self = this;
    this.events.on('input.events.trigger', function () {
        self.triggerInputEvents();
    });

    this.io.sockets.on('connection', function (socket) {
        socket.emit('setup', {size: self.size});
        // Send render event from PixelController to clients
        self.events.on('render', function (e) {
            socket.emit('render', e);
        });
        // Listen to touch events on client and cache them until 'input.updateState' is called
        socket.on('touch', function (data) {
            // Only last touchInput is cached, all others ignored. Could be replaced by buffer aggregation, 
            // for different behaivor
            self.touchBuffer = data.touch;
        });
    });
}

/**
 * Is called on each frame of TixelController to schedule events 
 */
TixelServer.prototype.triggerInputEvents = function () {
    if (this.touchBuffer !== null) {
        this.touchEvents.update(this.touchBuffer);
    }
};

module.exports = TixelServer;