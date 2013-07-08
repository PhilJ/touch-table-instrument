// This script should always light the led under the touched button

var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var Uart = require('./UartReader.js');
var TouchEvents = require("./TouchEvents.js").TouchEvents;
var PixelController = require('./PixelController.js');

// configure table 
var rows = 7, columns = 6;
var startX = "left", startY = "bottom", wireingDirection = "vertical";
var ledDevice = '/dev/spidev0.0'; 
var uartDevice = '/dev/ttyAMA0';

// Define Input Mapping
var inputFormat = {
  isPressed: [0,1],
  x: [1,1],
  y: [2,1]
};


// Init UART Device
var device = new SerialPort(uartDevice, {
  baudrate: 9600,
  buffersize: 4,
  parser: Uart.rawWithDelimiterParser( Buffer("\n") )
});

// Init Uart Reader
var uartReader = new Uart.UartReader({
  device: device,
  format: inputFormat
});

// Init touch event manager
var touchEvents = new TouchEvents(rows, columns);

// Init Pixel Controller
var ledPixels = new PixelController.PixelController({
    deviceName: ledDevice,
    mapping: PixelController.createMapping(rows, columns, startX, startX, wireingDirection)
});

// Setup pixel default value
var input = [
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000"]
];



// wireup uart reader with event manager
uartReader.listen(function (data) {
  // on touch event
  var onTouch = function (event) {
    // make touched pixel white
    input[event.newState.button.row][event.newState.button.column] = "FFFFFF";
    ledPixels.set(input);
  }
  // on release event
  var onRelease = function (event) {
    // make released pixel black
    input[event.newState.button.row][event.oldState.button.column] = "000000";
    ledPixels.set(input);
  }
  
  var onlyOnTouch = true;
  touchEvents.subscribeAllButtons(onTouch, onRelease, onlyOnTouch);
});



