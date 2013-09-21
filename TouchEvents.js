
function TouchEvents (pRows, pColumns) {
  this.rows = pRows;
  this.columns = pColumns;
  
  this.state = {
    isTouched: false,
    raw: { x: null, y: null },
    button: {
      row: null, column: null
    }
  };
  
  // Init callback stores
  this.buttonListeners = [];
  this.allButtonListeners = [];
  this.rowListeners = [];
  this.columnListeners = [];
  this.matrixListeners = [];
  for (var r = 0; r < this.rows; r++) {
    this.buttonListeners[ r ] = [];
    this.rowListeners[ r ] = [];
    for (var c = 0; c < this.columns; c++) {
      this.buttonListeners[ r ][ c ] = [];
      this.columnListeners[ c ] = [];
    }
  }
  
};

TouchEvents.prototype.update = function (isTouched, pX, pY) {
  var button = this.getButtonFromCoordinates(pX, pY);
  
  var newState = {
    isTouched: isTouched,
    raw: { x: pX, y: pY },
    button: {
      row: button.row, column: button.column
    }
  };
  var oldState = this.state;
  
  
  // trigger start & release button touch & hover event
  this.evaluateButtonListeners(newState, oldState);
  this.evaluateRowListeners(newState, oldState);
  
  // trigger slider start event
  // trigger slider update event
  // trigger slider stop event
  
  // trigger matrix event
  
  this.state = newState;
  
};

TouchEvents.prototype.evaluateButtonListeners = function (newState, oldState) {
  var events = {
    buttonTouchedStart: false,
    buttonTouchedUpdate: false,
    buttonTouchedStop: false,
    
    buttonHoveredStart: false,
    buttonHoveredUpdate: false,
    buttonHoveredStop: false
  };
  
  // Check for touch and hover events
  if (newState.isTouched == false) {
    // table is not touched
    if (oldState.isTouched == true) {
      events.buttonTouchedStop = true; // previously touched button was released
    }
    if (newState.button.row !== null) {
      // calculate hovered button presses
      if ( (oldState.button.row !== null) && (newState.button.row == oldState.button.row) && (newState.button.column == oldState.button.column) ) {
        events.buttonHoveredUpdate = true; // button which was hovered before is still hovered        
      } else {
        events.buttonHoveredStart = true; // a new button was hovered
        events.buttonHoveredStop = true; // if a new button was touched, the old must be released 
      }
      if ( (events.buttonHoveredUpdate || events.buttonHoveredStart) == false) {
        events.buttonHoveredStart = true; // if no hover event was triggered, trigger start (will be called on initial call)  
      }
    }
  } else {
    // table is touched
    if (oldState.isTouched == false) {
      events.buttonTouchedStart = true; // button which was NOT touched before is now touched
    } else if (newState.button.row == oldState.button.row && newState.button.column == oldState.button.column) {
      events.buttonTouchedUpdate = true; // button which was touched is still touched
    } else {
      //console.log("I WAS HERE")
      events.buttonTouchedStart = true; // a new button was touched
      events.buttonTouchedStop = true; // if a new button was touched, the old must be released
    }
  }
  
  var eventObject = {
    events: events,
    newState: newState,
    oldState: oldState
  };
    
  
  // trigger release button release
  if (oldState.button.row != null && oldState.button.column != null) {
    this.triggerButtonReleaseEvents(this.buttonListeners[oldState.button.row][oldState.button.column], eventObject);
    this.triggerButtonReleaseEvents(this.allButtonListeners, eventObject);
  }

  // trigger button events
  this.triggerButtonTouchEvents(this.buttonListeners[newState.button.row][newState.button.column], eventObject);
  this.triggerButtonTouchEvents(this.allButtonListeners, eventObject);
};

// trigger press button event
TouchEvents.prototype.triggerButtonTouchEvents = function (pListener, eventObject) {
  var events = eventObject.events, newState = eventObject.newState, oldState = eventObject.oldState;
  if (pListener.length > 0) {
    // loop trough all listeners for button
    for (var l in pListener) {
      var listener = pListener[l];

      if (events.buttonTouchedStart == true && listener.onTouch != null && typeof listener.onTouch == "function") {
        listener.onTouch(eventObject);
      }
      
      if (listener.onlyWhenTouched == true || newState.isTouched == true) 
        continue; // do not trigger listener if not touched or when onlyWhenTouched is set
      
      if (events.buttonHoveredStart && listener.onTouch != null && typeof listener.onTouch == "function") {
        listener.onTouch(eventObject);
      }
    }
  }
}

// trigger button release event
TouchEvents.prototype.triggerButtonReleaseEvents = function (pListener, eventObject) {
  var events = eventObject.events, newState = eventObject.newState, oldState = eventObject.oldState;
  if (oldState.button.row != null && pListener.length > 0) {
    // loop trough all listeners for button
    for (var b in pListener) {
      var listener = pListener[b];

      if (events.buttonTouchedStop == true && listener.onRelease != null && typeof listener.onRelease == "function") {
        listener.onRelease(eventObject);
      }
      
      if (listener.onlyWhenTouched == true || newState.isTouched == true) 
        continue; // do not trigger listener if not touched or when onlyWhenTouched is set
      
      
      if (events.buttonHoveredStop && listener.onRelease != null && typeof listener.onRelease == "function") {
        listener.onRelease(eventObject);
      }
    }
  }
};

TouchEvents.prototype.evaluateRowListeners = function (newState, oldState) {
  var events = {
    rowTouchedStart: false,
    rowTouchedUpdate: false,
    rowTouchedStop: false,
    
    rowHoveredStart: false,
    rowHoveredUpdate: false,
    rowHoveredStop: false
  };
  
  // Check for touch and hover events
  if (newState.isTouched == false) {
    // table is not touched
    if (oldState.isTouched == true) {
      events.rowTouchedStop = true; // previously touched row was released
    }
    if (newState.row != null) {
      // calculate hovered button presses
      if (newState.row == oldState.row) {
        events.rowHoveredUpdate = true; // row which was hovered before is still hovered
      } else {
        events.rowHoveredStart = true; // a new row was hovered
        events.rowHoveredStop = true; // if a new row was touched, the old must be released
      }
      if ( (events.rowHoveredUpdate || events.rowHoveredStart) == false) {
        events.buttonHoveredStart = true; // if no hover event was triggered, trigger start (will be called on initial call)    
      }
    }
  } else {
    // table is touched
    if (oldState.isTouched == false) {
      events.rowTouchedStart = true; // row which was NOT touched before is now touched
    } else if (newState.button.row == oldState.button.row) {
      events.rowTouchedUpdate = true; // button which was touched is still touched
    } else {
      events.rowTouchedStart = true; // a new button was touched
      events.rowTouchedStop = true; // if a new button was touched, the old must be released
    }
  }
  
  var eventObject = {
    events: events,
    newState: newState,
    oldState: oldState
  };
    
  // trigger button events
  this.triggerRowTouchEvents(this.rowListeners[newState.button.row], eventObject);
  
  // trigger release button release
  if (oldState.row != null) {
    this.triggerRowReleaseEvents(this.rowListeners[oldState.row], eventObject);
  }

};

// trigger press & update row event
TouchEvents.prototype.triggerRowTouchEvents = function (pListener, eventObject) {
  var events = eventObject.events, newState = eventObject.newState, oldState = eventObject.oldState;
  if (pListener.length > 0) {
    // loop trough all listeners for button
    for (var l in pListener) {
      var listener = pListener[l];

      // trigger touch row start event
      if (events.rowTouchedStart == true && listener.onTouch != null && typeof listener.onTouch == "function") {
        listener.onTouch(eventObject);
      }
      
      // trigger touch row update event
      if (events.rowTouchedUpdate == true && listener.onUpdate != null && typeof listener.onUpdate == "function") {
        listener.onUpdate(eventObject);
      }
      
      if (listener.onlyWhenTouched == true || newState.isTouched == true) 
        continue; // do not trigger listener if not touched or when onlyWhenTouched is set
      
      if (events.buttonHoveredStart && listener.onTouch != null && typeof listener.onTouch == "function") {
        listener.onTouch(eventObject);
      }
      
      if (events.rowHoveredUpdate && listener.onUpdate != null && typeof listener.onUpdate == "function") {
        listener.onUpdate(eventObject);
      }
    }
  }
};

// trigger button release event
TouchEvents.prototype.triggerRowReleaseEvents = function (pListener, eventObject) {
  var events = eventObject.events, newState = eventObject.newState, oldState = eventObject.oldState;
  if (oldState.row != null && pListener.length > 0) {
    // loop trough all listeners for button
    for (var b in pListener) {
      var listener = pListener[b];

      if (events.rowTouchedStop == true && listener.onRelease != null && typeof listener.onRelease== "function") {
        listener.onRelease(eventObject);
      }
      
      if (listener.onlyWhenTouched == true || newState.isTouched == false) 
        continue; // do not trigger listener if not touched or when onlyWhenTouched is set
      
      
      if (events.rowHoveredStop && listener.onRelease != null && typeof listener.onRelease == "function") {
        listener.onRelease(eventObject);
      }
    }
  }
};

TouchEvents.prototype.getButtonFromCoordinates = function (pX, pY) {
  var column = Math.floor(pX / (100 / this.columns));
  var row    = Math.floor(pY / (100 / this.rows));
  if (column == this.columns) column--; // avoid edge case on pX = 100 for a index which is to high
  if (row == this.rows) row--;
  return {
    column: column,
    row: row
  };
}; 

TouchEvents.prototype.subscribeAllButtons = function  (pOnTouch, pOnRelease, pOnlyWhenTouched) {
  var pOnlyWhenTouched = (typeof pOnlyWhenTouched == "boolean") ? pOnlyWhenTouched : true;
  if (typeof pOnTouch != "function") console.error("Please provide a function as property 1 'onTouched' to subscribeAllButtons");
  if (typeof pOnRelease != "function") console.error("Please provide a function as property 2 'onRelease' to subscribeAllButtons");

  var listener = {
    onlyWhenTouched: pOnlyWhenTouched,
    onTouch: pOnTouch,
    onRelease: pOnRelease
  };
  this.allButtonListeners.push(listener);
};

TouchEvents.prototype.subscribeButton = function  (pRow, pColumn, pOnTouch, pOnRelease, pOnlyWhenTouched) {
  var pOnlyWhenTouched = (typeof pOnlyWhenTouched == "boolean") ? pOnlyWhenTouched : true;

  var listener = {
    onlyWhenTouched: pOnlyWhenTouched,
    onTouch: pOnTouch,
    onRelease: pOnRelease
  };
  this.buttonListeners[pRow][pColumn].push(listener);
};


TouchEvents.prototype.subscribeRow = function  (pRow, pOnTouch, pOnUpdate, pOnRelease, pOnlyWhenTouched) {
  var pOnlyWhenTouched = (typeof pOnlyWhenTouched == "boolean") ? pOnlyWhenTouched : true;

  var listener = {
    onlyWhenTouched: pOnlyWhenTouched,
    onTouch: pOnTouch,
    onUpdate: pOnUpdate,
    onRelease: pOnRelease
  };
  this.rowListeners[pRow].push(listener);
};


TouchEvents.prototype.subscribeColumn = function  (pColumn, pOnTouch, pOnUpdate, pOnRelease, pOnlyWhenTouched) {
  var pOnlyWhenTouched = (typeof pOnlyWhenTouched == "boolean") ? pOnlyWhenTouched : true;

  var listener = {
    onlyWhenTouched: pOnlyWhenTouched,
    onTouch: pOnTouch,
    onUpdate: pOnUpdate,
    onRelease: pOnRelease
  };
  this.columnListeners[pColumn].push(listener);
};

module.exports.TouchEvents = TouchEvents;