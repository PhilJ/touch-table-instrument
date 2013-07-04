var splib      = require("serialport");
var SerialPort = splib.SerialPort;


function bufferParser () {
  var delimiter = "\n";
  // Delimiter buffer saved in closure
  var data = Buffer(0);
  return function (emitter, buffer) {
    // Collect data
    data = Buffer.concat([data, buffer]);
    console.log(buffer);
    var currentChar = buffer.toString();
    // if current buffer equals an \n buffer is emitted
//    if (currentChar == delimiter) {
      emitter.emit('data', data);
      data = Buffer(0);
//    }
  };
}

// Init UART Serial
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600,
  buffersize: 4,
  parser: bufferParser()
});

// parses a string of bits by given format
// @param input  Buffer
// @param format Object with Value containing Start end Length of each value
// @output Object with calculated values
function parseInput (input, format) {
  var output = {};
  for (var key in format) {
    if (format.hasOwnProperty(key)) {
      var lastOffset = format[key][0] + format[key][1];
      if (lastOffset <= input.length) {
        // slice bits out as decribed in format .slice(start, start  + length)
        var intAsBits = input.readUInt8(format[key][0]);
        // parse int and write to output
        output[key] = intAsBits;
      } else {
        console.log("key " + key + " offset is higher then buffer " + input.length);
      }
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
      val1: [0,1],
      val2: [1,1],
      val3: [2,1],
      val4: [3,1],
//      val5: [4,1],
//      val6: [5,1],
//      val7: [6,1],
//      val8: [7,1],
//      val9: [8,1],
//      val10: [9,1]
    };
  
    var parsedInput = parseInput(data, inputFormat);
    console.log("Parsed Input", parsedInput);
    console.log("\n\n");
    
  });
});

