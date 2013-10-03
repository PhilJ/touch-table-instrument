'use strict';

var TixelSelection = require('./TixelSelection.js'),
    ndarray = require('ndarray'),
    zeros = require('zeros'),
    fill = require('ndarray-fill'),
    ops = require('ndarray-ops'),
    iterate = require('./utils.js').iterate,
    type     = require('./utils.js').type,
    EventEmitter = require('events').EventEmitter;
    //    ColorMap = require('TixelColorMap.js'),

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
 * @param {object} config           Configuration object, all values are optional, however a size should be passed
 * @param {array}  config.size      Size of matrix, default: [10,10]
 * @param {number} config.size[0]   Element width
 * @param {number} config.size[1]   Element height
 * @param {array}  config.origin    Position of origin of shapes on matrix, default: [0,0]
 * @param {number} config.origin[0] Origin x value
 * @param {number} config.origin[1] Origin y value
 * @param {string} config.defaultColor Default color for background, default: '000000'
 * @param {array}  config.colorMap  Array of color which is mapped on values for output generation
 *
 * @property {array}   size          Size of output (pixel matrix)
 * @property {number}  size[0]       Width of output in pixels
 * @property {number}  size[1]       Height of output in pixels
 * @property {array}   origin        Origin coordinate of canvas, can be used to position child TixelElement
 * @property {number}  origin[0]     Origin x coordinate
 * @property {number}  origin[1]     Origin y coordinate
 * @property {string}  defaultColor  Default/background color
 * @property {ndarray} values        Value matrix is used to calculate output based on colorMap (Array based)
 * @property {ndarray} opacity       Opacity of element, can be used for child TixelElement (Float64Array based)
 * @property {ndarray} output        Rendered matrix of colors, output of TixelElement (Array based)
 * @property {array}   colorMap      List of colors which is used map values
 * @property {array}   childElements Child TixelElements which are rendered on given pixel element
 * @property {EventEmitter} events   Emit events
 * @property {number}  frame         Frame index, gets incremented on each render
 */
function TixelElement (config) {
    if (type(config) === 'undefined') config = {}; 
    // Check for alternative initialization with array
    if (type(config) === 'array' &&
        type(config[0]) === 'number' && 
        type(config[1]) === 'number') {
        // create config object based on size array
        var originalConfig = config;
        var config = {
            size: [originalConfig[0], originalConfig[1]]
        };
    }

    // Inherit from TixelSelection
    TixelSelection.apply(this, Array.prototype.slice.call( arguments )); 
    // Set output size
    this.size = [];
    this.size[0] = (type(config.size) === 'array' && type(config.size[0]) === 'number') ? config.size[0] : 10;
    this.size[1] = (type(config.size) === 'array' && type(config.size[1]) === 'number') ? config.size[1] : 10;

    // Set origin position (tells were to render child TixelElements on parent)
    this.origin = [];
    this.origin[0] = (type(config.origin) === 'array' && 
                      type(config.origin[0]) === 'number' && 
                      config.origin[0] < this.size[0]) ? config.origin[0] : 0;
    this.origin[1] = (type(config.origin) === 'array' && 
                      type(config.origin[1]) === 'number' &&
                      config.origin[1] < this.size[1]) ? config.origin[1] : 0;

    // Set default (background) color
    this.defaultColor = (type(config.defaultColor) === 'string') ? config.defaultColor : '000000';

    // Initialize values (Array) and opacity (Float64Array) with with zeros
    this.values = ndarray(new Array(this.size[0] * this.size[1]), this.size);
    ops.assigns(this.values, null);
    this.opacity = ndarray(Float64Array(this.size[0] * this.size[1]), this.size);
    ops.assigns(this.opacity, 1);

    // Initialize output (pixel matrix) with Array() and defaultColor as default value
    this.output = ndarray(Array(this.size[0] * this.size[1]), this.size);
    ops.assigns(this.output, this.defaultColor);

    this.colorMap = (type(config.colorMap) === 'array') ? config.colorMap : [this.defaultColor];

    // List of child PixelElements which are applied on out render
    this.childElements = [];

    this.events = new EventEmitter();

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
TixelElement.prototype.render = function () {
    // Check if any value is set
    this._renderValues();
    //TODO: this.renderShapes();
    this.frame++;
};

/**
 * Dynamically calculate output colors based on values and colorMap
 *
 * @access private
 */
TixelElement.prototype._renderValues = function () {
    var self = this;
    iterate(this.values, function (x,y) {
        var value = self.values.get(x,y);
        if (type(value) === 'number') {
            var color = self.getMappedColor(value);
            if (type('color') === 'string') {
                self.output.set(x,y,color);
            } else {
                console.log("You are using Tixel values, please define a colorMap to dynamicly create color values");
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
            self.output.set(position[0], position[1], color);
        });
    }
    return this;
};
/**
 * Set opacity to selected pixels
 * @param {number} opacity Opacity to set on all selected pixels
 * @return {TixelElement}
 */
TixelElement.prototype.setSelectedOpacity = function (opacity) {
    if (type(opacity) === 'number' && opacity >= 0 && opacity <= 1) {
        var self = this;
        this.forEachSelectedPixel(function (position) {
            self.opacity.set(position[0], position[1], opacity);
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
            self.values.set(position[0], position[1], value);
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
    iterate(this.output, function (x,y) {
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
    if (this.isInRange(position) === true) {
        var x = position[0],
            y = position[1];

        var data = {
            color: this.output.get(x,y),
            value: this.values.get(x,y),
            opacity: this.opacity.get(x,y),
            selected: this.selection.get(x,y)
        };
        return data;
    }
}

module.exports = TixelElement;