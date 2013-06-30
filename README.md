touch-table-instrument
======================

This project uses node modules adapted by tinkerlog for spi and adafruit-pixels, which are required to control WS2801 LEDs via Raspberry Pi.

# Prerequisites

Install Node.js. Since the Raspian Version is to old, you could use this pre built version of [Node v0.8.15](http://www.raspberrypi.org/phpBB3/viewtopic.php?f=34&t=24130) instead of building a current version yourself.

# Install & Run

    $ npm install                        # install dependencies
    $ cd node_modules/spi && npm install # install dependencies of SPI manually
    $ sudo node index.js                 # start server with sudo for SPI access
