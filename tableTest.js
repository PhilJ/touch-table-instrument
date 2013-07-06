var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var Uart = require('./UartReader.js');

// Init Divice
var device = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600,
  buffersize: 4,
  parser: Uart.rawWithDelimiterParser( Buffer("\n") )
});


// Define Input Mapping
var inputFormat = {
  isPressed: [0,1],
  x: [1,1],
  y: [2,1]
};

var uartReader = new Uart.UartReader({
  device: device,
  format: inputFormat
});

uartReader.listen(function (data) {
  console.log("Hey, here is some data", data);
  if (data.isTouched == true) {
    console.log("isTouched");
  }
});