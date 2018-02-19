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

### keys(o)

(↳ array) Returns an array containing the property keys of the object `o`.

### lerp(a, b, t)

(↳ number) Lerps between the values `a` and `b`, where `t` is the distance between them on a scale of 0 to 1.0.

### map(obj, f)

(↳ new list or object) Executes `f` with the signature `function(value, index) {...}` on every item within `obj`. `obj` can be an array or an object. If the call to `f` on an item did not return `false`, the return value gets added to the result of map().

### merge(destination, source)

Merges the properties of the `source` object into the `destination` object.

### selectRandom(list)

(↳ list item) Selects one of the items within the supplied `list` randomly and returns it.

### values(o)

(↳ array) Returns an array containing the property values of the object `o`.

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

# Smooth Easing Functions

`u-smooth.js` contains the `Smooth` namespace providing a couple of helper functions dealing with interpolative easing.

All easing functions have the signature `f(t)` where `t` is a value between 0 and 1.

The following smoothing functions are built in: linear, start, start^3, start^4, stop, stop^3, stop^4, start_stop, start_stop^3, start_stop^4, sin_start, sin_stop, sin_start_stop, sin_peak, pin_wave_peak, sin, arch_peak, bounce_start, bounce_stop, bounce, undershoot_start, overshoot_stop, under_overshoot

In addition, any smoothing functions can be composited using the `Smooth.compose` helper functions:

`Smooth.compose.mix(f1, f2)` blends the output of two easing functions.

`Smooth.compose.crossfade(f1, f2)` crossfades the output of two easing functions.

`Smooth.compose.reverse(f1)` mirrors the function `f1` along both X and Y axes.

`Smooth.compose.chain(f1, f2)` chains together `f1` and `f2` so that the output of `f1` is used from 0 to 0.5, and `f2` is used from 0.5 to 1.0.

![Smoothing functions](https://github.com/Udo/udolib/blob/master/u-js-helper/img/smooth-01.png?raw=true "Smoothing functions")

![Smoothing functions](https://github.com/Udo/udolib/blob/master/u-js-helper/img/smooth-02.png?raw=true "Smoothing functions")
