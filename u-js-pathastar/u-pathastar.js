var PathAStar = {

  extractPath : function(history, endNode, idField) {
    var path = [];
    
    var n = endNode;
    
    while(n) {
      path.push(n);
      n = history[n[idField]];
    }
    
    return(path.reverse());
  },
  
  config : {
    nodeIdField : 'id',
    defaultLinearDistance : function(fromNode, toNode) {
      var dx = fromNode.x - toNode.x;
      var dy = fromNode.y - toNode.y;
      return(Math.sqrt(
        (dx*dx)+(dy*dy)
        ));
    },
  },

  find : function(startNode, endNode, eachNeighbor, getCost, getCostHeuristic) {
    
    var startTime = performance.now();
    var countConsidered = 0;
    var countHighWatermark = 0;
    var idField = PathAStar.config.nodeIdField;
    
    if(!getCost)
      getCost = PathAStar.config.defaultLinearDistance;

    if(!getCostHeuristic)
      getCostHeuristic = PathAStar.config.defaultLinearDistance;
      
    var objectIdCounter = 10000;
    var objectId = function(o) {
      if(!o[idField]) 
        o[idField] = 'N'+(objectIdCounter++);
      return(o[idField]);
    }
    
    objectId(startNode);
    objectId(endNode);

    var frontier = PriorityQueue.create();
    frontier.push(0, startNode);
    var history = {};
    var costSoFar = {};
    costSoFar[startNode[idField]] = 1;
    history[startNode[idField]] = false;
    
    while(frontier.size > 0) {
      var currentNode = frontier.pop();
      if(countHighWatermark < frontier.size)
        countHighWatermark = frontier.size;
      if(currentNode == endNode) {
        return({ 
          result : 'path', 
          debug : {
            time : (performance.now() - startTime) / 1000,
            highWaterMark : countHighWatermark,
            nodesConsidered : countConsidered,
            totalCost : costSoFar[currentNode.id],
          },
          path : PathAStar.extractPath(history, endNode, idField) 
          });
      }
      eachNeighbor(currentNode, function(nextNode) {
        if(!nextNode)
          return;
        objectId(nextNode);
        var newCost = costSoFar[currentNode.id] + getCost(currentNode, nextNode);
        if(!costSoFar[nextNode.id] || newCost < costSoFar[nextNode.id]) {
          costSoFar[nextNode[idField]] = newCost; 
          var prio = newCost + getCostHeuristic(nextNode, endNode);
          frontier.push(prio, nextNode);
          countConsidered++;
          history[nextNode[idField]] = currentNode;
        }
      });
    }
     
    return({ 
      result : 'no-path', 
      debug : {
        time : (performance.now() - startTime) / 1000,
        highwaterMark : countHighWatermark,
        nodesConsidered : countConsidered,
        totalCost : 0,
      },
      path : [] });   
  },

}

