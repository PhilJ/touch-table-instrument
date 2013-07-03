var splib      = require("serialport");
var SerialPort = splib.SerialPort;


function bufferParser () {
  var delimiter = "\n";
  // Delimiter buffer saved in closure
  var data = new Buffer();
  return function (emitter, buffer) {
    // Collect data
    data = Buffer.concat([data, buffer]);
    
    var currentChar = buffer.toString();
    // if current buffer equals an \n buffer is emitted
    if (currentChat == delimiter) {
      emitter.emit('data', data);
      data = new Buffer();
    }
  };
}

// Init UART Serial
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 115200,
  buffersize: 8,
  parser: bufferParser
});

// parses a string of bits by given format
// @param input  Buffer
// @param format Object with Value containing Start end Length of each value
// @output Object with calculated values
function parseInput (input, format) {
  var output = {};
  for (var key in format) {
    if (format.hasOwnProperty(key)) {
      // slice bits out as decribed in format .slice(start, start  + length)
      var intAsBits = input.readUInt8(format[key][0]);
      // parse int and write to output
      output[key] = intAsBits;
    }
  } 
  return output;
}

// Wait on Port open
serialPort.on("open", function () {
  console.log('UART connected');

  // On data receive
  serialPort.on('data', function(data) {
    console.log('data received (as buffer): ' + data);
   
    // describes name as key and start bit and length. 
    // all values are interpreted as Ints so far
    var inputFormat = {
      val1: [0,8],
      val2: [8, 8],
      val3: [16, 8],
      val4: [24, 8],
      val5: [32,8],
      val6: [40, 8],
      val7: [48, 8],
      val8: [56, 8],
      val9: [64,8],
      val10: [72, 8]
    };
  
    var parsedInput = parseInput(data, inputFormat);
    console.log("Parsed Input", parsedInput);
    console.log("\n\n");
    
  });
});

