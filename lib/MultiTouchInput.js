var serialport = require("serialport"),
    MultiTouchEventManager = require('./MultiTouchEventManager.js');
    type = require('./Tixel/utils.js').type;

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
    this.touchBuffer = null;

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
            
            if (type(parsedData.isPressed) === 'array') {
                self.touchBuffer = parsedData.isPressed;
            }
        });
    });

    this.events.on('input.events.trigger', function () {
        if (type(self.touchBuffer) === 'array') {
            self.touchEvents.update(self.touchBuffer);
        }
    });
}

module.exports = MultiTouchInput;