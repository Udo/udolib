# Udolib Priority Queue

This is worst case O(n) for push() and pop(), but should be reasonably fast with small n,
still faster than Array.splice()-based structures. 

## Creating a Queue

```
  var p = PriorityQueue.create();
```

## Pushing Items onto the Queue

```
push = function(prio, payload)
```
Pushes a payload items with a certain priority into the queue.

```
  p.push(1);
  p.push(11);
  p.push(2);
  p.push(9);
  p.push(5);
```

## Popping Items from the Queue

```
peek = function() 
```
Returns the item with the lowest priority but leaves it in the queue.

```
peekPriority = function() 
```
Returns the priorty of the item with the lowest priority.

```
pop = function() 
```
Retrieves the item with the lowest priority and removes it from the queue.

```
  while(pq.peek()) {
    console.log(pq.peekPriority(), pq.pop());
  }
```

## Trimming the Queue's Internal Storage

```
  p.cleanup();
```
