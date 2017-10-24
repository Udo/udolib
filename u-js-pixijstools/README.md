# Udolib PIXI.JS Tools 

# Stage

Stage is a helper for setting up a PIXI renderer, stage with layers, event handlers, and very basic animation system.

## Setup with Stage.create(options)

`Stage.create(opt)` returns a stage object. Behind the scenes, this creates a PIXI renderer and sets up some basic things like the event handling system.

````javascript

  var s = Stage.create({
      smoothScroll : 0.85,
    });
  
````

This example creates a stage with smooth scrolling enabled.

### Stage Setup and Runtime Options

The following options can be passed to Stage.create(). These options can be changed again during runtime by accessing the `.options` property of the stage object (for example: `myStage.options.stopped` accesses the `stopped` value).

````javascript
options : {
  maxZoom : 0 to Z              // the stage root's maximum zoom (scale) level
  minZoom : 0 to Z              // the stage root's minimum zoom (scale) level
  disableWheelZoom : true/false // do not change the stage root's zoom when mouse wheel is used
  zoomStep : -Z to Z            // how much the zoom level should change per step
  smoothZoom : 0 to 1.0         // smoothes changes to the stage root's zoom level over time
  smoothScroll : 0 to 1.0       // smoothes changes to the stage root's pivot values over time
  stopped : true or false       // whether the render loop should stop
  stopAnimation : true or false // whether animations should be processed
  stopEvents : true or false    // whether events should be processed
  frameSkipThreshold : 0 to 100 // skip a frame when thread load exceeds this value in percent 
  panArea : {           // set this if you want to restrict stage panning to a rectangle
    left : X,           // left limit
    right : X,          // right limit
    top : Y,            // top limit
    bottom : Y.         // bottom limit
  }
}

````

## Event Handling with Stage.on(eventName, handlerFunction)

The stage object can trigger event handlers on a variety of occasions. Supported event handlers are:

### .on('frameinfo', function(inf) { ... })

This gets called on every frame after the stage object's `.debug` property has been updated. The `.debug` object is also passed to the `frameinfo` handler (this object is reused from frame to frame). It has the following structure:

````javascript
  debug : {
    fps : 0 to X,             // current average frames per second
    threadLoad : 0,           // how long the animation and render step took this frame
    threadLoadPercent : 0,    // how much of the frame time was consumed by animation and render
    frameInterval : 33,       // how much time has passed since the last frame
    frameSkipStatus : 0,      // are we skipping the next frame due to high load?
    frameSkipCounter : 0,     // how often we skipped a frame due to high load
    animationTimestamp : 0,   // when the animation function was last called
    renderTimestamp : 0,      // when the render function was last called
  },  
````

### .on('animationstart', function(animFunc) { ... })

Triggers when an animation function is first added to the queue.

### .on('animationend', function(animFunc) { ... })

Triggers when an animation function is removed from the queue.

### .on('click', function(mouse) { ... })

Triggers when the stage receives a click event. `mouse` is also the stage's persistent `.mouse` info object. It has the following structure:

````javascript
  mouse : {
  	leftButton : false,       // whether the left mouse button is currently down
  	middleButton : false,     // whether the middle mouse button is currently down
  	rightButton : false,      // whether the right mouse button is currently down
  	anyButton : false,        // whether any mouse button is currently down
  	zoom : 1.0,	              // the current zoom level of the stage root
  	x : 0,                    // current mouse X based on the stage root's pivot and zoom
  	y : 0,                    // current mouse Y based on the stage root's pivot and zoom
  	x0 : 0,	                // while dragging, this indicates the original mouse X
  	y0 : 0,                   // while dragging, this indicates the original mouse Y
  },  
````

### .on('mousedown', function(mouse, buttonName) { ... })

Triggers when a mouse button is pressed.

### .on('mousedown_left', function(mouse) { ... })

Triggers only when a the left mouse button is pressed. Likewise, there are events for the other buttons called `mousedown_middle' and `mousedown_right`.

### .on('mousemove', function(mouse) { ... })

Triggers when the mouse position changes.

### .on('mouseup', function(mouse, buttonName) { ... })

Triggers when a mouse button is release.

### .on('mouseup_left', function(mouse) { ... })

Triggers only when a the left mouse button is released. Likewise, there are events for the other buttons called `mousedown_middle' and `mousedown_right`.

### .on('mouseenter', function(mouse) { ... })

Triggers when the mouse pointer enters the stage area.

### .on('mouseout', function(mouse) { ... })

Triggers when the mouse pointer leaves the stage area.

### .on('pan', function(position) { ... })

Triggers when the stage root changes position. You can change the outcome of the pan by altering the `x` and `y` values of the position object.  

### .on('resize', function(sizeInfo) { ... })

Triggers after the window has been resized and the renderer processed its own resize function.

### .on('wheel', function(wheelPositionY, wheelPositionX) { ... })

Triggers when the mouse wheel is used.

### .on('zoom', function(mouse) { ... })

Triggers when the stage's zoom level changes. You can change the outcome of the zoom by altering the `zoom` value of the mouse object.

## Triggering Events Manually with .trigger(eventName, param)

This will trigger an event if a handler for it has previously been defined with the `.on(eventName, handlerFunc)` method.

## Changing the Zoom Level with .zoom(level)

This function will change the stage's zoom level to a new value, triggering the 'zoom' event handler if defined.

## Relative Pan with .panBy(xd, yd)

This function will move the stage root by relative amounts, triggering the 'pan' event handler if defined.

### Example: Panning with the mouse

````javascript

  myStage.on('mousedown_right', function(m) {
    myStage.root.dragStart();
  });

  myStage.on('mousemove', function(m) {          
    if(m.rightButton) {
      if(Math.abs(m.xd) > 3 || Math.abs(m.yd) > 3) {
        myStage.panBy(m.xd, m.yd);
      }
      return;
    }    
  });

````

## Absolute Pan with .panTo(x, y)

This function will move the stage root to position `x:y`, triggering the 'pan' event handler if defined.

## Animating Stuff with .animate(function(dt) { ... })

To create an animation that gets executed on each frame, invoke `.animate(function(dt) { ... })` on your stage object. On each frame, this function will be called with the `dt` reflecting how much time has passed since the last animation frame (in seconds). The animation will run as long as the function does not return `false`. 

### Example: moving an object across the screen

````javascript

  var myObject = CreateMyObject(...);

  myStage.animate(function(deltaTime) {  
    // move at 1000 pixels per second:
    myObject.x = myObject.x + deltaTime*1000; 
    // run until myObject arrives at position 500
    return(myObject.x < 500);  
  });

````

## Executing Stuff on the Next Frame with .once(function() { ... })

This works like the `.animate(f)` function, but the function will only be executed once during the next frame.








