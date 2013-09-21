var splib      = require("serialport");
var SerialPort = splib.SerialPort;
var Pixel = require('adafruit_pixel').Pixel;

// Init LED Chain
var pixels = new Pixel('/dev/spidev0.0', 50);
//pixels.all(0xff, 0xff, 0xff);
pixels.all(0, 0, 0);
pixels.sync();

// Init UART Serial
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 115200,
  buffersize: 8,
  parser: splib.parsers.readline('\n')
});

// Wait on Port open
serialPort.on("open", function () {
  console.log('UART connected');

  // On data receive
  serialPort.on('data', function(data) {
    console.log('data received: ' + data, data.length);
    if (data.length == 5) {
      console.log("ALL ON");
      pixels.all(0xff, 0xff, 0xff);
    } else {
      console.log("ALL OFF");
      pixels.all(0, 0, 0);
    }
    pixels.sync();
  });
});

