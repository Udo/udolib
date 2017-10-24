# Udolib Helper Functions

## General Utility

### first([arguments...])

(↳ any) Returns the first item from the argument list that does not evaluate to false or "" (empty string).

### clamp(value, min, max)

(↳ number) Returns `value`, clamped between `min` and `max`.

### dist(x1, y1, x2, y2)

(↳ number) Returns the distance between two points.

### each(obj, f)

Executes `f` with the signature `function(value, index) {...}` on every item within `obj`. `obj` can be an array or an object.

### lerp(a, b, t)

(↳ number) Lerps between the values `a` and `b`, where `t` is the distance between them on a scale of 0 to 1.0.

### map(obj, f)

(↳ new list or object) Executes `f` with the signature `function(value, index) {...}` on every item within `obj`. `obj` can be an array or an object. If the call to `f` on an item did not return `false`, the return value gets added to the result of map().

### merge(destination, source)

Merges the properties of the `source` object into the `destination` object.

### selectRandom(list)

(↳ list item) Selects one of the items within the supplied `list` randomly and returns it.

## Colors and Graphics

### bresenham_line(x0, y0, x1, y1, [f])

(↳ array of points [x, y]) This draws a line using the Bresenham line algorithm and returns the resulting points as an array. Alternatively, you can supply the callback function `f` with the signature `function(x, y) {...}` which will be called on every point of the line. 

### frgb(r, g, b)

(↳ number) Takes in the red, green, and blue components as 0-1.0 values and returns the resulting 24-bit color value.

### frgba(r, g, b, a)

(↳ number) Takes in the red, green, blue, and alpha components as 0-1.0 values and returns the resulting 32-bit color value.

### rgb(r, g, b)

(↳ number) Takes in the red, green, and blue components as byte values and returns the resulting 24-bit color value.

### rgba(r, g, b, a)

(↳ number) Takes in the red, green, blue, and alpha components as byte values and returns the resulting 32-bit color value.

