# Udolib Priority Queue

## Creating a Queue

```
  var p = PriorityQueue.create();
```

## Pushing Items onto the Queue

```
  p.push(1);
  p.push(11);
  p.push(2);
  p.push(9);
  p.push(5);
```

## Popping Items from the Queue

```
  while(pq.peek()) {
    console.log(pq.pop());
  }
```

## Trimming the Queue's Internal Storage

```
  p.cleanup();
```
