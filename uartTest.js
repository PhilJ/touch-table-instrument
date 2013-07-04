var splib      = require("serialport");
var SerialPort = splib.SerialPort;

Buffer.prototype.indexOf = function (needle) { 
        if (!(needle instanceof Buffer)) { 
                needle = new Buffer(needle + ""); 
        } 
        var length = this.length, needleLength = needle.length, pos = 0, 
index; 
        for (var i = 0; i < length; ++i) { 
                if (needle[pos] === this[i]) { 
                        if ((pos + 1) === needleLength) { 
                            if (index != null) return index;
                            else return i; 
                        } else if (pos === 0) { 
                                index = i; 
                        } 
                        ++pos; 
                } else if (pos) { 
                        pos = 0; 
                        i = index; 
                } 
        } 
        return -1; 
}; 

/* TEST EMITTER
var testEmitter = {
  emit: function(event, data) {
    console.log('data received (as buffer): ' + data);
    
    // describes name as key and start bit and length. 
    // all values are interpreted as Ints so far
    var inputFormat = {
      val1: [0,1],
      val2: [1,1],
      val3: [2,1],
      val4: [3,1],
      val5: [4,1],
      val6: [5,1],
      val7: [6,1],
      val8: [7,1],
      val9: [8,1],
      val10: [9,1]
    };
    
    var parsedInput = parseInput(data, inputFormat);
    console.log("Parsed Input", parsedInput);
    console.log("\n\n");
  }
}
*/

function bufferParser (delimiterStr) {
  var delimiter = Buffer(delimiterStr);
  // Delimiter buffer saved in closure
  var data = new Buffer(0);
  return function (emitter, buffer) {
    // Collect data
    data = new Buffer.concat([data, buffer]);
    
    // if current buffer equals an \n buffer is emitted
    var delimiterIndex = data.indexOf(delimiter);
    //var delimiterIndex = 32;//Buffer.prototype.indexOf.apply(data, [delimiter]);
    if (delimiterIndex != -1) {
      var output = data.slice(0, delimiterIndex);
      data = data.slice(delimiterIndex + delimiter.length, data.length - 1)
      emitter.emit('data', output);
    }
  };
}

// Init UART Serial
var serialPort = new SerialPort("/dev/ttyAMA0", {
  baudrate: 9600,
  buffersize: 4,
  parser: bufferParser("\n")
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
      val5: [4,1],
      val6: [5,1],
      val7: [6,1],
      val8: [7,1],
      val9: [8,1],
      val10: [9,1]
    };
    
    var parsedInput = parseInput(data, inputFormat);
    console.log("Parsed Input", parsedInput);
    console.log("\n\n");
    
  });
});


/* TEST CODE
var testData = [0x00, 0x4d, 0x5b, 0x19, 0x33, 0x19, 0x93, 0x19, 0xbe, 0x19, 0x89, 0x19, 0xd2, 0x19, 0xf2, 0x18, 0xa9, 0x19, 0x5f, 0x35, 0xa4, 0x35, 0x94, 0x35, 0x4d, 0x33, 0xa4, 0x35, 0xc1, 0x33, 0x8f, 0x0a];
var testBuffer = Buffer("004d5b1933199319be198919d219f218a9195f35a43594354d33a435c1338f0a", "hex");

var testBuffers = [
  testBuffer.slice(0,16),
  testBuffer.slice(16,32),
  testBuffer.slice(0,8),
  testBuffer.slice(8,31),
  testBuffer.slice(31,32),
];
console.log("Buffers: ", testBuffers[0], testBuffers[1]);

var parser = bufferParser();
for (var i in testBuffers) {
   parser(testEmitter, testBuffers[i]);
}
*/
