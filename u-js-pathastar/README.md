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

* The starting node and the end node are assumed to be traversable. If there is a chance that they're not, this must be checked before PathAStar.find() is called. The reason why the pathfinder doesn't check this on its own is that it has no built-in concept of reachability - instead this functionality is injected with the `eachNeighbor` function that must be supplied with the find() call.

## Basic Usage

```
// finding a path from startNode to endNode
var pfResult = PathAStar.find( startNode, endNode, eachNeighbor );
```

`startNode`: the graph node where the search begins (must be traversable)

`endNode`: the graph node where the search ends (must be traversable)

`eachNeighbor(currentNode, callbackFunc)`: a function that takes a node and a callback as parameters. The function is expected to invoke the `callbackFunc` for each neighboring node of `currentNode`.

If no path could be found, `find()` will return a result like this:

```
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

```
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

