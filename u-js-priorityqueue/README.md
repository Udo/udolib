# Udolib Priority Queue

This is worst case O(n) for push() and pop(), but should be reasonably fast with small n,
still faster than Array.splice()-based structures. 

## Creating a Queue

```javascript
  var q = PriorityQueue.create();
```

## Pushing Items onto the Queue

```javascript
  push = function(prio, payload)
```
Pushes a payload items with a certain priority into the queue.

```javascript
  q.push(1);
  q.push(11);
  q.push(2);
  q.push(9);
  q.push(5);
```

## Popping Items from the Queue

```javascript
  q.peek() 
```
Returns the item with the lowest priority but leaves it in the queue.

```javascript
  q.peekPriority() 
```
Returns the priorty of the item with the lowest priority.

```javascript
  q.pop() 
```
Retrieves the item with the lowest priority and removes it from the queue.

```javascript
  while(q.peek()) {
    console.log(q.peekPriority(), q.pop());
  }
```

Example showing all three functions in action.

## Trimming the Queue's Internal Storage

```javascript
  q.cleanup();
```
