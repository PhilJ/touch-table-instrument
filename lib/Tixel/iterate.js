"use strict"

var ndarray = require("ndarray");
var unpack = require("ndarray-unpack");

var iterate = require("cwise")({
  args: ["index", "array", "scalar"],
  body: function(idx, out, f) {
    f.apply(undefined, idx)
  }
})

var array1 = ndarray(new Array(4), [2,2]);
array1.set(0,0) = 1;
array1.set(1,1) = 1;

console.log("Before");
console.log(unpack(array1));

iterate(array1, function (x,y) {
	console.log("Element ", x, y, " : ", array1.get(x,y));
});


console.log("After");
console.log(unpack(array1));