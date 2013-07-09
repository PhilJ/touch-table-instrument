var assert = require("assert")
//var PixelController = require('../PixelController.js')

describe("PixelController Test", function () {
  describe("createMapping()", function () {
    it('should return correct mapping for top,left,horizontal', function () {
      var rows = 3, columns = 3;
      var startX = "left", startY = "top", wireingDirection = "horizontal";
      
      var mapping = createMapping(rows, columns, startX, startY, wireingDirection);
      var expect = [
         [0,0], [1,0], [2,0], [2,1], [1,1], [0,1], [0,2], [1,2], [2,2]
      ];
      assert.deepEqual(mapping, expect);
    
    })
  })
});



function createMapping (rows, cols, startX, startY, direction) {
  var output = [];
  
  var x = (startX == "left") ? 0 : (cols - 1);
  var y = (startY == "top")  ? 0 : (rows - 1);
  console.log("startX", startX);
  console.log("startY", startY);
  console.log("X&Y", x, y);

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