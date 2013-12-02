'use strict';

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


module.exports.generateMatrix = function (size, defaultValue) {
    var matrix = new Array();
    for (var x = 0; x < size[0]; x++) {
        var column = Array();
        for (var y = 0; y < size[1]; y++) {
            column.push(defaultValue);
        }
        matrix.push(column);
    }
    return matrix;
}

module.exports.isSize = function (size) {
    if (Array.isArray(size) && size.length === 2 && typeof size[0] === 'number' && typeof size[1] === 'number') {
        return true;
    }
    return false;
};

module.exports.isPosition = function (position) {
    return module.exports.isSize(position);
};

module.exports.isMatrix = function (matrix) {
    if (Array.isArray(matrix) && Array.isArray(matrix[0])) {
        return true;
    }
    return false;
};

module.exports.isOnMatrix = function (position, size) {
    if (position[0] >= 0 && position[0] < size[0] && position[1] >= 0 && position[1] < size[1]) {
        return true;
    }
    return false;
};


