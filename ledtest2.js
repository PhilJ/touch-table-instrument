var spi = require('spi');

function PixelController (config) { 
    this.mapping = config.mapping;
    this.device = new spi.Spi(config.deviceName);
    
    this.pixelCount = mapping.length;
    
    this.writeBuffer = new Buffer(this.pixelCount * 3);
    this.readBuffer = new Buffer(this.pixelCount * 3);
    this.writeBuffer.fill(0);
    this.readBuffer.fill(0);
    
    this.device.write(this.writeBuffer, this.readBuffer);
}

PixelController.prototype.set = function (pixelMatrix) {
    var pixelStrip = [];
  
    for (var m in mapping) {
        pixelStrip.push(pixels[ mapping[m][1] ][ mapping[m][0] ]);
    }
    
    for (var p in pixelStrip) {
        this.writeBuffer[ p * 3 ]     = pixelStrip[p].slice(0,2); // red
        this.writeBuffer[ p * 3 + 1 ] = pixelStrip[p].slice(2,4); // green
        this.writeBuffer[ p * 3 + 2 ] = pixelStrip[p].slice(4,6); // blue
    }
    
    this.device.write(this.writeBuffer, this.readBuffer);
}

function createMapping (rows, cols, startX, startY, direction) {
  var output = [];
  
  var x = (startX === "left") ? 0 : (cols - 1);
  var y = (startY === "top")  ? 0 : (rows - 1);

  var xDirection = (x === 0) ? "right" : "left";
  var yDirection = (y === 0) ? "down" : "up";
  
  for (var i = 0; i < rows * cols; i++) {
    // push coordinates
    output.push([x, y]);
    
    // vertical mode
    if (direction == "vertical") { 
      // change col (x) when end if no more rows left in col
      if ((i + 1) % rows === 0) {
        if (xDirection == "right") { x++; } else { x--; }
        yDirection = (yDirection === "up") ? "down" : "up";
      } else {
        // change row (y) every iteration
        if (yDirection == "up") { y--; } else { y++; } 
      } 
    }
    
    // horizontal mode
    if (direction == "horizontal") { 
      if ((i + 1) % cols === 0) {
        if (yDirection == "up") { y--; } else { y++; }
        xDirection = (xDirection === "left") ? "right" : "left";
      } else {
        // change col (y) every iteration
        if (xDirection == "right") { x++; } else { x--; } 
      } 
    }
  }
  return output;
}



var rows = 7, cols = 6;
var startX = "left", startY = "bottom", wireingDirection = "vertical";
var mapping = createMapping(rows, cols, startX, startX, wireingDirection);

var controller = new PixelController({
    deviceName: '/dev/spidev0.0',
    mapping: mapping
});

var pixels = [
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD"],
  ["000000", "111111", "222222", "333333", "444444", "555555"]
];

controller.set(pixels);
