var utils = require('./utils.js');

/**
 * Size of an matrix in format [x, y], e.g. [5,5] for a 5x5 Matrix. Equal to Position.
 * @typedef {Array.<Number>} Size
 *
 * Position on a matrix in format [x, y], e.g. [1,2]. Equal to Size.
 * @typedef {Array.<number>} Position
 *
 * 2D Matrix with format matrix[x][y]
 * @typedef {Array.<Array>} Matrix
 */

/**
 * TixelMatrix is the representation of a 2-dimensional array. It supplies setter, getter,
 * easy iterations and nice shorthands, e.g. setAll() or reset().
 * 
 * @constructor
 *
 * @property {Matrix} matrix       Holds all values of TixelMatrix
 * @property {*}      defaultValue Default value, e.g. on reset()
 * @property {Size}   size         Size of pixel matrix in format [x, y], e.g. [2,2]
 * @property {Matrix} buffer       Holds all array with buffered values, which can are written to matrix on readBuffer()
 * @example
 * 		new TixelMatrix([2, 2], 0);                  // Create TixelMatrix with size [2, 2] and default value 0
 * 		new TixelMatrix([2, 2] 0, [[1, 0], [0, 1]]); // Create TixelMatrix and preset values
 */
function TixelMatrix (size, defaultValue, matrix) {
	this.defaultValue = defaultValue;
	if (utils.isSize(size) === true) {
		this.size = size;
	} else {
		this.size = [1,1];
	}

	this.matrix = utils.generateMatrix(this.size, this.defaultValue);
    this.buffer = utils.generateMatrix(this.size, null);

	if (utils.isMatrix(matrix)) {
		this.setMatrix(matrix);
	}
}

/**
 * Get value for coordinates on matrix, shorthand for {@link TixelMatrix#getAt}
 * @param  {number} x x coordinate on matrix
 * @param  {number} y y coordinate on matrix
 * @return {*} Value on position
 */
TixelMatrix.prototype.get = function (x, y) {
    return this.getAt([x,y]);
};

/**
 * Get value for position on matrix
 * @param  {Position} position
 * @return {*} Value on position
 */
TixelMatrix.prototype.getAt = function (position) {
    if (utils.isPosition(position) === true && utils.isOnMatrix(position, this.size) === true) {
        return this.matrix[ position[0] ][ position[1] ];
    }
};

/**
 * Set value for coordinates on matrix, shorthand for {@link TixelMatrix#setAt}
 * @param {number} x     x coordinate on matrix
 * @param {number} y     y coordinate on matrix
 * @param {*}      value Value to set on matrix
 */
TixelMatrix.prototype.set = function (x, y, value) {
    return this.setAt([x,y], value);
};

/**
 * Set value at position on matrix
 * @param {Position} position Position on matrix
 * @param {*}        value
 */
TixelMatrix.prototype.setAt = function (position, value) {
	if (utils.isPosition(position) === true && utils.isOnMatrix(position, this.size) === true) {
		this.matrix[ position[0] ][ position[1] ] = value;
	}
};

/**
 * Set buffer values at position, which are written to matrix, when {@link TixelMatrix#applyBuffer} is called.
 * The first value in array is applied first.
 * 
 * @param  {number} x x coordinate on matrix
 * @param  {number} y y coordinate on matrix
 * @param {Array}    buffer   Buffer array for coordinate
 */
TixelMatrix.prototype.setBuffer = function (x, y, buffer) {
	var position = [x, y];
	if (utils.isPosition(position) === true && utils.isOnMatrix(position, this.size) === true && Array.isArray(buffer)) {
		this.buffer[x][y] = buffer;
	}
};

/**
 * Read values for matrix from buffer, if any are set. 
 */
TixelMatrix.prototype.applyBuffer = function () {
	var self = this;
	this.forEach(function (x, y) {
		var buffer = self.buffer[x][y];
        if (Array.isArray(buffer) && buffer.length > 0) {
            // read first value from array
            var value = buffer[0];
            // write first buffer value to matrix
            self.matrix[x][y] = value; 

            if (buffer.length > 1) {
                // delete first value from buffer
                self.buffer[x][y] = buffer.slice(1, buffer.length);
            } else {
                // set value buffer to null if this was last buffer value
                self.buffer[x][y] = null;
            }

            // write buffer value to value matrix
            self.matrix[x][y] = value;
        } else {
            // set buffer to null if invalid
            self.buffer[x][y] = null;
        }
	});
};

/**
 * Set values of passed matrix to this matrix at position. 
 * 
 * @param {Matrix} matrix   2D array of values, can be any size
 * @param {[type]} position Position were were matrix is placed, can also be negative, e.g. [-1,-1]
 * @example
 *      var matrix1 = new Matrix([3,3], 1); 
 *      var matrix2 = new Matrix([4,4], 0);
 *      var position = [-1,-1];
 *      matrix2.setMatrix(matrix1, position);
 */
TixelMatrix.prototype.setMatrix = function (matrix, position) {
	if (utils.isPosition(position) === false) position = [0,0];
	if (utils.isMatrix(matrix)) {
		for (var cx = 0; cx < matrix.length; cx++) {
			for (var cy = 0; cy < matrix[cx].length; cy++) {
				var x = cx + position[0],
				    y = cy + position[1];
				if (utils.isOnMatrix([x,y], this.size)) {
					this.matrix[x][y] = matrix[cx][cy];
				}
			}
		}
	}
};

/**
 * Callback which is called for all values in matrix
 * @callback MatrixforEachCallback
 * @param {number} x     x coordinate of position
 * @param {number} y     y coordinate of position
 * @param {*}      value Value at position
 */

/**
 * Iterate over all values in matrix
 * @param  {MatrixforEachCallback} callback
 */
TixelMatrix.prototype.forEach = function (callback) {
	for (var x = 0; x < this.size[0]; x++) {
		for (var y = 0; y < this.size[1]; y++) {
			callback(x, y, this.matrix[x][y]);
		}
	}
};

/**
 * Iterate over all values in matrix and set return value of
 * callback as new value
 * @param {MatrixforEachCallback} callback
 */
TixelMatrix.prototype.setForEach = function (callback) {
	var self = this;
	this.forEach(function (x, y, value) {
		self.matrix[x][y] = callback(x, y, value);
	});
};

/**
 * Resets all values in matrix to defaultValue
 */
TixelMatrix.prototype.reset = function () {
	var self = this;
	this.setForEach(function (x, y) {
		return self.defaultValue;
	});
};

/**
 * Sets all values in matrix to passed value
 * @param {*} value
 */
TixelMatrix.prototype.setAll = function (value) {
	var self = this;
	this.setForEach(function (x, y) {
		return value;
	});
};

module.exports = TixelMatrix;

