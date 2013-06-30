var splib      = require("serialport");
var SerialPort = splib.SerialPort;

var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600,
  buffersize: 8,
  parser: splib.parsers.readline('\n')
});

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
    //console.log(parseInt(data, 16).toString(2) );
    console.log(typeof data);
  });  
});

