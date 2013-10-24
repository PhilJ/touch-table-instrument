'use strict';


/* type helper */

var toString = Object.prototype.toString;
var regex = /\[object (.*?)\]/;
module.exports.type = function (o) {
    if (o && o.nodeType === 1) {
        return 'element';
    }
    var match = toString.call(o).match(regex);
    var _type = match[1].toLowerCase();
    if (_type === 'number' && isNaN(o)) {
        return 'nan';
    }
    return _type;
};

/**
 * ndarray operations
 */
module.exports.iterate = require("cwise")({
    args: ["index", "array", "scalar"],
    body: function(idx, out, f) {
        f.apply(undefined, idx)
    }
});


/**
 * Resize input matrix
 *
 * @param {ndarray} inputMatrix  2d input matrix
 * @param {array}   size         Size of output matrix in format [x,y]
 * @param {array}   position     Position of input matrix on output matrix
 * @param {*}       defaultValue Default value for fields on output matrix not covered by input matrix
 */
module.exports.resizeMatrix = function (inputMatrix, size, position, defaultValue) {
    var outputMatrix =  ndarray(new Array(size[0] * size[1]), size);

    var inputWidth = inputMatrix._shape0;
    var inputHeight = inputMatrix._shape1;
    fill(outputMatrix, function (x, y) {
        // cordinate can only be read out if exists on input matrix
        if (x >= position[0] && y >= position[1]) {
            var ix = x - position[0];
            var iy = y - position[1];
            if (ix < inputWidth && iy < inputHeight) {
                return inputMatrix.get(ix, iy);
            }
        } 
        return defaultValue;
    });
    return outputMatrix;
};


