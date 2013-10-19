var spi = require('spi');

function PixelController (config) { 
    this.mapping = config.mapping;
    this.device = new spi.Spi(config.deviceName);
    
    this.pixelCount = this.mapping.length;
    
    this.writeBuffer = new Buffer(this.pixelCount * 3);
    this.readBuffer = new Buffer(this.pixelCount * 3);
    this.writeBuffer.fill(0);
    this.readBuffer.fill(0);
    
    this.device.write(this.writeBuffer, this.readBuffer);
}

PixelController.prototype.set = function (pixelMatrix) {
    var pixelStrip = [];
  
    for (var m in this.mapping) {
        pixelStrip.push(pixelMatrix[ this.mapping[m][1] ][ this.mapping[m][0] ]);
    }
    for (var p in pixelStrip) {
        this.writeBuffer.write(pixelStrip[p].slice(0,6), p * 3, 'hex');
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

module.exports = {
  PixelController: PixelController,
  createMapping: createMapping
};
