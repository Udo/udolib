# ulib PHP

## What is it?

ulib is a small single-file library of convenience functions
without any external dependencies.

Feel free to contact me at udo.schroeter@gmail.com for
questions and comments.

## Why use it?

This is intended to be a small piece of living code to
make your life easier, it's not some big monolithic library.
Feel free to change things, add identifier prefixes, or 
implement namespacing as you see fit. Out of the box, ulib
comes with none of these assumptions and you should be
able to just include and start using it.

## License

ulib is released into the public domain.

# ulib Functions

## ageToString($unixDate, $new = 'just now', $ago = 'ago')

Takes a Unix timestamp and converts it to a human-friendly
date. If the timestamp points to a recent time, this function
will return a relative result, such as "4 min ago".

```PHP
print( ageToString(time()-1234) );
```

Output:
```
21 min ago
```

## capitalize($name)

Capitalizes the first letter of the given string.


```PHP
print( capitalize('hello there.') );
```

Output:

```
Hello there.
```

## element($name, ...)

A way to do simple templates with building blocks in your app. `element()` will look up a file
called `$name.'.php'` and execute it. That file must return a function. This function will
then be called every time element() is invoked with that same name. Additional parameters
to the `element()` call will be passed along to that function.

A very simple element file might look like this:
```
<?php return(function($title) {
  ?><h2><?= $title ?></h2><?
});
```

Here's how the element is being used:


```PHP
element('example-element', 'Hello World');
```

Output:

```
<h2>Hello World</h2>
```

### elementDir

If `$GLOBALS['elementDir']` is set, `element()` will use it as a prefix to locate the
element file.

### elementLoader

If `$GLOBALS['elementLoader']` is set to a function, `element()` will use it 
to load the element function instead of simply including it from a file. `$GLOBALS['elementLoader']`
must be a function with the signature `function($name) {}` and it must
return a function.

## endsWith($s, $match)

Checks whether the string `$s` ends with `$match`.

```PHP
print( endsWith('hello world', 'world') );
```

Output:

```
1
```

## first(...)

Returns the first of its arguments that is not
null, false, or an empty string. You can use this
with the @ prefix to silence notices about uninitialized
variables.

```PHP
print( @first($_REQUEST['test'], 'default value') );
```

Output:

```
default value
```

## map($list, $func)

Iterates through $list and calls `$func($item, $key)` on every
single item. If $func returns a non-null value, that value will
be appended to a new list. This new list is then returned by `map()`.

If $list is null, the result will be an empty list. If $list is
not an array, it will be converted into an array with one element.

```PHP
$list = array(1, 2, 3, 4, 5);
# put even entries in new list
print_r( map($list, function($item) {
  if($item % 2 == 0) return($item);
  }) );
```

Output:

```
Array
(
    [0] => 2
    [1] => 4
)
```

## match($subject, $criteria)

Returns `true` if $subject matches all the fields of $criteria.

```PHP
$person = array('name' => 'Jon', 'family' => 'Doe', 'age' => '21');
print( match($person, array('family' => 'Doe')) );
```

Output:

```
1
```

## nibble($delim, &$cake, &$found = false)

Returns $cake up to (but not including) $delim.
$cake gets shortened to everything following after $delim.
If $cake does not contain $delim, `nibble()` will
return the entirety of $cake, and the $cake
variable will be an empty string.

```PHP
$myString = 'answer=42';
print( nibble('=', $myString).chr(10) );
print( 'equals '.$myString );
```

Output:

```
answer
equals 42
```

## parseRequestURI($uri = $_SERVER['REQUEST_URI'])

This is a convenience replacement for the built-in `parse_url()` function.
parseRequestURI() returns a record of URL components it finds in $uri.

The key difference to the built-in function is its handling of 
the request path, which is optimized to work with "pretty" URL
rules commonly used on Apache or NginX (compatible with Wordpress URLs).

parseRequestURI() also allows for "pretty" URLs where URL rewriting
is not an option. In these cases, you can revert to a scheme where
the path is appended after a ? symbol, like this:

`/index.php?/some/path?bla=1`

When parseRequestURI() detects such a path, it will put it
in the field `path2`, allowing you to make the decision on
how to deal with it in your app.

```PHP
print_r( parseRequestURI() );
```

Output:

```
Array
(
    [path] => dev/udolib/util-ulib-php/example-demo.php
    [query] => Array
        (
        )

    [path2] => bla
)
```

## reduce($list, $func)

Iterates through all the items in $list and calls
`$func($total, $item)` on every item, where $total
is the value of the reduce process so far (starting with null)
and $item is the current item. 

If $func returns a non-null value, that value will
become the new $total on the next call. At the end,
$total is returned by `reduce()`.

```PHP
$list = array(1, 2, 3, 4, 5);
# sum of all even entries
print( reduce($list, function($total, $item) {
  if($item % 2 == 0) return($total+$item);
  }) );
```

Output:


```
6
```

## startsWith($s, $match)

Checks whether the string `$s` starts with `$match`.

```PHP
print( startsWith('hello world', 'hello') );
```

Output:
```
1
```

## truncate($s, $maxLength, $indicator = '')

Returns $s. If $s is longer than $maxLength, it
will be shortened. In case shortening occurrs,
you can specify an $indicator that gets appended
to the result.

```PHP
print( truncate('hello world', 5, '…') );
```

Output:
```
hello…
```

## writeToFile($fileName, $content)

```PHP

```

Output:
```

```

