require('buffertools');
var splib      = require("serialport");
var SerialPort = splib.SerialPort;

/*
  Generates a parser for Serialport which accept a Buffer as delimiter.

  Caches all uart messages until delimiter is send.

  @param delimiter Buffer Buffer with message delimiter bits
  @output Function Returns a parser function
*/
function rawWithDelimiterParser (delimiter) {
  var data = new Buffer(0);
  return function (emitter, buffer) {
    // Concat cache and buffer
    data = new Buffer.concat([data, buffer]);
    // check if buffer contains delimiter
    var delimiterIndex = data.indexOf(delimiter);
    if (delimiterIndex != -1) {
      // buffer contains delimiter. prepare for output by slicing off everything before delimiter
      var output = data.slice(0, delimiterIndex);
      // write everthing after delimiter to cache
      //console.log(delimiterIndex + delimiter.length, data.length - 1);
      var start = delimiterIndex + delimiter.length;
      var end   = data.length - 1;
      if (start < end) {
        data = data.slice(start, end);
      } else {
        data = new Buffer(0);
      }
      // emit data
      emitter.emit('data', output);
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
