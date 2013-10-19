var serialport = require("serialport");

function MultiTouchInput(config) {

    this.deviceName = config.device;
    this.delimiter = config.delimiter;
    this.events = config.eventHandler;

    this.device = new serialport.SerialPort(this.deviceName, {
        baudrate: 115200,
        parser: serialport.parsers.readline(this.delimiter)
    });

    this.device.on('open',function() {
      console.log('Port open');
    });

    this.device.on('data', function(data) {
      console.log(data);
    });

}

module.exports = MultiTouchInput;