require('buffertools');
var splib      = require("serialport");
var SerialPort = splib.SerialPort;

/*
  Generates a parser for Serialport which accept a Buffer as delimiter.

  Caches all uart messages until delimiter is send.

  @param delimiter Buffer Buffer with message delimiter bits
  @output Function Returns a parser function
*/
function rawWithDelimiterParser (delimiter, messageLength) {
  var data = new Buffer(0, "hex");
  
  return function (emitter, buffer) {
    // Concat cache and buffer
    data = new Buffer.concat([data, buffer]);
    // check if buffer contains delimiter
    var delimiterIndex = data.indexOf(delimiter);
    var shouldBeDelimiter = data.slice(messageLength, messageLength + delimiter.length);
    
    //var equal = new Buffer.equal(delimiter, shouldBeDelimiter);
    console.log(data);

    // data has length of message + delimiter
    // data is longer then message + delimiter
    if (delimiter.toString() == shouldBeDelimiter.toString()) {
      // buffer contains delimiter. prepare for output by slicing off everything before delimiter
      var output = data.slice(0, messageLength);
      
      // emit data
      emitter.emit('data', output);
      data = new Buffer(0);
      // write everthing after delimiter to cache
      //console.log(delimiterIndex + delimiter.length, data.length - 1);
      
    } else if (data.length < messageLength + delimiter.length) {  
      // data shorter then length -> write completly to buffer = do nothing
      // data = new Buffer(0);
    } else if (data.length > messageLength + delimiter.length) {
      // data is longer then expected length -> write everthing behind delimiter to buffer
      var start = delimiterIndex + delimiter.length;
      var end   = data.length;
      data = data.slice(start, end);
    }
  };
}

/*
  Reads data from UART, parses it by format and returns handy objects
*/

function UartReader (config) {
  if (config.device == null) console.log("Missing key 'device' of type SerialPort");
  //this.deviceName = (config.deviceName != null) ? config.deviceName : '/dev/ttyAMA0';
  //this.baudRate   = (config.baudRate != null) ? config.baudRate : 9600;
  //this.bufferSize = (config.bufferSize != null) ? config.bufferSize : 8;
  //this.messageDelimiter = (config.messageDelimiter && config.messageDelimiter.isBuffer == true) ? config.messageDelimiter : Buffer("\n");
  this.inputFormat = config.inputFormat ? config.inputFormat : null;
  this.listeners  = [];
  this.device     = config.device;
  
  /*this.device = new SerialPort(this.deviceName, {
    baudrate: this.baudRate ,
    buffersize: bufferSize,
    parser: rawWithDelimiterParser(this.messageDelimiter)
  });*/
  
  // open serial interface
  var self = this;  

  this.device.on('open', function () {
    // wait for data events
    self.device.on('data', function(message) { 
      // parse data by format
      var parsedInput = self.parseBuffer(message, self.inputFormat);
      // notfiy all listener
      for (var l in self.listeners) {
        self.listeners[l](parsedInput)
      }    
    });
  });
}

/*
  Adds callback to data listerns. Use to receive parsed data from uart

  Callback will be called whenever parsed data is ready
*/
UartReader.prototype.listen = function (callback) {
  this.listeners.push(callback)
};

/* 
  Parses a string of bits by given format

  @param input  Buffer
  @param format Object with Value containing Start end Length of each value  
  @output Object with calculated values
*/

UartReader.prototype.parseBuffer = function (input, format) {
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

module.exports = {
  UartReader: UartReader,
  rawWithDelimiterParser: rawWithDelimiterParser
};
