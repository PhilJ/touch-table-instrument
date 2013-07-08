var assert = require("assert")
var TouchEvents = require("../TouchEvents.js").TouchEvents


// default values for testing
var rows = 2, columns = 3;
var button = {
  row: 1,
  column: 1
};
function onTouchCallback () {};
function onReleaseCallback () {};

describe('TouchEvents', function () {
  describe('TouchEvents()', function () {
    it('should return an Object with init settings', function () {

      var te = new TouchEvents(rows, columns);
      assert.equal(te.rows, rows);
      assert.equal(te.columns, columns);
      assert.equal(te.buttonListeners.length, rows);
      assert.equal(te.buttonListeners[0].length, columns);
    })
  })
  
  describe('getButtonFromCoordinates()', function () {
    
    it('should calculate the correct button for input coordinates', function () {
      var te = new TouchEvents(rows, columns);
    
      var result1 = te.getButtonFromCoordinates(0,0);
      assert.equal(result1.row, 0);
      assert.equal(result1.column, 0);
    
      var result2 = te.getButtonFromCoordinates(100,100);
      assert.equal(result2.row, rows - 1);
      assert.equal(result2.column, columns - 1);

      var result3 = te.getButtonFromCoordinates(33, 49);
      assert.equal(result3.row, 0);
      assert.equal(result3.column, 0);

      var result4 = te.getButtonFromCoordinates(34, 51);
      assert.equal(result4.row, 1);
      assert.equal(result4.column, 1);
      
    })
  })
  
  describe('subscribeButton()', function () {
    it('should add a listener to list', function () {
      var te = new TouchEvents(rows, columns);
      
      te.subscribeButton(button.row, button.column, onTouchCallback, onReleaseCallback);
      
      var listener1 = te.buttonListeners[button.row][button.column][0];
      assert.equal(listener1 != null, true, 'Check if listener is in list');
      assert.equal(listener1.onlyWhenTouched, true, 'onlyWhenTouched should be automatically set true');
      assert.equal(listener1.onTouch, onTouchCallback);
      assert.equal(listener1.onRelease, onReleaseCallback);
    })
  })
  
  describe('update()', function () {
    it('should trigger button touch event', function (done) {
      var te = new TouchEvents(rows, columns);
      
      var onTouchCallback = (function () {
        var counter = 0;
        return function (event) {
          counter++;
          // Exspect to be called 3 times
          if (counter == 3) {
            done();
          }
        }; 
      })();

      var isTouched = true;
      te.subscribeButton(0, 0, onTouchCallback, onTouchCallback);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 100, 100);
      te.update(isTouched, 100, 100);
      te.update(isTouched, 0, 0);
    })
    
    it('should trigger button release event', function (done) {
      var te = new TouchEvents(rows, columns);

      function onReleaseCallback (e) {
        assert.equal(e.newState.raw.x, 100);
        assert.equal(e.newState.raw.y, 100);
        done();
      };
          
      var isTouched = true;
      te.subscribeButton(0, 0, onTouchCallback, onReleaseCallback);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 100, 100);
    })
    
    
    
    it('should trigger button touch event, without onlyOnTouch = false', function (done) {
      var te = new TouchEvents(rows, columns);
      
      var onTouchCallback = (function () {
        var counter = 0;
        return function (e) {
          counter++;
          // Exspect to be called 3 times
          if (counter == 2) {
            assert.equal(e.newState.raw.y, 1);
            done();
          }
        }; 
      })();
  
      te.subscribeButton(0, 0, onTouchCallback, onReleaseCallback, false);
      te.update(false, 0, 0);
      te.update(false, 0, 0);
      te.update(false, 99, 99);
      te.update(false, 99, 99);
      te.update(false, 1, 1);
    })
    
    it('should trigger button release event, without onlyOnTouch = false', function (done) {
      var te = new TouchEvents(rows, columns);
      function onReleaseCallback () {
        done(); // finish test
      };
         
      var isTouched = false;
      te.subscribeButton(0, 0, onTouchCallback, onReleaseCallback, false);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 100, 100);
    })
    
    it('should trigger ALL button touch event', function (done) {
      var te = new TouchEvents(rows, columns);
      function onTouchCallback () {
        done(); // finish test
      };
         
      var isTouched = true;
      te.subscribeAllButtons(onTouchCallback, onTouchCallback);
      te.update(isTouched, 0, 0);
    })
    
    it('should trigger ALL button release event', function (done) {
      var te = new TouchEvents(rows, columns);
      function onReleaseCallback () {
        done(); // finish test
      };
         
      var isTouched = true;
      te.subscribeAllButtons(onTouchCallback, onReleaseCallback);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 100, 100);
    })
    
    it('should trigger row touched start events', function (done) {
      
      var te = new TouchEvents(rows, columns);
    
      var onTouchCallback = (function () {
        var counter = 0;
        return function (e) {
          counter++;
          console.log(e);
          if (e.newState.raw.x == 1) {
            assert.equal(counter, 2);
            done();
          }
          
        }; 
      })();
      
      var onUpdateCallback = function () {};

      var isTouched = true;
      te.subscribeRow(0, onTouchCallback, onUpdateCallback, onReleaseCallback);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 0, 0);
      te.update(isTouched, 60, 100);
      te.update(isTouched, 60, 100);
      te.update(isTouched, 1, 0);
      
    })
  })
  
})

