'use strict';

var spi = require('spi'),
    EventEmitter = require('events').EventEmitter;

/**
 * This view manager renders a array of pixel colors via
 * SPI on a WS2801 LED chain
 * 
 * @param {object} config                   - Configuration object
 * @param {array}  config.size              - Size of LED matrix in format [x, y], default: [10,10]
 * @param {string} config.device            - Path to spi device, default: '/dev/spidev0.0'
 * @param {array}  config.mapping           - Maps Led chain to matrix by array of coordinates [x,y] in matrix for each led, 
 *                                            Can be used alternativly to wiring configuration 
 * @param {object} config.wireing           - Wireing info to create matrix-chain mapping, if not provided by mapping
 * @param {string} config.wireing.startX    - X Position of first pixel, 'left' or 'right', default: 'left'
 * @param {string} config.wireing.startY    - Y Position of first pixel, 'top' or 'bottom', default: 'top'
 * @param {string} config.wireing.direction - Wireing direction, either 'vertical' or 'horizontal', default: 'vertical' 
 * @param {EventEmitter} config.eventHandler - EventHandler from TixelController were render events are triggered on
 */
function LedView (config) {
    this.size = (Array.isArray(config.size)  &&
                 typeof config.size[0] === 'number' &&
                 typeof config.size[1] === 'number') ? [config.size[0], config.size[1]] : [10,10];

    this.events = (config.eventHandler instanceof EventEmitter) ? config.eventHandler : new EventEmitter;


    // Write and read buffers will be initialized by mapping setter method
    this.pixelCount = 0;
    this.writeBuffer = null;
    this.readBuffer = null;
    // Initialize SPI device for LED 
    this.device = (typeof config.device === 'string') ?
                  new spi.Spi(config.device) :
                  new spi.Spi('/dev/spidev0.0');
    this.device.open();

    // Set defaults for wireing
    this.wireing = {};
    this.wireing.startX = (config.wireing &&
                           (config.wireing.startX === 'left' ||
                            config.wireing.startX === 'right')) ? config.wireing.startX : 'left';
    this.wireing.startY = (config.wireing &&
                           (config.wireing.startY === 'top' ||
                            config.wireing.startY === 'bottom')) ? config.wireing.startY : 'top';
    this.wireing.direction = (config.wireing &&
                           (config.wireing.direction === 'vertical' ||
                            config.wireing.direction === 'horizontal')) ?
                            config.wireing.direction : 'vertical';

    // Use mapping from configuration or generate mapping instead
    // Mapping setter automatically initializes write and read buffers
    this.mapping = (Array.isArray(config.mapping)) ?
                    config.mapping :
                    this.createMapping(this.size[0], this.size[1], this.wireing.startX, this.wireing.startY, this.wireing.direction);

    // Bind render event to LED update
    var self = this;
    this.events.on('render', function (pixels) {
        self.setPixels(pixels);
    });
}

LedView.prototype = {
    /**
     * Mapping setter
     *
     * Automatically sets writeBuffer and readBuffer to correct length
     */
    get mapping () {
        return this._mapping;
    },
    set mapping (mapping) {
        this._mapping = mapping;
        // Reset write and read buffers according to mapping length
        this.pixelCount = this._mapping.length;
        this.writeBuffer = new Buffer(this.pixelCount * 3);
        this.readBuffer = new Buffer(this.pixelCount * 3);

        // Set all LEDs to black
        this.writeBuffer.fill(0);
        this.readBuffer.fill(0);
        this.device.write(this.writeBuffer);
    }
};

LedView.prototype.setPixels = function (pixelMatrix) {
    var pixelStrip = [];
    // create 1d array from 2d matrix
    var self = this;
    for (var m in this.mapping) {
        pixelStrip.push(pixelMatrix.pixels[ this.mapping[m][1] ][ this.mapping[m][0] ]);
    }

    // write 1d array to write buffer
    for (var p in pixelStrip) {
        this.writeBuffer.write(pixelStrip[p].slice(0,6), p * 3, 'hex');
    }
    // write buffer to led chain
    this.device.write(this.writeBuffer);
};

LedView.prototype.createMapping = function (rows, cols, startX, startY, direction) {
  var output = [];
  
  var x = (startX === 'left') ? 0 : (cols - 1);
  var y = (startY === 'top')  ? 0 : (rows - 1);

  var xDirection = (x === 0) ? 'right' : 'left';
  var yDirection = (y === 0) ? 'down' : 'up';

  for (var i = 0; i < rows * cols; i++) {
    // push coordinates
    output.push([x, y]);
    
    // vertical mode
    if (direction == 'vertical') {
      // change col (x) when end if no more rows left in col
      if ((i + 1) % rows === 0) {
        if (xDirection == 'right') { x++; } else { x--; }
        yDirection = (yDirection === 'up') ? 'down' : 'up';
      } else {
        // change row (y) every iteration
        if (yDirection == 'up') { y--; } else { y++; }
      }
    }
    
    // horizontal mode
    if (direction == 'horizontal') {
      if ((i + 1) % cols === 0) {
        if (yDirection == 'up') { y--; } else { y++; }
        xDirection = (xDirection === 'left') ? 'right' : 'left';
      } else {
        // change col (y) every iteration
        if (xDirection == 'right') { x++; } else { x--; }
      }
    }
  }
  return output;
};

module.exports = LedView;