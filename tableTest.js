// This script should always light the led under the touched button

var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var Uart = require('./UartReader.js');
var TouchEvents = require("./TouchEvents.js").TouchEvents;
var PixelController = require('./PixelController.js');

// configure table 
var rows = 6, columns = 8;
var startX = "left", startY = "top", wireingDirection = "vertical";
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
  baudRate: 115200,
  bufferSize: 6,
  parser: Uart.rawWithDelimiterParser( Buffer("\n\n\n"), 3 )
});

// Init Uart Reader
var uartReader = new Uart.UartReader({
  'device': device,
  'inputFormat': inputFormat
});

// Init touch event manager
var touchEvents = new TouchEvents(rows, columns);

var mapping = PixelController.createMapping(rows, columns, startX, startY, wireingDirection);
mapping.unshift([0,0], [0,0]);

// Init Pixel Controller
var ledPixels = new PixelController.PixelController({
    deviceName: ledDevice,
    mapping: mapping
});

//console.log(PixelController.createMapping(rows, columns, startX, startX, wireingDirection).unshift());

// Setup pixel default value
var input = [
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
];

var input_white = [
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
];




// on touch event
var onTouch = function (event) {
 
  // make touched pixel white
  input[event.newState.button.row][event.newState.button.column] = "FFFFFF";
  ledPixels.set(input);
//  console.log("Touch", event.newState.button);
}
// on release event
var onRelease = function (event) {
  // make released pixel black
  input[event.oldState.button.row][event.oldState.button.column] = "F0000F";
//  console.log("Release", event.oldState.button);
  ledPixels.set(input);
}
  
var onlyOnTouch = true;
touchEvents.subscribeAllButtons(onTouch, onRelease, onlyOnTouch);

// wireup uart reader with event manager
uartReader.listen(function (data) {
  //if (typeof data.x == "number" && typeof data.y == "number" && data.x <= 100 && data.y <= 100) {
    touchEvents.update(data.isPressed, data.x, data.y);
  //}
});



