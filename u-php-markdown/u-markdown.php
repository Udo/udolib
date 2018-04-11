<?php
  
define('U_MD_MODE_TEXT', 0);
define('U_MD_MODE_CODE_INDENTED', 1);
define('U_MD_MODE_CODE_QUOTED', 2);
define('U_MD_MODE_HTML', 3);
  
function u_md_contains_only($needle, $haystack)
{
  $haystack = trim($haystack);
  $len = strlen($haystack);
  for($i = 0; $i < $len; $i++)
  {
    if(substr($haystack, $i, 1) != $needle)
      return(false);
  }
  return(true);
}

function u_md_bracket_stats($haystack)
{
  $bs = 0;
  $len = strlen($haystack);
  for($i = 0; $i < $len; $i++)
  {
    $c = substr($haystack, $i, 1);
    if($c == '<')
      $bs += 1;
    else if($c == '>')
      $bs -= 1;
  }
  return($bs);
}
  
function u_md_indent_count($line)
{
  $result = 0;
  $len = strlen($line);
  for($i = 0; $i < $len; $i++)
  {
    $c = substr($line, $i, 1);
    if(ctype_space($c))
      $result += 1;
    else
      return($result);
  }
  return($result);
}

function u_md_indent_level($type, $line, &$flags)
{
  if($flags['last_type'] != $type)
  {
    $flags['indent'] = 0;
    $flags['indent_chars'] = 0;
  }
  $indent = u_md_indent_count($line);
  if($indent > $flags['indent_chars'])
    $flags['indent'] += 1;
  else if($indent < $flags['indent_chars'])
    $flags['indent'] -= 1;
  $flags['indent_chars'] = $indent;
  if($flags['indent'] <= 0)
    $flags['indent'] = 1;
}
  
function u_md_parse_line($line, $previousLine, $nextLine, &$mode, &$idx, &$flags)
{
  $nextLineFirstChar = substr(trim($nextLine), 0, 1);
  $lineFirstChar = substr(trim($line), 0, 1);
  $lineSecondChar = substr(trim($line), 1, 1);
  $lineThirdChar = substr(trim($line), 2, 1);
  $lineIndentCount = u_md_indent_count($line);
  switch($mode)
  {
    case(U_MD_MODE_TEXT):
    {
      if($lineFirstChar == '*' && ctype_space($lineSecondChar) && $lineThirdChar != '*')
      {
        u_md_indent_level('ul', $line, $flags);
        return(array( 't' => 'ul', 'lvl' => $flags['indent'], 's' => trim(substr(trim($line), 1)) ));
      }
      if(ctype_digit($lineFirstChar) && $lineSecondChar == '.' && ctype_space($lineThirdChar))
      {
        u_md_indent_level('ol', $line, $flags);
        return(array( 't' => 'ol', 'lvl' => $flags['indent'], 's' => trim(substr(trim($line), 2)) ));
      }
      if($nextLineFirstChar == '=' && u_md_contains_only('=', $nextLine))
      {
        $idx++;
        return(array( 't' => 'header', 'lvl' => 1, 's' => $line ));
      }
      if($nextLineFirstChar == '-' && u_md_contains_only('-', $nextLine))
      {
        $idx++;
        return(array( 't' => 'header', 'lvl' => 2, 's' => $line ));
      }
      if(trim($line) == '')
        return(array( 't' => 'blank' ));
      if($lineIndentCount > 0 && $flags['last_type'] != 'html')
      {
        $mode = U_MD_MODE_CODE_INDENTED;
        return(u_md_parse_line($line, $previousLine, $nextLine, $mode, $idx, $flags));
      }
      if($lineFirstChar == '<' && !$flags['disallow_html'])
      {
        $flags['open_brackets'] = 0;
        $mode = U_MD_MODE_HTML;
        return(u_md_parse_line($line, $previousLine, $nextLine, $mode, $idx, $flags));
      }
      return(array( 't' => 'text', 's' => $line ));
    } break;
    case(U_MD_MODE_CODE_INDENTED):
    {
      if($lineIndentCount == 0)
      {
        $mode = U_MD_MODE_TEXT;
        return(u_md_parse_line($line, $previousLine, $nextLine, $mode, $idx, $flags));
      }
      # todo: technically, we need to decrease the number of spaces on the left side by the current indent_chars count
      return(array( 't' => 'code', 's' => $line ));
    } break;
    case(U_MD_MODE_HTML):
    {
      $flags['open_brackets'] += u_md_bracket_stats($line);
      if($flags['open_brackets'] == 0)
        $mode = U_MD_MODE_TEXT;
      return(array( 't' => 'html', 's' => $line ));
    } break;
    default:
    {
      return(array('t' => 'error', 's' => 'unknown mode', 'm' => $mode));
    } break;
  }
}

function u_md_parse_to_tree(&$list, $type = false)
{
  $result = array();
  $prevItem = false;
  while(sizeof($list) > 0)
  {
    $current = array_shift($list);
    
    if($current['t'] == $type)
    {
      if($prevItem && $current['lvl'] > $prevItem['lvl'])
      {
        array_unshift($list, $current);
        $result[] = array('t' => 'list', 'lt' => $current['t'], 'items' => u_md_parse_to_tree($list, $current['t']));
        $current = false;
      }
      else if($prevItem && $current['lvl'] < $prevItem['lvl'])
      {
        array_unshift($list, $current);
        return($result);
      }
      else
      {
        $current['t'] = 'li';
        $result[] = $current;
      }
    }
    else if($type !== false && $current['t'] != $type)
    {
      array_unshift($list, $current);
      return($result);      
    }
    else if($current['t'] == 'ul' || $current['t'] == 'ol')
    {
      array_unshift($list, $current);
      $result[] = array('t' => 'list', 'lt' => $current['t'], 'items' => u_md_parse_to_tree($list, $current['t']));
      $current = false;
    }
    else
    {
      $result[] = $current;
    }
    
    if($current)
      $prevItem = $current;
  }
  return($result);
}
  
function u_md_parse($text, $flags = array())
{
  $result = array();
  $items = array();
  $flags['result'] = &$result;
  $flags['indent'] = 0;
  $flags['indent_chars'] = 0;
  $lines = explode(chr(10), $text);
  $lineCount = sizeof($lines);
  $mode = U_MD_MODE_TEXT;
  for($idx = 0; $idx < $lineCount; $idx++)
  {
    $pl = u_md_parse_line($lines[$idx], $lines[$idx-1], $lines[$idx+1], $mode, $idx, $flags);
    if($pl)
    {
      $flags['last_type'] = $pl['t'];
      $result[] = $pl;
    }
  }
  $collapse = array('blank', 'html', 'code', 'text');
  $prevItem = false;
  $prevItem2 = false;
  foreach($result as $item)
  {
    if($item['t'] == 'code' && $prevItem['t'] == 'blank' && $prevItem2['t'] == 'code')
    {
      array_pop($items);
      $items[sizeof($items)-1]['s'] .= chr(10).chr(10).$item['s'];
    }
    else if(array_search($item['t'], $collapse) !== false && $prevItem['t'] == $item['t'])
    {
      $items[sizeof($items)-1]['s'] .= chr(10).$item['s'];
    }
    else
    {
      $items[] = $item;
    }
    $prevItem2 = $prevItem;
    $prevItem = $item;
  }
  return(u_md_parse_to_tree($items, false));
}

function u_md_render($items)
{
  ob_start();
  foreach($items as $item)
  {
    switch($item['t'])
    {
      case('li'):
      {
        print('<li>'.($item['s']).'</li>');
      } break;
      case('list'):
      {
        print('<'.$item['lt'].'>'.u_md_render($item['items']).'</'.$item['lt'].'>');
      } break;
      case('html'):
      {
        print($item['s']);
      } break;
      case('text'):
      {
        print('<p>'.htmlspecialchars($item['s']).'</p>');
      } break;
      case('blank'):
      {
        
      } break;
      case('code'):
      {
        print('<pre>'.htmlspecialchars($item['s']).'</pre>');
      } break;
      case('header'):
      {
        print('<h'.$item['lvl'].'>'.htmlspecialchars($item['s']).'</h'.$item['lvl'].'>');
      } break;
    }
  }
  return(ob_get_clean());
}




