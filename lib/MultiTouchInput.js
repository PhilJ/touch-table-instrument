var serialport = require("serialport"),
    MultiTouchEventManager = require('./MultiTouchEventManager.js');

function MultiTouchInput(config) {

    this.deviceName = config.device;
    this.delimiter = config.delimiter;
    this.events = config.eventHandler;
    this.size = config.size;

    // Initialize MultiTouchEventManager, which triggers events based on client touch input
    this.touchEvents = new MultiTouchEventManager({
        size: this.size,
        eventHandler: this.events
    });
    // buffer containing only the isTouched data
    this.touchBuffer = null;
    // buffer containing proximity data
    this.promximityBuffer = null;

    this.device = new serialport.SerialPort(this.deviceName, {
        baudrate: 115200,
        parser: serialport.parsers.readline(this.delimiter)
    });

    var self = this;
    this.device.on('open',function() {
        self.device.on('data', function(data) {
            var parsedData = null;
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                console.log("Failed to parse JSON", data);
            }
            
            if (typeof parsedData !== 'null')
                if (Array.isArray(parsedData.isPressed) {
                    self.touchBuffer = parsedData.isPressed;
                }
                if (Array.isArray(parsedData.proximity)) {
                    this.events.trigger('proximity.update', parsedData.proximity);
                }
            }
        });
    });

    this.events.on('input.events.trigger', function () {
        if (Array.isArray(self.touchBuffer)) {
            self.touchEvents.update(self.touchBuffer);
        }
    });
}

module.exports = MultiTouchInput;
