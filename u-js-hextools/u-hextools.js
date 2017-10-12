var HexTools = {
  
  options : {
    oddOffset : 0,
    evenOffset : 1,
  },
  
  /* creates a hex grid backing store */
  createGrid : function(width, height, options) {
    var setDefaultValue = function(container, varName, value) {
      if(typeof container[varName] == 'undefined')
        container[varName] = value;
    };
    if(!options) options = {};
    setDefaultValue(options, 'oddOffset', 0);
    setDefaultValue(options, 'evenOffset', 1);
    setDefaultValue(options, 'type', HexTools.graphics.pointyTop);
    var grid = {
      width : width,
      height : height,
      cells : [],
      options : options,
      get : function(x, y) {
        if(x > width-1 || x < 0 || y > height-1 || y < 0)
          return(false);
        return(grid.cells[y][x]);
      },
      call : function(x, y, f) {
        if(x > width-1 || x < 0 || y > height-1 || y < 0)
          return(false);
        return(f(grid.cells[y][x], x, y));
      },
      each : function(f) {
        grid.cells.forEach(function(row, rowIndex) {
          row.forEach(function(cell, colIndex) {
            f(cell, colIndex, rowIndex);
          });
        });
      },
    }
    for(var prop in options.type) if(options.type.hasOwnProperty(prop)) {
      grid[prop] = options.type[prop].bind(grid); 
    }
    if(options.functions) for(var prop in options.functions) if(options.functions.hasOwnProperty(prop)) {
      grid[prop] = options.functions[prop].bind(grid); 
    }
    for(var y = 0; y < height; y++) {
      grid.cells[y] = [];
      for(var x = 0; x < width; x++) {
        var cell = {
            x : x,
            y : y,
          };
        if(options.onCreateCell)
          options.onCreateCell(cell);
        grid.cells[y][x] = cell;
      }
    }
    return(grid);
  },

  graphics : {
    
    sqrt3 : Math.sqrt(3),
    
    pointyTop : {

      neighborsOf : function(cell, eachNeighborCallback) {
        var options = this.options || HexTools.options;
        var x = cell.x;
        var y = cell.y;
        var offset1 = (y % 2 != 0 ? options.oddOffset : options.evenOffset);        
        this.call(offset1+x-1, y-1, eachNeighborCallback);
        this.call(offset1+x+0, y-1, eachNeighborCallback);
        this.call(x+1, y+0, eachNeighborCallback);
        this.call(offset1+x+0, y+1, eachNeighborCallback);
        this.call(offset1+x-1, y+1, eachNeighborCallback);
        this.call(x-1, y+0, eachNeighborCallback);
      },

      distance : function(hx1, hy1, hx2, hy2) {
        var options = this.options || HexTools.options;
        hx1 += (hy1 % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        hx2 += (hy2 % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        var dx = hx1 - hx2;
        var dy = hy1 - hy2;
        return(Math.sqrt(dx*dx + dy*dy));
      },
      
      heightFromWidth : function(width) {
        return(width / (HexTools.graphics.sqrt3/2));
      },
      
      rowHeightFromWidth : function(width) {
        return(width / (HexTools.graphics.sqrt3/2)) * 0.75;
      },
      
      createDrawPath : function(size) {
        var height = HexTools.graphics.pointyTop.heightFromWidth(size);
        var width = size;
        return([
          0.00 * width,   -0.50 * height,
          0.50 * width,   -0.25 * height,
          0.50 * width,    0.25 * height,
          0.00 * width,    0.50 * height,
          -0.50 *width,    0.25 * height,
          -0.50 *width,   -0.25 * height,
          0.00 * width,   -0.50 * height,
        ]);  
      },
      
      projectHexToPlanar : function(hx, hy, cellSize, optionalDestination) {
        var options = this.options || HexTools.options;
        if(!optionalDestination)
          optionalDestination = {};
        var offset = (hy % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        optionalDestination.y = hy * HexTools.graphics.pointyTop.rowHeightFromWidth(cellSize);
        optionalDestination.x = (hx + offset) * cellSize;
        return(optionalDestination);
      },
      
      projectPlanarToHex : function(xc, yc, cellSize, optionalDestination) {
        if(!optionalDestination)
          optionalDestination = {};
        var options = this.options || HexTools.options;
        var cellWidth = cellSize;
        var cellHeight = HexTools.graphics.pointyTop.rowHeightFromWidth(cellSize);
        var y = (yc / cellHeight) + 1/6;
        var x = (xc / cellWidth) - 
          (Math.round(y) % 2 == 0 ? options.evenOffset*0.5 : options.oddOffset*0.5);
        var fx = x - Math.round(x);
        var fy = y - Math.round(y);
        if(fy < -0.5+HexTools.graphics.sqrt3/5 && (Math.abs(fx) - (fy+0.5)*(1+HexTools.graphics.sqrt3/3) ) > 0) {
          y -= 1;
          x += (Math.round(y) % 2 == 0 ? -options.evenOffset : -options.oddOffset) + (fx > 0 ? 1 : 0);
        }
        optionalDestination.x = Math.round(x);
        optionalDestination.y = Math.round(y);
        return(optionalDestination);
      },
      
    },

    flatTop : {

      neighborsOf : function(cell, eachNeighborCallback) {
        var options = this.options || HexTools.options;
        var x = cell.x;
        var y = cell.y;
        var offset1 = (x % 2 != 0 ? options.oddOffset : options.evenOffset);        
        this.call(x+0, y-1, eachNeighborCallback);
        this.call(x+1, offset1+y-1, eachNeighborCallback);
        this.call(x+1, offset1+y+0, eachNeighborCallback);
        this.call(x+0, y+1, eachNeighborCallback);
        this.call(x-1, offset1+y+0, eachNeighborCallback);
        this.call(x-1, offset1+y-1, eachNeighborCallback);
      },

      distance : function(hx1, hy1, hx2, hy2) {
        var options = this.options || HexTools.options;
        hy1 += (hx1 % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        hy2 += (hx2 % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        var dx = hx1 - hx2;
        var dy = hy1 - hy2;
        return(Math.sqrt(dx*dx + dy*dy));
      },
      
      widthFromHeight : function(height) {
        return(height / (HexTools.graphics.sqrt3/2));
      },
      
      colWidthFromHeight : function(height) {
        return(height / (HexTools.graphics.sqrt3/2) * 0.75);
      },
      
      createDrawPath : function(size) {
        var width = HexTools.graphics.flatTop.widthFromHeight(size);
        var height = size;
        return([
          -0.50 * width,  0.00 * height,
          -0.25 * width,  0.50 * height,   
           0.25 * width,  0.50 * height,
           0.50 * width,  0.00 * height,    
           0.25 * width, -0.50 * height,    
          -0.25 * width, -0.50 * height,
          -0.50 * width,  0.00 * height,   
        ]);  
      },
      
      projectHexToPlanar : function(hx, hy, cellSize, optionalDestination) {
        var options = this.options || HexTools.options;
        if(!optionalDestination)
          optionalDestination = {};
        var offset = (hx % 2 != 0 ? options.oddOffset/2 : options.evenOffset/2);
        optionalDestination.x = hx * HexTools.graphics.flatTop.colWidthFromHeight(cellSize);
        optionalDestination.y = (hy + offset) * cellSize;
        return(optionalDestination);
      },
      
      projectPlanarToHex : function(xc, yc, cellSize) {
        var options = this.options || HexTools.options;
        var cellHeight = cellSize;
        var cellWidth = HexTools.graphics.flatTop.colWidthFromHeight(cellSize);
        var x = (xc / cellWidth) + 1/6;
        var y = (yc / cellHeight) - 
          (Math.round(x) % 2 == 0 ? options.evenOffset*0.5 : options.oddOffset*0.5);
        var fx = x - Math.round(x);
        var fy = y - Math.round(y);
        if(fx < -0.5+HexTools.graphics.sqrt3/5 && (Math.abs(fy) - (fx+0.5)*(1+HexTools.graphics.sqrt3/3) ) > 0) {
          x -= 1;
          y += (Math.round(x) % 2 == 0 ? -options.evenOffset : -options.oddOffset) + (fy > 0 ? 1 : 0);
        }
        return({ x : Math.round(x), y : Math.round(y) });
      },
      
    },
    
  },
  
  
}

