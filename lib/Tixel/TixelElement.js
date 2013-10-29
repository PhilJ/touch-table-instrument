'use strict';

var TixelSelection = require('./TixelSelection.js'),
    TixelMatrix = require('./TixelMatrix.js'),
    utils = require('./utils.js'),
    type     = utils.type,
    chroma = require('chroma-js');

/**
 * Tixel provides a jQuery-like interface for dynamic manipulation of 
 * an image, represented as an array of pixels. Initialize either with size array
 * or with configuration object.
 * @example
 *      var tixel = new TixelElement([10,10]); // initialize with size array
 *      var tixel = new TixelElement({         // initialize with object
 *          size: [10,10],
 *          defaultColor: 'FF0000',
 *          colorMap: ['00FF00', '00FF00']
 *      });
 *      
 *      tixel.selectLine([0,0], [10,10]).setSelectedPixels('00FF00'); // draw a line directly
 *      var output = tixel.render();
 *      
 *      tixel.selectLine([0,0], [10,10]).setSelectedValues(1); // draw a line by using values which are converted to colors
 *      var output = tixel.render();
 *      
 *
 * @constructor
 * @augments TixelSelection
 * @param {array}  config    Size of matrix as [width, height], default: [10,10]
 * 
 * @param {object}   config              Configuration object, all values are optional, however a size should be passed
 * @param {Size}     config.size         Size of matrix, default: [10,10]
 * @param {Position} config.position     Position matrix on parent matrix, default: [0,0]
 * @param {Position} config.origin       Position of origin on matrix, default: [0, 0]
 * @param {string}   config.defaultColor Default color for background, default: '000000'
 * @param {array}    config.colorMap     Array of color which is mapped on values for output generation
 *
 * @property {Size}         size         Size of output (pixel matrix)
 * @property {Position}     position     Origin coordinate of canvas, can be used to position child TixelElement
 * @property {Position}     origin       Position of origin, when placing Tixel on ParentElement
 * @property {string}       defaultColor Default/background color
 * @property {TixelMatrix}  canvas       Canvas were child pixels are rendered on
 * @property {TixelMatrix}  valueCanvas  Value matrix is used to calculate output based on colorMap (Array based)
 * @property {TixelMatrix}  mask         Opacity of element, can be used for child TixelElement (Float64Array based)
 * @property {TixelMatrix}  output       Rendered matrix of colors, output of TixelElement (Array based)
 * @property {Array.<HexColor>} colorMap List of colors which is used map values
 * @property {Array.<TixelChildElement>}  childElements Child TixelElements which are rendered on given pixel element
 * @property {number}       frame        Frame index, gets incremented on each render
 */
function TixelElement (config) {
    // check if config is defined
    if (type(config) === 'undefined') config = {}; 
    // Check for alternative initialization with array
    if (utils.isSize(config)) {
        config = { size: config };
    }

    // Inherit from TixelSelection
    TixelSelection.apply(this, Array.prototype.slice.call( arguments )); 

    this.size = utils.isSize(config.size) ? config.size : [10,10];

    // TODO: Move to ChildTixel
    this.position = utils.isPosition(config.position) ? config.position : [0,0];
    this.origin = utils.isPosition(config.origin) ? config.origin : [0,0];
    this.mask = new TixelMatrix(this.size, 1);

    // Set default (background) color
    this.defaultColor = (type(config.defaultColor) === 'string') ? config.defaultColor : '000000';


    this.valueCanvas = new TixelMatrix(this.size, null); 
    this.canvas = new TixelMatrix(this.size, this.defaultColor);
    this.output = new TixelMatrix(this.size, this.defaultColor);

    this.colorMap = (type(config.colorMap) === 'array') ? config.colorMap : [this.defaultColor];

    // List of child PixelElements which are applied on out render
    this.children = [];

    this.frame = 0;
}
 
/* set TixelElement prototype to TixelSelection to inherit behaivor */
TixelElement.prototype = new TixelSelection();

/********************************
****** RENDERING ****************
*********************************/

/** 
 * Render next frame
 */
TixelElement.prototype.render = function (type) {
    this.canvas.applyBuffer();
    this.valueCanvas.applyBuffer();

    // duplicate canvas on rendered
    this.output = new TixelMatrix(this.size, this.defaultColor, this.canvas.matrix);
    
    this._renderValues();
    this._renderChildren();

    // Check if any value is set
    //TODO: this.renderShapes();
    this.frame++;

    return this.output.matrix;
};


/**
 * Render child elements
 */
TixelElement.prototype._renderChildren = function () {
    for (var c in this.children) {
        var childTixel = this.children[c];
        childTixel.render();
        var childRenderResult = childTixel.output;
        this._applyChildMatrix(childRenderResult, childTixel.mask, childTixel.position);
    }
};

/**
 * Apply child matrix on parent matrix
 * 
 * @param  {ndarray} colorMatrix   Color matrix of child
 * @param  {ndarray} opacityMatrix Opacity matrix of child in same size as colorMatrix
 * @param  {array}   position      Position of child matrix on parent in format [x,y]
 */
TixelElement.prototype._applyChildMatrix = function (colorMatrix, maskMatrix, position) {
    var self = this;
    colorMatrix.forEach(function (x, y, childColor) {
        var opacity    = maskMatrix.get(x,y),
            px         = x + position[0],
            py         = y + position[1],
            pp         = [px, py];

        if (utils.isOnMatrix(pp, self.size) === true) {
            if (opacity > 0 && opacity < 1) {
                var parentColor = self.output.get(px, py);
                var result = chroma.interpolate('#' + childColor, '#'+ parentColor, 1-opacity).hex().substr(1,7);
                self.output.set(px, py, result);
            } else if (opacity === 1) {
                self.output.set(px, py, childColor);
            }
        }
    });
};


/**
 * Dynamically calculate output colors based on values and colorMap
 *
 * @access private
 */
TixelElement.prototype._renderValues = function () {
    var self = this;
    this.valueCanvas.forEach(function (x, y, value) {
        if (type(value) === 'number') {
            var color = self.getMappedColor(value);
            if (type('color') === 'string') {
                self.canvas.set(x,y,color);
            } else {
                console.log("You are using Tixel values, please define a colorMap to dynamicly create color values");
            }
        }
    });
};

TixelElement.prototype._applyValueBuffer = function () {
    var self = this;
    // Iterate over value buffer
    iterate(this.valueBuffer, function (x,y) {
        var valueArray = self.valueBuffer.get(x,y);
        if (type(valueArray) === 'array') {
            // read first value from array
            var value = valueArray[0];
            if (valueArray.length > 1) {
                // delete first value from buffer
                self.valueBuffer.set(x,y, valueArray.slice(1,valueArray.length));
            } else {
                // set value buffer to null if this was last buffer value
                self.valueBuffer.set(x,y, null);
            }
            if (type(value) === 'number') {
                // write buffer value to value matrix
                self.values.set(x,y,value);
            }
        }
    });
};

TixelElement.prototype._applyOutputBuffer = function () {
    var self = this;
    // Iterate over output buffer
    iterate(this.outputBuffer, function (x,y) {
        var colorArray = self.outputBuffer.get(x,y);
        if (type(colorArray) === 'array' && colorArray.length > 0) {
            // read first value from array
            var color = colorArray[0];
            if (colorArray.length > 1) {
                // delete first value from buffer
                self.outputBuffer.set(x,y, colorArray.slice(1,colorArray.length));
            } else {
                // set buffer to for this pixel to null, if this was last entry
                self.outputBuffer.set(x,y, null);
            }
            if (type(color) === 'string') {
                // write buffer value to output matrix
                self.canvas.set(x,y,color);
            }
        }
    });
};

/**
 * Get a color from the colorMap based on value. 
 * @param  {Float} Value between 0 and 1
 * @return {String} Mapped color
 * @return {Boolean} When false, no colorMap is available or value out of index
 */
TixelElement.prototype.getMappedColor = function (value) {
    if (this.colorMap.length > 0) {
        // Calculate index in colorMap
        var colorIndex = Math.floor( this.colorMap.length * value);

        // Fix values which are to large or small (e.g. because value is out of range)
        if (colorIndex < 0) colorIndex = 0;
        if (colorIndex >= this.colorMap.length) colorIndex = this.colorMap.length - 1;

        if (type(this.colorMap[colorIndex]) === 'string') {
            return this.colorMap[colorIndex];    
        }
    } 
    return false;
};


/********************************
****** MANIPULATION *************
*********************************/


/**
 * Set color to selected pixels
 * @param {string} color Color to set in output on all selected pixels
 * @return {TixelElement}
 */
TixelElement.prototype.setSelectedPixels = function (color) {
    if (type(color) === 'string') {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.canvas.set(position[0], position[1], color);
        });
    }
    if (type(color) === 'array') {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.outputBuffer.set(position[0], position[1], color);
        });
    }
    return this;
};
/**
 * Set opacity to selected pixels
 * @param {number} opacity Opacity to set on all selected pixels
 * @return {TixelElement}
 */
TixelElement.prototype.setSelectedMask = function (opacity) {
    if (type(opacity) === 'number' && opacity >= 0 && opacity <= 1) {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.mask.set(position[0], position[1], opacity);
        });
    }
    return this;
};

/**
 * Set value to selected pixels
 * @param {number} value Value to set in output on all selected pixels
 * @return {TixelElement}
 */
TixelElement.prototype.setSelectedValues = function (value) {
    if ( (type(value) === 'null') || (type(value) === 'number' && value >= 0 && value <= 1) ) {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.valueCanvas.set(position[0], position[1], value);
        });
    }    
    if ( type(value) === 'array' ) {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.valueBuffer.set(position[0], position[1], value);
        });
    }     
    return this; 
};

/**
 * Iterate over all pixels
 * @param {function} callback Must accept callback(array position, (optional) object data) width position [x,y] 
 * @param {boolean}  addData  When set to true callback receives second param data with color, value, opacity and selection for this pixel, default: false
 * @returns {TixelElement} 
 */
TixelElement.prototype.forEachPixel = function (callback, addData) {
    var addData = (type(addData) === 'boolean') ? addData : false;
    var self = this;
    this.canvas.forEach(function (x, y, value) {
        if (addData === true) {
            var data = self.getDataForPixel([x,y]);
            callback([x,y] , data);
        } else {
            callback([x,y]);
        }
    });

    return this;
};

/**
 * Iterate over all selected pixels
 * @param {function} callback Must accept callback(array position, (optional) object data) width position [x,y] 
 * @param {boolean}  addData  When set to true callback receives second param data with color, value, opacity and selection for this pixel, default: false
 * @returns {TixelElement} 
 */
TixelElement.prototype.forEachSelectedPixel = function (callback, addData) {
    var addData = (type(addData) === 'boolean') ? addData : false;
    var self = this;
    this.selectionCoordinates.forEach(function (element, index) {
        if (addData === true) {
            var data = self.getDataForPixel(element);
            callback(element , data);
        } else {
            callback(element);
        }
    });

    return this;
};


/** 
 * Returns object with keys color, value, opacity and selected for requested pixel
 * @position {array} Position of pixel to request data for
 * @return {object} Object with all information about requested pixel
 */
TixelElement.prototype.getDataForPixel = function (position) {
    if (utils.isOnMatrix(position, this.size)) {
        var x = position[0],
            y = position[1];

        var data = {
            color: this.output.get(x,y),
            value: this.valueCanvas.get(x,y),
            mask: this.mask.get(x,y),
            selected: this.selection.get(x,y)
        };
        return data;
    }
}

module.exports = TixelElement;
