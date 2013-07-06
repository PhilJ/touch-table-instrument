var PixelController = require('./PixelController.js');

var rows = 7, cols = 6;
var startX = "left", startY = "bottom", wireingDirection = "vertical";
var ledDevice = '/dev/spidev0.0';

console.log(PixelController.createMapping(rows, cols, startX, startX, wireingDirection));

var pixels = new PixelController.PixelController({
    deviceName: ledDevice,
    mapping: PixelController.createMapping(rows, cols, startX, startX, wireingDirection)
});
/*
var input = [
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"]
];
*/
var input = [
  ["FF0000", "FF0000", "FF0000", "FF0000", "FF0000", "FF0000"],
  ["00FF00", "00FF00", "00FF00", "00FF00", "00FF00", "00FF00"],
  ["0000FF", "0000FF", "0000FF", "0000FF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "FF0000", "FF0000", "FF0000", "FF0000"],
  ["00FF00", "00FF00", "00FF00", "00FF00", "00FF00", "00FF00"],
  ["0000FF", "0000FF", "0000FF", "0000FF", "0000FF", "0000FF"],
  ["FF0000", "FF0000", "FF0000", "FF0000", "FF0000", "FF0000"]
];

pixels.set(input);