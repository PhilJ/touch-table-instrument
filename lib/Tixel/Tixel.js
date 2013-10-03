'use strict';


var Events = require('TixelEvents.js'),
    Matrix = require('TixelMatrix.js'),
    Selection = require('TixelSelection.js'),
    ColorMap = require('TixelColorMap.js');

/**
 * Tixel provides a jQuery-like interface for dynamic manipulation of 
 * an image, represented as an array of pixels. 
 */
function Tixel () {
    this.width = null;
    this.height = null;
    this.backgroundColor = '000000';

    this.values = [];
    this.opacity = [];
    this.colors = [];

    this.colormap = new ColorMap();

    this.selection = new Selection();

    this.shapes = [];

    this.events = new Events();
    /*{
        onRender: []
    };*/

    this.origin = {}
    this.tick = 0;
}

/** 
 * Render next frame
 */
PixelQuery.prototype.render = function () {
    if (this.values != null) {
        this.renderValues();
    }
    this.renderShapes();
    this.frame++;
};

PixelQuery.prototype.select = function () {};
PixelQuery.prototype.selectAll = function () {};

/**
 * Set to color
 */
PixelQuery.prototype.set = function () {};