'use strict';

var TixelMatrix = require('./TixelMatrix.js'),
    utils = require('./utils.js');

/**
 * TixelSelection provides an API for convinient selection of cells in 
 * 2D matrix. 
 *
 * This is is used by pixel to easily select multiple pixels, e.g. in a box
 * shape, optionally change that shape, e.g. by make selection grow by one pixel,
 * to apply a command on all that pixels in Tixel, e.g. color('FFFFFF').
 *
 * @constructor
 * 
 * @example
 *         var selection = new TixelSelection(4, 4);
 *         selection.selectLine([0, 1], [4, 1]);
 *         console.log(require('ndarray-unpack')(selection.selection)); 
 *         // [ [0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0] ]
 *
 * @param {array}  config Alternative array onfig: Selection size, format [x,y]. defaults: [10,10]           
 * @param {object} config Configuration object
 * @param {array}  config.size Selection size, format [x,y]. defaults: [10,10]
 * @property {Array}   size Selection size, format [x,y]
 * @property {ndarray} selection Selected pixes are `1`, unselected '0'. Based on Array()
 * @property {array}   selectionCoordinates List of all selected pixels, format [x,y]
 */

function TixelSelection (config) {
    // check if config is defined
    if (typeof config === 'undefined') config = {}; 
    // Check for alternative initialization with array
    if (utils.isSize(config)) {
        config = { size: config };
    }

    this.size = utils.isSize(config.size) ? config.size : [10,10];

    this.selection = new TixelMatrix(this.size, 0);
    this.selectionCoordinates = [];

    /**
     * Enum for selection application mode
     * @readonly
     * @member
     * @enum {string} modus
     */
    this.modus = {
        /** Add new selection to existing selection */
        add: 'ADD',  
        /** Substract new selection from existing selection */
        substract: 'SUBSTRACT',
        /** Keep only the intersection between the new and existing selection*/
        intersection: 'INTERSECTION'
    };
    this.mode = this.modus.add;
}

/**
 * Check if mode exists and store
 * return {this}
 */
TixelSelection.prototype.setSelectionMode = function (mode) {
    for (var m in this.mode) {
        if (this.mode.hasOwnProperty(m)) {
            if (mode === this.modus[m]) {
                this.currentMode = mode;
            }
        }
    }
    return this;
};

/************************************
 ******* UTILS **********************
 ************************************/


/**
 * Update list of all selected coordinates based on selection array
 */
TixelSelection.prototype.updateCoordinates = function () {
    // reset selected coordinates list
    this.selectionCoordinates = [];
    var self = this;
    // Iterate selection matrix and push all selected elements to coordinate list
    this.selection.forEach(function (x,y, value) {
        if (value === 1) {
            self.selectionCoordinates.push([x,y]);
        }
    });
};

/************************************
 ******* SELECTION MODES ************
 ************************************/

TixelSelection.prototype.addToSelection = function () {};
TixelSelection.prototype.substractFromSelection = function () {};
TixelSelection.prototype.new = function () {};



/************************************
 ******* BASIC SELECTORS ************
 ************************************/

/**
 * Select coordinate
 * @param {array} point Point with format [x,y]
 * @return {this}
 */
TixelSelection.prototype.selectAt = function (position) {
    if (utils.isOnMatrix(position, this.size)) {
        this.selection.setAt(position, 1);
        this.updateCoordinates();
    }
    return this;
};
/**
 * Unselect coordinate
 * @param {array} point Point with format [x,y]
 * @return {this}
 */
TixelSelection.prototype.unselectAt = function (position) {
    if (utils.isOnMatrix(position, this.size)) {
        this.selection.setAt(position,0);
        this.updateCoordinates();
    }
    return this;
};

/**
 * Mark all coordinates as selected
 * @return {this}
 */
TixelSelection.prototype.selectAll = function () {
    this.selection.setAll(1);
    this.updateCoordinates();
    return this;
};
/**
 * Reset selection, unselect all
 * @return {this}
 */
TixelSelection.prototype.reset = function () {
    this.selection.reset();
    this.updateCoordinates();
    return this;
};
/**
 * Inverts current selection
 * @return {this} 
 */
TixelSelection.prototype.selectionInvert = function () {
    var self = this;
    this.selection.setForEach(function (x,y, value) {
        return 1 - value;
    });

    this.updateCoordinates();
    return this;
};

/************************************
 ******* SHAPES *********************
 ************************************/

/**
 * Select line between given points
 * @returns {this}
 */
TixelSelection.prototype.selectLine = function (point1, point2) {
    var line = this.createLineSelection(point1, point2);
    this.selection = line;

    this.updateCoordinates();
    return this;
};

/**
 * Calculate line between point following the Bresenham algorithm and returns selection
 * Source: http://stackoverflow.com/a/4672319
 * @see selectLine
 * 
 * @param {array} point1 Array with [x,y] values for line start
 * @param {array} point2 Array with [x,y] values for line stop
 * @return {ndarray} Array with line coordinates
 */
TixelSelection.prototype.createLineSelection = function (point1, point2) {
    var selection = new TixelMatrix(this.size, 0),
        x0 = point1[0], 
        y0 = point1[1], 
        x1 = point2[0], 
        y1 = point2[1];

    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;

    while(true){
        if (utils.isOnMatrix([x0,y0], this.size) ) {
            selection.set(x0,y0,1); 
        }
        if ((x0==x1) && (y0==y1)) break;
         var e2 = 2*err;
         if (e2 >-dy){ err -= dy; x0  += sx; }
         if (e2 < dx){ err += dx; y0  += sy; }
   }
   return selection;
};

TixelSelection.prototype.createBoxSelection = function (point1, point2) {
    var selection = new TixelMatrix(this.size, 0),
        x0 = point1[0], 
        y0 = point1[1], 
        x1 = point2[0], 
        y1 = point2[1];

    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;

    for (var x = x0; x !== x1 + sx; x += sx ) {
        for (var y = y0; y !== y1 + sy; y += sy ) {
            if (utils.isOnMatrix([x,y], this.size)) {
                selection.set(x,y,1);
            }
        }
    }

    return selection;
};
/*
 * Draw circle with combined Bresenham and midpoint algorithm
 * Source: http://willperone.net/Code/codecircle.php
 * @param {array} point Origin of circle with shape [x,y]
 * @param {number} radius  Circle radius
 */

TixelSelection.prototype.createCircleSelection = function (point, radius) {
    var selection = new TixelMatrix(this.size, 0),
        r = radius,
        xc = point[0],
        yc = point[1],
        x = r, 
        y = 0,
        cd2 = 0;    //current distance squared - radius squared

    selection.set(xc-r, yc, 1);
    selection.set(xc+r, yc, 1);
    selection.set(xc, yc-r, 1);
    selection.set(xc, yc+r, 1);
 
    while (x > y)    //only formulate 1/8 of circle
    {
        cd2-= (--x) - (++y);
        if (cd2 < 0) cd2+=x++;

        selection.set(xc-x, yc-y, 1);//upper left left
        selection.set(xc-y, yc-x, 1);//upper upper left
        selection.set(xc+y, yc-x, 1);//upper upper right
        selection.set(xc+x, yc-y, 1);//upper right right
        selection.set(xc-x, yc+y, 1);//lower left left
        selection.set(xc-y, yc+x, 1);//lower lower left
        selection.set(xc+y, yc+x, 1);//lower lower right
        selection.set(xc+x, yc+y, 1);//lower right right
    }
    return selection;
};




/**
 * Select chess game field pattern
 * @return {TixelSelection}
 */
TixelSelection.prototype.chess = function () {};
/**
 * Select a specific pattern repeatedly on the screen
 * @param  {Array} pattern 2-dim array of 1 (selected) and 0
 * @return {TixelSelection}
 */
TixelSelection.prototype.repeatPattern = function (pattern) {};

/************************************
 ******* MODIFIERS ******************
 ************************************/

TixelSelection.prototype.grow = function () {};
TixelSelection.prototype.shrink = function () {};

TixelSelection.prototype.getMooreNeighbors = function () {};
TixelSelection.prototype.selectMooreNeighbors = function () {};

TixelSelection.prototype.getNeumannNeighbors = function () {};
TixelSelection.prototype.selectNeumannNeighbors = function () {};

module.exports = TixelSelection;
