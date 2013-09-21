////////////////////////////////////////////////////////
// Use the cool library                               //
// git://github.com/voodootikigod/node-serialport.git //
// to read the serial port where arduino is sitting.  //
////////////////////////////////////////////////////////               
var com = require("serialport");

var uartMessageDelimiter = "\n\n\n";

var serialPort = new com.SerialPort("/dev/ttyAMA0", {
    baudrate: 115200,
    bufferSize: 15,
    parser: com.parsers.readline(uartMessageDelimiter)
  });

serialPort.on('open',function() {
  	console.log('Port open');
});

serialPort.on('data', function(data) {
//	console.log('Data');
	data = JSON.parse(data);
  	//console.log(data.toString('ascii'));
  	console.log(data);
});
