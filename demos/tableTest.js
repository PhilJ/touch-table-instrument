// This script should always light the led under the touched button

var splib      = require("serialport");
var color = require('onecolor');
var SerialPort = splib.SerialPort;
var MultiTouchEventManager = require("../lib/MultiTouchEventManager.js").MultiTouchEventManager;
var PixelController = require('../lib/PixelController.js');


// configure table 
var rows = 6, columns = 8;
var startX = "left", startY = "top", wireingDirection = "vertical";
var ledDevice = '/dev/spidev0.0'; 
var uartDevice = '/dev/ttyAMA0';
var uartMessageDelimiter = "\n\n\n";


// Init UART Device
var device = new SerialPort(uartDevice, {
  baudRate: 115200,
  bufferSize: 6,
  parser: splib.parsers.readline(uartMessageDelimiter)
});


// Init touch event manager
var touchEvents = new MultiTouchEventManager({rows: rows, columns: columns});

var mapping = PixelController.createMapping(rows, columns, startX, startY, wireingDirection);
mapping.unshift([0,0], [0,0]);

// Init Pixel Controller
var ledPixels = new PixelController.PixelController({
    deviceName: ledDevice,
    mapping: mapping
});

//console.log(PixelController.createMapping(rows, columns, startX, startX, wireingDirection).unshift());

// Setup pixel default value
/*var input = [
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
];*/

var pixels = [
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"],
  ["000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"]
];

/*var pixels = [
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
];*/

/*var pixels = [
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"]
];*/


var pressed = false;

// on touch event
var onTouch = function (status) {
  status.buttonsPressedNew.forEach(function (element, index) {
    pixels[element.y][element.x] = 'FFFFFF';
  });

  //console.log("TOUCH", status, pixels);
  ledPixels.set(pixels);
}

// on release event
var onRelease = function (status) {
  status.buttonsReleased.forEach(function (element, index) {
    pixels[element.y][element.x] = '000000';
  });
  //console.log("RELEASE", status, pixels);
  ledPixels.set(pixels);
}
  
var onlyOnTouch = true;
touchEvents.subscribe({all:true}, onTouch, onRelease);

// wireup uart reader with event manager
// wireup uart reader with event manager
device.on('data', function(data) {
  //try {
    console.log(data);
    data = JSON.parse(data);
    touchEvents.update(data.isPressed);
  //} catch (e) {
    //console.log("Couldn't parse", data, e);
  //}
});



