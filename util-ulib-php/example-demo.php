<?php
  
header('Content-Type: text/html; charset=utf-8');
  
include('ulib.php');

?><html>

  <h1>ulib Demos</h1> 
  
<?php
  
$demos = array();

$demos['first'] = array(
  'code' => 'print( @first($_REQUEST[\'test\'], \'default value\') );',
  );

$demos['ageToString'] = array(
  'code' => 'print( ageToString(time()-1234) );',
  );

$demos['capitalize'] = array(
  'code' => 'print( capitalize(\'hello there.\') );',
  );

$demos['nibble'] = array(
  'code' => '$myString = \'answer=42\';
print( nibble(\'=\', $myString).chr(10) );
print( \'equals \'.$myString );',
  );

$demos['map'] = array(
  'code' => '$list = array(1, 2, 3, 4, 5);
# put even entries in new list
print_r( map($list, function($item) {
  if($item % 2 == 0) return($item);
  }) );',
  );

$demos['reduce'] = array(
  'code' => '$list = array(1, 2, 3, 4, 5);
# sum of all even entries
print( reduce($list, function($total, $item) {
  if($item % 2 == 0) return($total+$item);
  }) );',
  );

$demos['startsWith'] = array(
  'code' => 'print( startsWith(\'hello world\', \'hello\') );'
  );

$demos['endsWith'] = array(
  'code' => 'print( endsWith(\'hello world\', \'world\') );'
  );

$demos['truncate'] = array(
  'code' => 'print( truncate(\'hello world\', 5, \'…\') );'
  );

$demos['match'] = array(
  'code' => '$person = array(\'name\' => \'Jon\', \'family\' => \'Doe\', \'age\' => \'21\');
print( match($person, array(\'family\' => \'Doe\')) );'
  );

$demos['parseRequestURI'] = array(
  'code' => 'print_r( parseRequestURI() );'
  );

$demos['element'] = array(
  'code' => 'element(\'example-element\', \'Hello World\');'
  );

ksort($demos);

foreach($demos as $fName => $demo)
{
  ?><p>
    <h3><?= $fName ?>()</h3>
    <pre><?= htmlspecialchars(trim($demo['code'])) ?></pre>
    Output:
    <pre><? 
      ob_start();
      eval($demo['code']);
      print(htmlspecialchars(ob_get_clean()));
    ?></pre>
  </p><?
}


?></html>