# Udolib Hex Tools

Optional dependencies: Udolib PriorityQueue, PathAStar

This is a collection of things that come in handy when dealing with 2D hex maps.

## HexTools.createGrid() - Creating a Hex Grid Backing Store

```javascript
  HexTools.createGrid = function(width, height, options)

  // Example
  var hg = HexTools.createGrid(32, 32);
```

Creates an array that stores hex cells. The mapping used here is assumed to be
an y:x array where each odd row is offset by a half hex. As such it has only two
axes. 

The grid object created by this function is referred to by the variable name `grid` in this documentation.

##### Options

The `options` parameter of HexTools.createGrid() supports the following parameters:

- `functions` (default: none) A place to define custom functions that should be included in the returned grid object. The functions featured in this option will be applied and bound to the resulting grid object (binding the `this` parameter to the grid object).

- `oddOffset` (default: 0) this is an `x` offset for odd rows. This information is used by topological functions such as `neighborsOf()` to determine what the layout of the grid represents.

- `evenOffset` (default: 1) same as `oddOffset` but for even rows.

- `onCreateCell` (default: none) This is an optional callback function that will be invoked on each cell when the grid is created. The expected signature of the function is `f(cell)`. 

- `type` (default: `HexTools.graphics.pointyTop`) contains functions that allows HexTools to work with hex graphics and topology based on the orientation of the hexes. By default, this creates a grid for hexes standing upright on their pointy side. The other supported option for this is for a grid where the hexes lie flat: `HexTools.graphics.flatTop`. The functions featured in this option will be applied and bound to the resulting grid object (binding the `this` parameter to the grid object).

## grid.call(x, y, f)

Calls the function `f` using the cell at `x`:`y` and coordinates as its parameters, and returns the result. If the coordinates are outside the grid's dimension, this returns the `false` value. The expected signature of `f` is `f(cell, x, y)`. Refer to the section on `grid.each()` for a note on the binding of the `this` keyword in `f`.

## grid.cells

(array) The x by y array used to store the individual cells of the grid.

## grid.createDrawPath(width)

(array) Returns an array containing a vector path describing a single hex based on the specified width.

#### Example: Drawing a Pointy-Topped Grid in PIXI.JS

```javascript
  
  var hg = HexTools.createGrid(8, 8, { 
    cellSize : 64, 
    evenOffset : 1, 
    oddOffset : 0, 
    type : HexTools.graphics.pointyTop,
    functions : {

      drawHex : function(cell) {
        // note: "this" will stay bound to the grid object
        var g = new PIXI.Graphics();
        g.beginFill(0x00ff00, 0.3);
        g.lineStyle(2, 0xff00ff, 1.0);
        g.drawPolygon(this.createDrawPath(this.options.cellSize));
        this.projectHexToPlanar(
          cell.x, 
          cell.y, 
          this.options.cellSize, 
          g.position);
        MyPIXILayer.addChild(g);
      },

    }});
    
  hg.each(hg.drawHex);

```

## grid.distance(x1, y1, x2, y2)

(number) Returns the distance between the hex cells `x1:y1` and `x2:y2`.

## grid.each(f)

Iterates over all the cells in the grid and calls the function `f` on them. The expected signature of `f` is `f(cell, x, y)`. 

Note: To avoid spamming the garbage collector with bound versions of `f`, `grid.each()` does not bind the `this` keyword inside `f` to the grid object. However, if `f` is provided to `createGrid()`'s custom `functions`, it will already be `this`-bound.

## grid.get(x, y)

(cell object) Returns the cell at `x`:`y`. If the coordinates are outside the grid's dimension, this returns the `false` value.

## grid.height

(number) The `y` dimension of the grid (read-only).

## grid.heightFromWith(width)

(number) Returns the height of a hex based on its width.

## grid.neighborsOf(cell, f) 

Calls the function `f` on all neighbors of the `cell`.

#### Example: Highlight the Neighbors of a Hex in PIXI.JS

```javscript

  grid.neighborsOf(grid.get(4, 3), function(cell) {
    cell.g.tint = 0xff88ff;
  });
      
```

## grid.options 

(object/hashmap) These are the options passed into the grid with `HexTools.createGrid()` (see there). You can pass arbitrary other options into this as well as modify the `options` object for your own purposes.

## grid.projectHexToPlanar(gx, gy, width, result)

(object) Returns the x and y coordinates of a given hex cell on a planar map (or modifies the supplied `result` parameter). The result is an object with an `x` and a `y` field holding the values. This is useful for drawing a graphical map of the grid.

## grid.projectPlanarToHex(px, py, width, result)

(object) Given the the planar map coordinates `px` and `py` and the `width` of an individual hex, this function returns the grid x and y of the hex cell those coordinates fall into. This is useful, for example, to find the hex below the mouse pointer on a map.

#### Example: Mouse-Over Highlighting in PIXI.JS

```javascript
  
  function MakeInteractive(container, grid) {
    
    container.interactive = true;
    var lastCellHighlighted = false;
    
    container.mousemove = function(e) {
      if(lastCellHighlighted) {
        lastCellHighlighted.tint = lastCellHighlighted.prevTint;
        lastCellHighlighted = false;
      }
      var x = e.data.global.x + container.pivot.x;
      var y = e.data.global.y + container.pivot.y;
      var gridPos = grid.projectPlanarToHex(x, y, hg.options.cellSize);
      var cell = grid.get(gridPos.x, gridPos.y);
      if(cell) {
        lastCellHighlighted = cell.g;
        cell.g.prevTint = cell.g.tint;
        cell.g.tint = 0x8888ff;
      }
    }
    
  }
  
```

## grid.rowHeightFromWith(width)

(number) Returns the distance between hex rows based on the width of an individual hex.

## grid.width 

(number) The `x` dimension of the grid (read-only).
