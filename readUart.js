// This file contains an example for parsing bitwise input from UART via SerialPort

// generates test input as bitstream
function generateTestInput () {
  var isPressed = 1, xPos = 240, yPos = 4, row1 = 798;
  
  var uint8template = new Array(8 + 1).join('0'); 
  var uint16template = new Array(16 + 1).join('0');
  var result = (uint8template+isPressed.toString(2)).slice(-uint8template.length) +
               (uint8template+xPos.toString(2)).slice(-uint8template.length) +
               (uint8template+yPos.toString(2)).slice(-uint8template.length) +
               (uint16template+row1.toString(2)).slice(-uint16template.length);
  return result;
}

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

// Parse string passed by SerialPort to String of Bits (0 & 1)
function strToBinary (input) {
  var output = "";
  for (var i = 0; input.length - 1 >= i; i++) {
    var charAsInt = input.charCodeAt(i);
    output += charAsInt.toString(2);
  }
  return output;
}

function test () {
  // get test input from function
  var input = generateTestInput();
  console.log("Input as bits", input);
  // OUTPUT: 0000000111110000000001000000001100011110 
  
  // use this line instead of test input
  // var input = strToBinary(stringFromSerialPort);
   
  // describes name as key and start bit and length. 
  // all values are interpreted as Ints so far
  var inputFormat = {
    isPressed: [0,8], // uint8
    xPos: [8, 8],     // uint8
    yPos: [16, 8],    // unit8
    row1: [24, 16]    // uint16
  };
  
  var parsedInput = parseInput(input, inputFormat);
  console.log("Parsed Input", parsedInput);
  /*
  OUTPUT  {isPressed: 1, xPos: 240, yPos: 4, row1: 798}
  Matches Test Input
  */
}

// Run test method
test();