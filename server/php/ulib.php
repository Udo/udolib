<?php

# **************************** GENERAL UTILITY FUNCTIONS ******************************

# if $def1 is empty, use $def2
function first()
{
	$args = func_get_args();
	foreach($args as $v)
	{
		if(isset($v) && $v !== false && $v !== '' && $v !== null)
			return($v);
	}
}

# append any string to the given file
function write_to_file($filename, $content)
{
	if (is_array($content)) $content = json_encode($content);
	$open = fopen($filename, 'a+');
	fwrite($open, $content);
	fclose($open);
	@chmod($filename, 0777);
}

# **************************** ARRAY FUNCTIONS ******************************

function map($list, $func)
{
	$result = array();
	if($list !== null && $list !== false)
	{
		if(!is_array($list)) $list = array($list);
		foreach($list as $key => $item)
		{
			$v = $func($item, $key);
			if($v !== null)
				$result[] = $v;
		}
	}
	return($result);
}

function reduce($list, $func)
{
	$result = null;
	if($list !== null && $list !== false)
	{
		if(!is_array($list)) $list = array($list);
		foreach($list as $key => $item)
		{
			$v = $func($result, $item, $key);
			if($v !== null)
				$result = $v;
		}
	}
	return($result);
}

function cfg($key)
{
	$config = $GLOBALS['config'];
	$seg = explode('/', $key);
	$lastSeg = array_pop($seg);
	foreach($seg as $s)
	{
		if(is_array($config[$s]))
			$config = $config[$s];
		else
			$config = array();
	}
	return($config[$lastSeg]);
}


# **************************** STRING/FORMATTING FUNCTIONS ******************************

function strings_to_array($stringArray, $params = array())
{
	$result = array();
	if (is_array($stringArray))
		foreach ($stringArray as $line)
		{
			$key = CutSegment('=', $line);
			$line = trim($line);
			if(substr($key, -1) == '+')
			{
				// add this to array by key
				$key = substr($key, 0, -1);
				$result[$key][] = $line;
			}
			else if(substr($line, 0, 1) == '[' && substr($line, -1) == ']')
			{
				foreach(explode(',', substr($line, 1, -1)) as $seg)
					$result[$key][] = $seg;
			}
			else if ($key != '') $result[$key] = $line;
		}
	return($result);
}

function text_to_array($text, $params = array())
{
	$list = explode("\n", $text);
	return(strings_to_array($list, $params));
}

function stringlistToText($stringlist)
{
	$list = array_to_strings($stringlist);
	return(implode("\n", $list));
}

function base_convert_any($numberInput, $fromBaseInput, $toBaseInput)
{
	if ($fromBaseInput==$toBaseInput) return $numberInput;
	$fromBase = str_split($fromBaseInput,1);
	$toBase = str_split($toBaseInput,1);
	$number = str_split($numberInput,1);
	$fromLen=strlen($fromBaseInput);
	$toLen=strlen($toBaseInput);
	$numberLen=strlen($numberInput);
	$retval='';
	if ($toBaseInput == '0123456789')
	{
			$retval=0;
			for ($i = 1;$i <= $numberLen; $i++)
					$retval = bcadd($retval, bcmul(array_search($number[$i-1], $fromBase),bcpow($fromLen,$numberLen-$i)));
			return $retval;
	}
	if ($fromBaseInput != '0123456789')
			$base10=base_convert_any($numberInput, $fromBaseInput, '0123456789');
	else
			$base10 = $numberInput;
	if ($base10<strlen($toBaseInput))
			return $toBase[$base10];
	while($base10 != '0')
	{
			$retval = $toBase[bcmod($base10,$toLen)].$retval;
			$base10 = bcdiv($base10,$toLen,0);
	}
	return $retval;
}

function age_to_string($unixDate, $new = 'just now', $ago = 'ago')
{
	if($unixDate == 0) return('-');
	$result = '';
	$oneMinute = 60;
	$oneHour = $oneMinute*60;
	$oneDay = $oneHour*24;

	$difference = time() - $unixDate;

	if ($difference < $oneMinute)
		$result = $new;
	else if ($difference < $oneHour)
		$result = round($difference/$oneMinute).' min '.$ago;
	else if ($difference < $oneDay)
		$result = floor($difference/$oneHour).' h '.$ago;
	else if ($difference < $oneDay*5)
		$result = gmdate('D H:i', $unixDate);
	else if ($difference < $oneDay*365)
		$result = gmdate('M dS H:i', $unixDate);
	else
		$result = date('d. M Y H:i', $unixDate);
	return($result);
}

function capitalize($name)
{
	return(strtoupper(substr($name, 0, 1)).substr($name, 1));
}

function nibble($segdiv, &$cake, &$found = false)
{
	$p = strpos($cake, $segdiv);
	if ($p === false)
	{
		$result = $cake;
		$cake = '';
		$found = false;
	}
	else
	{
		$result = substr($cake, 0, $p);
		$cake = substr($cake, $p + strlen($segdiv));
		$found = true;
	}
	return $result;
}

function starts_with($s, $match)
{
	return(substr($s, 0, strlen($match)) == $match);
}

function ends_with($s, $match)
{
	return(substr($s, -strlen($match)) == $match);
}

function truncate($s, $maxLength, $indicator = '')
{
	if(strlen($s) <= $maxLength)
		return($s);
	else
		return(substr($s, 0, $maxLength).$indicator);
}

function match_with($subject, $criteria)
{
	$result = true;
	foreach($criteria as $k => $v)
	{
		if($subject[$k] != $v) $result = false;
	}
	return($result);
}

function parse_request_uri($uri = false)
{
	$result = parse_url(@first($uri, $_SERVER['REQUEST_URI']));

	if(isset($result['query']))
	{
		if(strpos($result['query'], '?') !== false || strpos($result['query'], '&') === false)
		{
			$result['path2'] = nibble('?', $result['query']);
		}
		parse_str($result['query'], $http_query);
		$_SERVER['QUERY_STRING'] = $result['query'];
		if(is_array($http_query))
			foreach($http_query as $k => $v) $_REQUEST[$k] = $v;
		$result['query'] = $http_query;
	}

	foreach(array('path', 'path2') as $p)
		while(@substr($result[$p], 0, 1) == '/' || @substr($result[$p], 0, 1) == '.')
			$result[$p] = substr($result[$p], 1);

	return($result);
}

function element($name)
{
	$args = func_get_args();
	$name = array_shift($args);
	if(!isset($GLOBALS['elementCache'][$name]))
	{
		if(isset($GLOBALS['elementLocator']))
			$GLOBALS['elementCache'][$name] = $GLOBALS['elementLoader']($name);
		else
			$GLOBALS['elementCache'][$name] = require(@first($GLOBALS['elementDir'], '').$name.'.php');
	}
	return(call_user_func_array($GLOBALS['elementCache'][$name], $args));
}













