// This script should always light the led under the touched button

var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var TouchEvents = require("./TouchEvents.js").TouchEvents;
var PixelController = require('./PixelController.js');
var color = require('onecolor');

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
/*var input = [
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "00FF00", "FFFF00", "FFFF00", "00FFFF", "0000FF", "0000FF"],
];*/

var input_white = [
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
  ["FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF", "FFFFFF"],
];

var pixels = [
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"],
  ["00000F", "00000F", "0000F0", "0000F0", "000000", "000000", "000000", "000000"]
];


var pressed = false;

// on touch event
var onTouch = function (event) {
 
  // make touched pixel white
  //input[event.newState.button.row][event.newState.button.column] = "FFFFFF";
  //ledPixels.set(pixels);
  //console.log(event);
  
  pressed = true;
  lighten();
  
  function lighten () {
    //console.log("Pressed: ", pressed);
    var oldColor = pixels[event.newState.button.row][event.newState.button.column];
    if (pressed === true) {
      newColor = color(oldColor);
      if (newColor.red() == 0) newColor = newColor.green(.05, true);
      else newColor = newColor.red(.05, true).green(-0.05, true); // (newColor.red() < 1)

      if (newColor.green() == 1) newColor = newColor.red(.05, true);
      console.log(newColor);

      pixels[event.newState.button.row][event.newState.button.column] = newColor.hex().substr(1,6);
      ledPixels.set(pixels);
      setTimeout(function () {
        lighten();
      }, 50);
      
    }
  };
//  console.log("Touch", event.newState.button);
}
// on release event
var onRelease = function (event) {
  // make released pixel black
  //input[event.oldState.button.row][event.oldState.button.column] = "F0000F";
//  console.log("Release", event.oldState.button);
  //ledPixels.set(pixels);
  //console.log("What a RELEASE!", event.oldState.button)
  pressed = false;
}
  
var onlyOnTouch = true;
touchEvents.subscribeAllButtons(onTouch, onRelease, onlyOnTouch);

// wireup uart reader with event manager
// wireup uart reader with event manager
device.on('data', function(data) {
  try {
    data = JSON.parse(data);
    //console.log(data);
    //if (typeof data.x == "number" && typeof data.y == "number" && data.x <= 100 && data.y <= 100) {
      touchEvents.update(data.isPressed, data.xPos, data.yPos);
    //}
  } catch (e) {
    console.log("Couldn't parse", data, e);
  }
});



