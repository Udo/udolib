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



```PHP
print( capitalize('hello there.') );
```

Output:

```
Hello there.
```

## element($name, ...)

```PHP
element('example-element', 'Hello World');
```

Output:

```
<h2>Hello World</h2>
```

## endsWith($s, $match)

```PHP
print( endsWith('hello world', 'world') );
```

Output:

```
1
```

## first(...)

```PHP
print( @first($_REQUEST['test'], 'default value') );
```

Output:

```
default value
```

## map($list, $func)

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


```PHP
$person = array('name' => 'Jon', 'family' => 'Doe', 'age' => '21');
print( match($person, array('family' => 'Doe')) );
```

Output:

```
1
```

## nibble($delim, $cake)

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

```PHP
print( startsWith('hello world', 'hello') );
```

Output:
```
1
```

## truncate($s, $maxLength, $indicator = '')

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

