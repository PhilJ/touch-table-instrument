// This script should always light the led under the touched button

var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var MultiTouchEventManager = require("../lib/MultiTouchEventManager.js").MultiTouchEventManager;
var PixelController = require('../lib/PixelController.js');
var Color      = require("color");

// configure table 
var rows = 6, columns = 8;
var startX = "left", startY = "top", wireingDirection = "vertical";
var ledDevice = '/dev/spidev0.0'; 
var uartDevice = '/dev/ttyAMA0';
var uartMessageDelimiter = "\n\n\n";

// Define Input Mapping
var inputFormat = {
  isPressed: [0,'uint8'],
  x: [1,'uint8'],
  y: [2,'uint8'],
  prox1: [3,'uint8'],
  prox2: [4,'uint8']
};


// Init UART Device
var device = new SerialPort(uartDevice, {
  baudRate: 115200,
  bufferSize: 5,
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


var pressed = false;

// on touch event
var onTouch = function (state) {
 
//   make touched pixel white
//var row_temp = event.newState.button.row;
//var col_temp = event.newState.button.column;
//console.log(row_temp, col_temp);
  state.buttonsPressedNew.forEach(function (element, index) {

    input[element.y][element.x] = "FFFFFF";
  //  input[row_temp + 1][col_temp +1] = "AAAAAA";
    ledPixels.set(input);
  });
  
  /*pressed = true;
  lighten();
  
  function lighten () {
    if (pressed == true) {
      var oldColor = input[event.newState.button.row][event.newState.button.column];
      
      var newColor = Color(oldColor).lighten(0.1).hexString().slice(1,7);
      console.log(oldColor, newColor);
      input[event.newState.button.row][event.newState.button.column] = newColor;
      ledPixels.set(input);
      setTimeout(function () {
        lighten();
      }, 10);
      
    }
  };*/
//  console.log("Touch", event.newState.button);
}


// on release event
var onRelease = function (state) {
//   make released pixel pink
  state.buttonsPressedNew.forEach(function (element, index) {

    input[element.y][element.x] = "7CFC00";
  //  console.log("Release", event.oldState.button);
    ledPixels.set(input);
  });
 // pressed = false;
};
  
touchEvents.subscribe({all: true} , onTouch, onRelease);

// wireup uart reader with event manager
device.on('data', function(data) {
  data = JSON.parse(data);
  console.log(data);
  /*var hex1 = data.prox_left_half.toString(16);
  if (hex1.length < 2) hex1 = "0" + hex1;
  var hex2 = data.prox_right_half.toString(16);
  if (hex2.length < 2) hex2 = "0" + hex2;

  var color = hex1 + hex2 + "00";
  var output = [];
  for (var r = 0; r < rows; r++) {
    output[r] = [];
    for (var c = 0; c < columns; c++) {
      output[r][c] = color;
    }
  }*/
  //console.log(data.col_raw[7]);
  //ledPixels.set(output);
  
  //if (typeof data.x == "number" && typeof data.y == "number" && data.x <= 100 && data.y <= 100) {
    touchEvents.update(data.isPressed);
  //}
});



