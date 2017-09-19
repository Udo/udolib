/**
 * Udolib JavaScript Priority Queue
 * (c) Udo Schroeter udo@openfu.com
 * License: Public Domain
 * losely based on https://github.com/lemire/FastPriorityQueue.js
*/

var PriorityQueue = {

  defaultCompare : function(a, b) {
    return( a[0] < b[0] );
  },

  create : function(optionalCustomCompareFunction) {

    var q = {
      compare : optionalCustomCompareFunction || PriorityQueue.defaultCompare,
      items : [],
      size : 0,
    };

    q.push = function(prio, payload) {
      var v = [prio, payload];
      var i = q.size;
      q.items[q.size] = v;
      q.size += 1;
      var p;
      var ap;
      while (i > 0) {
        p = (i - 1) >> 1;
        ap = q.items[p];
        if (!q.compare(v, ap)) {
          break;
        }
        q.items[i] = ap;
        i = p;
      }
      q.items[i] = v;      
    }

    q.percolateDown = function(i) {
      var size = q.size;
      var hsize = q.size >>> 1;
      var ai = q.items[i];
      var l;
      var r;
      var bestc;
      while (i < hsize) {
        l = (i << 1) + 1;
        r = l + 1;
        bestc = q.items[l];
        if (r < size) {
          if (q.compare(q.items[r], bestc)) {
            l = r;
            bestc = q.items[r];
          }
        }
        if (!q.compare(bestc, ai)) {
          break;
        }
        q.items[i] = bestc;
        i = l;
      }
      q.items[i] = ai;      
    }

    q.peek = function() {
      if(q.size == 0) 
        return(false);      
      return(q.items[0][1]);
    }

    q.peekPriority = function() {
      if(q.size == 0) 
        return(false);      
      return(q.items[0][0]);
    }

    q.pop = function() {
      if(q.size == 0) 
        return(false);
      var res = q.items[0];
      if (q.size > 1) {
        q.items[0] = q.items[--q.size];
        q.percolateDown(0 | 0);
      } else {
        q.size -= 1;
      }
      return(res[1]);
    }

    q.cleanup = function() {
      q.items = q.items.slice(0, q.size);
    }

    return(q);
  },

}
