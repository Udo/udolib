<?php

define('STORAGE_DIR', 'data/');

/* SIMPLE UNIX-STYLE FILE STORAGE LAYER
 *
 * PREREQUISITES:
 * shell_exec() Linux/Unix with access to
 * - tail, grep, ls, rm, cd
 *
 * The general layout is
 * storage_function($class,			$bucket,		$item_name)
 * 					   ^			   ^			   1
 * STORAGE_DIR	.	ITEM_CLASS	.	BUCKET_PATH	.	ITEM_NAME	.	'.json'/'.log'
 */

# convert a number into another base
function base_convert_ex($numberInput, $fromBaseInput, $toBaseInput)
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
		$base10=base_convert_ex($numberInput, $fromBaseInput, '0123456789');
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

# creates a short hash from $s
function make_hash($s, $digits = 10)
{
	$s = strtolower(substr(trim($s), 0, 64));
	return(substr(base_convert_ex(
		sha1(sha1('qw0e983124o521öl34u9087'.$s)),
		'0123456789abcdef',
		'0123456789abcdefghijklmnopqrstuvwxyz'
	), -$digits));
}

# makes a filesystem-optimized bucket path
function make_bucket_path($p, $digits = 2)
{
	if(stristr($p, '/') !== false)
	{
		$seg = explode('/', $p);
		$p = array_shift($seg);
		return(substr($p, -$digits).'/'.$p.'/'.implode('/', $seg));
	}
	return(substr($p, -$digits).'/'.$p);
}

# translate storage scheme into file name $class/et/$bucket/$item_name.json
function get_data_filename($class, $bucket, $item_name, $ext = 'json')
{
	return(STORAGE_DIR.$class.'/'.make_bucket_path($bucket).'/'.$item_name.'.'.$ext);
}

# translate storage scheme into file name $class/et/$bucket/
function get_data_path($class, $bucket)
{
	return(STORAGE_DIR.$class.'/'.make_bucket_path($bucket).'/');
}

# write a file using an exclusive lock
function write_file($file_name, $content)
{
	return(file_put_contents($file_name, $content, LOCK_EX));
}

# write $data into $class/et/$bucket/$item_name.json
function write_data($class, $bucket, $item_name, $data)
{
	$storage_path = get_data_path($class, $bucket);
	if(!file_exists($storage_path)) @mkdir($storage_path, 0774, true);
	write_file(get_data_filename($class, $bucket, $item_name), json_encode($data));
}

# read data from $class/et/$bucket/$item_name.json
function read_data($class, $bucket, $item_name)
{
	return(json_decode(file_get_contents(get_data_filename($class, $bucket, $item_name)), true));
}

# delete data in $class/et/$bucket/$item_name.json
function delete_data($class, $bucket, $item_name)
{
	return(@unlink(get_data_filename($class, $bucket, $item_name)));
}

function list_bucket($class, $bucket)
{
	return(explode(chr(10), trim(shell_exec('ls -1 '.escapeshellarg(get_data_path($class, $bucket))))));
}

function search_bucket($class, $bucket, $q)
{
	$storage_path = get_data_path($class, $bucket);
	foreach(explode(chr(10), trim(shell_exec('grep -irlF '.escapeshellarg($q).' '.escapeshellarg($storage_path)))) as $l)
	{
		$name = substr($l, strlen($storage_path)+1, -5);
		$items[] = $name;
	}
	return($items);
}

function delete_bucket($class, $bucket)
{
	$storage_path = get_data_path($class, $bucket);
	if(stristr($storage_path, '*') !== false) return;
	if(stristr($storage_path, '?') !== false) return;
	$result = trim(shell_exec('rm -r '.escapeshellarg($storage_path).' 2>&1'));
	return($result);
}

function list_storage($class, $bucket, $crit = false)
{
	$storage_path = get_data_path($class, $bucket);
	$result = array();
	if($crit)
		$crit_arg = '-iname '.escapeshellarg($crit);
	foreach(explode(chr(10), trim(shell_exec('cd '.escapeshellarg($storage_path).' && find . '.$crit_arg))) as $item)
	{
		nibble('/', $item);
		$file = $storage_path.'/'.$item;
		if(is_file($file))
		{
			if(stristr($item, '/') !== false)
			{
				$dir_parts = explode('/', $item);
				$item = array_pop($dir_parts);
				$sbucket = '/'.implode('/', $dir_parts);
			}
			else
			{
				$sbucket = '';
			}
			$format = 'none';
			if(substr($item, -4, 1) == '.')
			{
				$format = substr($item, -3);
				$item = substr($item, 0, -4);
			}
			$result[] = array(
				'bucket' => $bucket.$sbucket,
				'item' => $item,
				'format' => $format,
				'file' => $file,
			);
		}
	}
	return($result);
}

function write_log($class, $bucket, $item_name, $data)
{
	$storage_path = get_data_path($class, $bucket);
	if(!file_exists($storage_path)) @mkdir($storage_path, 0774, true);
	WriteToFile(get_data_filename($class, $bucket, $item_name, 'log'), json_encode($data).chr(10));
}

function read_log($class, $bucket, $item_name, $line_count = 8, $offset = false)
{
	return(get_json_tail(get_data_filename($class, $bucket, $item_name, 'log'), $line_count, $offset));
}

function read_log_complete($class, $bucket, $item_name)
{
	return(json_lines(file_get_contents(get_data_filename($class, $bucket, $item_name, 'log'))));
}

function search_log($class, $bucket, $item_name, $q, $max_lines = false)
{
	$storage_path = get_data_filename($class, $bucket, $item_name, 'log');
	$filter = '';
	if($max_lines > 0)
		$filter .= ' | tail -n '.$max_lines.' ';
	return(json_lines(trim(shell_exec('grep -Fhi '.escapeshellarg($q).' '.escapeshellarg($storage_path).$filter))));
}

function line_count($class, $bucket, $item_name)
{
	return(1*trim(shell_exec('wc -l '.escapeshellarg(get_data_filename($class, $bucket, $item_name, 'log')))));
}

function get_json_tail($from_file, $line_count = 8, $offset = false)
{
	if($offset >  0)
	{
		$lines = trim(shell_exec(
			'tail -n '.escapeshellarg($offset+$line_count).' '.escapeshellarg($from_file).' | head -n '.escapeshellarg($line_count)));
	}
	else
	{
		$lines = trim(shell_exec(
			'tail -n '.escapeshellarg($line_count).' '.escapeshellarg($from_file)));
	}
	return(json_lines($lines));
}

function get_tail($from_file, $line_count = 8, $offset = false)
{
	if($offset >  0)
	{
		$lines = trim(shell_exec(
			'tail -n '.escapeshellarg($offset+$line_count).' '.escapeshellarg($from_file).' | head -n '.escapeshellarg($line_count)));
	}
	else
	{
		$lines = trim(shell_exec(
			'tail -n '.escapeshellarg($line_count).' '.escapeshellarg($from_file)));
	}
	return(explode(chr(10), $lines));
}

function json_lines($lines)
{
	if($lines == '')
	{
		return(array());
	}
	else
	{
		$result = array();
		foreach(explode(chr(10), $lines) as $line)
			$result[] = json_decode($line, true);
		return($result);
	}
}
