# Udolib Hex Tools - Basic Usage

Dependencies: none

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

- `oddOffset` (default: 0) this is an `x` offset for odd rows. This information is used by topological functions such as `eachNeighborOf()` to determine what the layout of the grid represents.

- `evenOffset` (default: 1) same as `oddOffset` but for even rows.

- `onCreateCell` (default: none) This is an optional callback function that will be invoked on each cell when the grid is created. The expected signature of the function is `function(cell)`. 

- `type` (default: `HexTools.pointyTop`) contains functions that allows HexTools to work with hex graphics and topology based on the orientation of the hexes. By default, this creates a grid for hexes standing upright on their pointy side. The other supported option for this is for a grid where the hexes lie flat: `HexTools.flatTop`. The functions featured in this option will be applied and bound to the resulting grid object (binding the `this` parameter to the grid object).

## grid.call(x, y, f)

(↳ return value of f) Calls the function `f` using the cell at `x`:`y` and coordinates as its parameters, and returns the result. If the coordinates are outside the grid's dimension, this returns the `false` value. The expected signature of `f` is `function(cell, x, y)`. Refer to the section on `grid.each()` for a note on the binding of the `this` keyword in `f`.

## grid.cells

(⇌ array) The x by y array used to store the individual cells of the grid.

## grid.colCount 

(⇌ number) The number of columns the grid was created with (read-only).

## grid.createDrawPath(width)

(↳ array) Returns an array containing a vector path describing a single hex based on the specified width.

#### Example: Drawing a Pointy-Topped Grid in PIXI.JS

```javascript
  
  var hg = HexTools.createGrid(8, 8, { 
    cellSize : 64, 
    evenOffset : 1, 
    oddOffset : 0, 
    type : HexTools.pointyTop,
    functions : {

      drawHex : function(cell) {
        // note: "this" will stay bound to the grid object
        var g = new PIXI.Graphics();
        g.beginFill(0x00ff00, 0.3);
        g.lineStyle(2, 0xff00ff, 1.0);
        g.drawPolygon(this.createDrawPath(this.options.cellSize));
        this.projectHexToMap(
          cell.x, 
          cell.y, 
          this.options.cellSize, 
          g.position);
        MyPIXILayer.addChild(g);
      },

    }});
    
  hg.each(hg.drawHex);

```

## grid.mapDistance(x1, y1, x2, y2)

(↳ number) Returns the distance between two points on the map.

## grid.mapDistance(c1, c2)

(↳ number) Returns the distance between two hex cells on the map.

## grid.each(f)

Iterates over all the cells in the grid and calls the function `f` on them. The expected signature of `f` is `function(cell, x, y)`. 

Note: To avoid spamming the garbage collector with bound versions of `f`, `grid.each()` does not bind the `this` keyword inside `f` to the grid object. However, if `f` is provided to `createGrid()`'s custom `functions`, it will already be `this`-bound.

#### Example: Iterating Through All the Hexes

```javscript

  grid.each(function(cell) {
    console.log(cell.x, cell.y, 'is at map position', cell.pos);
    });
      
```

## grid.eachInAreaOf(cells, radius, f) 

Calls the function `f` on all cells in the area of the list `cells` (an array of cells), within a distance of `radius`. The expected signature of `f` is `function(cell, distanceToCenter)`.

![eachInAreaOf example](https://github.com/Udo/udolib/blob/master/u-js-hextools/hextools-example-eachinareaof.png?raw=true "Udolib eachInAreaOf() example")

#### Example: Highlighting All Surrounding Hexes in PIXI.JS

```javscript

  // highlight an area with 3 hexes radius:
  grid.eachInAreaOf([grid.get(4, 3)], 3, function(cell) {
    // highlight every hex within that area:
    cell.g.tint = 0xff88ff;
    });
      
```

## grid.eachInLine(c1, c2, f) 

Calls the function `f` on all cells along a straight path from `cell` c1 to c2. The expected signature of `f` is `function(cell, stepCount)`.

![eachInLine example](https://github.com/Udo/udolib/blob/master/u-js-hextools/hextools-example-eachinline.png?raw=true "Udolib eachInLine() example")

#### Example: Drawing a Line on the Hex Map in PIXI.JS

```javscript

  grid.eachInLine(grid.get(4, 3), grid.get(9, 5), function(cell, distance) {
    // highlight every hex on the line:
    cell.g.tint = 0xff88ff;
    });
      
```

## grid.eachNeighborOf(cell, f) 

Calls the function `f` on all neighbors of the `cell`.

#### Example: Highlight the Neighbors of a Hex in PIXI.JS

```javscript

  grid.eachNeighborOf(grid.get(4, 3), function(cell, distance) {
    // highlight every neighbor cell:
    cell.g.tint = 0xff88ff;
    });
      
```

## grid.get(x, y)

(↳ cell object) Returns the cell at `x`:`y`. If the coordinates are outside the grid's dimension, this returns the `false` value.

## grid.heightFromWith(width)

(↳ number) Returns the height of a hex based on its width.

## grid.options 

(⇌ object) These are the options passed into the grid with `HexTools.createGrid()` (see there). You can pass arbitrary other options into this as well as modify the `options` object for your own purposes.

## grid.projectHexToMap(gx, gy, [hexSize], [result])

(↳ object) Returns the x and y coordinates of a given hex cell on a planar map (or modifies the supplied `result` parameter). The result is an object with an `x` and a `y` field holding the values. This is useful for drawing a graphical map of the grid.

#### Example: Getting the Position of a Hex

```javscript
  
  console.log('position of hex 4:3', grid.projectHexToMap(4, 3, 64));
      
```

## grid.projectMapToHex(px, py, [hexSize], [result])

(↳ object) Given the the planar map coordinates `px` and `py` and the `hexSize` of an individual hex, this function returns the grid x and y of the hex cell those coordinates fall into. This is useful, for example, to find the hex below the mouse pointer on a map.

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
      var gridPos = grid.projectMapToHex(x, y, hg.options.cellSize);
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

(↳ number) Returns the distance between hex rows based on the width of an individual hex.

## grid.stepDistance(c1, c2) 

(↳ number) Returns how many steps it takes on the map to get from cells c1 to c2 in a straight line.

## grid.rowCount

(⇌ number) The number of rows the grid has (read-only).

# Using HexTools with PathAStar Finder

Dependencies: Udolib PriorityQueue, PathAStar

![PathAStar example](https://github.com/Udo/udolib/blob/master/u-js-hextools/hextools-example-pathastar.png?raw=true "Udolib PathAStar example")

## Setting Things Up

To use pathfinding, hexes need some concept of passability (or a movement cost that differs from hex cell to hex cell, see below for examples of that). How you implement this is up to you, but here is an example that sets up a pseudo-random passability rule for each cell, using a custom cell property called `isPassable`:

```javascript
  
  var hg = HexTools.createGrid(16, 14, { 
    type : HexTools.pointyTop,
    onCreateCell : function(cell) {
      cell.isPassable = Math.random() < 0.3 || (cell.x % 2);
      },
    });

```

## Querying For a Path

Udolib's PathAStar.find() function can traverse any graph, so it is quite easy to set it up for a hexmap graph. The function expects at least 3 arguments: a start node, a target node, and a function that enumerates the reachable neighbors of any given node.

To continue the example above, here is an example case that uses HexTools' `grid.eachNeighborOf()` function:

```javascript
  
  var pfResult = PathAStar.find(
    hg.get(1,1), // <-- start node
    hg.get(9,6), // <-- end node
    function(node, f) { // <-- function that calls f() on all neighbors of node
      hg.eachNeighborOf(node, function(nb) {
        if(nb.isPassable)
          f(nb);
        });
      }          
    );

```

## Interpreting the Result

PathAStar.find() returns an object detailing the path that was found to be the shortest (if a path has been found). An example result might look like this:

```
{
  debug : {
    highWaterMark: 13,
    nodesConsidered: 42,
    time: 0.0008,
    totalCost: 12.82
  },
    
  path : [array of cells forming the path]   
}
```

Refer to the PathAStar documentation for more information about the pathfinding result.

## Using a Proper Distance Heuristic

While the example above does produce meaningful results, it does use PathAStar.find()'s default distance heuristic which interprets the `x` and `y` properties of each hex cell - which does not accurately reflect a hex' position on a map. To alleviate this, we can provide the grid's built-in distance function as a custom heuristic like so:

```javascript
  
  var pfResult = PathAStar.find(
    hg.get(1,1), // <-- start node
    hg.get(9,6), // <-- end node
    function(node, f) { // <-- function that calls f() on all neighbors of node
      hg.eachNeighborOf(node, function(nb) {
        if(nb.isPassable)
          f(nb);
        });
      },
    false, // <-- slot for costing function, empty for now
    hg.mapDistance // <-- distance heuristic       
    );

```

![PathAStar example](https://github.com/Udo/udolib/blob/master/u-js-hextools/hextools-example-pathastar-distheuristic.png?raw=true "Udolib PathAStar example")

## Using a Custom Movement Costing Function

You can set up custom movement costs however you like, you only need to supply a function that can return the movement cost between any two neighboring nodes. For example, let's say we create a hex map where every cell has its own terrain difficulty:

```javascript
  
  var hg = HexTools.createGrid(16, 14, { 
    type : HexTools.pointyTop,
    onCreateCell : function(cell) {
      cell.terrainDifficulty = 1 + Math.random()*4;
    },
    });

```

Based on this `terrainDifficulty` level, we can then provide a custom movement cost function:

```javascript
  
  var pfResult = PathAStar.find(
    hg.get(1,1), // <-- start node
    hg.get(9,6), // <-- end node
    hg.eachNeighborOf, // <-- function that calls f() on all neighbors of node
    function(cell1, cell2) { // <-- costing function
      return(cell2.terrainDifficulty);
      },
    hg.mapDistance // <-- distance heuristic       
    );

```

Note: the values returned by the movement cost function should never be lower than the guesses returned by the distance heuristic function. 

![PathAStar example](https://github.com/Udo/udolib/blob/master/u-js-hextools/hextools-example-pathastar-costing.png?raw=true "Udolib PathAStar example")


