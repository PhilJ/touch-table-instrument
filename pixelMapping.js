
/* 
  Convert matrix of pixels to list 

  @param pixels  Array 2-dimensional Array of Hex-Color values (pixels[row][col] / pixels[y][x]) 
  @param mapping Array List of Array which maps LED (index) to color in pixel map [row, col]. 
*/
function pixelMatrixToChain (pixels, mapping) {
  var output = [];
  
  for (var m in mapping) {
    output.push(pixels[ mapping[m][1] ][ mapping[m][0] ]);
  }

   return output;
}


/*
  Creates a mapping array, which is required for pixelMatrixToChain conversion
  
  Mapping contains the coordinates [row-index, col-index] in the matrix for each led
  in the chain. first mapping value contains coordinates in matrix for first pixel, ect.
  
  @param rows      Int    Number of rows
  @param cols      Int    Number of cols
  @param startX    String Position of first x pixel, either "left" or "right"
  @param startY    String Position of first y pixel, either "top" or "bottom"
  @param direction String Direction of wiring, either "vertical" or "horizontal"
  
  @output Array for pixelMatrixToChain mapping
*/
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

// EXAMPLE

var rows = 6, cols = 8;
var startX = "left", startY = "bottom", wireingDirection = "vertical";

var mapping = createMapping(rows, cols, startX, startX, wireingDirection);

/*

mapping =

[[0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [2, 4], [2, 3], [2, 2], [2, 1], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 5], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]]

*/

var pixels = [
  ["000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE", "FFFFFF"],
  ["000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE", "FFFFFF"],
  ["000000", "111111", "222222", "333333", "444444", "555555", "666666", "777777"],
  ["888888", "999999", "AAAAAA", "BBBBBB", "CCCCCC", "DDDDDD", "EEEEEE", "FFFFFF"]
];

console.log(pixelMatrixToChain(pixels, mapping));

/*
OUTPUT

["888888", "000000", "888888", "000000", "888888", "000000", "111111", "999999", "111111", "999999", "111111", "999999", "AAAAAA", "222222", "AAAAAA", "222222", "AAAAAA", "222222", "333333", "BBBBBB", "333333", "BBBBBB", "333333", "BBBBBB", "CCCCCC", "444444", "CCCCCC", "444444", "CCCCCC", "444444", "555555", "DDDDDD", "555555", "DDDDDD", "555555", "DDDDDD", "EEEEEE", "666666", "EEEEEE", "666666", "EEEEEE", "666666", "777777", "FFFFFF", "777777", "FFFFFF", "777777", "FFFFFF"]

*/