var Pixel = require('adafruit_pixel').Pixel;
var pixels = new Pixel('/dev/spidev0.0', 50);
//pixels.all(0xff, 0xff, 0xff);
pixels.all(0x55, 0x55, 0x55);
pixels.sync();
