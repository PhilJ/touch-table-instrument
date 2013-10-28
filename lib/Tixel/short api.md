# Tixel Short API

## Types

    Name          Type                Example
    -----------------------------------------------------
    Value         Number [0...1]      0.5
    HexColor      String              '#FFFFFF'
    Size          [Integer, Integer]  [8, 6]
    Position      [Integer, Integer]  [3, 4]
    PositionList  Array.<Position>    [ [1,1], [2,2], [3,3]]
    Matrix        Array.<Array>       [ [1,0,1], [0,1,0], [1,0,1] ]

## Tixel Matrix

All 2-dimensional arrays in Tixel are represented as `TixelMatrix`, e.g. `TixelSelection.selection` or `TixelElement.canvas`.

### Construction

    var matrix = new TixelMatrix([2, 2], 0);                  // Create TixelMatrix with size [2, 2] and default value 0
    var matrix = new TixelMatrix([2, 2] 0, [[1, 0], [0, 1]]); // Create TixelMatrix and preset values

### Properties

    TixelMatrix.matrix         (Matrix)
    TixelMatrix.bufferMatrix   (Matrix)

### Methods

    Tixel.get(x, y)
    Tixel.getAt(Position)
    Tixel.set(x, y, value)
    Tixel.forEach(function (x, y, valueAtPosition) {})
    Tixel.setForEach(function (x, y, valueAtPosition) { return valueAtPosition })
    Tixel.setMatrix(Matrix, Position)
    Tixel.setAll(value)
    Tixel.reset()


## TixelElement

`TixelElement` is a representation of 2D matrix of colors, with a simple interface for color manipulation.
You can use `canvas` by passing `HexColors` or `valueCanvas` by passing `Value`s from `0...1` which are 
automatically translated to the corresponding colors in `colorMap`.

`TixelElement.prototype = new TixelSelection()`, this means, that `TixelElement` extends `TixelSelection`
and inherits all its properties and methods.  

A TixelElement can have multiple `ChildTixelElements`, which are renderend onto its 'canvas'.

### Construction

    var matrix = new TixelElement([10,10]); // initialize with size array
    var matrix = new TixelElement({         // initialize with configuration object
        size: [10,10],
        defaultColor: 'FF0000',
        colorMap: ['00FF00', '00FF00']
    });

### Properties

    canvas        TixelMatrix
    valueCanvas   TixelMatrix
    children      Array.<TixelChildElement>
    colorMap      Array.<HexColor>
    defaultColor  HexColor

### Methods

    render()
    set(HexColor)
    set(HexColor, TixelSelection)
    set(HexColor, CoordianteList)
    set(Value)
    set(Value, TixelSelection)
    set(Value, CoordianteList)
    forEach(function (x, y, valueObject) {})
    onPosition(Position)

## TixelChildElement

A `TixelChildElement` inherits all properties and methods of `TixelElement` and `TixelSelection` and extends it
by `position` on parent matrix of `origin`, a mask for transparency and the possibility

### Properties

    mask          TixelMatrix
    position      Position
    origin        Position

##o Methods

    setMask(Value)
    setMask(Value, TixelSelection)
    setMask(Value, CoordianteList)
    move(Position, Frames)
    move(PositionList)
    moveTo(Position, Frames)


## TixelSelection

A `TixelSelection` represents an 2d matrix of elements, which are either selected `1`,
unselected `0`, or something inbetween (will be treated as `selected` as well). 

If you want to draw a specific shape (e.g. circle, line) on an `TixelElement` create an 
`TixelSelection` of that shape, and apply it via `TixelElement.set()`.

### Construction

    var selection = new TixelSelection(4, 4);
    selection.selectLine([0, 1], [4, 1]);

### Properties

    selection             Matrix
    selectedCoordinates   Array of Positions

### Methods

    select(TixelMatrix, mode);
    selectAt(Position)
    unselectAt(Position)
    selectAll()
    unselectAll()
    selectLine(Position, Position)
    selectCircle(Position, Position)
    invertSelection()
    selectMooreNeighbors()
    reset()

