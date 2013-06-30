var Pixel = require('adafruit_pixel').Pixel;
var pixels = new Pixel('/dev/spidev0.0', 25);
pixels.all(0xff, 0xff, 0xff);
pixels.sync();
