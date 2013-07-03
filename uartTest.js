var splib      = require("serialport");
var SerialPort = splib.SerialPort;

// Init UART Serial
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 115200,
  buffersize: 8,
  parser: splib.parsers.readline('\n')
});

// parses a string of bits by given format
// @param input  String of Bits, e.g. "00001010011"
// @param format Object with Value containing Start end Length of each value
// @output Object with calculated values
function parseInput (input, format) {
  var output = {};
  for (var key in format) {
    if (format.hasOwnProperty(key)) {
      // slice bits out as decribed in format .slice(start, start  + length)
      var intAsBits = input.slice(format[key][0], format[key][0] + format[key][1]);
      // parse int and write to output
      output[key] = parseInt(intAsBits, 2);
    }
  } 
  return output;
}

// Function to parse string passed by SerialPort to String of Bits (0 & 1)
function strToBinary (input) {
  var output = "";
  for (var i = 0; input.length - 1 >= i; i++) {
    var charAsInt = input.charCodeAt(i);
    output += charAsInt.toString(2);
  }
  return output;
}

// Wait on Port open
serialPort.on("open", function () {
  console.log('UART connected');

  // On data receive
  serialPort.on('data', function(data) {
    console.log('data received (as string): ' + data);
    var binaryData = strToBinary(data);
    console.log('data received (as binary): ' + binaryData);
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
  
    var parsedInput = parseInput(input, inputFormat);
    console.log("Parsed Input", parsedInput);
    console.log("\n\n\n\n");
    
  });
});

