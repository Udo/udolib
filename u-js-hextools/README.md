# Udolib Hex Tools

Dependencies: Udolib PriorityQueue, PathAStar

This is a collection of things that come in handy when dealing with 2D hex maps.

## Hextools.grid

### Creating a Hex Grid Backing Store

```javascript
  HexTools.grid.create = function(width, height, optionalOnCellCreate)


  // Example
  var hg = HexTools.grid.create(32, 32);
```

Creates an array that stores hex cells. The mapping used here is assumed to be
an y:x array where each odd row is offset by a half hex. As such it has only two
axes.

`optionalOnCellCreate(cell)` is an optional function parameter that takes a custom initializer
function which you can use to init properties of each individual grid cell.

The result of HexTools.grid.create() is a grid object with the following structure:

```javascript
  grid = {
    width : width,
    height : height,
    cells : [],
    each : function(f) { <...> },
  }
```


