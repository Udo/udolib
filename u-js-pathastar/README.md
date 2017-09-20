# Udolib A-Star Pathfinder

Dependencies: Udolib PriorityQueue

This is a simple A* pathfinder that is (relatively) data-agnostic, meaning
it doesn't assume an underlying grid structure; movement costs and neighboring nodes
can be decided dynamically.

It finds the optimal path along graph nodes (which can be any Javascript object).
This pathfinder isn't optimized for speed but it does relatively well on modest
graphs (still not nearly as fast as some grid-optimized finders like https://github.com/qiao/PathFinding.js/ ).

Assumptions: 

* Each node must have an id field that uniquely identifies it. By default the name of that field is "id". If the algorithm sees a node without such an id field it will generate one on the fly and modify the node accordingly. This is the only operation that modifies nodes.

* The starting node and the end node are assumed to be traversable. If there is a chance they're not, this must be checked before PathAStar.find() is called. The reason why the pathfinder doesn't check this on its own is that it has no built-in concept of reachability - instead this functionality is injected with the `eachNeighbor` function that must be supplied with the find() call.

* The default movement cost and heuristic functions assume each node has an `x` and a `y` field indicating its position on a flat map. If your graph nodes work differently, you can supply your own heuristic and/or costing functions (see below).

![Path finding example](https://github.com/udo/udolib/raw/master/u-js-pathastar/pathastar-example1.png "Udolib A-Star Pathfinder")

## Basic Usage

```javascript
// finding a path from startNode to endNode
var pfResult = PathAStar.find( startNode, endNode, eachNeighbor );
```

`startNode`: the graph node where the search begins (must be traversable)

`endNode`: the graph node where the search ends (must be traversable)

`eachNeighbor(currentNode, callbackFunc)`: a function that takes a node and a callback as parameters. The function is expected to invoke the `callbackFunc` for each neighboring node of `currentNode` (for more information, see below in the "eachNeighbor" section).

If no path could be found, `find()` will return a result like this:

```javascript
{ 
	result: "no-path", 
	debug: {
		highwaterMark: 23,
		nodesConsidered: 213,
		time: 0.00244500000000005,
	}, 
	path: []
}
```

The `debug` record shows information about the pathfinding process, such as how long it took in seconds, how many nodes were considered for the path, and how many nodes were in the frontier buffer at its highest.

A successful `find()` looks like this:

```javascript
{ 
	result: "path", 
	debug: {
		highwaterMark: 23,
		nodesConsidered: 213,
		time: 0.00244500000000005,
	}, 
	path: [{NODE}, {NODE}, ...]
}
```

In this case, the `path` field will contain an array of all the nodes that make up the path, in order.

## The `eachNeighbor` Function

The flexibility of this pathfinder comes from the fact that graph traversal is provided by the user-supplied `eachNeighbor` function. Here is how to write one:

```javascript
var myGraph = ...
var getNodeNeighborsExample = function(node, f) {
  var c = false;
  c = myGraph[node.y][node.x-1]; if(c && c.walkable) f(c);
  c = myGraph[node.y][node.x+1]; if(c && c.walkable) f(c);
  c = myGraph[node.y-1][node.x]; if(c && c.walkable) f(c);
  c = myGraph[node.y+1][node.x]; if(c && c.walkable) f(c);
}
```

In this example, the graph nodes are stored in a 2-dimensional array, and each node has an `x` and a `y` field to indicate its position in the grid. The pathfinder will call `getNodeNeighborsExample` for each node it traverses, to find the (walkable) neighboring nodes. In the `getNodeNeighborsExample` example function, each node only has four possible neighbors, one in each cardinal direction. 

It's easy to see how other topologies and other containers would be implemented. Here is an example for a flat hashmap grid with cardinal and inter-cardinal neighbors, and node objects that also feature `x` and `y` designators. In this example, each node is addressible within the container by the string `(x+':'+y)`:

```javascript
var eachNeighbor = function(n, f) {
  var c = false;
  c = grid[(n.x-1)+':'+(n.y-1)]; if(c && c.walkable) f(c);
  c = grid[(n.x-1)+':'+(n.y)];   if(c && c.walkable) f(c);
  c = grid[(n.x-1)+':'+(n.y+1)]; if(c && c.walkable) f(c);
  c = grid[(n.x)+':'+(n.y-1)];   if(c && c.walkable) f(c);
  c = grid[(n.x)+':'+(n.y+1)];   if(c && c.walkable) f(c);
  c = grid[(n.x+1)+':'+(n.y-1)]; if(c && c.walkable) f(c);
  c = grid[(n.x+1)+':'+(n.y)];   if(c && c.walkable) f(c);
  c = grid[(n.x+1)+':'+(n.y+1)]; if(c && c.walkable) f(c);
}
```

Here is an example for an amorphous graph, where each node stores a list of its own neighbors:

```javascript
var amorphousNeighborExample = function(node, f) {
  node.neighbors.forEach(f);
}
```

## Custom Movement Cost

By default, Udolib's PathAStar finder assumes each node has an `x` and a `y` field representing the node's position on a flat 2D map, to make the most common use case easier to deal with. This default function is used _both_ for calculating the movement cost between any two nodes _and_ as a heuristic for the total distance between any two nodes in the graph. The default implementation is stored in `PathAStar.config.defaultLinearDistance` and looks like this:

```javascript
defaultLinearDistance = function(fromNode, toNode) {
  var dx = fromNode.x - toNode.x;
  var dy = fromNode.y - toNode.y;
  return(Math.sqrt(
    (dx*dx)+(dy*dy)
    ));
}
```

When rolling your own movement cost function, you might want to take other factors into account, for example terrain-based costs:

```javascript
var myMovementCostFunction : function(fromNode, toNode) {
  return(fromNode.terrainCost + toNode.terrainCost);
}
```

Invoking `find()` with a custom movement cost function works like so:

```javascript
// finding a path from startNode to endNode, using a custom movement cost function
var pfResult = PathAStar.find( startNode, endNode, eachNeighbor, myMovementCostFunction );
```

The movement cost function will only ever be called to evaluate movement between two directly connected nodes.

## Custom Distance Heuristic

The A* algorithm uses a heuristic function to determine the approximate distance between any two nodes. It uses this heuristic to determine which nodes are the more promising to investigate next. By default, Udolib's finder uses the same distancing function as shown above in the movement section. If your graph nodes do not have an `x` and `y` field to prepresent their position on a flat 2D map, or if the topology of your map is different, you need to provide your own heuristic function for this.

Invoking `find()` with a custom movement cost _and_ custom heuristic function works like so:

```javascript
// finding a path from startNode to endNode, using a custom movement cost function
var pfResult = PathAStar.find( startNode, endNode, eachNeighbor, myMovementCostFunction, myHeuristic );
```

Keep in mind that the heuristic function must be able to return a reasonable distance approximation between any two nodes in the graph.

## Custom `id` Field

For its internal scratch storage, Udolib's finder needs every node to have a unique (string or numeric) ID field, because Javascript does not expose a suitable mechanism to uniquely identify an object.

By default, the function assumes the name of this field is "id", as in `node.id`. Whenever the algorithm encounters are node that does not have this field set, it fills it with an auto-generated value. To prevent this, make sure every node does have its ID field set before calling `find()`.

You can change the _name_ of this expected field by changing the value of `PathAStar.config.nodeIdField` to whatever you need it to be.














































