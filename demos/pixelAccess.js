var ndarray = require('ndarray');

var size = [8, 6]
var pixels = ndarray(new Array(size[0]*size[1]), size);
pixels.set(7,5,true);
pixels.set(7,0,true);
pixels.set(1,0,true);
pixels.set(2,0,true);
pixels.set(0,5,true);

console.log(pixels);
console.log('pixels.toArray', toArray(pixels));
console.log("Unpacked pixels:", require('ndarray-unpack')(pixels));

function toArray (pixels) {
	var x = pixels._shape0
	   ,y = pixels._shape1;

	var output = [];
	for (var xc = 0; xc < x; xc++) {
		var column = [];	
		for (var yc = 0; yc < y; yc++) {
			console.log("Coord", xc, yc);
			column.push(pixels.get(xc,yc));
		}
		output.push(column);
	}
	return output;
}