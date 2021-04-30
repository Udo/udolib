<?php

header('Content-Type: text/html; charset=utf-8');

include('ulib.php');

?><html>

<style>

div {
	color: green;
}

h1, h2 {
	margin: 0;
	margin-top: 16px;
}

pre {
	color: #f0f;
	margin-left: 16px;
}

</style>

	<h1>ulib Demos</h1>

<?php

?><h2>age_to_string(time()-1234)</h2>
<div>Get relative human-readable age</div>
<pre><?
print( age_to_string(time()-1234) );
?></pre><?

?><h2>capitalize('hello there.')</h2>
<div>Capitalize a word</div>
<pre><?
print( capitalize('hello there.') );
?></pre><?

?><h2>element('example-element', $arg1...)</h2>
<div>Include a template element and pass along arguments</div>
<pre><?
element('example-element', 'Hello World');
?></pre><?

?><h2>ends_with('hello world', 'world')</h2>
<div>Determines if string ends with</div>
<pre><?
print( json_encode(ends_with('hello world', 'world')) );
?></pre><?

?><h2>starts_with('hello world', 'world')</h2>
<div>Determines if string starts with</div>
<pre><?
print( json_encode(starts_with('hello world', 'world')) );
?></pre><?

?><h2>first($arg1...)</h2>
<div>Returns the first non-empty argument</div>
<pre><?
print( @first($_REQUEST['test'], 'default value') );
?></pre><?

?><h2>match($array, array('family' => 'Doe'))</h2>
<div>Looks for pattern in $array</div>
<pre><?
$person = array('name' => 'Jon', 'family' => 'Doe', 'age' => '21');
print( json_encode(match($person, array('family' => 'Doe'))) );
?></pre><?

?><h2>nibble('=', 'answer=42')</h2>
<div>Nibbles the part of the string that comes before the separator, shortening the string</div>
<pre><?
$myString = 'answer=42'; print( nibble('=', $myString).chr(10) );
?></pre><?

?><h2>parse_request_uri()</h2>
<div>Parses the server's request URI</div>
<pre><?
print_r( parse_request_uri() );
?></pre><?

?>
	<h1>DB-FILE Demos</h1>
<?

include('db-file.php');

?><h2>make_hash('test')</h2>
<div>Make a simple short hash</div>
<pre><?
print( make_hash('test') );
?></pre><?

?><h2>make_bucket_path('hello.world')</h2>
<div>Translate a path into a file-system-friendly storage path</div>
<pre><?
print_r( make_bucket_path('hello.world') );
?></pre><?

?><h2>get_data_filename('world', 'hello', 'goodmorning', '.json')</h2>
<div>Get the actual file name for the $class, $bucket, $item_name scheme</div>
<pre><?
print_r( get_data_filename('world', 'hello', 'goodmorning') );
?></pre><?

?><h2>get_data_path('world', 'hello')</h2>
<div>Get the storage path for the $class, $bucket scheme</div>
<pre><?
print_r( get_data_path('world', 'hello') );
?></pre><?

?><h2>write_file($file_name, $content)</h2>
<div>Write content to file using exclusive lock</div>
<pre><?
?></pre><?

?><h2>write_data($class, $bucket, $item_name, $data)</h2>
<div>Serialize data to file</div>
<pre><?
?></pre><?

?><h2>read_data($class, $bucket, $item_name)</h2>
<div>Read serialized data</div>
<pre><?
?></pre><?

?><h2>delete_data($class, $bucket, $item_name)</h2>
<div>Delete serialized data</div>
<pre><?
?></pre><?

?><h2>list_bucket($class, $bucket)</h2>
<div>List contents of bucket</div>
<pre><?
?></pre><?

?><h2>search_bucket($class, $bucket, $q)</h2>
<div>Fulltext search in bucket</div>
<pre><?
?></pre><?

?><h2>delete_bucket($class, $bucket)</h2>
<div>Delete entire bucket</div>
<pre><?
?></pre><?

?><h2>write_log($class, $bucket, $item_name, $data)</h2>
<div>Append to log in bucket</div>
<pre><?
?></pre><?

?><h2>read_log($class, $bucket, $item_name, $line_count = 8, $offset = false)</h2>
<div>Read from log in bucket</div>
<pre><?
?></pre><?

?><h2>read_log_complete($class, $bucket, $item_name)</h2>
<div>Read entire log file from bucket (memory caution!)</div>
<pre><?
?></pre><?

?><h2>search_log($class, $bucket, $item_name, $q, $max_lines = false)</h2>
<div>Fulltext search in log for matching lines</div>
<pre><?
?></pre><?

?><h2>line_count($class, $bucket, $item_name)</h2>
<div>Return size of log in bucket</div>
<pre><?
?></pre><?


?></html>
